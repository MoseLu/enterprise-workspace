<!--
  自定义图标展示页面
  展示所有可用的自定义图标（包括应用内图标和共享包图标）
  支持搜索、分类筛选、图标预览、复制图标名称等功能
-->
<template>
  <div class="icon-showcase-page">
    <!-- 搜索和切换区域 -->
    <div class="search-card">
      <div class="search-row">
        <div class="search-item search-item-input">
          <el-input
            v-model="searchText"
            placeholder="搜索图标名称..."
            clearable
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <div class="search-item search-item-switch">
          <btc-select-button
            v-model="iconMode"
            :options="iconModeOptions"
            small
          />
        </div>
      </div>
    </div>

    <!-- 分类标签容器 -->
    <div class="category-container-wrapper">
      <btc-tabs-category-container
        v-model="selectedCategory"
        :categories="categoryList"
        :default-category="'all'"
        :auto-fill="true"
        :min-item-width="140"
        :gap="10"
        @category-change="handleCategoryChange"
      >
        <template #default="{ category }">
          <div v-if="getCategoryIcons(category.name).length === 0" class="empty-state">
            <el-empty description="未找到匹配的图标" />
          </div>
          <div
            v-for="icon in getCategoryIcons(category.name)"
            :key="icon.name"
            class="icon-item"
            @click.stop="copyIconName(icon.name)"
          >
            <div
              class="icon-preview"
              :class="{
                'icon-preview--monochrome': iconMode === 'monochrome',
                [`icon-preview--${icon.category}`]: iconMode === 'colored'
              }"
              :style="iconMode === 'colored' ? { color: getCategoryColor(icon.category) } : {}"
            >
              <btc-svg
                :name="icon.name"
                :size="48"
              />
            </div>
            <div class="icon-name" :title="getIconLabel(icon.name)">
              {{ getIconLabel(icon.name) }}
            </div>
            <div class="icon-category">
              {{ getCategoryLabel(icon.category) }}
            </div>
            <div class="icon-source">
              <el-tag :type="icon.source === 'app' ? 'success' : 'info'" size="small">
                {{ icon.source === 'app' ? '应用内' : '共享包' }}
              </el-tag>
            </div>
          </div>
        </template>
      </btc-tabs-category-container>
    </div>

    <!-- 图标详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      :title="selectedIcon?.name"
      width="600px"
    >
      <div v-if="selectedIcon" class="icon-detail">
        <div
          class="detail-preview"
          :class="{
            'detail-preview--monochrome': iconMode === 'monochrome',
            [`detail-preview--${selectedIcon.category}`]: iconMode === 'colored'
          }"
          :style="iconMode === 'colored' ? { color: getCategoryColor(selectedIcon.category) } : {}"
        >
          <btc-svg
            :name="selectedIcon.name"
            :size="128"
          />
        </div>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="图标名称">
            {{ getIconLabel(selectedIcon.name) }}
            <el-tag size="small" style="margin-left: 8px;">{{ selectedIcon.name }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="分类">
            {{ getCategoryLabel(selectedIcon.category) }}
          </el-descriptions-item>
          <el-descriptions-item label="来源">
            {{ selectedIcon.source === 'app' ? '应用内图标' : '共享包图标' }}
          </el-descriptions-item>
          <el-descriptions-item label="使用方式">
            <el-tag size="small">&lt;btc-svg name="{{ selectedIcon.name }}" /&gt;</el-tag>
          </el-descriptions-item>
        </el-descriptions>
        <div class="detail-actions">
          <btc-button type="primary" @click="copyIconName(selectedIcon.name)">
            复制图标名称
          </btc-button>
          <btc-button @click="copyUsageCode(selectedIcon.name)">
            复制使用代码
          </btc-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import { BtcSvg, BtcButton, BtcSelectButton, BtcTabsCategoryContainer } from '@btc/shared-components';
import type { BtcCategory } from '@btc/shared-components';

// 图标数据接口
interface IconItem {
  name: string;
  category: string;
  source: 'app' | 'shared';
}

// 所有图标数据
const allIcons = ref<IconItem[]>([]);
const searchText = ref('');
const selectedCategory = ref<string | number>('all'); // 'all' 表示显示所有分类
const iconMode = ref<'monochrome' | 'colored'>('monochrome');

// 图标模式选项
const iconModeOptions = [
  { label: '纯色', value: 'monochrome' },
  { label: '彩色', value: 'colored' },
];

// 对话框
const showDetailDialog = ref(false);
const selectedIcon = ref<IconItem | null>(null);

// 分类中英文映射
const categoryMap: Record<string, string> = {
  'actions': '操作类',
  'analytics': '数据分析类',
  'commerce': '商业类',
  'communication': '通信类',
  'iot': '物联网类',
  'location': '位置类',
  'media': '媒体类',
  'micro': '微应用类',
  'misc': '其他类',
  'navigation': '导航类',
  'people': '人员类',
  'status': '状态类',
  'system': '系统类',
};

// 图标名称中英文映射（常用图标）
const iconLabelMap: Record<string, string> = {
  // actions
  'batch-unbind': '批量解绑',
  'close': '关闭',
  'close-border': '关闭（边框）',
  'delete': '删除',
  'delete-alt': '删除（备用）',
  'delete-batch': '批量删除',
  'download': '下载',
  'download-alt': '下载（备用）',
  'edit': '编辑',
  'expand': '展开',
  'export': '导出',
  'eye': '查看',
  'fold': '折叠',
  'import': '导入',
  'modify-bind': '修改绑定',
  'pause': '暂停',
  'pin': '固定',
  'play': '播放',
  'plus': '添加',
  'plus-border': '添加（边框）',
  'print': '打印',
  'pull': '拉取',
  'quick': '快捷',
  'recycle-bin': '回收站',
  'refresh': '刷新',
  'screen-full': '全屏',
  'screen-normal': '退出全屏',
  'search': '搜索',
  'search-alt': '搜索（备用）',
  'share': '分享',
  'sort': '排序',
  'stop': '停止',
  'sync': '同步',
  'unbind': '解绑',
  'upload': '上传',
  'upload-example': '上传示例',
  // analytics
  'activity': '活动',
  'amount': '数量',
  'amount-alt': '数量（备用）',
  'count': '计数',
  'data': '数据',
  'database': '数据库',
  'log': '日志',
  'match': '匹配',
  'monitor': '监控',
  'params': '参数',
  'rank': '排名',
  'stats': '统计',
  'table-columns': '表格列',
  'table-density': '表格密度',
  'table-style': '表格样式',
  'time': '时间',
  'trend': '趋势',
  // commerce
  'app': '应用',
  'approve': '审批',
  'card': '卡片',
  'cart': '购物车',
  'crown': '皇冠',
  'goods': '商品',
  'order': '订单',
  'reward': '奖励',
  'tag': '标签',
  'vip': 'VIP',
  // communication
  'call': '电话',
  'favor': '收藏',
  'hot': '热门',
  'like': '点赞',
  'news': '新闻',
  'phone': '手机',
  'qq': 'QQ',
  // iot
  'device': '设备',
  'iot': '物联网',
  // location
  'discover': '发现',
  'local': '本地',
  'map': '地图',
  // media
  'camera': '相机',
  'doc': '文档',
  'emoji': '表情',
  'file': '文件',
  'folder': '文件夹',
  'image': '图片',
  'pic': '图片',
  'video': '视频',
  // micro
  'engineering': '工程应用',
  'logistics': '物流应用',
  'production': '生产应用',
  'quality': '品质应用',
  // misc
  'common': '通用',
  'component': '组件',
  'design': '设计',
  'list': '列表',
  'tutorial': '教程',
  'star': '星标',
  'windmill': '风车',
  // navigation
  'arrow-left': '左箭头',
  'arrow-right': '右箭头',
  'back': '返回',
  'bg': '背景',
  'hamburger': '汉堡菜单',
  'home': '首页',
  'home-alt': '首页（备用）',
  'home-variant': '首页（变体）',
  'left': '左',
  'menu': '菜单',
  'right': '右',
  'tabbar-menu': '底部菜单',
  // people
  'dept': '部门',
  'my': '我的',
  'task': '任务',
  'team': '团队',
  'user': '用户',
  'work': '工作',
  'workbench': '工作台',
  // status
  '404': '404错误',
  'fail': '失败',
  'info': '信息',
  'info-alt': '信息（备用）',
  'msg': '消息',
  'notice': '通知',
  'question': '疑问',
  'success': '成功',
  'warn': '警告',
  // system
  'auth': '认证',
  'ban': '禁用',
  'dark': '暗色主题',
  'dict': '字典',
  'exit': '退出',
  'github': 'GitHub',
  'lang': '语言',
  'light': '亮色主题',
  'light-alt': '亮色主题（备用）',
  'set': '设置',
  'settings': '设置',
  'theme': '主题',
  'unlock': '解锁',
};

// 获取分类中文标签
function getCategoryLabel(category: string): string {
  return categoryMap[category] || category;
}

// 获取分类对应的颜色（用于彩色模式）
function getCategoryColor(category: string): string {
  const colorMap: Record<string, string> = {
    'actions': '#F56C6C',      // 红色 - 操作类
    'analytics': '#409EFF',    // 蓝色 - 数据分析类
    'commerce': '#67C23A',     // 绿色 - 商业类
    'communication': '#E6A23C', // 橙色 - 通信类
    'iot': '#909399',          // 灰色 - 物联网
    'location': '#9C27B0',     // 紫色 - 位置类
    'media': '#FF5722',        // 深橙色 - 媒体类
    'micro': '#00BCD4',        // 青色 - 微应用
    'misc': '#795548',         // 棕色 - 杂项
    'navigation': '#3F51B5',   // 靛蓝色 - 导航类
    'people': '#E91E63',       // 粉红色 - 人员类
    'status': '#FF9800',       // 橙黄色 - 状态类
  };
  return colorMap[category] || '#303133'; // 默认灰色
}

// 获取图标中文标签
function getIconLabel(iconName: string): string {
  return iconLabelMap[iconName] || iconName;
}

// 计算属性
const categories = computed(() => {
  const cats = new Set(allIcons.value.map(icon => icon.category));
  return Array.from(cats).sort();
});

// 分类列表数据（用于 btc-tabs-category-container）
const categoryList = computed<BtcCategory[]>(() => {
  const list: BtcCategory[] = [
    {
      name: 'all',
      label: '全部',
      count: allIcons.value.length
    }
  ];

  categories.value.forEach(cat => {
    const count = allIcons.value.filter(icon => icon.category === cat).length;
    list.push({
      name: cat,
      label: getCategoryLabel(cat),
      count
    });
  });

  return list;
});

// 获取指定分类的图标列表（已应用搜索筛选）
function getCategoryIcons(categoryName: string | number): IconItem[] {
  let result = allIcons.value;

  // 按分类筛选
  if (categoryName && categoryName !== 'all') {
    result = result.filter(icon => icon.category === categoryName);
  }

  // 按搜索文本筛选（支持中英文搜索）
  if (searchText.value) {
    const keyword = searchText.value.toLowerCase();
    result = result.filter(icon => {
      const iconName = icon.name.toLowerCase();
      const iconLabel = getIconLabel(icon.name).toLowerCase();
      const categoryLabel = getCategoryLabel(icon.category).toLowerCase();
      return iconName.includes(keyword) ||
             iconLabel.includes(keyword) ||
             categoryLabel.includes(keyword);
    });
  }

  return result;
}

// 初始化图标数据（从 RAG 数据库获取）
async function initIcons() {
  const icons: IconItem[] = [];

  try {
    // 尝试从 RAG 数据库获取图标信息
    // 注意：这里需要在运行时环境中才能访问，所以先使用静态数据作为后备
    // 在实际使用中，可以通过 API 或直接导入 RAG 查询函数来获取

    // 应用内图标（system-app/src/assets/icons）
    const appIconNames = ['star', 'windmill'];
    appIconNames.forEach(name => {
      icons.push({
        name,
        category: 'misc',
        source: 'app',
      });
    });

    // 共享包图标（packages/shared-components/src/assets/icons）
    // 根据目录结构添加所有图标
    const sharedIconsMap: Record<string, string[]> = {
      actions: [
        'batch-unbind', 'close', 'close-border', 'delete', 'delete-alt', 'delete-batch',
        'download', 'download-alt', 'edit', 'expand', 'export', 'eye', 'fold', 'import',
        'modify-bind', 'pause', 'pin', 'play', 'plus', 'plus-border', 'print', 'pull',
        'quick', 'recycle-bin', 'refresh', 'screen-full', 'screen-normal', 'search',
        'search-alt', 'share', 'sort', 'stop', 'sync', 'unbind', 'upload', 'upload-example',
      ],
      analytics: [
        'activity', 'amount', 'amount-alt', 'count', 'data', 'database', 'log', 'match',
        'monitor', 'params', 'rank', 'stats', 'table-columns', 'table-density',
        'table-style', 'time', 'trend',
      ],
      commerce: [
        'app', 'approve', 'card', 'cart', 'crown', 'goods', 'order', 'reward', 'tag', 'vip',
      ],
      communication: [
        'call', 'favor', 'hot', 'like', 'news', 'phone', 'qq',
      ],
      iot: [
        'device', 'iot',
      ],
      location: [
        'discover', 'local', 'map',
      ],
      media: [
        'camera', 'doc', 'emoji', 'file', 'folder', 'image', 'pic', 'video',
      ],
      micro: [
        'engineering', 'logistics', 'production', 'quality',
      ],
      misc: [
        'common', 'component', 'design', 'list', 'tutorial',
      ],
      navigation: [
        'arrow-left', 'arrow-right', 'back', 'bg', 'hamburger', 'home', 'home-alt',
        'home-variant', 'left', 'menu', 'right', 'tabbar-menu',
      ],
      people: [
        'dept', 'my', 'task', 'team', 'user', 'work', 'workbench',
      ],
      status: [
        '404', 'fail', 'info', 'info-alt', 'msg', 'notice', 'question', 'success', 'warn',
      ],
      system: [
        'auth', 'ban', 'dark', 'dict', 'exit', 'github', 'lang', 'light', 'light-alt',
        'set', 'settings', 'theme', 'unlock',
      ],
    };

    // 添加共享包图标
    Object.entries(sharedIconsMap).forEach(([category, names]) => {
      names.forEach(name => {
        icons.push({
          name,
          category,
          source: 'shared',
        });
      });
    });

    // 按分类和名称排序
    icons.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return a.name.localeCompare(b.name);
    });

    allIcons.value = icons;
  } catch (error) {
    console.error('初始化图标数据失败:', error);
    // 即使出错也设置空数组，避免页面崩溃
    allIcons.value = [];
  }
}

// 搜索处理
function handleSearch() {
  // 搜索逻辑已在 computed 中实现
}

// 分类筛选处理
function handleCategoryChange(category: BtcCategory, index: number) {
  // selectedCategory 已通过 v-model 自动更新
  // 筛选逻辑在 getCategoryIcons 函数中实现
}

// 复制文本到剪贴板（兼容性处理）
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // 优先使用 Clipboard API
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // 降级方案：使用 document.execCommand
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  } catch (error) {
    console.error('复制失败:', error);
    return false;
  }
}

// 复制图标名称
async function copyIconName(iconName: string) {
  const success = await copyToClipboard(iconName);
  if (success) {
    ElMessage.success(`已复制图标名称: ${iconName}`);
  } else {
    ElMessage.error('复制失败，请手动复制');
  }
}

// 复制使用代码
async function copyUsageCode(iconName: string) {
  const code = `<btc-svg name="${iconName}" />`;
  const success = await copyToClipboard(code);
  if (success) {
    ElMessage.success('已复制使用代码');
  } else {
    ElMessage.error('复制失败，请手动复制');
  }
}

// 显示图标详情
function showIconDetail(icon: IconItem) {
  selectedIcon.value = icon;
  showDetailDialog.value = true;
}

  // 组件挂载时初始化
onMounted(async () => {
  await initIcons();
});
</script>

<style scoped lang="scss">
.icon-showcase-page {
  padding: 10px;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  .search-card {
    margin-bottom: 10px;
    box-sizing: border-box;

    .search-row {
      display: flex;
      align-items: center;
      width: 100%;
    }

    .search-item {
      display: flex;
      align-items: center;
      box-sizing: border-box;

      &.search-item-input {
        flex: 1; // 搜索框占据剩余空间
        min-width: 0;
        margin-right: 10px;
      }

      &.search-item-switch {
        flex: 0 0 auto; // 切换按钮固定宽度
        min-width: 0;
        justify-content: flex-end;
      }

      > * {
        width: 100%;
      }
    }
  }

  .category-container-wrapper {
    width: 100%;
    flex: 1; // 使用 flex 布局自动填充剩余空间
    min-height: 400px;
    display: flex;
    flex-direction: column;

    // 覆盖 btc-container 的自动行高，让图标卡片根据内容自适应
    :deep(.btc-container__content) {
      grid-auto-rows: auto !important;
    }

    .empty-state {
      padding: 40px;
      text-align: center;
    }

    .icon-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 10px;
        border: 1px solid #e4e7ed;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s;
        background: #fff;
        height: auto !important; // btc-container 会设置 height: 100%，这里覆盖为 auto 以适应内容
        min-height: 160px; // 确保最小高度
        align-self: start; // 确保卡片从顶部对齐，不被拉伸

        &:hover {
          border-color: #409eff;
          box-shadow: 0 2px 12px rgba(64, 158, 255, 0.2);
          transform: translateY(-4px);
        }

        .icon-preview {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
          margin-bottom: 10px;
          background: #f0f2f5;
          border-radius: 8px;

          :deep(.btc-svg) {
            width: 48px;
            height: 48px;
          }

          // 彩色模式：使用currentColor，通过父元素的color属性控制颜色
          &:not(.icon-preview--monochrome) {
            // 通过父元素的color属性，currentColor会自动继承
            :deep(.btc-svg) {
              fill: currentColor !important;
            }

            :deep(.btc-svg svg) {
              fill: currentColor !important;
            }

            :deep(.btc-svg svg use) {
              fill: currentColor !important;
            }

            // 确保所有SVG元素都使用currentColor
            :deep(.btc-svg svg path),
            :deep(.btc-svg svg circle),
            :deep(.btc-svg svg rect),
            :deep(.btc-svg svg polygon),
            :deep(.btc-svg svg polyline),
            :deep(.btc-svg svg g),
            :deep(.btc-svg svg *) {
              fill: currentColor !important;
              stroke: currentColor !important;
            }
          }

          // 纯色模式：强制设置为灰色，覆盖所有内联颜色
          &--monochrome {
            :deep(.btc-svg) {
              fill: #303133 !important;
              color: #303133 !important;
            }

            :deep(.btc-svg svg) {
              fill: #303133 !important;
              color: #303133 !important;
            }

            :deep(.btc-svg svg use) {
              fill: #303133 !important;
            }

            // 覆盖所有SVG子元素的内联颜色
            :deep(.btc-svg svg path),
            :deep(.btc-svg svg circle),
            :deep(.btc-svg svg rect),
            :deep(.btc-svg svg polygon),
            :deep(.btc-svg svg polyline),
            :deep(.btc-svg svg line),
            :deep(.btc-svg svg g),
            :deep(.btc-svg svg *) {
              fill: #303133 !important;
              stroke: #303133 !important;
              color: #303133 !important;
            }
          }
        }

        .icon-name {
          font-size: 14px;
          font-weight: 600;
          color: #303133;
          margin-bottom: 10px;
          text-align: center;
          word-break: break-all;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.5;
        }

        .icon-category {
          font-size: 12px;
          color: #606266;
          margin-bottom: 10px;
          line-height: 1.5;
          font-weight: 400;
        }

        .icon-source {
          margin-top: auto;

          :deep(.el-tag) {
            color: #303133 !important;
            background-color: #f0f2f5 !important;
            border-color: #dcdfe6 !important;
            font-weight: 500;
          }
        }
      }
  }

  .icon-detail {
    .detail-preview {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 40px;
      background: #f0f2f5;
      border-radius: 8px;
      margin-bottom: 10px;

      :deep(.btc-svg) {
        width: 128px;
        height: 128px;
      }

      // 彩色模式：使用currentColor，通过父元素的color属性控制颜色
      &:not(.detail-preview--monochrome) {
        // 通过父元素的color属性，currentColor会自动继承
        :deep(.btc-svg) {
          fill: currentColor !important;
        }

        :deep(.btc-svg svg) {
          fill: currentColor !important;
        }

        :deep(.btc-svg svg use) {
          fill: currentColor !important;
        }

        // 确保所有SVG元素都使用currentColor
        :deep(.btc-svg svg path),
        :deep(.btc-svg svg circle),
        :deep(.btc-svg svg rect),
        :deep(.btc-svg svg polygon),
        :deep(.btc-svg svg polyline),
        :deep(.btc-svg svg g),
        :deep(.btc-svg svg *) {
          fill: currentColor !important;
          stroke: currentColor !important;
        }
      }

      // 纯色模式：强制设置为灰色
      &--monochrome {
        :deep(.btc-svg) {
          fill: #303133 !important;
          color: #303133 !important;
        }

        :deep(.btc-svg svg) {
          fill: #303133 !important;
          color: #303133 !important;
        }

        :deep(.btc-svg svg use) {
          fill: #303133 !important;
        }
      }
    }

    .detail-actions {
      display: flex;
      justify-content: center;
      gap: 10px;
      margin-top: 10px;
    }
  }
}
</style>
