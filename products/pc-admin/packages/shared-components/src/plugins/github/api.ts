/**
 * GitHub集成插件 API（供子应用调用）
 */

/**
 * GitHub API 接口
 * 子应用通过 window.__PLUGIN_API__.github 访问
 */
export interface GitHubAPI {
  checkAuth: () => Promise<boolean>;
  login: (token: string) => Promise<void>;
  logout: () => void;
  getRepos: () => Promise<any[]>;
  getCommits: (repo: string) => Promise<any[]>;
  createIssue: (repo: string, issue: any) => Promise<any>;
}

