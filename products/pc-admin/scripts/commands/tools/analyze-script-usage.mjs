#!/usr/bin/env node

/**
 * 分析 scripts 目录下脚本的实际使用情况
 * 检查哪些脚本被引用，哪些可能是过时的
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname, extname, basename } from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const scriptsDir = join(rootDir, 'scripts');

// 获取所有脚本文件
function getAllScriptFiles() {
  const files = [];
  const entries = readdirSync(scriptsDir, { withFileTypes: true });
  
  for (const entry of entries) {
    if (entry.isFile()) {
      const ext = extname(entry.name);
      if (['.js', '.mjs', '.sh', '.ps1'].includes(ext)) {
        files.push(entry.name);
      }
    } else if (entry.isDirectory() && entry.name !== 'node_modules') {
      // 递归读取子目录
      const subDir = join(scriptsDir, entry.name);
      const subFiles = readdirSync(subDir, { withFileTypes: true });
      for (const subEntry of subFiles) {
        if (subEntry.isFile()) {
          const ext = extname(subEntry.name);
          if (['.js', '.mjs', '.sh', '.ps1'].includes(ext)) {
            files.push(`${entry.name}/${subEntry.name}`);
          }
        }
      }
    }
  }
  
  return files.sort();
}

// 从 package.json 中提取脚本引用
function getPackageJsonReferences() {
  const packageJsonPath = join(rootDir, 'package.json');
  const content = readFileSync(packageJsonPath, 'utf-8');
  const packageJson = JSON.parse(content);
  const references = new Set();
  
  if (packageJson.scripts) {
    for (const [key, value] of Object.entries(packageJson.scripts)) {
      // 提取 scripts/ 路径
      const matches = value.match(/scripts\/([^\s"']+)/g);
      if (matches) {
        matches.forEach(match => {
          const scriptPath = match.replace('scripts/', '');
          references.add(scriptPath);
        });
      }
    }
  }
  
  return references;
}

// 从文件中搜索脚本引用
async function searchScriptReferences(pattern) {
  const files = await glob(pattern, {
    cwd: rootDir,
    ignore: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
  });
  
  const references = new Set();
  
  for (const file of files) {
    try {
      const content = readFileSync(join(rootDir, file), 'utf-8');
      // 搜索 scripts/ 引用
      const matches = content.match(/scripts\/([^\s"']+\.(js|mjs|sh|ps1))/g);
      if (matches) {
        matches.forEach(match => {
          const scriptPath = match.replace('scripts/', '');
          references.add(scriptPath);
        });
      }
    } catch (error) {
      // 忽略无法读取的文件
    }
  }
  
  return references;
}

// 从脚本文件中搜索相互引用
async function getScriptInternalReferences() {
  const scriptFiles = getAllScriptFiles();
  const references = new Set();
  
  for (const scriptFile of scriptFiles) {
    const fullPath = join(scriptsDir, scriptFile);
    try {
      const content = readFileSync(fullPath, 'utf-8');
      // 搜索 scripts/ 引用
      const matches = content.match(/scripts\/([^\s"']+\.(js|mjs|sh|ps1))/g);
      if (matches) {
        matches.forEach(match => {
          const scriptPath = match.replace('scripts/', '');
          if (scriptPath !== scriptFile) {
            references.add(scriptPath);
          }
        });
      }
    } catch (error) {
      // 忽略无法读取的文件
    }
  }
  
  return references;
}

// 主函数
async function main() {
  console.log('🔍 分析 scripts 目录下的脚本使用情况...\n');
  
  // 获取所有脚本文件
  const allScripts = getAllScriptFiles();
  console.log(`📁 发现 ${allScripts.length} 个脚本文件\n`);
  
  // 获取所有引用
  const packageJsonRefs = getPackageJsonReferences();
  console.log(`📦 package.json 中引用了 ${packageJsonRefs.size} 个脚本`);
  
  const ciCdRefs = await searchScriptReferences([
    '.github/workflows/**/*.yml',
    '.github/workflows/**/*.yaml',
    'jenkins/**/*.groovy',
    'jenkins/**/*.Jenkinsfile',
    'Jenkinsfile*',
  ]);
  console.log(`🚀 CI/CD 配置中引用了 ${ciCdRefs.size} 个脚本`);
  
  const scriptInternalRefs = await getScriptInternalReferences();
  console.log(`🔗 脚本内部相互引用了 ${scriptInternalRefs.size} 个脚本`);
  
  // 合并所有引用
  const allReferences = new Set([
    ...packageJsonRefs,
    ...ciCdRefs,
    ...scriptInternalRefs,
  ]);
  
  // 分类脚本
  const usedScripts = [];
  const unusedScripts = [];
  
  for (const script of allScripts) {
    if (allReferences.has(script)) {
      usedScripts.push(script);
    } else {
      unusedScripts.push(script);
    }
  }
  
  // 输出结果
  console.log('\n' + '='.repeat(80));
  console.log('📊 分析结果');
  console.log('='.repeat(80));
  
  console.log(`\n✅ 被使用的脚本 (${usedScripts.length} 个):`);
  usedScripts.forEach(script => {
    const sources = [];
    if (packageJsonRefs.has(script)) sources.push('package.json');
    if (ciCdRefs.has(script)) sources.push('CI/CD');
    if (scriptInternalRefs.has(script)) sources.push('脚本内部');
    console.log(`  - ${script} (${sources.join(', ')})`);
  });
  
  console.log(`\n⚠️  未被引用的脚本 (${unusedScripts.length} 个，可能是过时的):`);
  unusedScripts.forEach(script => {
    console.log(`  - ${script}`);
  });
  
  // 生成详细报告
  console.log('\n' + '='.repeat(80));
  console.log('📋 详细引用来源');
  console.log('='.repeat(80));
  
  console.log('\npackage.json 引用:');
  Array.from(packageJsonRefs).sort().forEach(script => {
    console.log(`  - ${script}`);
  });
  
  console.log('\nCI/CD 引用:');
  Array.from(ciCdRefs).sort().forEach(script => {
    console.log(`  - ${script}`);
  });
  
  console.log('\n脚本内部引用:');
  Array.from(scriptInternalRefs).sort().forEach(script => {
    console.log(`  - ${script}`);
  });
  
  console.log('\n' + '='.repeat(80));
  console.log('💡 建议');
  console.log('='.repeat(80));
  console.log(`\n1. 检查 ${unusedScripts.length} 个未被引用的脚本，确认是否仍需要`);
  console.log('2. 如果确认不再使用，可以考虑删除或归档');
  console.log('3. 如果仍在使用但未检测到，请手动添加到引用列表');
  console.log('\n');
}

main().catch(error => {
  console.error('❌ 分析失败:', error);
  process.exit(1);
});
