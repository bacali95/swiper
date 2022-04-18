/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
/* eslint no-console: "off" */
const exec = require('exec-sh').promise;
const fs = require('fs-extra');
const chalk = require('chalk');
const elapsed = require('elapsed-time-logger');

const config = require('./build-config');
const { outputDir } = require('./utils/output-dir');
const { banner } = require('./utils/banner');

async function buildCore(modules, format) {
  const filename = `swiper.${format}`;
  const coreContent =
    format === 'esm'
      ? [
          banner(),
          `export { default as Swiper, default } from './${format}/core/core.js';`,
          ...modules.map(
            ({ name, capitalized }) =>
              `export { default as ${capitalized} } from './${format}/modules/${name}/${name}.js';`,
          ),
        ].join('\n')
      : [
          banner(),
          `"use strict";`,
          `exports.__esModule = true;`,
          `exports.default = require('./${format}/core/core.js').default;`,
          `exports.Swiper = require('./${format}/core/core.js').default;`,
          ...modules.map(
            ({ name, capitalized }) =>
              `exports.${capitalized} = require('./${format}/modules/${name}/${name}.js').default;`,
          ),
        ].join('\n');

  await Promise.all([
    fs.writeFile(`./${outputDir}/${filename}.js`, coreContent),
    exec(
      `npx cross-env MODULES=${format} npx babel src --out-dir ${outputDir}/${format} --config-file ./scripts/babel/babel.config.core.js`,
    ),
  ]);

  await fs.unlink(`./${outputDir}/${format}/swiper.js`);
}

async function build() {
  elapsed.start('core');
  const modules = [];
  config.modules.forEach((name) => {
    // eslint-disable-next-line
    const capitalized = name
      .split('-')
      .map((word) => {
        return word
          .split('')
          .map((char, index) => {
            if (index === 0) return char.toUpperCase();
            return char;
          })
          .join('');
      })
      .join('');
    const jsFilePath = `./src/modules/${name}/${name}.js`;
    if (fs.existsSync(jsFilePath)) {
      modules.push({ name, capitalized });
    }
  });

  await Promise.all([buildCore(modules, 'esm'), buildCore(modules, 'cjs')]);
  elapsed.end('core', chalk.green('Core build completed!'));
}

module.exports = build;
