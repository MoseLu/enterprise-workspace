import type { App, Directive } from 'vue';

/**
 * 鎻掍欢閰嶇疆閫夐」
 */
export interface PluginOptions {
  [key: string]: any;
}

/**
 * 鎻掍欢鍏冩暟鎹厤缃紙鍏煎 Cool-Admin 椋庢牸锛? */
export interface PluginMetadata {
  /**
   * 鎻掍欢鏄剧ず鍚嶇О
   */
  label?: string;

  /**
   * 鎻掍欢鎻忚堪
   */
  description?: string;

  /**
   * 浣滆€?   */
  author?: string;

  /**
   * 鐗堟湰鍙?   */
  version?: string;

  /**
   * 鏇存柊鏃堕棿
   */
  updateTime?: string;

  /**
   * 鎻掍欢鏂囨。閾炬帴
   */
  doc?: string;

  /**
   * 绀轰緥璺緞鍒楄〃
   */
  demo?: string[];

  /**
   * 鎻掍欢鍥炬爣 URL
   */
  icon?: string;

  /**
   * 鎻掍欢鍒嗙被
   */
  category?: string;

  /**
   * 鎻掍欢鏍囩
   */
  tags?: string[];

  /**
   * 鏄惁鎺ㄨ崘浣跨敤
   */
  recommended?: boolean;
}

/**
 * 宸ュ叿鏍忛厤缃? */
export interface ToolbarConfig {
  /**
   * 鎺掑簭锛堟暟瀛楄秺灏忚秺闈犲墠锛?   */
  order?: number;

  /**
   * 鏄惁鍦?PC 绔樉绀?   */
  pc?: boolean;

  /**
   * 鏄惁鍦?H5 绔樉绀?   */
  h5?: boolean;

  /**
   * 宸ュ叿鏍忕粍浠?   */
  component: () => Promise<any>;
}

/**
 * 甯冨眬娉ㄥ叆閰嶇疆
 */
export interface LayoutConfig {
  /**
   * 娉ㄥ叆浣嶇疆
   */
  position: 'header' | 'sidebar' | 'footer' | 'global';

  /**
   * 鎺掑簭锛堟暟瀛楄秺灏忚秺闈犲墠锛?   */
  order?: number;

  /**
   * 甯冨眬缁勪欢
   */
  component: () => Promise<any>;
}

/**
 * qiankun 寰墠绔厤缃? */
export interface QiankunConfig {
  /**
   * 鏄惁鍏变韩缁欏瓙搴旂敤
   */
  shared?: boolean;

  /**
   * 鍏ㄥ眬鐘舵€侊紙渚涘瓙搴旂敤璁块棶锛?   */
  globalState?: Record<string, any>;

  /**
   * 瀛愬簲鐢ㄥ彲璁块棶鐨?API
   */
  exposeApi?: string[];
}

/**
 * 闈欐€佽祫婧愰厤缃? */
export interface StaticConfig {
  /**
   * SVG 鍥炬爣鐩綍璺緞锛堢浉瀵逛簬鎻掍欢鏍圭洰褰曪級
   */
  svgDir?: string;

  /**
   * 鍏朵粬闈欐€佽祫婧愮洰褰?   */
  assetsDir?: string;
}

/**
 * 鐢熷懡鍛ㄦ湡浜嬩欢鍙傛暟
 */
export interface PluginLifecycleEvents {
  /**
   * 鍏朵粬鎻掍欢瀵煎嚭鐨勬柟娉曞拰鍙橀噺
   */
  [key: string]: any;
}

/**
 * 鎻掍欢鎺ュ彛锛堟墿灞曠増锛? */
export interface Plugin<T = any> {
  /**
   * 鎻掍欢鍚嶇О锛堝敮涓€鏍囪瘑锛?   */
  name: string;

  /**
   * 鎻掍欢鐗堟湰
   */
  version?: string;

  /**
   * 鎻掍欢鎻忚堪
   */
  description?: string;

  /**
   * 浣滆€?   */
  author?: string;

  /**
   * 鏇存柊鏃堕棿
   */
  updateTime?: string;

  /**
   * Logo URL
   */
  logo?: string;

  /**
   * 鎻掍欢渚濊禆锛堝叾浠栨彃浠跺悕绉帮級
   */
  dependencies?: string[];

  /**
   * 鏄惁鍚敤
   */
  enable?: boolean;

  /**
   * 鍔犺浇椤哄簭锛堟暟瀛楄秺澶ц秺鍏堝姞杞斤級
   */
  order?: number;

  /**
   * 鎻掍欢瀹夎閽╁瓙
   * @param app Vue 搴旂敤瀹炰緥
   * @param options 鎻掍欢閰嶇疆閫夐」
   */
  install?: (app: App, options?: PluginOptions) => void | Promise<void>;

  /**
   * 鎻掍欢鍗歌浇閽╁瓙
   */
  uninstall?: () => void | Promise<void>;

  /**
   * 鎻掍欢鍔犺浇瀹屾垚鍚庣殑閽╁瓙
   * @param events 鐢熷懡鍛ㄦ湡浜嬩欢鍙傛暟锛堝彲浠ユ帴鏀跺叾浠栨彃浠跺鍑虹殑鏂规硶锛?   * @returns 瀵煎嚭缁欏叾浠栨彃浠朵娇鐢ㄧ殑鏂规硶鍜屽彉閲?   */
  onLoad?: (events: PluginLifecycleEvents) => Promise<Record<string, any>> | Record<string, any>;

  /**
   * 鎻掍欢鍔熻兘瀹炰緥锛堝 Excel 瀵煎嚭鍑芥暟銆乁pload 宸ュ叿绛夛級
   */
  api?: T;

  /**
   * 鍏ㄥ眬缁勪欢鑷姩娉ㄥ唽
   */
  components?: (() => Promise<any>)[];

  /**
   * 鍏ㄥ眬鎸囦护鑷姩娉ㄥ唽
   * key 涓烘寚浠ゅ悕锛寁alue 涓烘寚浠ゅ畾涔?   */
  directives?: Record<string, Directive>;

  /**
   * 瑙嗗浘璺敱锛堜細琚敞鍐屽埌涓昏矾鐢辩殑 children 涓級
   */
  views?: any[];

  /**
   * 椤甸潰璺敱锛堢嫭绔嬬殑涓€绾ц矾鐢憋級
   */
  pages?: any[];

  /**
   * 椤舵爮宸ュ叿閰嶇疆
   */
  toolbar?: ToolbarConfig;

  /**
   * 甯冨眬娉ㄥ叆閰嶇疆
   */
  layout?: LayoutConfig;

  /**
   * 闈欐€佽祫婧愰厤缃?   */
  static?: StaticConfig;

  /**
   * qiankun 寰墠绔厤缃?   */
  qiankun?: QiankunConfig;

  /**
   * 鎻掍欢閰嶇疆鍙傛暟锛堝彲渚涘閮ㄤ娇鐢級
   */
  options?: PluginOptions;

  /**
   * 鎻掍欢鍏冩暟鎹?   */
  meta?: Record<string, any>;

  /**
   * 鎻掍欢閰嶇疆鍏冩暟鎹紙鍏煎 Cool-Admin 椋庢牸锛?   * 鎻愪緵鏇翠赴瀵岀殑鎻掍欢淇℃伅鍜岄厤缃€夐」
   */
  config?: PluginMetadata;
}

/**
 * 鎻掍欢绠＄悊鍣ㄩ厤缃? */
export interface PluginManagerOptions {
  /**
   * 鏄惁鍦ㄥ畨瑁呮彃浠舵椂妫€鏌ヤ緷璧?   */
  checkDependencies?: boolean;

  /**
   * 鏄惁鍏佽閲嶅娉ㄥ唽锛堣鐩栵級
   */
  allowOverride?: boolean;

  /**
   * 鏄惁鍚敤璋冭瘯鏃ュ織
   */
  debug?: boolean;
}

/**
 * 鎻掍欢鐘舵€? */
export enum PluginStatus {
  /** 宸叉敞鍐屼絾鏈畨瑁?*/
  Registered = 'registered',
  /** 宸插畨瑁?*/
  Installed = 'installed',
  /** 宸插嵏杞?*/
  Uninstalled = 'uninstalled',
  /** 瀹夎澶辫触 */
  Failed = 'failed',
}

/**
 * 鎻掍欢璁板綍
 */
export interface PluginRecord<T = any> {
  plugin: Plugin<T>;
  status: PluginStatus;
  installedAt?: Date;
  error?: Error;
}



