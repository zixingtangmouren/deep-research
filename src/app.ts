import { AssistantMessage, Message, UserMessage } from './base/message';
import { generateBrief } from './briefAgent';
import { clarifyWithUser } from './clarifyAgent';

export class App {
  private curentNode = 'clarify';
  clarifyMessages: Message[] = [];

  async run(input?: string) {
    switch (this.curentNode) {
      case 'clarify': {
        this.clarifyMessages.push(new UserMessage(input || ''));
        const json = await clarifyWithUser(this.clarifyMessages);

        if (json) {
          if (json.needClarification) {
            this.clarifyMessages.push(new AssistantMessage(json.question));
            return json.question;
          } else {
            this.clarifyMessages.push(new AssistantMessage(json.verification));
            return await this.command('brief');
          }
        } else {
          throw new Error('clarify failed');
        }
      }
      case 'brief': {
        const brief = await generateBrief(this.clarifyMessages);
        return brief;
      }
    }
  }

  async command(node: string): Promise<string> {
    this.curentNode = node;
    return (await this.run()) || '';
  }
}
