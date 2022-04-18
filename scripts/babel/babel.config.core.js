let modules = process.env.MODULES || false;
if (modules === 'esm' || modules === 'false') modules = false;

module.exports = {
  ignore: [
    '../../src/angular/**/*.js',
    '../../src/react/**/*.js',
    '../../src/*-react.js',
    '../../src/vue/**/*.js',
    '../../src/*-vue.js',
    '../../src/copy/*',
    '../../src/svelte/**/*.js',
    '../../src/*-svelte.js',
  ],
  presets: [['@babel/preset-env', { modules, loose: true }]],
};
