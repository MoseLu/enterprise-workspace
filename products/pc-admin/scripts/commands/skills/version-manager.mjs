/**
 * 技能版本化管理系统
 * 支持技能版本管理、回滚、灰度发布
 */

import { getDbManager } from './database/db.mjs';
import { logger } from './utils/logger.mjs';
import { readSkillFile, writeSkillFile, backupSkillFile } from './utils/file-helper.mjs';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

/**
 * 读取配置
 */
function getConfig() {
  try {
    const configPath = join(process.cwd(), '.claude', 'skills-meta', 'config.json');
    if (existsSync(configPath)) {
      const configContent = readFileSync(configPath, 'utf-8');
      return JSON.parse(configContent);
    }
  } catch (error) {
    // 忽略配置读取错误
  }
  return {};
}

/**
 * 计算内容哈希
 * @param {string} content - 内容
 * @returns {string} 哈希值
 */
function calculateContentHash(content) {
  return createHash('sha256').update(content).digest('hex').substring(0, 16);
}

/**
 * 生成版本号
 * @param {string} skillName - skill名称
 * @returns {string} 版本号
 */
function generateVersion(skillName) {
  const db = getDbManager();
  
  // 获取当前最新版本
  const latest = db.prepare(`
    SELECT version FROM skill_versions
    WHERE skill_name = ?
    ORDER BY created_at DESC
    LIMIT 1
  `).get(skillName);
  
  if (!latest) {
    return '1.0.0';
  }
  
  // 简单的版本递增：主版本.次版本.修订版本
  const parts = latest.version.split('.').map(Number);
  parts[2] = (parts[2] || 0) + 1; // 修订版本+1
  
  return parts.join('.');
}

/**
 * 创建技能版本
 * @param {string} skillName - skill名称
 * @param {object} options - 选项
 * @returns {object} 版本信息
 */
export function createSkillVersion(skillName, options = {}) {
  const config = getConfig();
  const db = getDbManager();
  
  if (!config.skill_versioning?.enable_versioning) {
    return {
      success: false,
      message: '版本化管理未启用'
    };
  }
  
  try {
    // 读取当前skill内容
    const content = readSkillFile(skillName);
    const contentHash = calculateContentHash(content);
    
    // 检查是否与最新版本相同
    const latest = db.prepare(`
      SELECT content_hash FROM skill_versions
      WHERE skill_name = ?
      ORDER BY created_at DESC
      LIMIT 1
    `).get(skillName);
    
    if (latest && latest.content_hash === contentHash) {
      return {
        success: false,
        message: '内容未变化，无需创建新版本',
        currentVersion: latest.version
      };
    }
    
    // 获取当前指标（优化前）
    const metricsBefore = getCurrentMetrics(skillName);
    
    // 生成版本号
    const version = options.version || generateVersion(skillName);
    
    // 备份当前版本（如果启用）
    if (config.skill_versioning?.auto_backup) {
      try {
        backupSkillFile(skillName, `v${version}`);
      } catch (err) {
        logger.warn(`[VersionManager] 备份失败:`, err.message);
      }
    }
    
    // 保存版本记录
    const stmt = db.prepare(`
      INSERT INTO skill_versions (
        skill_name, version, content_hash, change_summary,
        metrics_before, created_by
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      skillName,
      version,
      contentHash,
      options.changeSummary || '自动创建版本',
      JSON.stringify(metricsBefore),
      options.createdBy || 'system'
    );
    
    // 更新skill_metrics的current_version
    db.prepare(`
      UPDATE skill_metrics SET current_version = ?
      WHERE skill_name = ?
    `).run(version, skillName);
    
    logger.info(`[VersionManager] 技能版本已创建: ${skillName} v${version}`);
    
    return {
      success: true,
      skillName,
      version,
      contentHash,
      metricsBefore
    };
  } catch (error) {
    logger.error(`[VersionManager] 创建技能版本失败:`, error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 获取当前指标
 * @param {string} skillName - skill名称
 * @returns {object} 指标
 */
export function getCurrentMetrics(skillName) {
  const db = getDbManager();
  
  try {
    const metrics = db.prepare(`
      SELECT * FROM skill_metrics WHERE skill_name = ?
    `).get(skillName);
    
    if (!metrics) {
      return null;
    }
    
    return {
      total_executions: metrics.total_executions,
      success_rate: metrics.success_rate,
      avg_rating: metrics.avg_rating,
      avg_iterations: metrics.avg_iterations,
      avg_duration: metrics.avg_duration
    };
  } catch (error) {
    return null;
  }
}

/**
 * 回滚技能版本
 * @param {string} skillName - skill名称
 * @param {string} version - 版本号（可选，默认回滚到上一版本）
 * @returns {object} 回滚结果
 */
export function rollbackSkillVersion(skillName, version = null) {
  const config = getConfig();
  const db = getDbManager();
  
  if (!config.skill_versioning?.enable_versioning) {
    return {
      success: false,
      message: '版本化管理未启用'
    };
  }
  
  try {
    let targetVersion = version;
    
    // 如果没有指定版本，回滚到上一版本
    if (!targetVersion) {
      const versions = db.prepare(`
        SELECT version FROM skill_versions
        WHERE skill_name = ?
        ORDER BY created_at DESC
        LIMIT 2
      `).all(skillName);
      
      if (versions.length < 2) {
        return {
          success: false,
          message: '没有可回滚的版本'
        };
      }
      
      targetVersion = versions[1].version; // 第二新的版本
    }
    
    // 获取目标版本的内容哈希
    const targetVersionRecord = db.prepare(`
      SELECT content_hash FROM skill_versions
      WHERE skill_name = ? AND version = ?
    `).get(skillName, targetVersion);
    
    if (!targetVersionRecord) {
      return {
        success: false,
        message: `版本 ${targetVersion} 不存在`
      };
    }
    
    // 从备份恢复（如果存在）
    try {
      const backupPath = join(
        process.cwd(),
        '.claude',
        'skills-meta',
        'optimizations',
        `${skillName}-v${targetVersion}.md`
      );
      
      if (existsSync(backupPath)) {
        const backupContent = readFileSync(backupPath, 'utf-8');
        writeSkillFile(skillName, backupContent);
        
        logger.info(`[VersionManager] 技能已回滚: ${skillName} -> v${targetVersion}`);
        
        return {
          success: true,
          skillName,
          version: targetVersion,
          method: 'backup_restore'
        };
      }
    } catch (err) {
      logger.warn(`[VersionManager] 从备份恢复失败:`, err.message);
    }
    
    // 如果备份不存在，无法回滚（因为版本记录只保存了哈希，不保存完整内容）
    return {
      success: false,
      message: `无法回滚：备份文件不存在，请手动恢复版本 ${targetVersion}`
    };
  } catch (error) {
    logger.error(`[VersionManager] 回滚技能版本失败:`, error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 获取技能版本列表
 * @param {string} skillName - skill名称
 * @returns {array} 版本列表
 */
export function getSkillVersions(skillName) {
  const db = getDbManager();
  
  try {
    const versions = db.prepare(`
      SELECT * FROM skill_versions
      WHERE skill_name = ?
      ORDER BY created_at DESC
    `).all(skillName);
    
    return versions.map(v => ({
      ...v,
      metrics_before: v.metrics_before ? JSON.parse(v.metrics_before) : null,
      metrics_after: v.metrics_after ? JSON.parse(v.metrics_after) : null
    }));
  } catch (error) {
    logger.error(`[VersionManager] 获取技能版本列表失败:`, error);
    return [];
  }
}

/**
 * 设置技能版本为活跃
 * @param {string} skillName - skill名称
 * @param {string} version - 版本号
 * @returns {object} 结果
 */
export function setActiveVersion(skillName, version) {
  const db = getDbManager();
  
  try {
    // 先取消所有版本的活跃状态
    db.prepare(`
      UPDATE skill_versions SET is_active = 0
      WHERE skill_name = ?
    `).run(skillName);
    
    // 设置指定版本为活跃
    db.prepare(`
      UPDATE skill_versions SET is_active = 1
      WHERE skill_name = ? AND version = ?
    `).run(skillName, version);
    
    // 更新skill_metrics
    db.prepare(`
      UPDATE skill_metrics SET current_version = ?
      WHERE skill_name = ?
    `).run(version, skillName);
    
    logger.info(`[VersionManager] 活跃版本已设置: ${skillName} v${version}`);
    
    return {
      success: true,
      skillName,
      version
    };
  } catch (error) {
    logger.error(`[VersionManager] 设置活跃版本失败:`, error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 开始灰度发布
 * @param {string} skillName - skill名称
 * @param {string} version - 版本号
 * @param {number} percentage - 灰度百分比
 * @returns {object} 结果
 */
export function startGradualRollout(skillName, version, percentage = 10) {
  const config = getConfig();
  const db = getDbManager();
  
  if (!config.gradual_rollout?.enable_gradual_rollout) {
    return {
      success: false,
      message: '灰度发布未启用'
    };
  }
  
  try {
    // 更新版本的灰度百分比
    db.prepare(`
      UPDATE skill_versions SET rollout_percentage = ?
      WHERE skill_name = ? AND version = ?
    `).run(percentage, skillName, version);
    
    logger.info(`[VersionManager] 灰度发布已启动: ${skillName} v${version} (${percentage}%)`);
    
    return {
      success: true,
      skillName,
      version,
      rolloutPercentage: percentage,
      startTime: Date.now()
    };
  } catch (error) {
    logger.error(`[VersionManager] 启动灰度发布失败:`, error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 增加灰度发布比例
 * @param {string} skillName - skill名称
 * @param {string} version - 版本号
 * @returns {object} 结果
 */
export function incrementRollout(skillName, version) {
  const config = getConfig();
  const db = getDbManager();
  
  try {
    const current = db.prepare(`
      SELECT rollout_percentage FROM skill_versions
      WHERE skill_name = ? AND version = ?
    `).get(skillName, version);
    
    if (!current) {
      return {
        success: false,
        message: '版本不存在'
      };
    }
    
    const increment = config.gradual_rollout?.rollout_increment || 10;
    const newPercentage = Math.min(100, current.rollout_percentage + increment);
    
    db.prepare(`
      UPDATE skill_versions SET rollout_percentage = ?
      WHERE skill_name = ? AND version = ?
    `).run(newPercentage, skillName, version);
    
    logger.info(`[VersionManager] 灰度比例已增加: ${skillName} v${version} (${newPercentage}%)`);
    
    return {
      success: true,
      skillName,
      version,
      rolloutPercentage: newPercentage
    };
  } catch (error) {
    logger.error(`[VersionManager] 增加灰度比例失败:`, error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 检查是否应该使用新版本（基于灰度百分比）
 * @param {string} skillName - skill名称
 * @param {string} executionId - 执行ID（用于一致性哈希）
 * @returns {object} 版本信息
 */
export function getVersionForExecution(skillName, executionId) {
  const db = getDbManager();
  
  try {
    // 获取所有有灰度设置的版本
    const versions = db.prepare(`
      SELECT version, rollout_percentage, is_active
      FROM skill_versions
      WHERE skill_name = ? AND rollout_percentage > 0
      ORDER BY created_at DESC
    `).all(skillName);
    
    if (versions.length === 0) {
      // 没有灰度版本，返回当前活跃版本
      const active = db.prepare(`
        SELECT version FROM skill_versions
        WHERE skill_name = ? AND is_active = 1
        ORDER BY created_at DESC
        LIMIT 1
      `).get(skillName);
      
      return {
        version: active?.version || null,
        isGradualRollout: false
      };
    }
    
    // 使用执行ID进行一致性哈希，决定使用哪个版本
    const hash = parseInt(executionId.slice(-8), 16) % 100;
    
    for (const v of versions) {
      if (hash < v.rollout_percentage) {
        return {
          version: v.version,
          isGradualRollout: true,
          rolloutPercentage: v.rollout_percentage
        };
      }
    }
    
    // 默认返回当前活跃版本
    const active = db.prepare(`
      SELECT version FROM skill_versions
      WHERE skill_name = ? AND is_active = 1
      ORDER BY created_at DESC
      LIMIT 1
    `).get(skillName);
    
    return {
      version: active?.version || null,
      isGradualRollout: false
    };
  } catch (error) {
    logger.error(`[VersionManager] 获取执行版本失败:`, error);
    return {
      version: null,
      isGradualRollout: false
    };
  }
}
