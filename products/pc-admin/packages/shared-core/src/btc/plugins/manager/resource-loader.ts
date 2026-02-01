import { logger } from '../../../utils/logger/index';
;
﻿/**
 * 插件资源加载器
 * 用于加载插件的静态资源（SVG、图片等）
 * 每个插件有独立的资源目录，避免冲突
 */

/**
 * SVG 资源配置
 */
export interface SvgResource {
  /**
   * SVG 名称（文件名）
   */
  name: string;

  /**
   * SVG 内容或路径
   */
  content: string;

  /**
   * 所属插件
   */
  plugin: string;
}

/**
 * 资源加载器
 */
export class ResourceLoader {
  private svgCache: Map<string, SvgResource> = new Map();

  /**
   * 注册 SVG 资源
   * @param pluginName 插件名称
   * @param svgModules import.meta.glob 返回的模块对象
   */
  async registerSvgFromGlob(
    pluginName: string,
    svgModules: Record<string, () => Promise<any>>
  ): Promise<void> {
    for (const [path, loader] of Object.entries(svgModules)) {
      try {
        const module = await loader();
        const content = module.default || module;

        // 提取文件名（不包含扩展名）
        const fileName = this.extractFileName(path);

        if (fileName) {
          // 使用 pluginName:fileName 作为唯一标识
          const key = `${pluginName}:${fileName}`;

          this.svgCache.set(key, {
            name: fileName,
            content,
            plugin: pluginName,
          });
        }
      } catch (_error) {
        logger.error(`[ResourceLoader] Failed to load SVG from ${path}:`, _error);
      }
    }
  }

  /**
   * 手动注册单个 SVG
   */
  registerSvg(pluginName: string, name: string, content: string): void {
    const key = `${pluginName}:${name}`;
    this.svgCache.set(key, {
      name,
      content,
      plugin: pluginName,
    });
  }

  /**
   * 获取 SVG 资源
   * @param pluginName 插件名称
   * @param name SVG 名称
   */
  getSvg(pluginName: string, name: string): SvgResource | undefined {
    const key = `${pluginName}:${name}`;
    return this.svgCache.get(key);
  }

  /**
   * 获取插件的所有 SVG
   */
  getPluginSvgs(pluginName: string): SvgResource[] {
    return Array.from(this.svgCache.values()).filter(
      svg => svg.plugin === pluginName
    );
  }

  /**
   * 获取所有 SVG
   */
  getAllSvgs(): SvgResource[] {
    return Array.from(this.svgCache.values());
  }

  /**
   * 清除插件的所有资源
   */
  clearPlugin(pluginName: string): void {
    for (const [key, resource] of this.svgCache.entries()) {
      if (resource.plugin === pluginName) {
        this.svgCache.delete(key);
      }
    }
  }

  /**
   * 从路径中提取文件名
   */
  private extractFileName(path: string): string | null {
    const match = path.match(/\/([^/]+)\.svg$/);
    return match && match[1] ? match[1] : null;
  }
}

// 单例实例
let resourceLoaderInstance: ResourceLoader | null = null;

/**
 * 获取资源加载器实例（单例模式）
 */
export function useResourceLoader(): ResourceLoader {
  if (!resourceLoaderInstance) {
    resourceLoaderInstance = new ResourceLoader();
  }
  return resourceLoaderInstance;
}

/**
 * 重置资源加载器（用于测试）
 */
export function resetResourceLoader(): void {
  resourceLoaderInstance = null;
}
