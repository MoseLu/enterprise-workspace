/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Plugin } from 'vite';
import { parse, compileScript } from '@vue/compiler-sfc';
import MagicString from 'magic-string';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { config } from '../config';

/**
 * 尝试解析文件路径，自动添加扩展名
 */
function resolveFilePath(baseDir: string, file: string, cwd: string): string | null {
  // 如果是绝对路径，直接返回
  if (!file.startsWith('.')) {
    // 如果以 node_modules 开头，从项目根目录解析
    if (file.startsWith('node_modules')) {
      const basePath = resolve(cwd, file);
      const extensions = ['', '.ts', '.d.ts', '.tsx', '.js', '.mjs'];
      for (const ext of extensions) {
        const fullPath = basePath + ext;
        if (existsSync(fullPath)) {
          return fullPath;
        }
      }
      return null;
    }
    return file;
  }

  // 相对路径，需要解析
  const basePath = resolve(baseDir, file);

  // 尝试不同的扩展名
  const extensions = ['', '.ts', '.d.ts', '.tsx', '.js', '.mjs'];

  for (const ext of extensions) {
    const fullPath = basePath + ext;
    if (existsSync(fullPath)) {
      return fullPath;
    }
  }

  return null;
}

/**
 * 处理 Vue 组件的 name 标签
 */
export function createTag(code: string, id: string): { code: string; map: any } | null {
  if (/\.vue$/.test(id)) {
    let s: MagicString | undefined;
    const str = () => s || (s = new MagicString(code));
    const { descriptor } = parse(code);

    if (!descriptor.script && descriptor.scriptSetup) {
      // 清理 id 中的查询参数，获取真实文件路径
      const filename = id.split('?')[0] || id;
      if (!filename) return null;
      const fileDir = dirname(filename);

      const res = compileScript(descriptor, {
        id: filename,
        fs: {
          fileExists: (file: string) => {
            // 尝试不同的解析策略
            let resolvedPath: string | null = null;
            const cwd = process.cwd();

            // 1. 如果已经是绝对路径，直接使用
            if (resolve(file) === file) {
              resolvedPath = file;
            }
            // 2. 如果是相对路径，相对于 Vue 文件解析
            else if (file.startsWith('.')) {
              resolvedPath = resolveFilePath(fileDir, file, cwd);
            }
            // 3. 否则尝试相对于文件目录解析
            else {
              resolvedPath = resolveFilePath(fileDir, `./${file}`, cwd);
            }

            return resolvedPath !== null && existsSync(resolvedPath);
          },
          readFile: (file: string) => {
            // 使用相同的解析逻辑
            let resolvedPath: string | null = null;
            const cwd = process.cwd();

            if (resolve(file) === file) {
              resolvedPath = file;
            } else if (file.startsWith('.')) {
              resolvedPath = resolveFilePath(fileDir, file, cwd);
            } else {
              resolvedPath = resolveFilePath(fileDir, `./${file}`, cwd);
            }

            if (!resolvedPath || !existsSync(resolvedPath)) {
              throw new Error(`Cannot resolve file: ${file} (base: ${fileDir})`);
            }
            return readFileSync(resolvedPath, 'utf-8');
          },
        },
      });
      const { name, lang }: any = res.attrs;

      if (name) {
        str().appendLeft(
          0,
          `<script lang="${lang || 'ts'}">
import { defineComponent } from 'vue'
export default defineComponent({
	name: "${name}"
})
</script>\n`
        );

        return {
          map: str().generateMap(),
          code: str().toString(),
        };
      }
    }
  }

  return null;
}

/**
 * 名称标签插件
 * 自动给 Vue 组件添加 name 属性（支持 <script setup name="ComponentName"> 语法）
 */
export function tagPlugin(): Plugin {
  return {
    name: 'btc:tag',

    enforce: 'pre',

    transform(code: string, id: string) {
      // 只有开启了 nameTag 配置才处理
      if (!config.nameTag) {
        return null;
      }

      const result = createTag(code, id);

      if (result) {
        return result;
      }

      return null;
    },
  } as unknown as Plugin;
}
