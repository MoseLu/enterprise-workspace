/**
 * PostCSS 配置
 */
module.exports = {
  plugins: {
    autoprefixer: {
      overrideBrowserslist: [
        '> 1%',
        'last 2 versions',
        'not dead',
        'not IE 11',
      ],
    },
    'postcss-pxtorem': {
      rootValue: 16,
      unitPrecision: 5,
      propList: ['*'],
      selectorBlackList: ['.norem'],
      unitToRem: 'px',
      resize: false,
    },
  },
};
