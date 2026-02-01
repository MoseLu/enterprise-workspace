import { logger } from '@btc/shared-core';
import XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 创建用户导入模板数据
const templateData = [
  {
    '用户名': 'admin',
    '姓名': '管理员',
    '邮箱': 'admin@example.com',
    '状态': '1',
    '头像': 'https://via.placeholder.com/100'
  },
  {
    '用户名': 'user1',
    '姓名': '张三',
    '邮箱': 'zhangsan@example.com',
    '状态': '1',
    '头像': ''
  },
  {
    '用户名': 'user2',
    '姓名': '李四',
    '邮箱': 'lisi@example.com',
    '状态': '0',
    '头像': ''
  }
];

// 创建工作簿
const wb = XLSX.utils.book_new();

// 创建工作表
const ws = XLSX.utils.json_to_sheet(templateData);

// 设置列宽
ws['!cols'] = [
  { wch: 15 }, // 用户名
  { wch: 15 }, // 姓名
  { wch: 25 }, // 邮箱
  { wch: 10 }, // 状态
  { wch: 30 }  // 头像
];

// 添加工作表到工作簿
XLSX.utils.book_append_sheet(wb, ws, '用户导入模板');

// 确保目录存在
const templateDir = path.join(__dirname, '../public/templates');
if (!fs.existsSync(templateDir)) {
  fs.mkdirSync(templateDir, { recursive: true });
}

// 写入文件
const outputPath = path.join(templateDir, 'users.xlsx');
XLSX.writeFile(wb, outputPath);

logger.info('用户导入模板已生成:', outputPath);
