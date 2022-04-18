const exec = require('exec-sh');
const fs = require('fs-extra');
const { outputDir } = require('./utils/output-dir.js');
const { addBannerToFile } = require('./utils/banner.js');

async function buildSvelte(format) {
  await exec.promise(
    `cross-env MODULES=${format} npx babel src/svelte --out-dir ${outputDir}/${format}/svelte`,
  );
  await addBannerToFile(`./${outputDir}/${format}/svelte/swiper-svelte.js`, 'Svelte');

  const pkg = JSON.stringify(
    {
      name: `swiper/svelte`,
      private: true,
      main: `../cjs/svelte/swiper-svelte.js`,
      'jsnext:main': `../esm/svelte/swiper-svelte.js`,
      module: `../esm/svelte/swiper-svelte.js`,
      types: `./swiper-svelte.d.ts`,
      sideEffects: false,
    },
    '',
    2,
  );
  fs.writeFileSync(`./${outputDir}/svelte/package.json`, pkg);

  /* DON'T TRANSFORM SVELTE FILES
  // Transform svelte files
  let swiper = await fs.readFile('./src/svelte/swiper.svelte', 'utf8');
  const swiperResult = svelte.compile(swiper, {
    format: 'esm',
    filename: 'swiper.svelte',
  });
  swiper = swiperResult.js.code;
  await fs.writeFile(`./${outputDir}/svelte/swiper.js`, swiper);

  let swiperSlide = await fs.readFile('./src/svelte/swiper-slide.svelte', 'utf8');
  const swiperSlideResult = svelte.compile(swiperSlide, {
    format: 'esm',
    filename: 'swiper.svelte',
  });
  swiperSlide = swiperSlideResult.js.code;
  await fs.writeFile(`./${outputDir}/svelte/swiper-slide.js`, swiperSlide);
  */
  await fs.copyFile('./src/svelte/swiper.svelte', `./${outputDir}/svelte/swiper.svelte`);
  await fs.copyFile(
    './src/svelte/swiper-slide.svelte',
    `./${outputDir}/svelte/swiper-slide.svelte`,
  );
}

module.exports = buildSvelte;
