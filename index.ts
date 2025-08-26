import { Block } from './src/block';
import { UserMessage } from './src/message';
import { Tools, createTool } from './src/tool';
import readline from 'readline';

const tool = createTool({
  type: 'function',
  function: {
    name: 'doc_search',
    description: '根据文件名查询文档资源',
    parameters: {
      type: 'object',
      properties: {
        fileName: {
          type: 'string',
          description: '文档文件名',
        },
      },
      required: ['fileName'],
    },
  },

  func: async (args: { fileName: string }) => {
    return `import { add } from "./utils";  consolo.log(${args.fileName} add(1, 20))`;
  },
});

const agent = new Block({
  instruction: `你是一个文档查询助手，你可以根据用户的需求查询各种文档资源；
  你具备如下工具：
  1. doc_search: 用于查询文档资源
  注意，为了查询效率，如果是多个文档，你可以并行调用工具查询
  `,
  tools: new Tools([tool]),
});

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log('🤖 智能助手已启动，输入 "exit" 或 "quit" 退出对话\n');

  const askQuestion = () => {
    rl.question('👤 你: ', async (input: string) => {
      if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
        console.log('👋 再见!');
        rl.close();
        return;
      }

      if (input.trim() === '') {
        askQuestion();
        return;
      }

      try {
        console.log('🤔 思考中...');
        const res = await agent.invoke(new UserMessage(input));

        if (res.reasoningContent) {
          console.log('\n💭 推理过程:');
          console.log(res.reasoningContent);
        }

        console.log('\n🤖 助手:', res.assistantMessage);
        console.log('\n' + '-'.repeat(50) + '\n');
      } catch (error) {
        console.error('❌ 发生错误:', error instanceof Error ? error.message : String(error));
        console.log('\n' + '-'.repeat(50) + '\n');
      }

      askQuestion();
    });
  };

  askQuestion();
}

main().catch(console.error);
