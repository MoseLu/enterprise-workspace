/**
 * 閫氱敤琛ㄦ牸鍒楅厤缃伐鍏? * 缁熶竴澶勭悊甯歌鐨勮〃鏍煎垪锛屽鍒涘缓鏃堕棿銆佹洿鏂版椂闂寸瓑
 */
import type { TableColumn, OpButton } from '../types';
/**
 * 鍒涘缓鏃堕棿鍒楅厤缃? * 浣跨敤鍚庣鏍囧噯鐨?createdAt 瀛楁
 */
export declare function createCreatedAtColumn(): TableColumn;
/**
 * 鏇存柊鏃堕棿鍒楅厤缃? * 浣跨敤鍚庣鏍囧噯鐨?updatedAt 瀛楁
 */
export declare function createUpdatedAtColumn(): TableColumn;
/**
 * 鎿嶄綔鍒楅厤缃? * 鏍囧噯鐨勭紪杈戙€佸垹闄ゆ搷浣滄寜閽? */
export declare function createOperationColumn(buttons?: OpButton[]): TableColumn;
/**
 * 閫夋嫨鍒楅厤缃? */
export declare function createSelectionColumn(): TableColumn;
/**
 * 搴忓彿鍒楅厤缃? */
export declare function createIndexColumn(): TableColumn;
/**
 * 甯哥敤鐨勮〃鏍煎垪缁勫悎
 */
export declare const CommonColumns: {
    readonly selection: typeof createSelectionColumn;
    readonly index: typeof createIndexColumn;
    readonly createdAt: typeof createCreatedAtColumn;
    readonly updatedAt: typeof createUpdatedAtColumn;
    readonly operation: typeof createOperationColumn;
};
