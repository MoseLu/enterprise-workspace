/**
 * 存储图标展示页面实现方案
 * 总结约20次迭代的完整实现过程
 */

import { getSolutionDatabase } from './solution-database.mjs';
import { updateSolutionScore, addSolutionVersion } from './solution-scoring.mjs';

/**
 * 主函数
 */
async function main() {
  console.log('📝 开始存储图标展示页面实现方案...\n');

  const db = getSolutionDatabase();

  // 方案ID
  const solutionId = 'icon-showcase-page-system-app-test-one';

  // 任务描述
  const taskDescription = `在 system-app 的 test 模块中实现自定义图标展示页面。页面需要展示所有可用的自定义图标（包括应用内图标和共享包图标），支持搜索、分类筛选、图标预览、复制图标名称等功能。要求使用项目标准组件（btc-xxx），布局间距统一为10px，支持纯色和彩色两种显示模式。`;

  // 实现方案（详细总结所有迭代）
  const implementationPlan = {
    overview: '在 system-app/src/modules/test/views/test-one/index.vue 实现自定义图标展示页面',
    iterations: [
      {
        iteration: 1,
        description: '初始实现：删除原有SVG HMR测试页面，创建新的图标展示页面',
        changes: [
          '删除原有页面内容',
          '创建基础页面结构（搜索、分类筛选、图标列表）',
          '使用硬编码图标数据作为初始数据源'
        ]
      },
      {
        iteration: 2,
        description: '组件标准化：使用项目标准组件替换Element Plus组件',
        changes: [
          '使用 btc-crud-row 和 btc-col 替换 el-row 和 el-col',
          '使用 btc-button 替换 el-button',
          '调整页面 padding 为 10px（标准值）'
        ]
      },
      {
        iteration: 3,
        description: '布局优化：改进图标网格布局',
        changes: [
          '优化 CSS grid 布局（minmax(140px, 1fr), gap: 16px）',
          '调整图标预览区域样式',
          '移除不必要的统计卡片和标题'
        ]
      },
      {
        iteration: 4,
        description: '修复编译错误：完善 try-catch 语句',
        changes: [
          '修复 initIcons 函数的 try-catch 语法错误',
          '修复 sharedIconsMap 对象的缩进问题'
        ]
      },
      {
        iteration: 5,
        description: '修复样式错误：修正 SCSS 语法',
        changes: [
          '修复 .stat-item 的缩进问题',
          '移除多余的闭合括号'
        ]
      },
      {
        iteration: 6,
        description: '图标可见性优化：改善图标显示效果',
        changes: [
          '设置图标预览背景为 #f0f2f5',
          '为 btc-svg 添加 color="#303133" 确保图标可见',
          '优化文本对比度（白色背景）'
        ]
      },
      {
        iteration: 7,
        description: '中文映射：添加分类和图标名称的中文翻译',
        changes: [
          '创建 categoryMap（分类中英文映射）',
          '创建 iconLabelMap（图标名称中英文映射）',
          '更新搜索逻辑支持中英文搜索'
        ]
      },
      {
        iteration: 8,
        description: '布局简化：移除不必要的UI元素',
        changes: [
          '移除统计卡片',
          '移除"复制所有图标名称"按钮',
          '简化搜索区域布局（搜索和分类选择在同一行）'
        ]
      },
      {
        iteration: 9,
        description: '文本可见性优化：改善深色背景下的文本显示',
        changes: [
          '设置 .icon-item 背景为白色',
          '优化字体粗细和颜色',
          '移除"共xx"统计信息显示'
        ]
      },
      {
        iteration: 10,
        description: '图标模式切换：添加纯色/彩色切换功能',
        changes: [
          '添加 iconMode ref（monochrome/colored）',
          '使用 el-radio-group 实现模式切换',
          '通过 CSS 类控制图标颜色'
        ]
      },
      {
        iteration: 11,
        description: '修复 Element Plus API 警告：使用 value 替代 label',
        changes: [
          '将 el-radio-button 的 label 属性改为 value',
          '符合 Element Plus 3.0.0 API 规范'
        ]
      },
      {
        iteration: 12,
        description: '图标颜色控制优化：通过 currentColor 实现分类颜色',
        changes: [
          '添加 getCategoryColor 函数为每个分类分配颜色',
          '通过父元素的 color 属性控制图标颜色',
          '使用 CSS 强制所有 SVG 元素使用 currentColor'
        ]
      },
      {
        iteration: 13,
        description: '布局间距优化：统一所有间距为10px',
        changes: [
          '调整 gutter 为 10px',
          '移除重复的 padding',
          '统一所有内部元素间距'
        ]
      },
      {
        iteration: 14,
        description: '简化布局：移除复杂的栅格系统',
        changes: [
          '删除 btc-crud-row 和 btc-col 组件',
          '使用简单的 flex 布局',
          '使用 margin-right 处理元素间距'
        ]
      },
      {
        iteration: 15,
        description: '宽度占比调整：设置为40%、40%、20%',
        changes: [
          '使用 calc() 计算宽度，考虑间距',
          '第三个元素使用 flex: 1 自动填充',
          '确保右侧有 10px 空间'
        ]
      },
      {
        iteration: 16,
        description: '组件替换：使用 BtcSelectButton 替代 el-radio-group',
        changes: [
          '导入 BtcSelectButton 组件',
          '替换 el-radio-group 为 btc-select-button',
          '添加 iconModeOptions 配置'
        ]
      },
      {
        iteration: 17,
        description: '间距统一：确保所有间距和边距为10px且无重复',
        changes: [
          '移除 search-card 的 padding（避免与页面容器重复）',
          '移除 icons-grid 的 padding',
          '统一所有 margin 和 gap 为 10px'
        ]
      },
      {
        iteration: 18,
        description: '删除内联颜色：移除批量删除图标的内联颜色',
        changes: [
          '从 delete-batch.svg 移除 fill="#e75454" 属性',
          '让图标使用 currentColor 控制颜色'
        ]
      }
    ],
    finalImplementation: {
      filePath: 'apps/system-app/src/modules/test/views/test-one/index.vue',
      keyFeatures: [
        '搜索功能：支持中英文搜索图标名称',
        '分类筛选：12个分类（操作类、数据分析类、商业类等）',
        '图标模式切换：纯色模式（灰色）和彩色模式（按分类显示颜色）',
        '图标预览：网格布局展示所有图标',
        '点击复制：点击图标卡片复制图标名称',
        '详情对话框：显示图标详细信息和使用代码',
        '中文映射：所有分类和图标名称都有中文翻译'
      ],
      layoutStructure: {
        searchArea: {
          type: 'flex',
          items: [
            { component: 'el-input', width: 'calc(40% - 5px)', marginRight: '10px' },
            { component: 'el-select', width: 'calc(40% - 10px)', marginRight: '10px' },
            { component: 'btc-select-button', width: 'flex: 1' }
          ]
        },
        iconsGrid: {
          type: 'css-grid',
          columns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: '10px'
        }
      },
      spacingRules: {
        pagePadding: '10px',
        elementGap: '10px',
        iconItemPadding: '10px',
        iconPreviewMarginBottom: '10px',
        iconNameMarginBottom: '10px',
        iconCategoryMarginBottom: '10px'
      },
      colorScheme: {
        monochrome: '#303133',
        colored: {
          actions: '#F56C6C',
          analytics: '#409EFF',
          commerce: '#67C23A',
          communication: '#E6A23C',
          iot: '#909399',
          location: '#9C27B0',
          media: '#FF5722',
          micro: '#00BCD4',
          misc: '#795548',
          navigation: '#3F51B5',
          people: '#E91E63',
          status: '#FF9800'
        }
      }
    },
    lessonsLearned: [
      '优先使用项目标准组件（btc-xxx）而非Element Plus组件',
      '布局间距统一为10px，避免重复的padding/margin',
      '使用简单的flex布局比复杂的栅格系统更可靠',
      '图标颜色通过currentColor控制，移除内联颜色属性',
      '使用calc()计算宽度时需要考虑间距',
      'flex布局中，最后一个元素使用flex:1可以自动填充剩余空间',
      '中文映射表对于用户体验很重要',
      '迭代过程中需要持续关注用户反馈并快速调整'
    ],
    challenges: [
      '布局溢出问题：flex + gap 会导致宽度溢出，需要使用margin替代',
      '图标颜色控制：需要移除SVG内联颜色，使用CSS控制',
      '间距重复：多层容器的padding会导致间距重复',
      '组件API变更：Element Plus 3.0.0 API变更需要及时适配'
    ]
  };

  // 使用的资源
  const resources = {
    components: [
      { id: 'btc-svg', path: 'packages/shared-components/src/components/basic/btc-svg', isNew: false },
      { id: 'btc-button', path: 'packages/shared-components/src/components/basic/btc-button', isNew: false },
      { id: 'btc-select-button', path: 'packages/shared-components/src/components/form/btc-select-button', isNew: false }
    ],
    icons: [
      { id: 'all-icons', path: 'packages/shared-components/src/assets/icons', isNew: false },
      { id: 'app-icons', path: 'apps/system-app/src/assets/icons', isNew: false }
    ],
    utilities: [
      { id: 'clipboard-api', type: 'browser-api', isNew: false }
    ]
  };

  // 参考页面
  const referencePages = [];

  // 元数据
  const metadata = {
    module: 'test',
    page: 'test-one',
    app: 'system-app',
    category: 'icon-showcase',
    complexity: 'medium',
    iterationCount: 18,
    implementationTime: '2025-01-XX',
    technologies: ['Vue 3', 'TypeScript', 'Element Plus', 'BTC Components', 'SCSS'],
    features: [
      'icon-search',
      'icon-filter',
      'icon-preview',
      'icon-copy',
      'icon-mode-toggle',
      'chinese-mapping'
    ]
  };

  // 检查方案是否已存在
  const existing = db.prepare('SELECT id, version FROM solutions WHERE id = ?').get(solutionId);

  if (existing) {
    console.log(`⚠️  方案已存在，版本: ${existing.version}`);
    console.log('📝 更新方案并创建新版本...\n');
    
    // 更新方案
    db.prepare(`
      UPDATE solutions 
      SET implementation_plan = ?,
          resources = ?,
          reference_pages = ?,
          metadata = ?,
          status = 'implemented',
          implemented_at = strftime('%s', 'now'),
          updated_at = strftime('%s', 'now')
      WHERE id = ?
    `).run(
      JSON.stringify(implementationPlan),
      JSON.stringify(resources),
      JSON.stringify(referencePages),
      JSON.stringify(metadata),
      solutionId
    );
    
    // 创建新版本记录所有迭代
    const newVersion = incrementVersion(existing.version);
    await addSolutionVersion(solutionId, newVersion, null, {
      totalIterations: implementationPlan.iterations.length,
      description: '完整实现总结',
      changes: implementationPlan.iterations.map(iter => `${iter.iteration}. ${iter.description}`)
    });
  } else {
    // 创建新方案
    console.log('📝 创建新方案...\n');
    
    db.prepare(`
      INSERT INTO solutions 
      (id, task_description, scenario_type, version, implementation_plan, resources, reference_pages, metadata, status, implemented_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'implemented', strftime('%s', 'now'))
    `).run(
      solutionId,
      taskDescription,
      'icon-showcase-page',
      '1.0.0',
      JSON.stringify(implementationPlan),
      JSON.stringify(resources),
      JSON.stringify(referencePages),
      JSON.stringify(metadata)
    );

    // 添加资源关联
    const insertResource = db.prepare(`
      INSERT INTO solution_resources (solution_id, resource_type, resource_id, resource_path, is_new)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const [type, items] of Object.entries(resources)) {
      if (Array.isArray(items)) {
        for (const item of items) {
          insertResource.run(
            solutionId,
            type,
            item.id || item.path || '',
            item.path || '',
            item.isNew ? 1 : 0
          );
        }
      }
    }

    // 记录初始版本
    await addSolutionVersion(solutionId, '1.0.0', null, {
      totalIterations: implementationPlan.iterations.length,
      description: '初始实现完成',
      changes: ['完成所有18次迭代，页面功能完整实现']
    });
  }

  // 更新评分
  console.log('📊 更新方案评分...\n');
  await updateSolutionScore(solutionId);

  // 获取评分信息
  const { getSolutionScore } = await import('./solution-scoring.mjs');
  const score = await getSolutionScore(solutionId);

  console.log('✅ 方案存储完成！\n');
  console.log('📊 方案评分：');
  console.log(`  - 迭代次数: ${score.iteration_count}`);
  console.log(`  - 通用程度: ${(score.generality_score * 100).toFixed(1)}%`);
  console.log(`  - 接近程度: ${(score.similarity_score * 100).toFixed(1)}%`);
  console.log(`  - 使用次数: ${score.usage_count}\n`);

  console.log('📝 方案总结：');
  console.log(`  - 方案ID: ${solutionId}`);
  console.log(`  - 任务: ${taskDescription.substring(0, 50)}...`);
  console.log(`  - 迭代次数: ${implementationPlan.iterations.length}`);
  console.log(`  - 最终状态: implemented\n`);
}

/**
 * 递增版本号
 */
function incrementVersion(version) {
  const parts = version.split('.');
  const minor = parseInt(parts[1] || 0) + 1;
  return `${parts[0]}.${minor}.0`;
}

main().catch(console.error);
