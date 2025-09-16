import dotenv from 'dotenv';
import { AssistantMessage, Message, SystemMessage, ToolCall, ToolMessage } from '../base/message';
import { Tools } from '../base/tool';

interface LLMBaseConfig {
  model: string;
  apiKey: string;
  baseUrl: string;
  response_format?: {
    type: 'text' | 'json_object';
  };
}

interface BlockConfig {
  name: string;
  instruction: string;
  tools?: Tools;
  autoRunTools?: boolean;
  responseFormat?: {
    type: 'text' | 'json_object';
  };
  maxIterations?: number;
  debug?: boolean;
}

dotenv.config();

export class Block {
  private readonly name: string;
  private readonly llmBaseConfig: LLMBaseConfig;
  private messages: Message[] = [];
  private instruction: string = '';
  private tools: Tools;
  private autoRunTools: boolean = true;
  private maxIterations: number = 10;
  private debug: boolean = false;

  constructor(config: BlockConfig) {
    if (!process.env.MODEL_NAME || !process.env.DEEPSEEK_API_KEY || !process.env.BASE_URL) {
      throw new Error('MODEL_NAME, DEEPSEEK_API_KEY, BASE_URL are not defined');
    }

    this.name = config.name;
    this.llmBaseConfig = {
      model: process.env.MODEL_NAME,
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseUrl: process.env.BASE_URL,
      response_format: config.responseFormat || {
        type: 'text',
      },
    };

    this.maxIterations = config.maxIterations || 10;
    this.debug = config.debug || false;
    this.instruction = config.instruction;
    this.messages.push(new SystemMessage(this.instruction));
    this.tools = config.tools || new Tools([]);
    this.autoRunTools = config.autoRunTools !== false;
  }

  public async invoke(messages?: Message[]): Promise<AssistantMessage> {
    const { model, apiKey, baseUrl, response_format } = this.llmBaseConfig;

    if (messages) {
      this.messages.push(...messages);
    }

    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        stream: true,
        messages: this.messages,
        tools: this.tools.getTools(),
        response_format,
      }),
    });

    if (!res.ok) {
      console.log('Response status:', res.status);
      console.log('Response statusText:', res.statusText);
      const errorText = await res.text();
      console.log('Error response:', errorText);
      throw new Error(`API Error: ${res.status} ${res.statusText} - ${errorText}`);
    }

    let buffer = '';
    let assistantMessage = '';
    let tools: Record<number, ToolCall> = {};

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = (await reader?.read()) || {};
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep the last incomplete line in buffer

      for (const line of lines) {
        if (line.trim() === '') continue;
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            break;
          }

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta;

            if (delta?.content) {
              assistantMessage += delta.content;
            }

            // 处理多个工具调用
            if (delta?.tool_calls) {
              delta?.tool_calls.forEach((toolCall: any) => {
                if (tools[toolCall.index]) {
                  tools[toolCall.index].function.arguments += toolCall.function.arguments;
                } else {
                  tools[toolCall.index] = toolCall;
                }
              });
            }
          } catch (e) {
            console.log('Failed to parse JSON:', data);
          }
        }
      }
    }

    let message: AssistantMessage;

    if (assistantMessage && Object.keys(tools).length === 0) {
      this.debug && console.table([{ node: this.name, type: 'Assistant', content: JSON.stringify(assistantMessage) }]);
      message = new AssistantMessage(assistantMessage);
      this.messages.push(message);
    }

    if (Object.keys(tools).length > 0) {
      const tool_calls = Object.values(tools).map((tool) => tool);

      if (this.autoRunTools) {
        this.debug &&
          console.table([
            {
              node: this.name,
              type: 'Assistant',
              content: JSON.stringify(assistantMessage),
              tools: tool_calls.map((tool) => `${tool.function.name}(${tool.function.arguments})`).join('\n'),
            },
          ]);
        message = new AssistantMessage(assistantMessage, tool_calls);
        this.messages.push(message);

        const callToolTasks = Object.values(tools).map(async (tool) => {
          let result = '';
          try {
            result = await this.tools.call(tool.function.name, JSON.parse(tool.function.arguments));
          } catch (error) {
            result = `${tool.function.name} 执行异常`;
          }
          return JSON.stringify(result);
        });
        const toolResults = await Promise.all(callToolTasks);
        const toolResultMessages = toolResults.map((result, index) => {
          console.table([{ node: this.name, type: 'tool', json: JSON.stringify(result) }]);
          return new ToolMessage(result, tools[index].id);
        });
        this.messages.push(...toolResultMessages);

        return await this.invoke();
      } else {
        console.table([
          {
            node: this.name,
            type: 'Assistant',
            content: JSON.stringify(assistantMessage),
            tools: tool_calls.map((tool) => `${tool.function.name}(${tool.function.arguments})`).join('\n'),
          },
        ]);
        message = new AssistantMessage(assistantMessage, tool_calls);
      }
    }

    // 确保 message 已定义后再返回
    return message!;
  }

  public getMessages() {
    return this.messages;
  }
}
