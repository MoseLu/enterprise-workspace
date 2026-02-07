import { useState, useCallback } from 'react';

export function useFinanceInventoryDetail() {
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  const handleViewDetail = useCallback((record: any) => {
    setSelectedRecord(record);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedRecord(null);
  }, []);

  return {
    selectedRecord,
    handleViewDetail,
    handleCloseDetail,
  };
}
