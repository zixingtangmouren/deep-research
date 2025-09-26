import * as readline from 'readline';
import { ReActAgent } from './src/react/index';
import { PlanondExecutorAgent } from './src/plan-and-execute';

/**
 * 通用的终端对话方法
 * @param agent - 可以是 ReActAgent 实例或 Block 实例
 * @param welcomeMessage - 欢迎消息，可选
 */
async function startTerminalChat(
  agent: ReActAgent | PlanondExecutorAgent,
  welcomeMessage: string = '你好！我是你的AI助手，有什么可以帮助你的吗？'
) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log('\n=== AI 助手终端对话 ===');
  console.log(welcomeMessage);
  console.log('输入 "exit" 或 "quit" 退出对话\n');

  const askQuestion = () => {
    rl.question('你: ', async (input) => {
      const userInput = input.trim();

      // 检查退出命令
      if (userInput.toLowerCase() === 'exit' || userInput.toLowerCase() === 'quit') {
        console.log('\n再见！');
        rl.close();
        return;
      }

      if (!userInput) {
        console.log('请输入有效的问题。\n');
        askQuestion();
        return;
      }

      try {
        console.log('\n思考中...');

        let response;
        response = await agent.invoke(userInput);

        console.log(`\nAI: ${response}\n`);
      } catch (error) {
        console.error('\n发生错误:', error);
        console.log('请重试。\n');
      }

      askQuestion();
    });
  };

  askQuestion();
}

/**
 * 创建默认的 ReAct Agent
 */
export function createReActAgent(): ReActAgent {
  return new ReActAgent();
}

/**
 * 创建默认的 Plan and Executor Agent
 */
export function createPlanAndExecutorAgent(): PlanondExecutorAgent {
  return new PlanondExecutorAgent();
}

// const defaultAgent = createReActAgent();
const defaultAgent = createPlanAndExecutorAgent();
startTerminalChat(defaultAgent);
