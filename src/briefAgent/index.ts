import { Block } from '../base/block';
import { Message } from '../base/message';

import { generateBriefPrompt } from './prompt';

export const generateBrief = async (messages: Message[]) => {
  const briefAgent = new Block({
    name: 'brief',
    instruction: generateBriefPrompt(messages),
  });
  const res = await briefAgent.invoke();
  return res?.content;
};
