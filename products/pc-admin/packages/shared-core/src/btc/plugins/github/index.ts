import type { App, Plugin } from 'vue';

/**
 * GitHub鎻掍欢API鎺ュ彛
 */
export interface GitHubPlugin {
  /**
   * 鎵撳紑GitHub浠撳簱
   * @param url GitHub浠撳簱鍦板潃
   */
  openRepository: (url?: string) => void;
}

let githubPluginInstance: GitHubPlugin | null = null;

/**
 * 鍒涘缓GitHub鎻掍欢
 */
export function createGitHubPlugin(): Plugin & { github: GitHubPlugin } {
  const github: GitHubPlugin = {
    openRepository(url = 'https://github.com/BellisGit/btc-shopflow.git') {
      window.open(url, '_blank');
    }
  };

  // 淇濆瓨鍗曚緥
  githubPluginInstance = github;

  const plugin: Plugin & { github: GitHubPlugin } = {
    install(app: App) {
      // 灏咷itHub瀹炰緥鎸傝浇鍒板叏灞€灞炴€?      app.config.globalProperties.$github = github;

      // 鎻愪緵缁?composition API 浣跨敤
      app.provide('github', github);
    },
    github,
  };

  return plugin;
}

/**
 * 缁勫悎寮?API锛氫娇鐢℅itHub鎻掍欢
 */
export function useGitHubPlugin(): GitHubPlugin {
  if (!githubPluginInstance) {
    throw new Error('GitHub plugin not installed. Please call createGitHubPlugin() first.');
  }
  return githubPluginInstance;
}




