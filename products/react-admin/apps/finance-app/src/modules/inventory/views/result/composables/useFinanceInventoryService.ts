export function useFinanceInventoryService() {
  const getList = async (params: any) => {
    console.log('Fetch list:', params);
    return {
      list: [],
      total: 0,
    };
  };

  const page = async (params: any) => {
    return getList(params);
  };

  return {
    getList,
    page,
  };
}
