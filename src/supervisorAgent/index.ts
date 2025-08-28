import { Block } from '../base/block';
import { Message, ToolCall } from '../base/message';
import { createTool, Tools } from '../base/tool';
import { generateSupervisorPrompt } from './prompt';

const conductResearch = createTool({
  type: 'function',
  function: {
    name: 'conduct_research',
    description: '执行研究任务的工具函数',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: '需要研究的查询内容',
        },
      },
      required: ['query'],
    },
  },
  func: async (args) => {
    // 返回一个Promise以满足类型要求
    return Promise.resolve({});
  },
});

const tools = new Tools([conductResearch]);

// export const supervisor = async (messages: Message[]) => {
//   const supervisorAgent = new Block({
//     name: 'supervisor',
//     instruction: generateSupervisorPrompt({
//       maxResearcherIterations: 3,
//       maxConcurrentResearchUnits: 3,
//     }),
//     tools,
//     autoRunTools: false,
//   });

//   const response = await supervisorAgent.invoke(messages);

//   // const lastMessage = supervisorAgent.getMessages().pop();
// };

export class Supervisor {
  private maxResearcherIterations: number = 3;
  private currentIteration: number = 0;
  private supervisorMessages: Message[] = [];

  async start(messages: Message[]) {
    this.supervisorMessages = messages;
    await this.invoke(this.supervisorMessages);
  }

  async invoke(messages: Message[]): Promise<Message[]> {
    const supervisorAgent = new Block({
      name: 'supervisor',
      instruction: generateSupervisorPrompt({
        maxResearcherIterations: 3,
        maxConcurrentResearchUnits: 3,
      }),
      tools,
      autoRunTools: false,
    });

    const response = await supervisorAgent.invoke(messages);
    this.supervisorMessages.push(response);

    const hasToolsCall = !!response?.tool_calls?.length;
    const isMaxIteration = this.currentIteration === this.maxResearcherIterations;
    const hasResearchCompleteTools = response.tool_calls?.find((tool) => tool.function.name === 'ResearchComplete');

    // 结束循环
    if (!hasToolsCall || isMaxIteration || hasResearchCompleteTools) {
      return this.supervisorMessages;
    }

    const toolCalls = response.tool_calls;

    await this.callTools(toolCalls!);
    this.currentIteration++;

    return await this.invoke(this.supervisorMessages);
  }

  async callTools(toolCalls: ToolCall[]) {
    // 调用工具 、添加上下级文
  }
}
