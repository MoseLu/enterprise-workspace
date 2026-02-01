/**
 * Style Dictionary 配置文件
 * 用于将设计令牌编译为多种格式（CSS、SCSS、TypeScript等）
 */

import transforms from './transforms.js';

export default {
  source: ['tokens/**/*.json'],
  platforms: {
    css: {
      transforms: [
        'attribute/cti',
        'name/kebab',
        'size/px',
        'color/css',
      ],
      buildPath: 'dist/css/',
      files: [
        {
          destination: 'variables.css',
          format: 'css/variables',
          filter: (token) => {
            // 只输出 btc.* 路径的变量
            return token.path[0] === 'btc';
          },
          options: {
            selector: ':root',
            variableNameTransform: (token) => {
              // 自定义变量名转换：生成 --btc-* 格式
              const path = token.path;
              // 跳过 'btc' 前缀
              const parts = path.slice(1);
              const name = parts
                .map((part) => part.replace(/([A-Z])/g, '-$1').toLowerCase())
                .join('-');
              return `--btc-${name}`;
            },
          },
        },
      ],
    },
    scss: {
      transforms: [
        'attribute/cti',
        'name/kebab',
        'size/px',
        'color/css',
      ],
      buildPath: 'dist/scss/',
      files: [
        {
          destination: '_variables.scss',
          format: 'scss/variables',
          filter: (token) => {
            // 只输出 btc.* 路径的变量
            return token.path[0] === 'btc';
          },
          options: {
            variableNameTransform: (token) => {
              // 自定义变量名转换：生成 $btc-* 格式
              const path = token.path;
              // 跳过 'btc' 前缀
              const parts = path.slice(1);
              const name = parts
                .map((part) => part.replace(/([A-Z])/g, '-$1').toLowerCase())
                .join('-');
              return `$btc-${name}`;
            },
          },
        },
      ],
    },
    ts: {
      transforms: [
        'attribute/cti',
        'name/camel',
        'size/px',
        'color/css',
      ],
      buildPath: 'dist/ts/',
      files: [
        {
          destination: 'tokens.ts',
          format: 'typescript/es6-declarations',
          filter: (token) => {
            // 只输出 btc.* 路径的变量
            return token.path[0] === 'btc';
          },
        },
      ],
    },
  },
};
