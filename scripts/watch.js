const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const url = require('url');
const buildJsCore = require('./build-js-core.js');
const buildJsBundle = require('./build-js-bundle.js');
const buildTypes = require('./build-types.js');
const buildStyles = require('./build-styles.js');
const buildReact = require('./build-react.js');
const buildVue = require('./build-vue.js');
const buildSolid = require('./build-solid.js');
const buildSvelte = require('./build-svelte.js');

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
console.log(chalk.cyan('Watching file changes ...'));
const watchFunction = async (fileName) => {
  if (fileName.includes('.less') || fileName.includes('.css') || fileName.includes('.scss')) {
    console.log('Building styles');
    await buildStyles();
    console.log('Building styles DONE');
    return;
  }
  if (fileName.includes('.d.ts')) {
    console.log('Building Types');
    await buildTypes();
    return;
  }
  if (fileName.includes('react')) {
    console.log('Building React');
    buildReact('build');
    return;
  }
  if (fileName.includes('vue')) {
    console.log('Building Vue');
    buildVue('build');
    return;
  }
  if (fileName.includes('solid')) {
    console.log('Building Solid');
    buildSolid('build');
    return;
  }
  if (fileName.includes('svelte')) {
    console.log('Building Svelte');
    buildSvelte('build');
    return;
  }
  if (fileName.includes('.js')) {
    console.log('Building JS');
    buildJsCore();
    buildJsBundle();
    return;
  }
  console.log('something wrong...');
};
let watchTimeout;
fs.watch(path.resolve(__dirname, '../src'), { recursive: true }, (eventType, fileName) => {
  clearTimeout(watchTimeout);
  watchTimeout = setTimeout(() => {
    watchFunction(fileName);
  }, 100);
});
