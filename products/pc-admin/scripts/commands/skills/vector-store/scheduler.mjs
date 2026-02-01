/**
 * 智能调度引擎
 * 根据任务需求自动推荐相关资源
 */

import { searchResources, searchResourcesByType } from './search.mjs';
import { logger } from '../utils/logger.mjs';

/**
 * 推荐资源
 */
export async function recommendResources(task, context = {}) {
  const {
    app,
    module,
    resourceTypes = ['composable', 'component', 'icon', 'skill'],
  } = context;

  logger.info(`Recommending resources for task: "${task}"`);

  const recommendations = {
    composables: [],
    components: [],
    icons: [],
    skills: [],
    utilities: [],
  };

  try {
    // 搜索各种类型的资源
    const searchPromises = [];

    if (resourceTypes.includes('composable')) {
      searchPromises.push(
        searchResourcesByType(task, 'composable', 5).then((results) => {
          recommendations.composables = results;
        })
      );
    }

    if (resourceTypes.includes('component')) {
      searchPromises.push(
        searchResourcesByType(task, 'component', 5).then((results) => {
          recommendations.components = results;
        })
      );
    }

    if (resourceTypes.includes('icon')) {
      searchPromises.push(
        searchResourcesByType(task, 'icon', 10).then((results) => {
          recommendations.icons = results;
        })
      );
    }

    if (resourceTypes.includes('skill')) {
      searchPromises.push(
        searchResourcesByType(task, 'skill', 3).then((results) => {
          recommendations.skills = results;
        })
      );
    }

    if (resourceTypes.includes('utility')) {
      searchPromises.push(
        searchResourcesByType(task, 'utility', 5).then((results) => {
          recommendations.utilities = results;
        })
      );
    }

    await Promise.all(searchPromises);

    // 根据上下文过滤和排序
    if (app || module) {
      recommendations.composables = filterByContext(
        recommendations.composables,
        app,
        module
      );
      recommendations.components = filterByContext(
        recommendations.components,
        app,
        module
      );
    }

    logger.info(`Recommended ${Object.values(recommendations).flat().length} resources`);
    return recommendations;
  } catch (error) {
    logger.error('Failed to recommend resources:', error);
    throw error;
  }
}

/**
 * 根据上下文过滤资源
 */
function filterByContext(resources, app, module) {
  return resources.filter((resource) => {
    const path = resource.metadata.path || '';

    if (app && !path.includes(`apps/${app}`)) {
      return false;
    }

    if (module && !path.includes(`modules/${module}`)) {
      return false;
    }

    return true;
  });
}

/**
 * 获取任务相关的完整资源集
 */
export async function getTaskResources(task, context = {}) {
  const recommendations = await recommendResources(task, context);

  return {
    task,
    context,
    recommendations,
    summary: {
      totalResources: Object.values(recommendations).flat().length,
      byType: {
        composables: recommendations.composables.length,
        components: recommendations.components.length,
        icons: recommendations.icons.length,
        skills: recommendations.skills.length,
        utilities: recommendations.utilities.length,
      },
    },
  };
}

/**
 * 格式化推荐结果（用于 Skills 使用）
 */
export function formatRecommendations(recommendations) {
  const lines = [];

  if (recommendations.composables.length > 0) {
    lines.push('## 推荐的 Composables');
    recommendations.composables.forEach((comp) => {
      lines.push(`- **${comp.metadata.name}** (${comp.score.toFixed(2)})`);
      lines.push(`  - 路径: \`${comp.metadata.path}\``);
      if (comp.metadata.description) {
        lines.push(`  - 描述: ${comp.metadata.description}`);
      }
    });
  }

  if (recommendations.components.length > 0) {
    lines.push('## 推荐的组件');
    recommendations.components.forEach((comp) => {
      lines.push(`- **${comp.metadata.name}** (${comp.score.toFixed(2)})`);
      lines.push(`  - 路径: \`${comp.metadata.path}\``);
    });
  }

  if (recommendations.icons.length > 0) {
    lines.push('## 推荐的图标');
    recommendations.icons.slice(0, 5).forEach((icon) => {
      lines.push(`- **${icon.metadata.name}** (${icon.metadata.category})`);
    });
  }

  if (recommendations.skills.length > 0) {
    lines.push('## 推荐的 Skills');
    recommendations.skills.forEach((skill) => {
      lines.push(`- **${skill.metadata.name}** (${skill.score.toFixed(2)})`);
      if (skill.metadata.description) {
        lines.push(`  - ${skill.metadata.description}`);
      }
    });
  }

  return lines.join('\n');
}
