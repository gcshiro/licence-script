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
const dependencies = Object.keys(packageJson.dependencies).map((key) => key);

// devDependenciesをpackage@versionの形で取得する
const devDependencies = Object.keys(packageJson.devDependencies).map(
  (key) => key
);

// 入力するpackages
const inputPackages = dependencies.concat(devDependencies);

// 出力するpacakge一覧
const outputPackages = [];

licenseChecker.init(
  {
    start: process.cwd(),
    customPath: { licenseText: '' },
  },
  (error, packages) => {
    if (error)
      throw new Error('エラーが起きたためライセンス生成できませんでした');

    Object.keys(packages).forEach((key) => {
      const regex = key.match(/(.+)@(.+)$/);

      // dependencies, devDependenciesに含まれていないものは出力しない
      if (!inputPackages.includes(regex[1])) return;

      const libPackage = {
        name: regex[1],
        version: regex[2],
        license: packages[key].licenses,
        licenseText: packages[key].licenseText,
      };

      // packageを探す
      const findPakcage = outputPackages.find(
        (p) => p.name === libPackage.name
      );

      // packageが重複している場合、最新のバージョンの方を出力
      if (findPakcage && findPakcage.version <= libPackage.version) {
        const index = outputPackages.findIndex(
          (p) => p.name === libPackage.name
        );
        outputPackages[index] = libPackage;
      } else {
        outputPackages.push(libPackage);
      }
    });

    // alphabet順に並び替える
    const outputPackagesSortByAlphabet = outputPackages.sort();

    // 出力する際、改行コードをつける
    const formattedOutputPackages = `${JSON.stringify(
      outputPackagesSortByAlphabet,
      null,
      2
    )}\r\n`;

    fs.mkdir(output.dir, { recursive: true }, (err) => {
      if (err) throw new Error('ディレクトリの作成に失敗しました');
      // ファイル出力
      fs.writeFileSync(
        `${output.dir}/${output.file}`,
        formattedOutputPackages,
        'utf8'
      );
    });
  }
);
