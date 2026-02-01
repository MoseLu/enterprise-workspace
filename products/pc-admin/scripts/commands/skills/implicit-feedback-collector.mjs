/**
 * 隐式反馈采集器
 * 检测用户是否采纳skill建议，是否修改了skill输出的内容
 */

import { getDbManager } from './database/db.mjs';
import { logger } from './utils/logger.mjs';
import { readFileSync, existsSync, statSync } from 'fs';
import { join } from 'path';
import { readFile } from 'fs/promises';

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
 * 检测文件是否被修改
 * @param {string} filePath - 文件路径
 * @param {number} baselineTime - 基准时间（执行开始时间）
 * @returns {boolean} 是否被修改
 */
async function isFileModified(filePath, baselineTime) {
  try {
    if (!existsSync(filePath)) {
      return false;
    }
    
    const stats = statSync(filePath);
    return stats.mtimeMs > baselineTime;
  } catch (error) {
    return false;
  }
}

/**
 * 检测文件内容是否被手动修改
 * @param {string} filePath - 文件路径
 * @param {string} originalContent - 原始内容（skill生成的内容）
 * @returns {object} 修改检测结果
 */
async function detectFileChanges(filePath, originalContent) {
  try {
    if (!existsSync(filePath)) {
      return {
        modified: false,
        exists: false
      };
    }
    
    const currentContent = await readFile(filePath, 'utf-8');
    const isModified = currentContent !== originalContent;
    
    // 简单的差异检测（可以扩展为更复杂的diff算法）
    const changes = {
      modified: isModified,
      exists: true,
      size_changed: currentContent.length !== originalContent.length,
      content_different: isModified
    };
    
    return changes;
  } catch (error) {
    logger.error(`[ImplicitFeedback] 检测文件变更失败:`, error);
    return {
      modified: false,
      error: error.message
    };
  }
}

/**
 * 收集隐式反馈
 * @param {string} executionId - 执行ID
 * @param {object} options - 选项
 * @param {array} generatedFiles - skill生成的文件列表
 * @param {object} fileBaselines - 文件基准内容（可选）
 */
export async function collectImplicitFeedback(executionId, options = {}) {
  const config = getConfig();
  
  if (!config.data_collection?.implicit_feedback_enabled) {
    return;
  }
  
  const db = getDbManager();
  
  try {
    // 获取执行记录
    const execution = db.prepare(`
      SELECT start_time, skill_name FROM executions WHERE execution_id = ?
    `).get(executionId);
    
    if (!execution) {
      logger.warn(`[ImplicitFeedback] 执行记录不存在: ${executionId}`);
      return;
    }
    
    const { start_time, skill_name } = execution;
    const generatedFiles = options.generatedFiles || [];
    const fileBaselines = options.fileBaselines || {};
    
    const feedbackRecords = [];
    
    // 检测文件修改
    for (const filePath of generatedFiles) {
      const baselineContent = fileBaselines[filePath];
      
      if (baselineContent) {
        // 检测内容变更
        const changes = await detectFileChanges(filePath, baselineContent);
        
        if (changes.modified || changes.content_different) {
          feedbackRecords.push({
            execution_id: executionId,
            feedback_type: 'file_modified',
            action_taken: 'user_modified_generated_file',
            file_changes: JSON.stringify({
              file: filePath,
              changes
            }),
            adoption_rate: 0.5 // 部分采纳（用户修改了内容）
          });
        } else {
          // 文件未被修改，表示完全采纳
          feedbackRecords.push({
            execution_id: executionId,
            feedback_type: 'file_adopted',
            action_taken: 'file_kept_as_is',
            file_changes: JSON.stringify({
              file: filePath,
              changes: { modified: false }
            }),
            adoption_rate: 1.0 // 完全采纳
          });
        }
      } else {
        // 检测文件是否在基准时间后被修改
        const modified = await isFileModified(filePath, start_time);
        
        if (modified) {
          feedbackRecords.push({
            execution_id: executionId,
            feedback_type: 'file_modified_after_execution',
            action_taken: 'file_modified',
            file_changes: JSON.stringify({
              file: filePath,
              detected_modification: true
            }),
            adoption_rate: 0.5
          });
        }
      }
    }
    
    // 保存反馈记录
    if (feedbackRecords.length > 0) {
      const stmt = db.prepare(`
        INSERT INTO implicit_feedback (
          execution_id, feedback_type, action_taken, file_changes, adoption_rate
        ) VALUES (?, ?, ?, ?, ?)
      `);
      
      for (const record of feedbackRecords) {
        stmt.run(
          record.execution_id,
          record.feedback_type,
          record.action_taken,
          record.file_changes,
          record.adoption_rate
        );
      }
      
      logger.info(`[ImplicitFeedback] 隐式反馈已收集: ${executionId}, 记录数=${feedbackRecords.length}`);
    }
    
    return {
      success: true,
      recordsCount: feedbackRecords.length,
      adoptionRate: feedbackRecords.length > 0
        ? feedbackRecords.reduce((sum, r) => sum + r.adoption_rate, 0) / feedbackRecords.length
        : 0
    };
  } catch (error) {
    logger.error(`[ImplicitFeedback] 收集隐式反馈失败:`, error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 检测用户是否采纳了skill建议
 * @param {string} executionId - 执行ID
 * @param {array} suggestions - skill建议列表
 * @returns {object} 采纳情况
 */
export async function detectSuggestionAdoption(executionId, suggestions = []) {
  const config = getConfig();
  
  if (!config.data_collection?.implicit_feedback_enabled) {
    return { adopted: [], notAdopted: [] };
  }
  
  // 这里可以根据具体的建议类型进行检测
  // 例如：如果建议是"修改配置文件"，检测配置文件是否被修改
  // 如果建议是"运行某个命令"，检测命令是否被执行
  
  const adopted = [];
  const notAdopted = [];
  
  // TODO: 实现具体的采纳检测逻辑
  // 这需要根据不同的建议类型来实现不同的检测方法
  
  return { adopted, notAdopted };
}
