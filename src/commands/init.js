import fs from 'fs';
import inquirer from 'inquirer';
import shell from 'shelljs';
import ora from 'ora';
import chalk from 'chalk';
import symbols from 'log-symbols';
import notifier from 'node-notifier';
import clone from '../utils/clone';

const remote = 'https://gitee.com/jack210481/stargate-template-nodejs.git';
const branch = 'master';

/**
 * 需要删除的目录
 * @type {string[]}
 */
const deleteDir = ['.git', 'README.md', '.gitignore'];

/**
 * 终端输入询问
 * @type {({})[]}
 */
const questions = [{
  type: 'input',
  message: '请输入项目简介:',
  name: 'description',
}, {
  type: 'list',
  message: '请选择模板类型:',
  choices: ['express', 'react-native', 'vue', 'react'],
  name: 'type',
}];

/**
 * 检查git 以及 校验项目名字
 */
const predicate = (name) => {
  // 检查git环境
  if (!shell.which('git')) {
    console.log(symbols.error, '对不起，git命令不可用！');
    shell.exit(1);
  }
  // 验证输入name是否合法
  if (fs.existsSync(name)) {
    console.log(symbols.warning, `已存在项目文件夹 ${name}！`);
    shell.exit(1);
  }
  if (name.match(/[^A-Za-z0-9\u4e00-\u9fa5_-]/g)) {
    console.log(symbols.error, '项目名称存在非法字符！');
    shell.exit(1);
  }
};

export default async (name) => {
  predicate(name);
  // 询问用户配置
  const answers = await inquirer.prompt(questions);
  answers.name = name;
  console.log('------------------------');
  console.log(answers);
  const confirm = await inquirer.prompt([{
    type: 'confirm',
    message: '确认创建？',
    default: 'Y',
    name: 'isConfirm',
  }]);
  if (!confirm.isConfirm) {
    return;
  }

  // 获取模板
  await clone(`direct:${remote}#${branch}`, name, { clone: true });

  // 清理文件并初始化.gitignore
  const pwd = shell.pwd();
  deleteDir.forEach((item) => {
    shell.rm('-rf', `${pwd}/${name}/${item}`);
  });
  shell.cd(name);
  shell.mv('-f', '.gitignore.bak', '.gitignore');

  // 重写package.json
  const cfgSpinner = ora('正在写入项目配置...')
    .start();
  let pkg = fs.readFileSync(`${pwd}/${name}/package.json`, 'utf8');
  pkg = JSON.parse(pkg);
  pkg.name = name;
  pkg.description = answers.description;
  fs.writeFileSync(`${pwd}/${name}/package.json`, JSON.stringify(pkg), { encoding: 'utf8' });
  cfgSpinner.succeed(chalk.green('配置信息写入成功！'));

  // 6. 安装依赖
  const installSpinner = ora('正在安装依赖...')
    .start();
  if (shell.exec('npm install --registry https://registry.npm.taobao.org').code !== 0) {
    console.log(symbols.warning, chalk.yellow('自动安装失败，请手动安装！'));
    installSpinner.fail();
    shell.exit(1);
  }
  installSpinner.succeed(chalk.green('依赖安装成功！'));
  console.log(symbols.success, chalk.green('\n       ♪(＾∀＾●)ﾉ \n\n  ❤   恭喜，项目创建成功  ❤ \n'));
  notifier.notify({
    title: 'stargate-cli',
    message: ' ♪(＾∀＾●)ﾉ 恭喜，项目创建成功！',
  });
  shell.exit(1);
};
