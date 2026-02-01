import { useI18n, logger } from '@btc/shared-core';
import { BtcMessage } from '@btc/shared-components';
import type { UseCrudReturn } from '@btc/shared-core';
import { service } from '@services/eps';

/**
 * 获取EPS服务节点
 */
function getEpsServiceNode(servicePath: string | string[]) {
  const pathArray = Array.isArray(servicePath) ? servicePath : servicePath.split('.');
  let serviceNode: any = service;
  for (const key of pathArray) {
    if (!serviceNode || typeof serviceNode !== 'object') {
      throw new Error(`EPS服务路径 ${servicePath} 不存在，无法找到 ${key}`);
    }
    serviceNode = serviceNode[key];
  }
  return serviceNode;
}

/**
 * 创建Summary sheet（使用result接口数据）
 */
function createSummarySheet(dataList: any[], XLSX: any) {
  const currentYear = new Date().getFullYear();
  const summarySheetName = `Summary ${currentYear}`;

  // Summary表头结构：按照正确的列顺序
  const summaryHeader1 = [
    'StockCode',
    'SYS FG',
    'SYS WF-FG',
    'SYS RFG',
    'SYS NG',
    'SYS NS',
    'SYS QC',
    'SYS ST',
    'SYS WF',
    'SYS IQC',
    'SYS RWF',
    'SYS ST-SM',
    'SYS Total',
    'BTC FG',
    'BTC WF-FG',
    'BTC RFG',
    'BTC NG',
    'BTC NS',
    'BTC QC',
    'BTC ST',
    'BTC WF',
    'BTC IQC',
    'BTC RWF',
    'BTC ST-SM',
    'BTC Total',
    'Variance',
    'Unit Cost',
    'Variance Cost'
  ];

  // 构建Summary数据行（按照正确的列顺序）
  const summaryRows = dataList.map((item: any) => [
    item.stockCode || '',
    item.sysFg || 0,
    item.sysWfFg || 0,
    item.sysRfg || 0,
    item.sysNg || 0,
    item.sysNs || 0,
    item.sysQc || 0,
    item.sysSt || 0,
    item.sysWf || 0,
    item.sysIqc || 0,
    item.sysRwf || 0,
    item.sysStSm || 0,
    item.sysTotal || 0,
    item.btcFg || 0,
    item.btcWfFg || 0,
    item.btcRfg || 0,
    item.btcNg || 0,
    item.btcNs ?? 0,
    item.btcQc || 0,
    item.btcSt || 0,
    item.btcWf || 0,
    item.btcIqc || 0,
    item.btcRwf || 0,
    item.btcStSm || 0,
    item.btcTotal || 0,
    item.variance || 0,
    item.unitCost || 0,
    item.varianceCost || 0
  ]);

  // 后端已经汇总，不需要前端再添加Total行
  const summarySheetData = [
    summaryHeader1,
    ...summaryRows
  ];

  const ws = XLSX.utils.aoa_to_sheet(summarySheetData);

  // 设置Summary列宽（按照正确的列顺序）
  const summaryColWidths = [
    { wch: 15 }, // StockCode
    { wch: 10 }, // SYS FG
    { wch: 12 }, // SYS WF-FG
    { wch: 10 }, // SYS RFG
    { wch: 10 }, // SYS NG
    { wch: 10 }, // SYS NS
    { wch: 10 }, // SYS QC
    { wch: 10 }, // SYS ST
    { wch: 10 }, // SYS WF
    { wch: 10 }, // SYS IQC
    { wch: 10 }, // SYS RWF
    { wch: 12 }, // SYS ST-SM
    { wch: 12 }, // SYS Total
    { wch: 10 }, // BTC FG
    { wch: 12 }, // BTC WF-FG
    { wch: 10 }, // BTC RFG
    { wch: 10 }, // BTC NG
    { wch: 10 }, // BTC NS
    { wch: 10 }, // BTC QC
    { wch: 10 }, // BTC ST
    { wch: 10 }, // BTC WF
    { wch: 10 }, // BTC IQC
    { wch: 10 }, // BTC RWF
    { wch: 12 }, // BTC ST-SM
    { wch: 12 }, // BTC Total
    { wch: 12 }, // Variance
    { wch: 12 }, // Unit Cost
    { wch: 15 }  // Variance Cost
  ];
  ws['!cols'] = summaryColWidths;

  return { ws, sheetName: summarySheetName };
}

/**
 * 创建Top 10 sheet（使用top接口数据）
 */
function createTop10Sheet(topDataObj: {
  varianceTop?: any[];
  priceTop?: any[];
  varianceBottom?: any[];
  priceBottom?: any[];
}, XLSX: any) {
  // 表头（6列，不包含Gain/Loss，Gain/Loss在标题行中）
  const topHeader = ['id', 'StockCode', 'SysQty', 'BTCQty', 'Variance', 'TotalValue'];

  // 格式化Top数据（6列）
  const formatTopRow = (item: any, index: number) => [
    index + 1,
    item.stockCode || '',
    item.sysQty || 0,
    item.btcQty || 0,
    item.variance || 0,
    item.totalValue || 0
  ];

  // 构建Top 10 sheet数据（2x2布局）
  const topSheetData: any[][] = [];

  // 获取数据
  const varianceTopRows = (topDataObj.varianceTop || []).map((item: any, idx: number) => formatTopRow(item, idx));
  const varianceBottomRows = (topDataObj.varianceBottom || []).map((item: any, idx: number) => formatTopRow(item, idx));
  const priceTopRows = (topDataObj.priceTop || []).map((item: any, idx: number) => formatTopRow(item, idx));
  const priceBottomRows = (topDataObj.priceBottom || []).map((item: any, idx: number) => formatTopRow(item, idx));

  // 计算最大行数（用于对齐）
  const maxQtyRows = Math.max(varianceTopRows.length, varianceBottomRows.length);
  const maxValueRows = Math.max(priceTopRows.length, priceBottomRows.length);

  // 1. Qty Top10 部分（2x2布局：Gain在左，Loss在右，中间空一列）
  // 标题行结构：
  // Gain区域：Qty Top10 | 空列(对应id) | 空列(对应StockCode) | 空列(对应SysQty) | 空列(对应BTCQty) | 空列(对应Variance) | Gain(对应TotalValue)
  // 空列（分隔）
  // Loss区域：Qty Top10 | 空列(对应id) | 空列(对应StockCode) | 空列(对应SysQty) | 空列(对应BTCQty) | 空列(对应Variance) | Loss(对应TotalValue)
  const qtyTitleRow: any[] = [
    'Qty Top10', '', '', '', '', 'Gain',  // Gain区域：7列
    '',  // 分隔列
    'Qty Top10', '', '', '', '', 'Loss'   // Loss区域：7列
  ];
  topSheetData.push(qtyTitleRow);

  // 表头行：Gain表头 | 空列 | Loss表头
  const qtyHeaderRow: any[] = [...topHeader, '', ...topHeader];
  topSheetData.push(qtyHeaderRow);

  // 数据行：Gain数据 | 空列 | Loss数据
  for (let i = 0; i < maxQtyRows; i++) {
    const gainRow = varianceTopRows[i] || Array(topHeader.length).fill('');
    const lossRow = varianceBottomRows[i] || Array(topHeader.length).fill('');
    topSheetData.push([...gainRow, '', ...lossRow]);
  }

  // 空行分隔
  topSheetData.push([]);

  // 2. Value Top 部分（2x2布局：Gain在左，Loss在右，中间空一列）
  // 标题行结构：
  // Gain区域：Value Top10 | 空列(对应id) | 空列(对应StockCode) | 空列(对应SysQty) | 空列(对应BTCQty) | 空列(对应Variance) | Gain(对应TotalValue)
  // 空列（分隔）
  // Loss区域：Value Top10 | 空列(对应id) | 空列(对应StockCode) | 空列(对应SysQty) | 空列(对应BTCQty) | 空列(对应Variance) | Loss(对应TotalValue)
  const valueTitleRow: any[] = [
    'Value Top10', '', '', '', '', 'Gain',  // Gain区域：7列
    '',  // 分隔列
    'Value Top10', '', '', '', '', 'Loss'   // Loss区域：7列
  ];
  topSheetData.push(valueTitleRow);

  // 表头行：Gain表头 | 空列 | Loss表头
  const valueHeaderRow: any[] = [...topHeader, '', ...topHeader];
  topSheetData.push(valueHeaderRow);

  // 数据行：Gain数据 | 空列 | Loss数据
  for (let i = 0; i < maxValueRows; i++) {
    const gainRow = priceTopRows[i] || Array(topHeader.length).fill('');
    const lossRow = priceBottomRows[i] || Array(topHeader.length).fill('');
    topSheetData.push([...gainRow, '', ...lossRow]);
  }

  const ws = XLSX.utils.aoa_to_sheet(topSheetData);

  // 设置Top 10列宽（Gain部分6列 + 空列 + Loss部分6列）
  const colWidths = [
    { wch: 8 },   // 序号
    { wch: 15 },  // 库存编码
    { wch: 12 },  // 系统数量
    { wch: 12 },  // BTC数量
    { wch: 12 },  // 差异
    { wch: 15 }   // 总价值
  ];
  const emptyColWidth = { wch: 3 }; // 空列
  const topColWidths = [...colWidths, emptyColWidth, ...colWidths];
  ws['!cols'] = topColWidths;

  return ws;
}

/**
 * 处理导出
 */
export function useLogisticsInventoryExport() {
  const { t } = useI18n();

  const handleExport = async (crudInstance: UseCrudReturn<any> | undefined, checkType?: string) => {
    if (!crudInstance) {
      BtcMessage.error('CRUD上下文不可用');
      return;
    }

    try {
      // 获取EPS服务节点
      const serviceNode = getEpsServiceNode(['logistics', 'base', 'check']);

      if (!serviceNode || typeof serviceNode.result !== 'function') {
        throw new Error('Result方法不存在');
      }

      if (!serviceNode.top || typeof serviceNode.top !== 'function') {
        throw new Error('Top方法不存在');
      }

      // 获取当前查询参数
      const params = crudInstance.getParams();

      // 构建导出参数，使用keyword对象传递参数（包含checkNo）
      const exportParams: any = {};
      if (params.keyword && typeof params.keyword === 'object' && !Array.isArray(params.keyword)) {
        // 传递完整的keyword对象，包含checkNo等
        exportParams.keyword = { ...params.keyword };
      } else {
        // 如果没有keyword，初始化为空对象
        exportParams.keyword = {};
      }

      // 并行调用两个接口获取数据
      const [resultResponse, topResponse] = await Promise.all([
        serviceNode.result(exportParams),
        serviceNode.top(exportParams),
      ]);

      // 处理 result 接口响应
      let dataList: any[] = [];
      if (resultResponse && typeof resultResponse === 'object') {
        if ('data' in resultResponse && Array.isArray(resultResponse.data)) {
          dataList = resultResponse.data;
        } else if (Array.isArray(resultResponse)) {
          dataList = resultResponse;
        }
      }

      // 处理 top 接口响应
      let topDataObj: {
        varianceTop?: any[];
        priceTop?: any[];
        varianceBottom?: any[];
        priceBottom?: any[];
      } = {};
      if (topResponse && typeof topResponse === 'object') {
        if ('data' in topResponse && topResponse.data && typeof topResponse.data === 'object') {
          topDataObj = topResponse.data;
        } else if (!('data' in topResponse) && typeof topResponse === 'object') {
          topDataObj = topResponse;
        }
      }

      // 使用XLSX库创建Excel文件
      const XLSX = await import('xlsx');
      const { saveAs } = await import('file-saver');

      // 创建工作簿
      const wb = XLSX.utils.book_new();

      // 创建两个sheet
      const { ws: summaryWs, sheetName: summarySheetName } = createSummarySheet(dataList, XLSX);
      const topWs = createTop10Sheet(topDataObj, XLSX);

      // 按顺序添加sheet：Summary, Top 10
      XLSX.utils.book_append_sheet(wb, summaryWs, summarySheetName);
      XLSX.utils.book_append_sheet(wb, topWs, 'Top 10');

      // 生成Excel文件
      const wbout = XLSX.write(wb, {
        bookType: 'xlsx',
        bookSST: false,
        type: 'binary',
      });

      // 转换为Blob
      const s2ab = (s: string) => {
        const buf = new ArrayBuffer(s.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i < s.length; i++) {
          view[i] = s.charCodeAt(i) & 0xff;
        }
        return buf;
      };

      const blob = new Blob([s2ab(wbout)], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      // 创建下载链接
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const timestamp = `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
      // 如果有checkType，使用checkType作为文件名前缀，否则使用默认的国际化文本
      const filenamePrefix = checkType ? `${checkType}采购结果` : t('menu.inventory_management.result');
      const filename = `${filenamePrefix}_${timestamp}.xlsx`;

      saveAs(blob, filename);

      BtcMessage.success(t('common.ui.export_success'));
    } catch (error: any) {
      logger.error('导出失败:', error);
      BtcMessage.error(error.message || t('common.ui.export_failed'));
    }
  };

  return {
    handleExport,
  };
}

