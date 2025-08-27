export interface Tool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: {
        [key: string]: {
          type: 'string' | 'number' | 'boolean' | 'object' | 'array';
          description: string;
        };
      };
      required: string[];
    };
  };
  func: (args: any) => Promise<any>;
}

export const createTool = (tool: Tool) => {
  return tool;
};

export class Tools {
  tools: Tool[] = [];

  constructor(tools: Tool[]) {
    this.tools = tools;
  }

  async call(toolName: string, args: { [key: string]: any }) {
    const tool = this.tools.find((tool) => tool.function.name === toolName);
    if (!tool) {
      throw new Error(`Tool ${toolName} not found`);
    }

    const result = await tool.func(args);
    return result;
  }

  getTools() {
    if (this.tools.length === 0) {
      return undefined;
    }
    return this.tools.map((tool) => {
      return {
        type: tool.type,
        function: tool.function,
      };
    });
  }
}
