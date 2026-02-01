/**
 * Form API 灏佽
 * 鎻愪緵瀵?el-form 鍘熺敓鏂规硶鐨勮闂? */

export function useElApi(keys: string[], el: any) {
  const apis: Record<string, any> = {};

  keys.forEach((e) => {
    apis[e] = (...args: any[]) => {
      return el.value?.[e](...args);
    };
  });

  return apis;
}



