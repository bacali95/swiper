/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
/* eslint no-console: "off" */
const exec = require('exec-sh').promise;
const fs = require('fs');
const { outputDir } = require('./utils/output-dir');
const { addBannerToFile } = require('./utils/banner');

async function buildReact(format) {
  await exec(
    `cross-env MODULES=${format} npx babel --config-file ./scripts/babel/babel.config.react.js src/react --out-dir ${outputDir}/${format}/react`,
  );
  await addBannerToFile(`./${outputDir}/${format}/react/swiper-react.js`, 'React');

  const pkg = JSON.stringify(
    {
      name: `swiper/react`,
      private: true,
      main: `../cjs/react/swiper-react.js`,
      'jsnext:main': `../esm/react/swiper-react.js`,
      module: `../esm/react/swiper-react.js`,
      types: `./swiper-react.d.ts`,
      sideEffects: false,
    },
    '',
    2,
  );
  fs.writeFileSync(`./${outputDir}/react/package.json`, pkg);
}

module.exports = buildReact;
