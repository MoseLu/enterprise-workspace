/**
 * GitHub集成插件 - 主应用鉴权初始化（Host）
 */
;
import { Octokit } from '@octokit/rest';
import { storage, logger } from '@btc/shared-core/utils';
import type { QiankunActions } from '../types';
import { setGlobalState } from '@btc/shared-core';

let octokitInstance: Octokit | null = null;
let githubInstance: any = null;

export interface GitHubPluginHostOptions {
  globalState?: QiankunActions;
}

/**
 * 初始化GitHub插件（主应用）
 */
export function initGitHubPluginHost(options: GitHubPluginHostOptions = {}) {
  if (githubInstance) {
    return githubInstance;
  }

  const { globalState } = options;

  const login = async (token: string) => {
    try {
      // 存储 token 到安全存储
      const settings = (storage.get('settings') as Record<string, any>) || {};
      settings.githubToken = token;
      storage.set('settings', settings);

      // 创建 Octokit 实例
      octokitInstance = new Octokit({ auth: token });

      // 同步到全局状态（通过统一中间层）
      setGlobalState({ githubAuth: true }, false).catch(() => {
        // 忽略错误（可能在初始化中）
      });

      return true;
    } catch (error) {
      logger.error('[GitHub] Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    octokitInstance = null;
    const settings = (storage.get('settings') as Record<string, any>) || {};
    delete settings.githubToken;
    storage.set('settings', settings);

    // 同步到全局状态（通过统一中间层）
    setGlobalState({ githubAuth: false }, false).catch(() => {
      // 忽略错误（可能在初始化中）
    });
  };

  const checkAuth = async (): Promise<boolean> => {
    if (!octokitInstance) {
      // 尝试从存储中恢复 token
      const settings = (storage.get('settings') as Record<string, any>) || {};
      const token = settings?.githubToken;
      if (token) {
        await login(token);
      }
    }
    return octokitInstance !== null;
  };

  const getRepos = async () => {
    if (!(await checkAuth())) {
      throw new Error('GitHub not authenticated');
    }
    if (!octokitInstance) {
      throw new Error('Octokit instance not available');
    }
    const response = await octokitInstance.rest.repos.listForAuthenticatedUser();
    return response.data;
  };

  const getCommits = async (repo: string) => {
    if (!(await checkAuth())) {
      throw new Error('GitHub not authenticated');
    }
    if (!octokitInstance) {
      throw new Error('Octokit instance not available');
    }
    const parts = repo.split('/');
    if (parts.length !== 2) {
      throw new Error(`Invalid repo format: ${repo}. Expected format: owner/repo`);
    }
    const [owner, repoName] = parts;
    if (!owner || !repoName) {
      throw new Error(`Invalid repo format: ${repo}. Expected format: owner/repo`);
    }
    const response = await octokitInstance.rest.repos.listCommits({
      owner,
      repo: repoName,
    });
    return response.data;
  };

  const createIssue = async (repo: string, issue: any) => {
    if (!(await checkAuth())) {
      throw new Error('GitHub not authenticated');
    }
    if (!octokitInstance) {
      throw new Error('Octokit instance not available');
    }
    const parts = repo.split('/');
    if (parts.length !== 2) {
      throw new Error(`Invalid repo format: ${repo}. Expected format: owner/repo`);
    }
    const [owner, repoName] = parts;
    const response = await octokitInstance.rest.issues.create({
      owner,
      repo: repoName,
      ...issue,
    });
    return response.data;
  };

  // 初始化时检查是否有已保存的 token
  const settings = (storage.get('settings') as Record<string, any>) || {};
  if (settings?.githubToken) {
    login(settings.githubToken);
  }

  githubInstance = {
    checkAuth,
    login,
    logout,
    getRepos,
    getCommits,
    createIssue,
  };

  return githubInstance;
}

