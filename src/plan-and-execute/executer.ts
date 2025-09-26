import { Block } from '../base/block';
import { Tools } from '../base/tool';
import { thoughtTool } from '../tools/thought';
import { tavilySearchTool } from '../tools/tavily-search';

export const createExecuter = (name: string) => {
  return new Block({
    instruction: `
  你是一个研究助理，你的职责是解决研究主管委派给你的任务。

  当前时间是：${new Date().toLocaleString()}
  
  你有如下核心工具：
  - thought: 用于思考和决策。注意，在调用 tavilySearch 之前，你必须先调用 thought 分析这么做的原因。在调用 tavilySearch 之后，你必须调用 thought 观察上下文并思考分析后续步骤。
  - tavilySearch: 用于搜索互联网
  `,
    tools: new Tools([thoughtTool, tavilySearchTool]),
    name,
    debug: false,
  });
};
