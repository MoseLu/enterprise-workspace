export interface DocSearchResult {
    id: string;
    type: 'doc';
    title: string;
    path: string;
    breadcrumb?: string;
}
export declare function searchDocs(keyword: string): Promise<DocSearchResult[]>;
export declare function getDocUrl(path: string): string;
