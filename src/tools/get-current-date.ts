import { Tool } from '../base/tool';

export const getCurrentDateTool: Tool = {
  type: 'function',
  function: {
    name: 'GetCurrentDate',
    description: '获取当前日期',
  },
  func: async () => {
    return new Date().toLocaleDateString();
  },
};
