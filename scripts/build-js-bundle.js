const fs = require('fs-extra');
const chalk = require('chalk');
const elapsed = require('elapsed-time-logger');
const { rollup } = require('rollup');
const { babel } = require('@rollup/plugin-babel');
const replace = require('@rollup/plugin-replace');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const { minify } = require('terser');
const { modules: configModules } = require('./build-config.js');
const { outputDir } = require('./utils/output-dir.js');
const { banner } = require('./utils/banner.js');
const isProd = require('./utils/isProd.js');

async function buildEntry(modules, format, browser = false) {
  const isUMD = format === 'umd';
  const isESM = format === 'esm';
  const isCJS = format === 'cjs';
  const needSourceMap = isProd && (isUMD || (isESM && browser));
  const external = isUMD || browser ? [] : () => true;
  let filename = 'swiper-bundle';
  if (!isUMD) filename += `.${format}`;
  if (isESM && browser) filename += '.browser';

  return rollup({
    input: './src/swiper.js',
    external,
    plugins: [
      replace({
        delimiters: ['', ''],
        'process.env.NODE_ENV': JSON.stringify(isProd ? 'production' : 'development'),
        '//IMPORT_MODULES': modules
          .map((mod) => `import ${mod.capitalized} from './modules/${mod.name}/${mod.name}.js';`)
          .join('\n'),
        '//INSTALL_MODULES': modules.map((mod) => `${mod.capitalized}`).join(',\n  '),
        '//EXPORT': isUMD ? 'export default Swiper;' : 'export default Swiper; export { Swiper }',
      }),
      nodeResolve({ mainFields: ['module', 'main', 'jsnext'], rootDir: './src' }),
      babel({ babelHelpers: 'bundled' }),
    ],
    onwarn() {},
  })
    .then((bundle) =>
      bundle.write({
        format,
        name: 'Swiper',
        strict: true,
        sourcemap: needSourceMap,
        sourcemapFile: `./${outputDir}/${filename}.js.map`,
        banner: banner(),
        file: `./${outputDir}/${filename}.js`,
      }),
    )
    .then(async (bundle) => {
      if (!browser && (isCJS || isESM)) {
        // Fix imports
        const modularContent = fs
          .readFileSync(`./${outputDir}/${filename}.js`, 'utf-8')
          .replace(/require\('\.\//g, `require('./${format}/`)
          .replace(/from '\.\//g, `from './${format}/`);
        fs.writeFileSync(`./${outputDir}/${filename}.js`, modularContent);
      }
      if (!isProd || !browser) {
        return;
      }
      const result = bundle.output[0];
      const { code, map } = await minify(result.code, {
        sourceMap: {
          content: needSourceMap ? result.map : undefined,
          filename: needSourceMap ? `${filename}.min.js` : undefined,
          url: `${filename}.min.js.map`,
        },
        output: {
          preamble: banner(),
        },
      }).catch((err) => {
        console.error(`Terser failed on file ${filename}: ${err.toString()}`);
      });
      await fs.writeFile(`./${outputDir}/${filename}.min.js`, code);
      await fs.writeFile(`./${outputDir}/${filename}.min.js.map`, map);
    })
    .then(async () => {
      if (isProd && isESM && browser === false) return buildEntry(modules, format, true);
      return true;
    })
    .catch((err) => {
      console.error('Rollup error:', err.stack);
    });
}

async function buildJsBundle() {
  elapsed.start('bundle');
  const modules = [];
  configModules.forEach((name) => {
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
  return Promise.all([
    buildEntry(modules, 'cjs', false),
    buildEntry(modules, 'esm', false),
    buildEntry(modules, 'esm', true),
    buildEntry(modules, 'umd', true),
  ]).then(() => {
    elapsed.end('bundle', chalk.green('\nBundle build completed!'));
  });
}

module.exports = buildJsBundle;
