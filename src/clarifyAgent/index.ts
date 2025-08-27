import { Block } from '../base/block';
import { Message, UserMessage } from '../base/message';
import { generateClarifyPrompt } from './prompt';

interface ClarifyResult {
  needClarification: boolean;
  question: string;
  verification: string;
}

export const clarifyWithUser = async (messages: Message[]): Promise<ClarifyResult | null> => {
  const clarifyAgent = new Block({
    instruction: generateClarifyPrompt(messages),
    responseFormat: {
      type: 'json_object',
    },
  });

  const { assistantMessage } = await clarifyAgent.invoke();

  try {
    const json: ClarifyResult = JSON.parse(assistantMessage);
    return json;
  } catch (error) {
    console.log('error >>', error);
    return null;
  }
};
