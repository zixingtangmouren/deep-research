import { Tool } from '../base/tool';

export const thoughtTool: Tool = {
  type: 'function',
  function: {
    name: 'Thought',
    description: '用于输出用于思考解决用户的问题，需要做什么以及这么做的原因',
    parameters: {
      type: 'object',
      properties: {
        thought: {
          type: 'string',
          description: '思考的内容',
        },
      },
      required: ['thought'],
    },
  },
  func: async (args: { [key: string]: any }) => {
    return `Thought: ${args.thought}`;
  },
};
