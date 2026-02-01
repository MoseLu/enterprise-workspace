import type { Plugin } from 'vite';
/**
 * 澶勭悊 Vue 缁勪欢鐨?name 鏍囩
 */
export declare function createTag(code: string, id: string): {
    code: string;
    map: any;
} | null;
/**
 * 鍚嶇О鏍囩鎻掍欢
 * 鑷姩缁?Vue 缁勪欢娣诲姞 name 灞炴€э紙鏀寔 <script setup name="ComponentName"> 璇硶锛? */
export declare function tagPlugin(): Plugin;

