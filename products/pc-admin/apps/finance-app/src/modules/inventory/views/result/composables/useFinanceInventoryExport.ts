// ref 未使用，已移除
// import { ref } from 'vue';
import { useI18n, logger } from '@btc/shared-core';
import { BtcMessage } from '@btc/shared-components';
import type { UseCrudReturn } from '@btc/shared-core';
import { getEpsServiceNode } from './useFinanceInventoryService';

/**
 * 格式化Result数据行（按照正确的列顺序）
 */
function formatResultRow(item: any): any[] {
  // 计算差异百分比（未使用，保留用于未来功能）
  // @ts-expect-error: 可能在未来使用
  const variancePercent = item.sysTotal !== 0
    ? ((item.variance / item.sysTotal) * 100).toFixed(2)
    : (item.btcTotal !== 0 ? '100.00' : '0.00');

  return [
    item.stockCode || '',
    // Syspro Qty (按照用户提供的顺序：SYS_FG, SYS_WF_FG, SYS_RFG, SYS_NG, SYS_NS, SYS_QC, SYS_ST, SYS_WF, SYS_IQC, SYS_RWF, SYS_ST_SM, SYS_Total)
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
    '', // 空列（在SYS_Total和BTC_FG之间）
    // Actual QTY (按照用户提供的顺序：BTC_FG, BTC_WF_FG, BTC_RFG, BTC_NG, BTC_NS, BTC_QC, BTC_ST, BTC_WF, BTC_IQC, BTC_RWF, BTC_ST_SM, BTC_Total)
    item.btcFg || 0,
    item.btcWfFg || 0,
    item.btcRfg || 0,
    item.btcNg || 0,
    item.btcNs || 0,
    item.btcQc || 0,
    item.btcSt || 0,
    item.btcWf || 0,
    item.btcIqc || 0,
    item.btcRwf || 0,
    item.btcStSm || 0,
    item.btcTotal || 0,
    // Variance[QTY]
    item.variance || 0,
    // UnitCost
    item.unitCost || 0,
    // VarianceCost
    item.varianceCost || 0,
    // Syspro value (按照用户提供的顺序：FG, WF_FG, RFG, NG, NS, QC, ST, WF, IQC, RWF, ST_SM)
    item.sysFgValue || 0,
    item.sysWfFgValue || 0,
    item.sysRfgValue || 0,
    item.sysNgValue || 0,
    item.sysNsValue || 0,
    item.sysQcValue || 0,
    item.sysStValue || 0,
    item.sysWfValue || 0,
    item.sysIqcValue || 0,
    item.sysRwfValue || 0,
    item.sysStSmValue || 0,
    // SysproTotal (需要计算，应该是所有sys value的总和)
    (item.sysFgValue || 0) + (item.sysWfFgValue || 0) + (item.sysRfgValue || 0) + (item.sysNgValue || 0) + (item.sysNsValue || 0) + (item.sysQcValue || 0) + (item.sysStValue || 0) + (item.sysWfValue || 0) + (item.sysIqcValue || 0) + (item.sysRwfValue || 0) + (item.sysStSmValue || 0),
    '', // 空列（在SysproTotal和BTC_FG之间）
    // Actual Value (按照用户提供的顺序：BTC_FG, BTC_WF_FG, BTC_RFG, BTC_NG, BTC_NS, BTC_QC, BTC_ST, BTC_WF, BTC_IQC, BTC_RWF, BTC_ST_SM, BTC_Total)
    item.btcFgValue || 0,
    item.btcWfFgValue || 0,
    item.btcRfgValue || 0,
    item.btcNgValue || 0,
    item.btcNsValue || 0,
    item.btcQcValue || 0,
    item.btcStValue || 0,
    item.btcWfValue || 0,
    item.btcIqcValue || 0,
    item.btcRwfValue || 0,
    item.btcStSmValue || 0,
    item.btcTotalValue || 0,
    '', // 空列（在BTC_Total和第二个FG之间）
    // Value Var. (按照用户提供的顺序：FG, WF_FG, RFG, NG, NS, QC, ST, WF, IQC, RWF, ST_SM, Total)
    item.fgVar || 0,
    item.wfFgVar || 0,
    item.rfgVar || 0,
    item.ngVar || 0,
    item.nsVar || 0,
    item.qcVar || 0,
    item.stVar || 0,
    item.wfVar || 0,
    item.iqcVar || 0,
    item.rwfVar || 0,
    item.stSmVar || 0,
    item.totalVar || 0
  ];
}

/**
 * 创建Result sheet
 */
function createResultSheet(dataList: any[], XLSX: any) {
  // Result表头第二行（列名行）
  const header2 = [
    'StockCode',
    // Syspro Qty (按照用户提供的顺序)
    'SYS_FG', 'SYS_WF_FG', 'SYS_RFG', 'SYS_NG', 'SYS_NS', 'SYS_QC', 'SYS_ST', 'SYS_WF', 'SYS_IQC', 'SYS_RWF', 'SYS_ST_SM', 'SYS_Total',
    '', // 空列（在SYS_Total和BTC_FG之间）
    // Actual QTY (按照用户提供的顺序)
    'BTC_FG', 'BTC_WF_FG', 'BTC_RFG', 'BTC_NG', 'BTC_NS', 'BTC_QC', 'BTC_ST', 'BTC_WF', 'BTC_IQC', 'BTC_RWF', 'BTC_ST_SM', 'BTC_Total',
    // Variance[QTY]
    'Variance[QTY]',
    // UnitCost
    'UnitCost',
    // VarianceCost
    'VarianceCost',
    // Syspro value (按照用户提供的顺序)
    'FG', 'WF_FG', 'RFG', 'NG', 'NS', 'QC', 'ST', 'WF', 'IQC', 'RWF', 'ST_SM',
    // SysproTotal
    'SysproTotal',
    '', // 空列（在SysproTotal和BTC_FG之间）
    // Actual Value (按照用户提供的顺序)
    'BTC_FG', 'BTC_WF_FG', 'BTC_RFG', 'BTC_NG', 'BTC_NS', 'BTC_QC', 'BTC_ST', 'BTC_WF', 'BTC_IQC', 'BTC_RWF', 'BTC_ST_SM', 'BTC_Total',
    '', // 空列（在BTC_Total和第二个FG之间）
    // Value Var. (按照用户提供的顺序)
    'FG', 'WF_FG', 'RFG', 'NG', 'NS', 'QC', 'ST', 'WF', 'IQC', 'RWF', 'ST_SM', 'Total'
  ];

  // Result表头第一行（标题行）
  const header1: any[] = [];
  // StockCode列
  header1.push('');
  // Syspro Qty (合并列1-12)
  header1.push('Syspro Qty');
  for (let i = 1; i < 12; i++) {
    header1.push('');
  }
  // 空列（列13）
  header1.push('');
  // Actual QTY (合并列14-25)
  header1.push('Actual QTY');
  for (let i = 1; i < 12; i++) {
    header1.push('');
  }
  // Variance[QTY] (列26)
  header1.push('BTC_Total - SYS_Total');
  // UnitCost (列27)
  header1.push('');
  // VarianceCost (列28)
  header1.push('');
  // Syspro value (合并列29-39)
  header1.push('Syspro value');
  for (let i = 1; i < 11; i++) {
    header1.push('');
  }
  // SysproTotal (列40)
  header1.push('');
  // 空列（列41）
  header1.push('');
  // Actual Value (合并列42-53)
  header1.push('Actual Value');
  for (let i = 1; i < 12; i++) {
    header1.push('');
  }
  // 空列（列54）
  header1.push('');
  // Value Var. (合并列55-66)
  header1.push('Value Var.');
  for (let i = 1; i < 12; i++) {
    header1.push('');
  }

  const rows = dataList.map(formatResultRow);
  const sheetData = [header1, header2, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  // 设置列宽
  const colWidths = [
    { wch: 15 }, // StockCode
    ...Array(12).fill({ wch: 12 }), // Syspro Qty (12列)
    { wch: 3 },  // 空列
    ...Array(12).fill({ wch: 12 }), // Actual QTY (12列)
    { wch: 18 }, // Variance[QTY]
    { wch: 12 }, // UnitCost
    { wch: 15 }, // VarianceCost
    ...Array(11).fill({ wch: 15 }), // Syspro value (11列)
    { wch: 15 }, // SysproTotal
    { wch: 3 },  // 空列
    ...Array(12).fill({ wch: 15 }), // Actual Value (12列)
    { wch: 3 },  // 空列
    ...Array(12).fill({ wch: 15 }), // Value Var. (12列)
  ];
  ws['!cols'] = colWidths;

  // 合并表头单元格
  if (!ws['!merges']) ws['!merges'] = [];
  // Syspro Qty (合并列1-12，行0)
  ws['!merges'].push({ s: { r: 0, c: 1 }, e: { r: 0, c: 12 } });
  // Actual QTY (合并列14-25，行0)
  ws['!merges'].push({ s: { r: 0, c: 14 }, e: { r: 0, c: 25 } });
  // Syspro value (合并列29-39，行0)
  ws['!merges'].push({ s: { r: 0, c: 29 }, e: { r: 0, c: 39 } });
  // Actual Value (合并列42-53，行0)
  ws['!merges'].push({ s: { r: 0, c: 42 }, e: { r: 0, c: 53 } });
  // Value Var. (合并列55-66，行0)
  ws['!merges'].push({ s: { r: 0, c: 55 }, e: { r: 0, c: 66 } });

  return ws;
}

/**
 * 格式化数字：千位分隔符，保留2位小数
 */
function formatNumberWithCommas(value: number | string | null | undefined): string {
  const num = Number(value) || 0;
  // 保留2位小数，使用千位分隔符
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * 创建Summary sheet
 */
function createSummarySheet(summaryData: any[], XLSX: any) {
  const currentYear = new Date().getFullYear();
  const summarySheetName = `Summary ${currentYear}`;

  // 生成日期字符串（格式：YYYYMMDD）
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  // 仓库顺序映射（按照要求的顺序）
  const warehouseOrder = [
    'ST',
    'QC',
    'NG',
    'ST-SM',
    'WF',
    'NS',
    'RWF',
    'IQC',
    'WF-FG',
    'FG',
    'RFG'
  ];

  // 仓库显示名称映射
  const warehouseDisplayNames: Record<string, string> = {
    'ST': 'ST',
    'QC': 'QC',
    'NG': 'NG(NG BTC)',
    'ST-SM': 'ST-SM',
    'WF': 'WF',
    'NS': 'NS(NG Supplier)',
    'RWF': 'RWF',
    'IQC': 'IQC',
    'WF-FG': 'WF-FG',
    'FG': 'FG',
    'RFG': 'RFG'
  };

  // 将summaryData转换为Map，方便查找
  const summaryMap = new Map<string, any>();
  summaryData.forEach((item: any) => {
    const wh = item.warehouse || '';
    summaryMap.set(wh, item);
  });

  // 按照指定顺序构建数据行（在Var.和Syspro之间添加空列，并格式化数字）
  const summaryRows: any[][] = [];
  const rawDataRows: any[][] = []; // 保存原始数值用于计算Total
  warehouseOrder.forEach((wh) => {
    const item = summaryMap.get(wh);
    if (item) {
      // 保存原始数据
      rawDataRows.push([
        item.sysQty || 0,
        item.btcQty || 0,
        item.varQty || 0,
        item.sysAmount || 0,
        item.btcAmount || 0,
        item.varAmount || 0
      ]);
      // 格式化后的数据行
      summaryRows.push([
        warehouseDisplayNames[wh] || wh,
        formatNumberWithCommas(item.sysQty),
        formatNumberWithCommas(item.btcQty),
        formatNumberWithCommas(item.varQty),
        '', // 空列（在Var.和Syspro之间）
        formatNumberWithCommas(item.sysAmount),
        formatNumberWithCommas(item.btcAmount),
        formatNumberWithCommas(item.varAmount)
      ]);
    }
  });

  // 添加Total行（在Var.和Syspro之间添加空列，并格式化数字）
  const totalRow: any[] = ['Total'];
  // 计算各列的合计（Quantity部分：3列）
  const qtySysproSum = rawDataRows.reduce((acc, row) => acc + (Number(row[0]) || 0), 0);
  const qtyActualSum = rawDataRows.reduce((acc, row) => acc + (Number(row[1]) || 0), 0);
  const qtyVarSum = rawDataRows.reduce((acc, row) => acc + (Number(row[2]) || 0), 0);
  totalRow.push(formatNumberWithCommas(qtySysproSum));
  totalRow.push(formatNumberWithCommas(qtyActualSum));
  totalRow.push(formatNumberWithCommas(qtyVarSum));
  totalRow.push(''); // 空列（在Var.和Syspro之间）
  // 计算各列的合计（Amount部分：3列）
  const amtSysproSum = rawDataRows.reduce((acc, row) => acc + (Number(row[3]) || 0), 0);
  const amtActualSum = rawDataRows.reduce((acc, row) => acc + (Number(row[4]) || 0), 0);
  const amtVarSum = rawDataRows.reduce((acc, row) => acc + (Number(row[5]) || 0), 0);
  totalRow.push(formatNumberWithCommas(amtSysproSum));
  totalRow.push(formatNumberWithCommas(amtActualSum));
  totalRow.push(formatNumberWithCommas(amtVarSum));

  // Summary表头结构：两级表头（在Var.和Syspro之间添加空列）
  const summaryHeader1 = [
    '',
    'Quantity', '', '', '',
    'Amount (USD)', '', ''
  ];
  const summaryHeader2 = [
    'Warehouse',
    'SYSPRO', 'Actual', 'Var.',
    '', // 空列（在Var.和Syspro之间）
    'Syspro', 'Actual', 'Var.'
  ];

  // 构建完整的sheet数据
  const summarySheetData = [
    [], // 首行是空行
    [`Stock take report of BTC on ${dateStr}`], // 标题行
    ['Currency:USD'], // 货币行
    [], // 空行
    summaryHeader1,
    summaryHeader2,
    ...summaryRows,
    [], // 空行（在RFG和Total之间）
    totalRow
  ];

  const ws = XLSX.utils.aoa_to_sheet(summarySheetData);

  // 设置Summary列宽（包含空列）
  const summaryColWidths = [
    { wch: 20 }, // WH
    { wch: 18 }, { wch: 18 }, { wch: 18 }, // Quantity (3列：SYSPRO, Actual, Var.)
    { wch: 3 },  // 空列
    { wch: 18 }, { wch: 18 }, { wch: 18 }  // Amount (3列：Syspro, Actual, Var.)
  ];
  ws['!cols'] = summaryColWidths;

  // 合并表头单元格（调整行号，因为首行是空行）
  if (!ws['!merges']) ws['!merges'] = [];
  ws['!merges'].push(
    { s: { r: 4, c: 1 }, e: { r: 4, c: 3 } }, // Quantity合并B5:D5
    { s: { r: 4, c: 5 }, e: { r: 4, c: 7 } }  // Amount合并F5:H5
  );

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
    'Qty Top10', '', '', '', '', 'Gain',  // Gain区域：6列
    '',  // 分隔列
    'Qty Top10', '', '', '', '', 'Loss'   // Loss区域：6列
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
    'Value Top10', '', '', '', '', 'Gain',  // Gain区域：6列
    '',  // 分隔列
    'Value Top10', '', '', '', '', 'Loss'   // Loss区域：6列
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
    { wch: 15 },  // 差异
    { wch: 18 }   // 总价值
  ];
  const emptyColWidth = { wch: 3 }; // 空列
  const topColWidths = [...colWidths, emptyColWidth, ...colWidths];
  ws['!cols'] = topColWidths;

  return ws;
}

/**
 * 处理导出
 */
export function useFinanceInventoryExport() {
  const { t } = useI18n();

  const handleExport = async (crudInstance: UseCrudReturn<any> | undefined, checkType?: string) => {
    if (!crudInstance) {
      BtcMessage.error('CRUD上下文不可用');
      return;
    }

    try {
      // 获取EPS服务节点
      const serviceNode = getEpsServiceNode('finance.base.financeResult');

      if (!serviceNode || typeof serviceNode.result !== 'function') {
        throw new Error('Result方法不存在');
      }

      if (!serviceNode.summary || typeof serviceNode.summary !== 'function') {
        throw new Error('Summary方法不存在');
      }

      if (!serviceNode.top || typeof serviceNode.top !== 'function') {
        throw new Error('Top方法不存在');
      }

      // 获取当前查询参数
      const params = crudInstance.getParams();

      // 构建导出参数，使用keyword对象传递参数（包含checkNo）
      const exportParams: any = {};
      if (params.keyword && typeof params.keyword === 'object' && !Array.isArray(params.keyword)) {
        // 传递完整的keyword对象，包含checkNo、materialCode、position等
        exportParams.keyword = { ...params.keyword };
      } else {
        // 如果没有keyword，初始化为空对象
        exportParams.keyword = {};
      }

      // 并行调用三个接口获取数据
      const [resultResponse, summaryResponse, topResponse] = await Promise.all([
        serviceNode.result(exportParams),
        serviceNode.summary(exportParams),
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

      // 处理 summary 接口响应
      let summaryData: any[] = [];
      if (summaryResponse && typeof summaryResponse === 'object') {
        if ('data' in summaryResponse && Array.isArray(summaryResponse.data)) {
          summaryData = summaryResponse.data;
        } else if (Array.isArray(summaryResponse)) {
          summaryData = summaryResponse;
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

      // 创建三个sheet
      const { ws: summaryWs, sheetName: summarySheetName } = createSummarySheet(summaryData, XLSX);
      const resultWs = createResultSheet(dataList, XLSX);
      const topWs = createTop10Sheet(topDataObj, XLSX);

      // 按顺序添加sheet：Summary 2025, Result, Top 10
      XLSX.utils.book_append_sheet(wb, summaryWs, summarySheetName);
      XLSX.utils.book_append_sheet(wb, resultWs, 'Result');
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
      const filenamePrefix = checkType ? `${checkType}财务结果` : t('menu.finance.inventory_management.result');
      const filename = `${filenamePrefix}_${timestamp}.xlsx`;

      saveAs(blob, filename);

      BtcMessage.success(t('platform.common.export_success'));
    } catch (error: any) {
      logger.error('导出失败:', error);
      BtcMessage.error(error.message || t('platform.common.export_failed'));
    }
  };

  return {
    handleExport,
  };
}

