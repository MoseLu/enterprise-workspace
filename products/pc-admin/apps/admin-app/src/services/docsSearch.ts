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
      title: 'Component Documentation',
      path: '/components/',
      breadcrumb: 'Documentation Center'
    },
    {
      id: 'doc2',
      type: 'doc',
      title: 'API Documentation',
      path: '/api/',
      breadcrumb: 'Documentation Center'
    },
    {
      id: 'doc3',
      type: 'doc',
      title: 'Development Guide',
      path: '/guide/',
      breadcrumb: 'Documentation Center'
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
