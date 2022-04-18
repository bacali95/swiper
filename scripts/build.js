const chalk = require('chalk');
const fs = require('fs-extra');
const elapsed = require('elapsed-time-logger');
const buildJsCore = require('./build-js-core.js');
const buildJsBundle = require('./build-js-bundle.js');
const buildTypes = require('./build-types.js');
const buildReact = require('./build-react.js');
const buildVue = require('./build-vue.js');
const buildSolid = require('./build-solid.js');
const buildSvelte = require('./build-svelte.js');
const buildStyles = require('./build-styles.js');
const buildAngular = require('./build-angular.js');
const outputCheckSize = require('./check-size.js');
const { outputDir } = require('./utils/output-dir.js');

class Build {
  constructor() {
    this.argv = process.argv.slice(2).map((v) => v.toLowerCase());
    this.size = this.argv.includes('--size');
    this.tasks = [];
    // eslint-disable-next-line no-constructor-return
    return this;
  }

  add(flag, buildFn) {
    if (!this.argv.includes('--only') || this.argv.includes(flag)) {
      this.tasks.push(() => buildFn());
    }
    return this;
  }

  addMultipleFormats(flag, buildFn) {
    return this.add(flag, async () =>
      Promise.all(['esm', 'cjs'].map((format) => buildFn(format, this.outputDir))),
    );
  }

  async run() {
    if (!this.argv.includes('--only')) {
      await fs.remove(`./${outputDir}`);
      await fs.ensureDir(`./${outputDir}`);
    }
    await fs.copy('./src/copy/', `./${outputDir}`);
    let start;
    let end;
    if (this.size) {
      start = outputCheckSize();
    }
    const res = await Promise.all(this.tasks.map((buildFn) => buildFn())).catch((err) => {
      console.error(err);
      process.exit(1);
    });
    if (this.size) {
      const sizeMessage = (value, label = '') =>
        `difference ${label}: ${value > 0 ? chalk.red(`+${value}`) : chalk.green(value)} bytes`;
      end = outputCheckSize();
      console.log(sizeMessage(end.size - start.size));
      console.log(sizeMessage(end.gzippedSize - start.gzippedSize, 'gzipped'));
    }
    return res;
  }
}
(async () => {
  elapsed.start('build');
  const build = new Build();
  await build
    .add('types', buildTypes)
    .add('styles', buildStyles)
    .add('core', buildJsCore)
    .add('bundle', buildJsBundle)
    .addMultipleFormats('react', buildReact)
    .addMultipleFormats('vue', buildVue)
    .addMultipleFormats('solid', buildSolid)
    .addMultipleFormats('svelte', buildSvelte)
    .add('angular', buildAngular)
    .run();
  elapsed.end('build', chalk.bold.green('Build completed'));
})();
