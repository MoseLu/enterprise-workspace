import type { TableColumn } from '../types';
import { formatDateTimeFriendly, isDateTimeField } from '@btc/shared-core/utils';

/**
 * 鑷姩鏍煎紡鍖栬〃鏍煎垪锛堥拡瀵规椂闂村瓧娈碉級
 * @param columns 琛ㄦ牸鍒楅厤缃? * @returns 澶勭悊鍚庣殑琛ㄦ牸鍒楅厤缃? */
export function autoFormatTableColumns(columns: TableColumn[]): TableColumn[] {
  return columns.map(column => {
    // 濡傛灉鏄椂闂村瓧娈碉紝鑷姩娣诲姞鏍煎紡鍖栧櫒
    if (column.prop && isDateTimeField(column.prop) && !column.formatter) {
      return {
        ...column,
        formatter: (_row: any, _column: any, cellValue: any) => {
          return formatDateTimeFriendly(cellValue);
        }
      };
    }
    return column;
  });
}

/**
 * 鍒涘缓鏃堕棿瀛楁鏍煎紡鍖栧櫒
 * @param format 鏍煎紡鍖栨ā鏉匡紝榛樿涓?'YYYY-MM-DD HH:mm:ss'
 * @returns 鏍煎紡鍖栧櫒鍑芥暟
 */
export function createDateTimeFormatter(_format = 'YYYY-MM-DD HH:mm:ss') {
  return (_row: any, _column: any, cellValue: any) => {
    return formatDateTimeFriendly(cellValue);
  };
}

/**
 * 涓虹壒瀹氬瓧娈靛垱寤烘椂闂存牸寮忓寲鍣? * @param fieldName 瀛楁鍚? * @returns 琛ㄦ牸鍒楅厤缃? */
export function createDateTimeColumn(fieldName: string, label = '鏃堕棿', width = 180): TableColumn {
  return {
    prop: fieldName,
    label,
    width,
    formatter: createDateTimeFormatter()
  };
}

/**
 * 涓哄垱寤烘椂闂村瓧娈靛垱寤哄垪閰嶇疆
 * @param fieldName 瀛楁鍚嶏紝榛樿涓?'createdAt'
 * @returns 琛ㄦ牸鍒楅厤缃? */
export function createCreatedAtColumn(fieldName = 'createdAt'): TableColumn {
  return createDateTimeColumn(fieldName, '鍒涘缓鏃堕棿');
}

/**
 * 涓烘洿鏂版椂闂村瓧娈靛垱寤哄垪閰嶇疆
 * @param fieldName 瀛楁鍚嶏紝榛樿涓?'updatedAt'
 * @returns 琛ㄦ牸鍒楅厤缃? */
export function createUpdatedAtColumn(fieldName = 'updatedAt'): TableColumn {
  return createDateTimeColumn(fieldName, '鏇存柊鏃堕棿');
}

