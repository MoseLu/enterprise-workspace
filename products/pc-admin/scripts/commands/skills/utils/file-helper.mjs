/**
 * Skills文件操作工具
 * 提供SKILL.md文件的读写功能
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { logger } from './logger.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 获取项目根目录
 */
function getRootDir() {
  return join(__dirname, '../../../../');
}

/**
 * 获取父目录（用于查找 .cursor/skills）
 */
function getParentDir() {
  const rootDir = getRootDir();
  return join(rootDir, '../');
}

/**
 * 获取skills目录
 * 优先查找父目录的 .cursor/skills，如果不存在则查找项目根目录的 .claude/skills
 */
export function getSkillsDir() {
  // 优先查找父目录的 .cursor/skills
  const parentCursorSkills = join(getParentDir(), '.cursor', 'skills');
  if (existsSync(parentCursorSkills)) {
    return parentCursorSkills;
  }
  
  // 如果不存在，查找项目根目录的 .claude/skills
  const projectClaudeSkills = join(getRootDir(), '.claude', 'skills');
  return projectClaudeSkills;
}

/**
 * 获取skill文件路径
 * @param {string} skillName - skill名称
 */
export function getSkillFilePath(skillName) {
  return join(getSkillsDir(), skillName, 'SKILL.md');
}

/**
 * 读取SKILL.md文件
 * @param {string} skillName - skill名称
 * @returns {string} 文件内容
 */
export function readSkillFile(skillName) {
  const filePath = getSkillFilePath(skillName);
  
  if (!existsSync(filePath)) {
    throw new Error(`Skill文件不存在: ${filePath}`);
  }
  
  try {
    return readFileSync(filePath, 'utf-8');
  } catch (error) {
    logger.error(`读取Skill文件失败: ${filePath}`, error);
    throw error;
  }
}

/**
 * 写入SKILL.md文件
 * @param {string} skillName - skill名称
 * @param {string} content - 文件内容
 */
export function writeSkillFile(skillName, content) {
  const filePath = getSkillFilePath(skillName);
  const dir = dirname(filePath);
  
  // 确保目录存在
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  
  try {
    writeFileSync(filePath, content, 'utf-8');
    logger.info(`Skill文件已更新: ${filePath}`);
  } catch (error) {
    logger.error(`写入Skill文件失败: ${filePath}`, error);
    throw error;
  }
}

/**
 * 备份SKILL.md文件
 * @param {string} skillName - skill名称
 * @param {string} backupSuffix - 备份后缀（可选）
 * @returns {string} 备份文件路径
 */
export function backupSkillFile(skillName, backupSuffix = null) {
  const filePath = getSkillFilePath(skillName);
  const rootDir = getRootDir();
  const backupDir = join(rootDir, '.claude', 'skills-meta', 'optimizations');
  
  // 确保备份目录存在
  if (!existsSync(backupDir)) {
    mkdirSync(backupDir, { recursive: true });
  }
  
  if (!existsSync(filePath)) {
    throw new Error(`Skill文件不存在，无法备份: ${filePath}`);
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const suffix = backupSuffix || timestamp;
  const backupPath = join(backupDir, `${skillName}-${suffix}.md`);
  
  try {
    copyFileSync(filePath, backupPath);
    logger.info(`Skill文件已备份: ${backupPath}`);
    return backupPath;
  } catch (error) {
    logger.error(`备份Skill文件失败: ${filePath} -> ${backupPath}`, error);
    throw error;
  }
}

/**
 * 检查skill文件是否存在
 * @param {string} skillName - skill名称
 * @returns {boolean}
 */
export function skillFileExists(skillName) {
  const filePath = getSkillFilePath(skillName);
  return existsSync(filePath);
}

/**
 * 获取所有skills列表
 * @returns {string[]} skill名称列表
 */
export function getAllSkills() {
  const skillsDir = getSkillsDir();
  
  if (!existsSync(skillsDir)) {
    return [];
  }
  
  try {
    return readdirSync(skillsDir)
      .filter(item => {
        const itemPath = join(skillsDir, item);
        return statSync(itemPath).isDirectory() && 
               existsSync(join(itemPath, 'SKILL.md'));
      });
  } catch (error) {
    logger.error('获取skills列表失败:', error);
    return [];
  }
}
