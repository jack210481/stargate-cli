#!/usr/bin/env node
import program from 'commander';
import initAction from './commands/init';

// 查看版本号
program
  .version(require('../package.json').version)
  .option('-v,--version', '查看版本号');
// 初始化项目
program
  .command('init <name>')
  .description('创建项目')
  .action(initAction);

program.parse(process.argv);
