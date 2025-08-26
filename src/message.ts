export interface ToolCall {
  id: string;
  type: string;
  index: number;
  function: {
    name: string;
    arguments: string;
  };
}

export interface Message {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_call_id?: string;
}

export class SystemMessage implements Message {
  role: 'system';
  content: string;

  constructor(content: string) {
    this.role = 'system';
    this.content = content;
  }
}

export class UserMessage implements Message {
  role: 'user';
  content: string;

  constructor(content: string) {
    this.role = 'user';
    this.content = content;
  }
}

export class AssistantMessage implements Message {
  role: 'assistant';
  content: string;
  tool_calls?: ToolCall[];

  constructor(content: string, tool_calls?: ToolCall[]) {
    this.role = 'assistant';
    this.content = content;
    this.tool_calls = tool_calls;
  }
}

export class ToolMessage implements Message {
  role: 'tool';
  content: string;
  tool_call_id: string;

  constructor(content: string, tool_call_id: string) {
    this.role = 'tool';
    this.content = content;
    this.tool_call_id = tool_call_id;
  }
}
