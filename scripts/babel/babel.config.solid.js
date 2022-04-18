let modules = process.env.MODULES || false;
if (modules === 'esm' || modules === 'false') modules = false;

module.exports = {
  presets: ['solid', ['@babel/preset-env', { modules, loose: true }]],
};
