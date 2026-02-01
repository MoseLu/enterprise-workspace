// 文档搜索服务
export interface DocSearchResult {
  id: string;
  type: 'doc';
  title: string;
  path: string;
  breadcrumb?: string;
}

// 模拟文档搜索功能
export async function searchDocs(keyword: string): Promise<DocSearchResult[]> {
  // 模拟异步搜索
  await new Promise(resolve => setTimeout(resolve, 100));

  // 模拟文档数据
  const mockDocs: DocSearchResult[] = [
    {
      id: 'doc1',
      type: 'doc',
      title: '组件文档',
      path: '/components/',
      breadcrumb: '文档中心'
    },
    {
      id: 'doc2',
      type: 'doc',
      title: 'API 文档',
      path: '/api/',
      breadcrumb: '文档中心'
    },
    {
      id: 'doc3',
      type: 'doc',
      title: '开发指南',
      path: '/guide/',
      breadcrumb: '文档中心'
    }
  ];

  // 简单的关键词匹配
  const lowerKeyword = keyword.toLowerCase();
  return mockDocs.filter(doc =>
    doc.title.toLowerCase().includes(lowerKeyword) ||
    (doc.breadcrumb && doc.breadcrumb.toLowerCase().includes(lowerKeyword))
  );
}

// 获取文档URL
export function getDocUrl(path: string): string {
  return `/docs${path}`;
}
