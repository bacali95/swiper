const exec = require('exec-sh');

async function buildAngular() {
  return exec.promise(`ng build swiper --configuration production`);
}

module.exports = buildAngular;
