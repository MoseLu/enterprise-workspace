/**
 * Qiankun 沙箱配置（统一样式隔离配置）
 * 所有应用使用相同的样式隔离配置，避免不一致导致的样式引擎累积
 */

export interface QiankunSandboxConfig {
  strictStyleIsolation: boolean;
  experimentalStyleIsolation: boolean;
  loose: boolean;
}

/**
 * 全局统一的 Qiankun 沙箱配置
 * 推荐方案：统一开启 experimentalStyleIsolation，避免样式污染
 */
export const globalQiankunSandboxConfig: QiankunSandboxConfig = {
  strictStyleIsolation: false, // 关闭严格样式隔离：需要共享样式（共享组件、主应用布局等）
  experimentalStyleIsolation: true, // 开启实验性样式隔离：通过 CSS 作用域隔离样式，但不使用 Shadow DOM，允许共享样式
  loose: false,
};

/**
 * 获取统一的 Qiankun 沙箱配置
 * 所有应用应该使用此配置，避免手动配置不一致
 */
export const getQiankunSandboxConfig = (): QiankunSandboxConfig => {
  return { ...globalQiankunSandboxConfig };
};
