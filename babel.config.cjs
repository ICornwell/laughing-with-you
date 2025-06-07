// CommonJS version of Babel config for better compatibility
module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: {
        node: 'current',
      },
      modules: 'auto',
    }],
  ],
};
