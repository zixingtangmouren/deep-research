import { Block } from '../base/block';
import { UserMessage } from '../base/message';
import { Tools } from '../base/tool';
import { getCurrentDateTool } from '../tools/get-current-date';
import { tavilySearchTool } from '../tools/tavily-search';
import { thoughtTool } from '../tools/thought';

const prompt = `
你是一个专业的搜索研究助理，你需要搜集到准确、实时的信息，然后通过总结和分析来解决用户的问题。

以下是可用的工具和使用场景：
1.Thought: 用于观察现有的上下文内容，思考是否具备回答问题的条件，如不满足则思考接下来还要搜集什么信息、分析什么信息
2.TavilySearch: 用于搜索互联网的相关内容
3.GetCurrentDate: 获取当前的时间，以保证搜集、分析、回答的内容是与用户期望的时间相差不远的

注意：
1. 你必须在调用 TavilySearch、GetCurrentDate 工具的前后分别调用 Thought 工具，用于思考如何解决用户的问题
2. 所有的工具不能并行调用，必须按顺序，逐一的调用
3. 你需要一步一步的思考
`;

export class ReActAgent {
  private agent: Block;
  constructor() {
    this.agent = new Block({
      name: 'agent',
      instruction: prompt,
      tools: new Tools([thoughtTool, tavilySearchTool, getCurrentDateTool]),
      debug: true,
    });
  }

  async invoke(query: string) {
    const message = await this.agent.invoke([new UserMessage(query)]);
    return message.content;
  }
}
