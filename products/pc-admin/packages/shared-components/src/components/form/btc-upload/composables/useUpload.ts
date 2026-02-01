
import type { UploadOptions, UploadResponse } from '../types';
import { BtcMessage } from '@btc/shared-components';

/**
 * 文件上传 composable
 */
export function useUpload(service?: any): { toUpload: (file: File, options?: UploadOptions) => Promise<UploadResponse> } {
  /**
   * 上传文件
   */
  async function toUpload(
    file: File,
    options: UploadOptions = {}
  ): Promise<UploadResponse> {
    const { uploadType = 'file', onProgress } = options;

    if (!service) {
      throw new Error('上传服务未提供，请确认 service 已正确注入');
    }

    try {
      // 创建 FormData
      const formData = new FormData();
      formData.append('file', file);

      let response;

      // 根据上传类型选择服务
      if (uploadType === 'avatar') {
        // 头像上传：根据 EPS 数据，prefix 是 /api/upload/file/avatar
        // 过滤掉 api 后路径是 upload/file/avatar，所以服务路径是 service.upload.file.avatar
        const avatarService = service.upload?.file?.avatar;
        if (!avatarService) {
          throw new Error('头像上传服务不可用，请检查 service.upload.file.avatar 是否存在');
        }
        if (typeof avatarService.avatar !== 'function') {
          throw new Error('头像上传方法不可用，请检查 service.upload.file.avatar.avatar 是否存在');
        }
        // 调用 avatar 服务的 avatar 方法（根据 API 配置，方法名是 avatar）
        response = await avatarService.avatar(formData);
      } else {
        // 普通文件上传：根据 EPS 数据，prefix 是 /api/upload/file/
        // 过滤掉 api 后路径是 upload/file，所以服务路径是 service.upload.file
        const fileService = service.upload?.file;
        if (!fileService) {
          throw new Error('文件上传服务不可用，请检查 service.upload.file 是否存在');
        }
        response = await fileService.upload(formData);
      }

      // 响应拦截器已经提取了 data 字段，所以 response 应该是 data 对象
      // 新格式：返回对象包含 objectKey 字段（文件 URL）
      let url = '';
      if (response?.objectKey) {
        url = response.objectKey;
      } else if (response?.data?.objectKey) {
        // 如果响应拦截器没有提取 data（异常情况），这里作为备用
        url = response.data.objectKey;
      }

      if (!url) {
        throw new Error('上传成功，但未获取到文件地址（objectKey 字段不存在）');
      }

      // 模拟进度完成
      onProgress?.(100);

      return {
        url,
        fileId: Date.now().toString()
      };
    } catch (error: any) {
      // 优先使用后端返回的错误消息
      let errorMessage = '文件上传失败';
      if (error?.response?.data) {
        const errorData = error.response.data;
        errorMessage = errorData.msg || errorData.message || errorMessage;
      } else if (error?.msg || error?.message) {
        errorMessage = error.msg || error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      BtcMessage.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  return {
    toUpload
  };
}