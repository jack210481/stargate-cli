import download from 'download-git-repo';
import symbols from 'log-symbols';
import ora from 'ora';
import chalk from 'chalk';

export default (remote, name, option) => {
    const downSpinner = ora('正在下载模板...').start();
    return new Promise((resolve, reject) => {
        download(remote, name, option, err => {
            if (err) {
                downSpinner.fail();
                console.log(symbols.error, chalk.red(err));
                reject(err);
                return;
            };
            downSpinner.succeed(chalk.green('模板下载成功！'));
            resolve();
        });
    });
}
