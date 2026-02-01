/* eslint-disable @typescript-eslint/no-explicit-any */
;
import fs from 'fs';
import { join } from 'path';
import prettier from 'prettier';

let projectRoot = process.cwd();

export function setRootDir(root: string): void {
  if (!root) return;
  projectRoot = root;
}

/**
 * 获取项目根目录
 */
export function rootDir(path: string): string {
  return join(projectRoot, path);
}

/**
 * 首字母大写
 */
export function firstUpperCase(value: string): string {
  return value.replace(/\b(\w)(\w*)/g, function (_$0, $1, $2) {
    return $1.toUpperCase() + $2;
  });
}

/**
 * 横杠转驼峰
 */
export function toCamel(str: string): string {
  return str.replace(/([^-])(?:-+([^-]))/g, function (_$0, $1, $2) {
    return $1 + $2.toUpperCase();
  });
}

/**
 * 创建目录
 */
export function createDir(path: string, recursive?: boolean): void {
  try {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive });
    }
  } catch (_err) {
    // ignore
  }
}

/**
 * 安全地移除JSON中的注释
 */
function removeJsonComments(content: string): string {
  let result = '';
  let inString = false;
  let stringChar = '';
  let escaped = false;
  let i = 0;

  while (i < content.length) {
    const char = content[i];
    const nextChar = content[i + 1];

    // 处理字符串状态
    if (!inString && (char === '"' || char === "'")) {
      inString = true;
      stringChar = char;
      result += char;
    } else if (inString && char === stringChar && !escaped) {
      inString = false;
      stringChar = '';
      result += char;
    } else if (inString) {
      // 在字符串内，直接添加字符
      result += char;
      escaped = char === '\\' && !escaped;
    } else {
      // 不在字符串内，检查注释
      if (char === '/' && nextChar === '/') {
        // 单行注释，跳过到行尾
        while (i < content.length && content[i] !== '\n') {
          i++;
        }
        if (i < content.length) {
          result += content[i]; // 保留换行符
        }
      } else if (char === '/' && nextChar === '*') {
        // 多行注释，跳过到 */
        i += 2;
        while (i < content.length - 1) {
          if (content[i] === '*' && content[i + 1] === '/') {
            i += 2;
            break;
          }
          i++;
        }
        continue;
      } else {
        result += char;
        escaped = false;
      }
    }

    i++;
  }

  return result;
}

/**
 * 读取文件
 */
export function readFile(path: string, json?: boolean): any {
  try {
    const content = fs.readFileSync(path, 'utf8');
    return json ? JSON.parse(removeJsonComments(content)) : content;
  } catch (_err) {
    // ignore
  }

  return json ? {} : '';
}

/**
 * 写入文件
 */
export function writeFile(path: string, data: string): void {
  try {
    fs.writeFileSync(path, data, 'utf8');
  } catch (_err) {
    // ignore
  }
}

/**
 * 解析 body
 */
export function parseJson(req: any): Promise<any> {
  return new Promise((resolve) => {
    let d = '';
    req.on('data', function (chunk: any) {
      d += chunk;
    });
    req.on('end', function () {
      try {
        resolve(JSON.parse(d));
      } catch {
        resolve({});
      }
    });
  });
}

/**
 * 格式化内容
 */
export async function formatContent(content: string, options?: prettier.Options): Promise<string> {
  return prettier.format(content, {
    parser: 'typescript',
    useTabs: true,
    tabWidth: 4,
    endOfLine: 'lf',
    semi: true,
    ...options,
  });
}

/**
 * 错误日志
 */
export function error(message: string): void {
  console.info('\x1B[31m%s\x1B[0m', message);
}

/**
 * 成功日志
 */
export function success(message: string): void {
  console.info('\x1B[32m%s\x1B[0m', message);
}

/**
 * 比较两个版本号
 */
export function compareVersion(version1: string, version2: string): number {
  const v1Parts = version1.split('.').map(Number);
  const v2Parts = version2.split('.').map(Number);

  const maxLength = Math.max(v1Parts.length, v2Parts.length);

  for (let i = 0; i < maxLength; i++) {
    const v1Part = v1Parts[i] || 0;
    const v2Part = v2Parts[i] || 0;

    if (v1Part > v2Part) return 1;
    if (v1Part < v2Part) return -1;
  }

  return 0;
}
