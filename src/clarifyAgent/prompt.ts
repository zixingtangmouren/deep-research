import { Message } from '../base/message';

export const generateClarifyPrompt = (messages: Message[]) => {
  return `
以下是用户要求得到一份报告时，到现在为止已交换的消息：
<消息>
${messages.map((message) => `${message.role}: ${message.content}`).join('\n')}
</消息>

今天的日期是${new Date().toLocaleDateString()}。

评估是否需要向用户提出澄清问题，或者用户是否已提供足够信息供你开始研究。
重要提示：如果在消息历史中你已提出过澄清问题，几乎无需再提另一个。仅在绝对必要时才提出新问题。

如果存在首字母缩写、缩写词或未知术语，请让用户澄清。
如需提问，请遵循以下指南：
- 简洁明了，同时收集所有必要信息
- 确保以简洁、结构清晰的方式收集执行研究任务所需的全部信息
- 必要时使用项目符号或编号列表以确保清晰。确保使用markdown格式，且若将输出字符串传递给markdown渲染器，能正确渲染。
- 不要询问不必要的信息，或用户已提供的信息。若发现用户已提供相关信息，请勿再次询问。

以有效的JSON格式回应，且包含以下确切键：
"needClarification": 布尔值,
"question": "<向用户询问以澄清报告范围的问题>",
"verification": "<我们将开始研究的确认消息>"

如需提出澄清问题，请返回：
"needClarification": true,
"question": "<你的澄清问题>",
"verification": ""

如无需提出澄清问题，请返回：
"needClarification": false,
"question": "",
"verification": "<基于所提供信息将开始研究的确认消息>"

当无需澄清时，确认消息需：
- 确认已获得足够信息可以继续
- 简要总结你从他们的请求中理解到的关键方面
- 确认你即将开始研究过程
- 保持消息简洁专业
`;
};
