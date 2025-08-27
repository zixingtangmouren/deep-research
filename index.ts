import readline from 'readline';
import { App } from './src/app';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const app = new App();

const askQuestion = () => {
  rl.question('👤 你: ', async (input) => {
    if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
      console.log('👋 再见！');
      rl.close();
      return;
    }

    if (input.trim() === '') {
      askQuestion();
      return;
    }

    try {
      console.log('🤖 AI: ');
      const reply = await app.run(input);
      console.log(reply);
      console.log('\n');
    } catch (error) {
      console.log('❌ 发生错误:', error);
    }

    askQuestion();
  });
};

askQuestion();
