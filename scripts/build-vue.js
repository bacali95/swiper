/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
/* eslint no-console: "off" */
const exec = require('exec-sh').promise;
const fs = require('fs');
const { outputDir } = require('./utils/output-dir');
const { addBannerToFile } = require('./utils/banner');

async function buildVue(format) {
  await exec(`cross-env MODULES=${format} npx babel src/vue --out-dir ${outputDir}/${format}/vue`);
  await addBannerToFile(`./${outputDir}/${format}/vue/swiper-vue.js`, 'Vue');

  const pkg = JSON.stringify(
    {
      name: `swiper/vue`,
      private: true,
      main: `../cjs/vue/swiper-vue.js`,
      'jsnext:main': `../esm/vue/swiper-vue.js`,
      module: `../esm/vue/swiper-vue.js`,
      types: `./swiper-vue.d.ts`,
      sideEffects: false,
    },
    '',
    2,
  );
  fs.writeFileSync(`./${outputDir}/vue/package.json`, pkg);
}

module.exports = buildVue;
