const fs = require('fs');
const licenseChecker = require('license-checker');

/**
 * dir - 出力ディレクトリ
 * file - 出力ファイル名
 */
const output = {
  dir: 'licenses',
  file: 'licenses.json',
};

// package.json
const packageJson = require('./package.json');

// dependenciesをpackage@versionの形で取得する
const dependencies = Object.keys(packageJson.dependencies)
  .map((key) => {
    const version = packageJson.dependencies[key].slice(1);
    return `${key}@${version}`;
  })
  .join(';');

// devDependenciesをpackage@versionの形で取得する
const devDependencies = Object.keys(packageJson.devDependencies)
  .map((key) => {
    const version = packageJson.devDependencies[key].slice(1);
    return `${key}@${version}`;
  })
  .join(';');

// 入力するpackages
const inputPackages = `${dependencies};${devDependencies}`;

licenseChecker.init(
  {
    start: process.cwd(),
    customPath: { licenseText: '' },
    packages: inputPackages,
  },
  (error, packages) => {
    if (error)
      throw new Error('エラーが起きたためライセンス生成できませんでした');

    const licenses = Object.keys(packages).map((key) => {
      const library = key.match(/(.+)@(.+)$/);
      return {
        name: library[1],
        version: library[2],
        license: packages[key].licenses,
        licenseText: packages[key].licenseText,
      };
    });

    const outputPackages = `${JSON.stringify(licenses, null, 2)}\r\n`;
    fs.mkdir(output.dir, { recursive: true }, (err) => {
      if (err) throw new Error('ディレクトリの作成に失敗しました');
      // ファイル出力
      fs.writeFileSync(`${output.dir}/${output.file}`, outputPackages, 'utf8');
    });
  }
);
