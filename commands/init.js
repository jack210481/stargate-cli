const fs = require('fs');
const inquirer = require('inquirer');
const shell = require('shelljs');
const ora = require('ora');
const chalk = require('chalk');
const symbols = require('log-symbols');
const notifier = require('node-notifier');
const clone = require('../utils/clone.js');
const remote = 'https://gitee.com/jack210481/stargate-template-nodejs.git';
let branch = 'master';
// 要删除的目录，相对于根目录
const deleteDir = ['.git', 'README.md', '.gitignore'];
const questions = [{
        type: 'input',
        message: '请输入项目简介:',
        name: 'description'
    },{
        type: 'list',
        message: '请选择模板类型:',
        choices: ['express', 'react-native', 'vue', 'react'],
        name: 'type'
    }];
const initAction = async (name) => {
  // 0. 检查控制台是否以运行`git `开头的命令
  if (!shell.which('git')) {
      console.log(symbols.error, '对不起，git命令不可用！');
      shell.exit(1);
  }
  // 1. 验证输入name是否合法
  if (fs.existsSync(name)) {
      console.log(symbols.warning,`已存在项目文件夹 ${name}！`);
      return;
  }
  if (name.match(/[^A-Za-z0-9\u4e00-\u9fa5_-]/g)) {
      console.log(symbols.error, '项目名称存在非法字符！');
      return;
  }
  // 2. 询问用户配置
  const answers = await inquirer.prompt(questions);
  answers.name = name;
  console.log('------------------------');
  console.log(answers);
  let confirm = await inquirer.prompt([{
      type: 'confirm',
      message: '确认创建？',
      default: 'Y',
      name: 'isConfirm'
  }]);
  if (!confirm.isConfirm) return false;
  // 3. 下载模板
  await clone(`direct:${remote}#${branch}`, name, { clone: true });
  // 4. 清理文件
  const pwd = shell.pwd();
  deleteDir.map(item => {
      shell.rm('-rf', pwd + `/${name}/${item}`);
  });
  shell.cd(name);
  // 修整.gitignore mv -f .gitignore.bak .gitignore
  shell.mv('-f', '.gitignore.bak', '.gitignore');
  // 5. 写入配置文件
  const cfgSpinner = ora('正在写入配置信息...').start();
  let pkg = fs.readFileSync(`${pwd}/${name}/package.json`, 'utf8');
  pkg = JSON.parse(pkg);
  pkg.name = name;
  pkg.description = answers.description;
  fs.writeFileSync(`${pwd}/${name}/package.json`, JSON.stringify(pkg), { encoding: 'utf8' });
  cfgSpinner.succeed(chalk.green('配置信息写入成功！'));
  // 6. 安装依赖
  const installSpinner = ora('正在安装依赖...').start();
  if (shell.exec('npm install').code !== 0) {
    console.log(symbols.warning, chalk.yellow('自动安装失败，请手动安装！'));
    installSpinner.fail();
    shell.exit(1);
  };
  installSpinner.succeed(chalk.green('依赖安装成功！'));
  console.log(symbols.success, chalk.green('\n       ♪(＾∀＾●)ﾉ \n\n  ❤   恭喜，项目创建成功  ❤ \n'));
  notifier.notify({
      title: 'stargate-cli',
      message: ' ♪(＾∀＾●)ﾉ 恭喜，项目创建成功！'
  });
  // 7. 打开编辑器
  if (shell.which('code')) shell.exec('code ./');
  shell.exit(1);
};
module.exports = initAction;
