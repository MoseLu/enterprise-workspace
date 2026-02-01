#!/usr/bin/env node
/**
 * 下载 jQuery 3.7.1 到 public 目录
 */
import { logger } from '@btc/shared-core';

import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicDir = resolve(__dirname, '../public');
const jqueryPath = resolve(publicDir, 'jquery-3.7.1.min.js');
const jqueryUrl = 'https://code.jquery.com/jquery-3.7.1.min.js';

logger.info('📥 正在下载 jQuery 3.7.1...');
logger.info(`   源: ${jqueryUrl}`);
logger.info(`   目标: ${jqueryPath}`);

https.get(jqueryUrl, (response) => {
  if (response.statusCode !== 200) {
    logger.error(`❌ 下载失败: HTTP ${response.statusCode}`);
    process.exit(1);
  }

  let data = '';
  response.on('data', (chunk) => {
    data += chunk;
  });

  response.on('end', () => {
    try {
      writeFileSync(jqueryPath, data, 'utf-8');
      logger.info('✅ jQuery 3.7.1 下载成功！');
      logger.info(`   文件大小: ${(data.length / 1024).toFixed(2)} KB`);
    } catch (error) {
      logger.error('❌ 保存文件失败:', error);
      process.exit(1);
    }
  });
}).on('error', (error) => {
  logger.error('❌ 下载失败:', error.message);
  logger.error('   请检查网络连接或手动下载:');
  logger.error(`   ${jqueryUrl}`);
  process.exit(1);
});
