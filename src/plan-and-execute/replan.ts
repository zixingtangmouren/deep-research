import { Block } from '../base/block';
import { UserMessage } from '../base/message';

const generateReplanPrompt = (input: string, plan: string, past_steps: string) => {
  return `
  你是一个研究主管。针对给定目标，制定一个简单的分步计划。该计划应包含各项独立任务，这些任务若执行正确，就能得出正确答案。请勿添加任何多余步骤。
  最后一步的结果须为最终答案。注意，必须确保每一步都包含所需的全部信息————不要跳过步骤。

  当前时间是：${new Date().toLocaleString()}

  你的目标如下：
  ${input}
  你最初的计划如下：
  ${plan}
  你目前已完成以下步骤：
  ${past_steps}
  请据此更新你的计划。若无需再执行其他步骤，且可以向用户反馈最终的结果，则直接回复该结论；若仍需执行步骤，请完善计划内容。仅添加仍需完成的步骤，切勿将已完成的步骤纳入更新后的计划中。
  
  注意，计划必须是一个 JSON 格式的内容，示例如下：
  ["1.步骤", "2.步骤", "3.步骤"]
  注意，如果返回的是最终结果，那么答案也必须是一个 JSON 格式的内容，示例如下：
  {"answer": "答案"}
  `;
};

export const getNewPlans = async (input: string, plan: string, past_steps: string) => {
  const prompt = generateReplanPrompt(input, plan, past_steps);
  const replanner = new Block({
    instruction: prompt,
    name: 'replan',
    responseFormat: {
      type: 'json_object',
    },
  });
  const res = await replanner.invoke([new UserMessage(prompt)]);
  console.log('replan', res.content);
  return JSON.parse(res.content);
};
