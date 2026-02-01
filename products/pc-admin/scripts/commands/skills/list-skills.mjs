/**
 * 列出所有可用的 skills
 */

import { getAllSkills, readSkillFile } from './utils/file-helper.mjs';
import { logger } from './utils/logger.mjs';
import { fileURLToPath } from 'url';
import { resolve } from 'path';

/**
 * 从 SKILL.md 文件中提取描述信息
 * @param {string} skillName - skill名称
 * @returns {object} skill信息
 */
function getSkillInfo(skillName) {
  try {
    const content = readSkillFile(skillName);
    
    // 提取 frontmatter 中的 name 和 description
    const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
    if (frontmatterMatch) {
      const frontmatter = frontmatterMatch[1];
      const nameMatch = frontmatter.match(/^name:\s*(.+)$/m);
      const descMatch = frontmatter.match(/^description:\s*(.+)$/m);
      
      return {
        name: nameMatch ? nameMatch[1].trim() : skillName,
        description: descMatch ? descMatch[1].trim() : '无描述'
      };
    }
    
    // 如果没有 frontmatter，尝试从第一行标题提取
    const titleMatch = content.match(/^#\s+(.+)$/m);
    return {
      name: skillName,
      description: titleMatch ? titleMatch[1].trim() : '无描述'
    };
  } catch (error) {
    return {
      name: skillName,
      description: '无法读取描述'
    };
  }
}

/**
 * 列出所有 skills
 */
function listAllSkills() {
  const skills = getAllSkills();
  
  if (skills.length === 0) {
    logger.info('当前没有可用的 skills');
    return;
  }
  
  logger.info(`\n📚 当前可用的 Skills (共 ${skills.length} 个):\n`);
  logger.info('═'.repeat(80));
  
  const skillsInfo = skills.map(skillName => getSkillInfo(skillName));
  
  // 按名称排序
  skillsInfo.sort((a, b) => a.name.localeCompare(b.name));
  
  for (let i = 0; i < skillsInfo.length; i++) {
    const skill = skillsInfo[i];
    logger.info(`${(i + 1).toString().padStart(2)}. ${skill.name}`);
    logger.info(`    ${skill.description}`);
    logger.info('');
  }
  
  logger.info('═'.repeat(80));
  logger.info(`\n💡 使用方式: 在对话中要求使用某个 skill，例如："使用 ${skillsInfo[0]?.name || 'skill-name'} 技能"`);
  logger.info(`📁 Skills 文件位置: .claude/skills/{skill-name}/SKILL.md\n`);
}

// 如果直接运行此脚本
const __filename = fileURLToPath(import.meta.url);
const isMainModule = process.argv[1] && resolve(process.argv[1]) === __filename;

if (isMainModule) {
  listAllSkills();
}

export { listAllSkills, getSkillInfo };
