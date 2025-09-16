import { Tool } from '../base/tool';
import dotenv from 'dotenv';
import { tavily } from '@tavily/core';

dotenv.config();

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY! });

export const tavilySearchTool: Tool = {
  type: 'function',
  function: {
    name: 'TavilySearch',
    description: '用于搜索互联网的相关内容',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: '搜索的查询内容',
        },
      },
      required: ['query'],
    },
  },
  func: async (args: { [key: string]: any }) => {
    try {
      const res = await tvly.search(args.query);
      const data = res.results.map(({ title, url, content }) => ({
        title,
        url,
        content,
      }));
      return JSON.stringify(data);
    } catch (error) {
      return 'Error: Tavily 搜索失败';
    }
  },
};
