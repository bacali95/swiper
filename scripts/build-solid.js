const exec = require('exec-sh');
const fs = require('fs-extra');
const { outputDir } = require('./utils/output-dir.js');
const { addBannerToFile } = require('./utils/banner.js');

async function buildSolid(format) {
  await exec.promise(
    `cross-env MODULES=${format} npx babel --config-file ./scripts/babel/babel.config.solid.js src/solid --out-dir ${outputDir}/${format}/solid`,
  );
  await addBannerToFile(`./${outputDir}/${format}/solid/swiper-solid.js`, 'SolidJS');

  const pkg = JSON.stringify(
    {
      name: `swiper/solid`,
      private: true,
      main: `../cjs/solid/swiper-solid.js`,
      'jsnext:main': `../esm/solid/swiper-solid.js`,
      module: `../esm/solid/swiper-solid.js`,
      types: `./swiper-solid.d.ts`,
      sideEffects: false,
    },
    '',
    2,
  );
  fs.writeFileSync(`./${outputDir}/solid/package.json`, pkg);
  await fs.copyFile('./src/solid/swiper.js', `./${outputDir}/solid/swiper.js`);
  await fs.copyFile('./src/solid/swiper-slide.js', `./${outputDir}/solid/swiper-slide.js`);
}

module.exports = buildSolid;
