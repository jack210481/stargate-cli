#!/usr/bin/env node

const program = require('commander');
const initAction = require('./commands/init');

// 查看版本号
program
    .version(require('./package.json').version)
    .option('-v,--version', '查看版本号');
// 初始化项目
program
    .command('init <name>')
    .description('创建项目')
    .action(initAction);

program.parse(process.argv);
