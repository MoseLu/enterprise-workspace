;
import { createDir, writeFile } from '../utils';
import { epsState } from './generator/state';
import { ensureStandardTargets } from './generator/standard-targets';
import { fetchEpsData as fetchRemoteEpsData } from './generator/fetch-data';
import { getData, createJson, getEpsPath } from './generator/data-loader';
import { createService, createServiceCode } from './generator/service-factory';
import { createDescribe } from './generator/describe';

export { fetchRemoteEpsData as fetchEpsData };

export async function createEps(
  epsUrl: string,
  reqUrl: string,
  outputDir: string,
  cachedData?: any,
  sharedEpsDir?: string,
  dictApi?: string
) {
  createDir(getEpsPath(outputDir), true);

  await getData(epsUrl, reqUrl, outputDir, epsState, cachedData, sharedEpsDir, dictApi);

  // 如果 EPS 数据为空，返回空的服务对象（不抛出错误，允许构建继续）
  if (!epsState.epsList || epsState.epsList.length === 0) {
    console.warn('[eps] 警告: EPS 数据为空，将返回空服务对象');
    return {
      service: {},
      serviceCode: { content: '{}', types: [] },
      list: [],
      isUpdate: false,
    };
  }

  ensureStandardTargets(epsState);

  Object.keys(epsState.service).forEach((key) => {
    delete epsState.service[key];
  });

  createService(epsUrl, epsState);

  const serviceCode = createServiceCode(epsState);

  const isUpdate = await createJson(outputDir, epsState);

  await createDescribe(outputDir, epsState);

  return {
    service: epsState.service,
    serviceCode,
    list: epsState.epsList,
    isUpdate,
  };
}

export async function generateEps(apiMeta: any, outputDir: string) {
  createDir(outputDir, true);

  const epsData: any = {};

  if (apiMeta.modules) {
    apiMeta.modules.forEach((module: any) => {
      if (module.entities) {
        module.entities.forEach((entity: any) => {
          const entityKey = entity.name.toLowerCase().replace(/entity$/, '');
          epsData[entityKey] = entity;
        });
      }
    });
  }

  writeFile(getEpsPath(outputDir, 'eps.json'), JSON.stringify(epsData, null, 2));

  return {
    success: true,
    message: 'EPS 服务代码生成成功',
    data: epsData,
  };
}
