export function useFinanceInventoryExport() {
  const handleExport = async (crudInstance?: any, checkType?: string) => {
    console.log('Export data:', { crudInstance, checkType });
  };

  return {
    handleExport,
  };
}
