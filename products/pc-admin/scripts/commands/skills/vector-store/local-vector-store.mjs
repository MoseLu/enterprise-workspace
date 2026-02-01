/**
 * 本地向量存储实现
 * 使用 SQLite + 本地文件存储，不依赖 Chroma 服务器
 */

import Database from 'better-sqlite3';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 获取项目根目录
 */
function getProjectRoot() {
  return join(__dirname, '../../../../');
}

/**
 * 获取存储目录
 */
function getStoreDir() {
  const root = getProjectRoot();
  return join(root, '.cursor', 'skills-meta', 'vector-store');
}

/**
 * 本地向量存储类
 */
class LocalVectorStore {
  constructor() {
    this.storeDir = getStoreDir();
    this.dbPath = join(this.storeDir, 'vectors.db');
    this.vectorsDir = join(this.storeDir, 'vectors');
    
    // 确保目录存在
    if (!existsSync(this.storeDir)) {
      mkdirSync(this.storeDir, { recursive: true });
    }
    if (!existsSync(this.vectorsDir)) {
      mkdirSync(this.vectorsDir, { recursive: true });
    }
    
    // 初始化数据库
    this.db = new Database(this.dbPath);
    this.initDatabase();
  }

  /**
   * 初始化数据库表（支持层级结构）
   */
  initDatabase() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS resources (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        name TEXT NOT NULL,
        path TEXT NOT NULL,
        description TEXT,
        category TEXT,
        tags TEXT,
        embedding_path TEXT,
        -- 层级结构字段（B树结构）
        app_name TEXT, -- 应用名称（如 'main-app', 'system-app'）
        app_type TEXT, -- 应用类型：'main'（主应用）| 'sub'（子应用）| 'package'（包）
        resource_category TEXT, -- 资源分类：'composables' | 'routes' | 'stores' | 'components' | 'utils' | 'docs' | 'icons' | 'locales'
        hierarchy_path TEXT, -- 层级路径，如 'main-app/composables' 或 'system-app/routes'
        parent_path TEXT, -- 父路径，用于构建树结构
        depth INTEGER DEFAULT 0, -- 层级深度：0=根，1=应用，2=资源类型，3=具体资源
        module_name TEXT, -- 模块名称（如果有）
        -- 扩展元数据（JSON格式）
        extended_metadata TEXT,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
      );
      
      -- 基础索引
      CREATE INDEX IF NOT EXISTS idx_type ON resources(type);
      CREATE INDEX IF NOT EXISTS idx_category ON resources(category);
      
      -- 层级索引（B树结构，支持快速层级查询）
      CREATE INDEX IF NOT EXISTS idx_app_name ON resources(app_name);
      CREATE INDEX IF NOT EXISTS idx_app_type ON resources(app_type);
      CREATE INDEX IF NOT EXISTS idx_resource_category ON resources(resource_category);
      CREATE INDEX IF NOT EXISTS idx_hierarchy_path ON resources(hierarchy_path);
      CREATE INDEX IF NOT EXISTS idx_parent_path ON resources(parent_path);
      CREATE INDEX IF NOT EXISTS idx_depth ON resources(depth);
      CREATE INDEX IF NOT EXISTS idx_module_name ON resources(module_name);
      
      -- 复合索引（优化常见查询）
      CREATE INDEX IF NOT EXISTS idx_app_category ON resources(app_name, resource_category);
      CREATE INDEX IF NOT EXISTS idx_app_type_category ON resources(app_type, resource_category);
      CREATE INDEX IF NOT EXISTS idx_hierarchy_depth ON resources(hierarchy_path, depth);
    `);
  }

  /**
   * 添加资源（支持层级结构）
   */
  addResource(id, metadata, embedding) {
    // 规范化 ID（将路径分隔符统一）
    const normalizedId = id.replace(/[\/\\]/g, '_').replace(/:/g, '-');
    
    // 保存向量到文件
    const embeddingPath = join(this.vectorsDir, `${normalizedId}.json`);
    
    // 确保目录存在
    const embeddingDir = dirname(embeddingPath);
    if (!existsSync(embeddingDir)) {
      mkdirSync(embeddingDir, { recursive: true });
    }
    
    writeFileSync(embeddingPath, JSON.stringify(embedding), 'utf-8');
    
    // 构建层级路径
    const hierarchyPath = this.buildHierarchyPath(metadata);
    const parentPath = this.buildParentPath(metadata);
    const depth = this.calculateDepth(metadata);
    
    // 保存元数据到数据库
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO resources 
      (id, type, name, path, description, category, tags, embedding_path,
       app_name, app_type, resource_category, hierarchy_path, parent_path, depth, module_name, extended_metadata,
       updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, strftime('%s', 'now'))
    `);
    
    stmt.run(
      id,
      metadata.type,
      metadata.name,
      metadata.path,
      metadata.description || '',
      metadata.category || '',
      JSON.stringify(metadata.tags || []),
      embeddingPath,
      metadata.appName || null,
      metadata.appType || null,
      metadata.resourceCategory || null,
      hierarchyPath,
      parentPath,
      depth,
      metadata.moduleName || null,
      JSON.stringify(metadata.extended || {}),
    );
  }

  /**
   * 构建层级路径
   */
  buildHierarchyPath(metadata) {
    const parts = [];
    
    if (metadata.appName) {
      parts.push(metadata.appName);
    }
    
    if (metadata.resourceCategory) {
      parts.push(metadata.resourceCategory);
    }
    
    if (metadata.moduleName) {
      parts.push(metadata.moduleName);
    }
    
    return parts.length > 0 ? parts.join('/') : null;
  }

  /**
   * 构建父路径
   */
  buildParentPath(metadata) {
    const parts = [];
    
    if (metadata.appName) {
      parts.push(metadata.appName);
    }
    
    if (metadata.resourceCategory) {
      // 父路径不包括当前资源类型
      return parts.join('/');
    }
    
    return parts.length > 0 ? parts.join('/') : null;
  }

  /**
   * 计算层级深度
   */
  calculateDepth(metadata) {
    let depth = 0;
    
    if (metadata.appName) depth++;
    if (metadata.resourceCategory) depth++;
    if (metadata.moduleName) depth++;
    
    return depth;
  }

  /**
   * 搜索资源（使用余弦相似度，支持层级过滤）
   */
  searchResources(queryEmbedding, options = {}) {
    const { 
      resourceTypes = [], 
      limit = 10, 
      minScore = 0.7,
      appName = null,
      appType = null,
      resourceCategory = null,
      hierarchyPath = null,
      depth = null,
    } = options;
    
    // 构建查询（支持层级过滤）
    let sql = 'SELECT * FROM resources WHERE 1=1';
    const params = [];
    
    if (resourceTypes.length > 0) {
      const placeholders = resourceTypes.map(() => '?').join(',');
      sql += ` AND type IN (${placeholders})`;
      params.push(...resourceTypes);
    }
    
    // 层级过滤
    if (appName) {
      sql += ' AND app_name = ?';
      params.push(appName);
    }
    
    if (appType) {
      sql += ' AND app_type = ?';
      params.push(appType);
    }
    
    if (resourceCategory) {
      sql += ' AND resource_category = ?';
      params.push(resourceCategory);
    }
    
    if (hierarchyPath) {
      sql += ' AND hierarchy_path LIKE ?';
      params.push(`${hierarchyPath}%`);
    }
    
    if (depth !== null && depth !== undefined) {
      sql += ' AND depth = ?';
      params.push(depth);
    }
    
    sql += ' ORDER BY created_at DESC';
    
    const resources = this.db.prepare(sql).all(...params);
    
    // 计算相似度
    const results = resources.map(resource => {
      try {
        const embeddingPath = resource.embedding_path;
        if (!existsSync(embeddingPath)) {
          return null;
        }
        
        const storedEmbedding = JSON.parse(readFileSync(embeddingPath, 'utf-8'));
        const score = this.cosineSimilarity(queryEmbedding, storedEmbedding);
        
        if (score < minScore) {
          return null;
        }
        
        return {
          id: resource.id,
          score,
          metadata: {
            type: resource.type,
            name: resource.name,
            path: resource.path,
            description: resource.description,
            category: resource.category,
            tags: JSON.parse(resource.tags || '[]'),
            appName: resource.app_name,
            appType: resource.app_type,
            resourceCategory: resource.resource_category,
            hierarchyPath: resource.hierarchy_path,
            parentPath: resource.parent_path,
            depth: resource.depth,
            moduleName: resource.module_name,
            extended: JSON.parse(resource.extended_metadata || '{}'),
          },
        };
      } catch (error) {
        return null;
      }
    }).filter(Boolean);
    
    // 按分数排序
    results.sort((a, b) => b.score - a.score);
    
    return results.slice(0, limit);
  }

  /**
   * 计算余弦相似度
   */
  cosineSimilarity(vecA, vecB) {
    if (vecA.length !== vecB.length) {
      // 如果维度不同，尝试截断或填充
      const minLen = Math.min(vecA.length, vecB.length);
      vecA = vecA.slice(0, minLen);
      vecB = vecB.slice(0, minLen);
    }
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    if (normA === 0 || normB === 0) {
      return 0;
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * 获取所有资源
   */
  getAllResources() {
    return this.db.prepare('SELECT * FROM resources ORDER BY created_at DESC').all();
  }

  /**
   * 获取资源数量
   */
  getCount() {
    const result = this.db.prepare('SELECT COUNT(*) as count FROM resources').get();
    return result.count;
  }

  /**
   * 关闭数据库
   */
  close() {
    this.db.close();
  }
}

let storeInstance = null;

/**
 * 获取存储实例
 */
export function getStore() {
  if (!storeInstance) {
    storeInstance = new LocalVectorStore();
  }
  return storeInstance;
}

/**
 * 初始化存储
 */
export function initStore() {
  const store = getStore();
  console.log('✅ 本地向量存储初始化成功');
  console.log(`   存储路径: ${store.storeDir}`);
  console.log(`   数据库: ${store.dbPath}`);
  return store;
}

export { LocalVectorStore };
