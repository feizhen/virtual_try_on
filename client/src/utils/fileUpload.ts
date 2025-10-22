import { apiClient } from '../api/client';
import type { AxiosProgressEvent } from 'axios';

export interface UploadOptions {
  onProgress?: (progress: number) => void;
  onSuccess?: (response: any) => void;
  onError?: (error: Error) => void;
}

export interface UploadResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * 上传文件到服务器
 * @param file 要上传的文件
 * @param endpoint API 端点 (例如: '/outfit-change/models/upload')
 * @param options 上传选项 (进度回调、成功/错误处理)
 * @returns 上传结果
 */
export async function uploadFile<T = any>(
  file: File,
  endpoint: string,
  options: UploadOptions = {}
): Promise<UploadResult<T>> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<{ data: T }>(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent: AxiosProgressEvent) => {
        if (progressEvent.total && options.onProgress) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          options.onProgress(progress);
        }
      },
    });

    const result = {
      success: true,
      data: response.data.data,
    };

    if (options.onSuccess) {
      options.onSuccess(result.data);
    }

    return result;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Upload failed';

    const result = {
      success: false,
      error: errorMessage,
    };

    if (options.onError) {
      options.onError(new Error(errorMessage));
    }

    return result;
  }
}

/**
 * 批量上传文件
 * @param files 要上传的文件数组
 * @param endpoint API 端点
 * @param options 每个文件的上传选项
 * @returns 所有上传结果的数组
 */
export async function uploadMultipleFiles<T = any>(
  files: File[],
  endpoint: string,
  options: UploadOptions = {}
): Promise<UploadResult<T>[]> {
  const uploadPromises = files.map((file) =>
    uploadFile<T>(file, endpoint, options)
  );

  return Promise.all(uploadPromises);
}

/**
 * 创建可取消的上传
 */
export class CancellableUpload<T = any> {
  private abortController: AbortController;
  private file: File;
  private endpoint: string;
  private options: UploadOptions;

  constructor(file: File, endpoint: string, options: UploadOptions = {}) {
    this.abortController = new AbortController();
    this.file = file;
    this.endpoint = endpoint;
    this.options = options;
  }

  async start(): Promise<UploadResult<T>> {
    try {
      const formData = new FormData();
      formData.append('file', this.file);

      const response = await apiClient.post<{ data: T }>(
        this.endpoint,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          signal: this.abortController.signal,
          onUploadProgress: (progressEvent: AxiosProgressEvent) => {
            if (progressEvent.total && this.options.onProgress) {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              this.options.onProgress(progress);
            }
          },
        }
      );

      const result = {
        success: true,
        data: response.data.data,
      };

      if (this.options.onSuccess) {
        this.options.onSuccess(result.data);
      }

      return result;
    } catch (error) {
      if (error.name === 'CanceledError') {
        return {
          success: false,
          error: 'Upload cancelled',
        };
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Upload failed';

      const result = {
        success: false,
        error: errorMessage,
      };

      if (this.options.onError) {
        this.options.onError(new Error(errorMessage));
      }

      return result;
    }
  }

  cancel(): void {
    this.abortController.abort();
  }
}
