import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Компилируем TypeScript
console.log('Compiling TypeScript...');
const tsc = spawn('npx', ['tsc', '--project', 'tsconfig.json', '--outDir', './dist', '--module', 'commonjs', '--moduleResolution', 'node']);

tsc.stdout.on('data', (data) => {
  console.log(data.toString());
});

tsc.stderr.on('data', (data) => {
  console.error(data.toString());
});

tsc.on('close', (code) => {
  if (code !== 0) {
    console.error('Compilation failed');
    process.exit(1);
  }
  
  console.log('Compilation successful!');
  console.log('Running tests...');
  
  // Запускаем тесты
  const test = spawn('node', ['--test', 'dist/test/integration.test.js']);
  
  test.stdout.on('data', (data) => {
    console.log(data.toString());
  });
  
  test.stderr.on('data', (data) => {
    console.error(data.toString());
  });
  
  test.on('close', (testCode) => {
    console.log(`Tests finished with code ${testCode}`);
    process.exit(testCode);
  });
});