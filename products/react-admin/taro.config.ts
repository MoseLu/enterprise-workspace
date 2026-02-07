/**
 * Taro 多端输出配置
 *
 * 支持 H5 和小程序输出
 * 使用方式：
 * - H5: pnpm dev:h5 / pnpm build:h5
 * - 微信小程序: pnpm dev:weapp / pnpm build:weapp
 */

import path from 'node:path';
import type { UserConfig } from '@tarojs/taro';

const config: UserConfig = {
  projectName: 'react-admin',
  date: '2026-02-07',
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2,
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: [],
  defineConstants: {},
  copy: {
    patterns: [],
    options: {},
  },
  framework: 'react',
  compiler: {
    type: 'webpack5',
    prebundle: {
      enable: false,
    },
  },
  mini: {
    compileType: 'bundle',
    webpackChain(chain) {
      chain.merge({
        externals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react-router-dom': 'ReactRouterDOM',
          antd: 'antd',
        },
      });
    },
    alias: {
      '@': path.resolve(__dirname, 'apps'),
      '@enterprise-workspace/frontend': path.resolve(__dirname, '../common/frontend'),
    },
  },
  h5: {
    webpackChain(chain) {
      chain.merge({
        externals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react-router-dom': 'ReactRouterDOM',
          antd: 'antd',
        },
      });
    },
    alias: {
      '@': path.resolve(__dirname, 'apps'),
      '@enterprise-workspace/frontend': path.resolve(__dirname, '../common/frontend'),
    },
    devServer: {
      port: 3000,
      host: '0.0.0.0',
    },
  },
};

export default config;
