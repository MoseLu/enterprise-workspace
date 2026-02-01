export interface ProcessPauseRecord {
  pauseTime: Date | string | number;
  resumeTime?: Date | string | number;
  reason?: string;
}

export interface ProcessManagementItem {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'paused' | 'completed';
  /**
   * 计划开始/结束时间：后端未提供时允许为空（以 status/checkStatus 为准，不强行赋默认值）
   */
  scheduledStartTime?: Date | string | number;
  scheduledEndTime?: Date | string | number;
  actualStartTime?: Date | string | number;
  actualEndTime?: Date | string | number;
  pauseHistory?: ProcessPauseRecord[];
  description?: string;
}

