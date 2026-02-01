/**
 * 页面实现数据库
 * 存储已实现的页面作为参考
 */

import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 获取数据库路径
 */
function getDbPath() {
  const configDir = join(__dirname, '../../../../.cursor/skills-meta/vector-store');
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true });
  }
  return join(configDir, 'page-database.db');
}

let dbInstance = null;

/**
 * 获取数据库实例
 */
export function getPageDatabase() {
  if (!dbInstance) {
    const dbPath = getDbPath();
    dbInstance = new Database(dbPath);
    
    // 初始化表结构
    initTables(dbInstance);
  }
  return dbInstance;
}

/**
 * 初始化表结构
 */
function initTables(db) {
  // 页面实现表
  db.exec(`
    CREATE TABLE IF NOT EXISTS page_implementations (
      id TEXT PRIMARY KEY,
      app_name TEXT NOT NULL,
      module_name TEXT,
      page_name TEXT NOT NULL,
      page_type TEXT NOT NULL, -- 'crud', 'form', 'detail', 'dashboard', etc.
      description TEXT,
      layout_type TEXT, -- 'splitter', 'single', 'dual-menu', etc.
      resources TEXT, -- JSON: { components: [], composables: [], icons: [], locales: [], services: [] }
      file_path TEXT NOT NULL,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `);

  // 页面资源关联表
  db.exec(`
    CREATE TABLE IF NOT EXISTS page_resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      page_id TEXT NOT NULL,
      resource_type TEXT NOT NULL, -- 'component', 'composable', 'icon', 'locale', 'service'
      resource_id TEXT NOT NULL, -- 关联到 resources 表的 id
      resource_path TEXT,
      usage_context TEXT, -- JSON: { role: 'layout', 'table', 'form', etc. }
      FOREIGN KEY (page_id) REFERENCES page_implementations(id)
    )
  `);

  // 创建索引
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_page_type ON page_implementations(page_type);
    CREATE INDEX IF NOT EXISTS idx_page_layout ON page_implementations(layout_type);
    CREATE INDEX IF NOT EXISTS idx_page_resources_page ON page_resources(page_id);
  `);
}

/**
 * 添加页面实现
 */
export function addPageImplementation(pageData) {
  const db = getPageDatabase();
  const {
    id,
    appName,
    moduleName,
    pageName,
    pageType,
    description,
    layoutType,
    resources,
    filePath,
  } = pageData;

  db.prepare(`
    INSERT OR REPLACE INTO page_implementations 
    (id, app_name, module_name, page_name, page_type, description, layout_type, resources, file_path, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, strftime('%s', 'now'))
  `).run(
    id,
    appName,
    moduleName || null,
    pageName,
    pageType,
    description || null,
    layoutType || null,
    JSON.stringify(resources || {}),
    filePath
  );

  // 添加资源关联
  if (resources) {
    // 先删除旧的关联
    db.prepare('DELETE FROM page_resources WHERE page_id = ?').run(id);

    // 添加新的关联
    const insertResource = db.prepare(`
      INSERT INTO page_resources (page_id, resource_type, resource_id, resource_path, usage_context)
      VALUES (?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((resources, pageId) => {
      for (const [type, items] of Object.entries(resources)) {
        if (Array.isArray(items)) {
          for (const item of items) {
            insertResource.run(
              pageId,
              type,
              item.id || item.path || '',
              item.path || '',
              JSON.stringify(item.context || {})
            );
          }
        }
      }
    });

    insertMany(resources, id);
  }
}

/**
 * 查找相似的页面实现
 */
export function findSimilarPages(criteria) {
  const db = getPageDatabase();
  const {
    pageType,
    layoutType,
    appName,
    limit = 5,
  } = criteria;

  let sql = 'SELECT * FROM page_implementations WHERE 1=1';
  const params = [];

  if (pageType) {
    sql += ' AND page_type = ?';
    params.push(pageType);
  }

  if (layoutType) {
    sql += ' AND layout_type = ?';
    params.push(layoutType);
  }

  if (appName) {
    sql += ' AND app_name = ?';
    params.push(appName);
  }

  sql += ' ORDER BY updated_at DESC LIMIT ?';
  params.push(limit);

  const pages = db.prepare(sql).all(...params);

  // 解析 resources JSON
  return pages.map(page => ({
    ...page,
    resources: JSON.parse(page.resources || '{}'),
  }));
}

/**
 * 获取页面的资源列表
 */
export function getPageResources(pageId) {
  const db = getPageDatabase();
  
  const resources = db.prepare(`
    SELECT pr.*, p.app_name, p.page_name, p.page_type
    FROM page_resources pr
    JOIN page_implementations p ON pr.page_id = p.id
    WHERE pr.page_id = ?
  `).all(pageId);

  return resources.map(r => ({
    ...r,
    usageContext: JSON.parse(r.usage_context || '{}'),
  }));
}

/**
 * 获取所有页面
 */
export function getAllPages() {
  const db = getPageDatabase();
  const pages = db.prepare('SELECT * FROM page_implementations ORDER BY updated_at DESC').all();
  
  return pages.map(page => ({
    ...page,
    resources: JSON.parse(page.resources || '{}'),
  }));
}

/**
 * 关闭数据库
 */
export function closePageDatabase() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
