/**
 * URL 工具函数
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * 获取完整的图片 URL
 * 如果 URL 已经是完整的(http/https开头),直接返回
 * 如果是相对路径,加上 API_URL 前缀
 */
export function getImageUrl(url: string | undefined): string {
  if (!url) return '';

  // 如果已经是完整 URL,直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // 如果是相对路径,加上 API_URL
  // 确保不会有双斜杠
  const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  const path = url.startsWith('/') ? url : `/${url}`;

  return `${baseUrl}${path}`;
}
