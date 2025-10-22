/**
 * 图片验证工具
 * 提供客户端文件验证功能(格式、大小、尺寸)
 */

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

export interface ImageDimensions {
  width: number;
  height: number;
}

/**
 * 允许的图片 MIME 类型
 */
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

/**
 * 允许的文件扩展名
 */
export const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

/**
 * 最大文件大小 (10MB)
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

/**
 * 最小图片尺寸要求
 */
export const MIN_IMAGE_WIDTH = 200;
export const MIN_IMAGE_HEIGHT = 200;

/**
 * 最大图片尺寸要求 (可选,防止过大图片)
 */
export const MAX_IMAGE_WIDTH = 4096;
export const MAX_IMAGE_HEIGHT = 4096;

/**
 * 验证文件类型
 */
export function validateFileType(file: File): ImageValidationResult {
  // 检查 MIME 类型
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `不支持的文件类型。仅支持 JPG, PNG, WEBP 格式`,
    };
  }

  // 检查文件扩展名
  const fileName = file.name.toLowerCase();
  const hasValidExtension = ALLOWED_EXTENSIONS.some((ext) =>
    fileName.endsWith(ext)
  );

  if (!hasValidExtension) {
    return {
      valid: false,
      error: `文件扩展名无效。仅支持 ${ALLOWED_EXTENSIONS.join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * 验证文件大小
 */
export function validateFileSize(file: File): ImageValidationResult {
  if (file.size > MAX_FILE_SIZE) {
    const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024);
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `文件过大 (${fileSizeMB}MB)。最大允许 ${maxSizeMB}MB`,
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: '文件为空',
    };
  }

  return { valid: true };
}

/**
 * 获取图片尺寸
 */
export function getImageDimensions(file: File): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.width,
        height: img.height,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('无法读取图片尺寸'));
    };

    img.src = url;
  });
}

/**
 * 验证图片尺寸
 */
export async function validateImageDimensions(
  file: File
): Promise<ImageValidationResult> {
  try {
    const dimensions = await getImageDimensions(file);

    if (
      dimensions.width < MIN_IMAGE_WIDTH ||
      dimensions.height < MIN_IMAGE_HEIGHT
    ) {
      return {
        valid: false,
        error: `图片尺寸过小。最小要求 ${MIN_IMAGE_WIDTH}x${MIN_IMAGE_HEIGHT} 像素`,
      };
    }

    if (
      dimensions.width > MAX_IMAGE_WIDTH ||
      dimensions.height > MAX_IMAGE_HEIGHT
    ) {
      return {
        valid: false,
        error: `图片尺寸过大。最大支持 ${MAX_IMAGE_WIDTH}x${MAX_IMAGE_HEIGHT} 像素`,
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : '图片验证失败',
    };
  }
}

/**
 * 完整的图片文件验证
 * 包含类型、大小、尺寸检查
 */
export async function validateImageFile(
  file: File,
  options: {
    checkDimensions?: boolean;
  } = {}
): Promise<ImageValidationResult> {
  // 1. 验证文件类型
  const typeValidation = validateFileType(file);
  if (!typeValidation.valid) {
    return typeValidation;
  }

  // 2. 验证文件大小
  const sizeValidation = validateFileSize(file);
  if (!sizeValidation.valid) {
    return sizeValidation;
  }

  // 3. 验证图片尺寸 (可选)
  if (options.checkDimensions) {
    const dimensionsValidation = await validateImageDimensions(file);
    if (!dimensionsValidation.valid) {
      return dimensionsValidation;
    }
  }

  return { valid: true };
}

/**
 * 批量验证图片文件
 */
export async function validateMultipleImages(
  files: File[],
  options: {
    checkDimensions?: boolean;
  } = {}
): Promise<Map<string, ImageValidationResult>> {
  const results = new Map<string, ImageValidationResult>();

  for (const file of files) {
    const validation = await validateImageFile(file, options);
    results.set(file.name, validation);
  }

  return results;
}

/**
 * 格式化文件大小为可读字符串
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
