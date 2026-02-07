<template>
  <div class="test-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span class="title">颜色令牌演示 - 基于 --el-color-primary</span>
        </div>
      </template>
      <div class="content">
        <!-- 基础主色 -->
        <section class="color-section">
          <h3 class="section-title">基础主色</h3>
          <div class="color-grid">
            <div class="color-item primary-color">
              <div class="color-preview" :style="{ backgroundColor: 'var(--el-color-primary)' }"></div>
              <div class="color-info">
                <div class="color-name">--el-color-primary</div>
                <div class="color-value">{{ primaryColorValue }}</div>
              </div>
            </div>
          </div>
        </section>

        <!-- 普通变体 -->
        <section class="color-section">
          <h3 class="section-title">普通变体（线性混合）</h3>
          <div class="color-group">
            <div class="group-title">浅色变体 (light-1 ~ light-9)</div>
            <div class="color-grid">
              <div
                v-for="i in 9"
                :key="`light-${i}`"
                class="color-item"
              >
                <div
                  class="color-preview"
                  :style="{ backgroundColor: `var(--el-color-primary-light-${i})` }"
                ></div>
                <div class="color-info">
                  <div class="color-name">light-{{ i }}</div>
                  <div class="color-value">{{ getColorValue(`--el-color-primary-light-${i}`) }}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="color-group">
            <div class="group-title">深色变体 (dark-1 ~ dark-9)</div>
            <div class="color-grid">
              <div
                v-for="i in 9"
                :key="`dark-${i}`"
                class="color-item"
              >
                <div
                  class="color-preview"
                  :style="{ backgroundColor: `var(--el-color-primary-dark-${i})` }"
                ></div>
                <div class="color-info">
                  <div class="color-name">dark-{{ i }}</div>
                  <div class="color-value">{{ getColorValue(`--el-color-primary-dark-${i}`) }}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 高对比度变体 -->
        <section class="color-section">
          <h3 class="section-title">高对比度变体（基于 WCAG 2.1 标准）</h3>
          <div class="color-grid contrast-grid">
            <div class="color-item contrast-item">
              <div class="color-preview" :style="{ backgroundColor: 'var(--el-color-primary-contrast-light)' }"></div>
              <div class="color-info">
                <div class="color-name">--el-color-primary-contrast-light</div>
                <div class="color-value">{{ contrastLightValue || getColorValue('--el-color-primary-contrast-light') }}</div>
                <div class="color-desc">用于深色背景的高对比度浅色（≥ 4.5:1）</div>
              </div>
            </div>
            <div class="color-item contrast-item">
              <div class="color-preview" :style="{ backgroundColor: 'var(--el-color-primary-contrast-dark)' }"></div>
              <div class="color-info">
                <div class="color-name">--el-color-primary-contrast-dark</div>
                <div class="color-value">{{ contrastDarkValue || getColorValue('--el-color-primary-contrast-dark') }}</div>
                <div class="color-desc">用于浅色背景的高对比度深色（≥ 4.5:1）</div>
              </div>
            </div>
            <div class="color-item contrast-item">
              <div class="color-preview" :style="{ backgroundColor: 'var(--el-color-primary-contrast-aa)' }"></div>
              <div class="color-info">
                <div class="color-name">--el-color-primary-contrast-aa</div>
                <div class="color-value">{{ contrastAAValue || getColorValue('--el-color-primary-contrast-aa') }}</div>
                <div class="color-desc">满足 WCAG AA 级对比度（≥ 4.5:1）</div>
              </div>
            </div>
            <div class="color-item contrast-item">
              <div class="color-preview" :style="{ backgroundColor: 'var(--el-color-primary-contrast-aaa)' }"></div>
              <div class="color-info">
                <div class="color-name">--el-color-primary-contrast-aaa</div>
                <div class="color-value">{{ contrastAAAValue || getColorValue('--el-color-primary-contrast-aaa') }}</div>
                <div class="color-desc">满足 WCAG AAA 级对比度（≥ 7:1）</div>
              </div>
            </div>
          </div>
        </section>

        <!-- 实际使用示例 -->
        <section class="color-section">
          <h3 class="section-title">实际使用示例</h3>
          
          <!-- 按钮示例 -->
          <div class="example-group">
            <h4 class="example-title">按钮示例</h4>
            <div class="button-examples">
              <el-button type="primary" class="normal-button">
                普通按钮（使用主色）
              </el-button>
              <el-button type="primary" class="contrast-aa-button">
                高对比度按钮 AA 级
              </el-button>
              <el-button type="primary" class="contrast-aaa-button">
                高对比度按钮 AAA 级
              </el-button>
            </div>
          </div>

          <!-- 文本示例 -->
          <div class="example-group">
            <h4 class="example-title">文本示例</h4>
            <div class="text-examples">
              <div class="text-item">
                <p class="normal-text">普通文本（使用主色）</p>
                <p class="contrast-aa-text">高对比度文本 AA 级</p>
                <p class="contrast-aaa-text">高对比度文本 AAA 级</p>
              </div>
            </div>
          </div>

          <!-- 背景对比示例 -->
          <div class="example-group">
            <h4 class="example-title">背景对比示例</h4>
            <div class="background-examples">
              <div class="bg-example light-bg">
                <p class="bg-text-dark">浅色背景上的深色文本（contrast-dark）</p>
              </div>
              <div class="bg-example dark-bg">
                <p class="bg-text-light">深色背景上的浅色文本（contrast-light）</p>
              </div>
            </div>
          </div>

          <!-- 链接示例 -->
          <div class="example-group">
            <h4 class="example-title">链接示例</h4>
            <div class="link-examples">
              <a href="#" class="normal-link">普通链接</a>
              <a href="#" class="contrast-aa-link">高对比度链接 AA 级</a>
              <a href="#" class="contrast-aaa-link">高对比度链接 AAA 级</a>
            </div>
          </div>
        </section>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

// 获取 CSS 变量值
function getColorValue(cssVar: string): string {
  if (typeof document === 'undefined') return '';
  try {
    const value = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
    return value || '未设置';
  } catch (error) {
    return '未设置';
  }
}

const primaryColorValue = ref('');
const contrastLightValue = ref('');
const contrastDarkValue = ref('');
const contrastAAValue = ref('');
const contrastAAAValue = ref('');

// 更新所有颜色值
function updateColorValues() {
  primaryColorValue.value = getColorValue('--el-color-primary');
  contrastLightValue.value = getColorValue('--el-color-primary-contrast-light');
  contrastDarkValue.value = getColorValue('--el-color-primary-contrast-dark');
  contrastAAValue.value = getColorValue('--el-color-primary-contrast-aa');
  contrastAAAValue.value = getColorValue('--el-color-primary-contrast-aaa');
}

// 监听主题变化事件
function handleThemeChange() {
  // 延迟一下，确保 CSS 变量已经更新
  setTimeout(() => {
    updateColorValues();
  }, 100);
}

let observer: MutationObserver | null = null;
let interval: number | null = null;

onMounted(() => {
  // 初始更新
  updateColorValues();
  
  // 监听主题变化事件
  window.addEventListener('theme-change', handleThemeChange);
  
  // 使用 MutationObserver 监听 CSS 变量变化
  observer = new MutationObserver(() => {
    updateColorValues();
  });
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['style', 'class'],
  });
  
  // 定期检查（作为备用方案）
  interval = window.setInterval(() => {
    updateColorValues();
  }, 1000);
});

onUnmounted(() => {
  window.removeEventListener('theme-change', handleThemeChange);
  if (observer) {
    observer.disconnect();
  }
  if (interval !== null) {
    clearInterval(interval);
  }
});
</script>

<style scoped lang="scss">
.test-page {
  padding: 10px;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  overflow-x: hidden;

  .card-header {
    display: flex;
    align-items: center;
    gap: 12px;

    .title {
      font-size: 18px;
      font-weight: 600;
    }
  }

  .content {
    padding: 20px;
  }

  .color-section {
    margin-bottom: 40px;

    .section-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 20px;
      color: var(--el-text-color-primary);
      padding-bottom: 8px;
      border-bottom: 2px solid var(--el-border-color);
    }

    .color-group {
      margin-bottom: 30px;

      .group-title {
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 12px;
        color: var(--el-text-color-regular);
      }
    }

    .color-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 16px;

      &.contrast-grid {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      }

      .color-item {
        border: 1px solid var(--el-border-color);
        border-radius: 8px;
        overflow: hidden;
        background: var(--el-bg-color);
        transition: transform 0.2s, box-shadow 0.2s;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        &.primary-color {
          grid-column: 1 / -1;
          max-width: 300px;
        }

        &.contrast-item {
          .color-desc {
            font-size: 12px;
            color: var(--el-text-color-secondary);
            margin-top: 4px;
            line-height: 1.4;
          }
        }

        .color-preview {
          width: 100%;
          height: 80px;
          border-bottom: 1px solid var(--el-border-color);
        }

        .color-info {
          padding: 12px;

          .color-name {
            font-size: 13px;
            font-weight: 500;
            color: var(--el-text-color-primary);
            margin-bottom: 4px;
            font-family: 'Courier New', monospace;
          }

          .color-value {
            font-size: 12px;
            color: var(--el-text-color-secondary);
            font-family: 'Courier New', monospace;
            word-break: break-all;
          }
        }
      }
    }
  }

  .example-group {
    margin-bottom: 30px;

    .example-title {
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 16px;
      color: var(--el-text-color-regular);
    }

    .button-examples {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;

      .normal-button {
        background-color: var(--el-color-primary);
        color: var(--el-color-primary-light-9);
      }

      .contrast-aa-button {
        background-color: var(--el-color-primary);
        color: var(--el-color-primary-contrast-aa);
      }

      .contrast-aaa-button {
        background-color: var(--el-color-primary);
        color: var(--el-color-primary-contrast-aaa);
      }
    }

    .text-examples {
      .text-item {
        padding: 16px;
        background: var(--el-bg-color-page);
        border-radius: 8px;
        border: 1px solid var(--el-border-color);

        p {
          margin: 8px 0;
          font-size: 14px;
        }

        .normal-text {
          color: var(--el-color-primary);
        }

        .contrast-aa-text {
          color: var(--el-color-primary-contrast-aa);
        }

        .contrast-aaa-text {
          color: var(--el-color-primary-contrast-aaa);
        }
      }
    }

    .background-examples {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;

      .bg-example {
        padding: 24px;
        border-radius: 8px;
        min-height: 100px;
        display: flex;
        align-items: center;
        justify-content: center;

        &.light-bg {
          background-color: #ffffff;
          border: 1px solid var(--el-border-color);
        }

        &.dark-bg {
          background-color: #131313;
          border: 1px solid var(--el-border-color-dark);
        }

        .bg-text-dark {
          color: var(--el-color-primary-contrast-dark);
          font-size: 14px;
          font-weight: 500;
          margin: 0;
        }

        .bg-text-light {
          color: var(--el-color-primary-contrast-light);
          font-size: 14px;
          font-weight: 500;
          margin: 0;
        }
      }
    }

    .link-examples {
      display: flex;
      flex-direction: column;
      gap: 12px;

      a {
        font-size: 14px;
        text-decoration: none;
        padding: 8px 0;
        transition: opacity 0.2s;

        &:hover {
          opacity: 0.8;
        }

        &.normal-link {
          color: var(--el-color-primary);
        }

        &.contrast-aa-link {
          color: var(--el-color-primary-contrast-aa);
        }

        &.contrast-aaa-link {
          color: var(--el-color-primary-contrast-aaa);
        }
      }
    }
  }
}
</style>
