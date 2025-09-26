import { UserMessage } from '../base/message';
import { planer } from './plan';
import { createExecuter } from './executer';
import { getNewPlans } from './replan';

export class PlanondExecutorAgent {
  async invoke(query: string) {
    const planMessage = await planer.invoke([new UserMessage(query)]);

    console.log('planMessage', planMessage.content);

    // 当前计划
    let plans = JSON.parse(planMessage.content) as string[];
    // 是否完成
    let isComplete = false;
    // 最终结果
    let finalResult;
    // 已执行计划的结果
    const pastSteps: string[] = [];

    console.table(plans.map((plan, index) => ({ 步骤: index + 1, 计划: plan })));

    while (plans.length > 0) {
      const step = plans[0];
      const prompt = `你的任务是：${step}`;
      console.log(`正在处理任务：${step}`);
      const exectuerMessage = await createExecuter('executer').invoke([new UserMessage(prompt)]);
      console.log('exectuerMessage', exectuerMessage.content);
      pastSteps.push(exectuerMessage.content);

      const plansStr = plans.join('\n');
      const pastStepsStr = pastSteps.join('\n');
      const result = await getNewPlans(query, plansStr, pastStepsStr);
      if (result?.answer) {
        isComplete = true;
        finalResult = result?.answer;
        return finalResult;
      } else {
        plans = result as string[];
        console.table(plans.map((plan, index) => ({ 步骤: index + 1, 计划: plan })));
      }
    }
  }
}
