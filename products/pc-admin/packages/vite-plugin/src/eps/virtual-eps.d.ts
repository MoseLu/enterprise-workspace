/**
 * 铏氭嫙妯″潡 virtual:eps 鐨勭被鍨嬪０鏄? *
 * 浣跨敤鏂瑰紡锛? * import epsData from 'virtual:eps';
 */

declare module 'virtual:eps' {
  interface ApiMethod {
    path: string;
    method: string;
    name: string;
    summary?: string;
  }

  interface ServiceModule {
    [key: string]: ApiMethod[];
  }

  const epsData: ServiceModule;
  export default epsData;
}

