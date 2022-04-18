const fs = require('fs');
const path = require('path');
const { gzipSizeFromFileSync } = require('gzip-size');

function checkSize() {
  return [
    'swiper-bundle.min.js',
    //  'swiper-bundle.esm.js'
  ]
    .map((name) => {
      const filePath = path.join(__dirname, '../dist/', name);
      if (fs.existsSync(filePath)) {
        const gzippedSize = gzipSizeFromFileSync(filePath);
        const { size } = fs.statSync(filePath);
        console.log(`${name}: ${size} (${gzippedSize} gziped) bytes`);
        return { gzippedSize, size };
      }
      console.log(`${filePath} not exists`);
      return 0;
    })
    .reduce((total, num) => ({
      gzippedSize: total.gzippedSize + num.gzippedSize,
      size: total.size + num.size,
    }));
}

module.exports = checkSize;
