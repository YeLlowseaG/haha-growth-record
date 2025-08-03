'use client';

import { useState, useRef } from 'react';
import { Upload, Image, X, Loader2 } from 'lucide-react';

interface ImageUploadProps {
  onImageUpload: (imageUrl: string) => void;
  currentImageUrl?: string;
}

export default function ImageUpload({ onImageUpload, currentImageUrl }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 压缩图片
  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new window.Image();
      
      img.onload = () => {
        // 计算压缩后的尺寸
        const maxWidth = 1200;
        const maxHeight = 1200;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // 绘制压缩后的图片
        ctx.drawImage(img, 0, 0, width, height);
        
        // 转换为 Blob
        canvas.toBlob((blob) => {
          resolve(blob!);
        }, 'image/jpeg', 0.8); // 80% 质量
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // 上传到免费云存储（示例使用 ImgBB API）
  const uploadToCloud = async (file: File): Promise<string> => {
    const compressedBlob = await compressImage(file);
    const formData = new FormData();
    formData.append('image', compressedBlob, file.name);
    
    // 这里可以集成各种云存储服务
    // 示例：ImgBB (免费，无需注册)
    const response = await fetch('https://api.imgbb.com/1/upload?key=YOUR_API_KEY', {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json();
    return data.data.url;
  };

  // 使用本地存储（Base64）
  const uploadToLocal = async (file: File): Promise<string> => {
    const compressedBlob = await compressImage(file);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(compressedBlob);
    });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 检查文件大小（限制为 10MB）
    if (file.size > 10 * 1024 * 1024) {
      alert('文件大小不能超过 10MB');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      let imageUrl: string;
      
      // 根据文件大小选择存储方式
      if (file.size > 5 * 1024 * 1024) {
        // 大文件使用云存储
        imageUrl = await uploadToCloud(file);
      } else {
        // 小文件使用本地存储
        imageUrl = await uploadToLocal(file);
      }
      
      onImageUpload(imageUrl);
      setUploadProgress(100);
    } catch (error) {
      console.error('上传失败:', error);
      alert('上传失败，请重试');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const input = fileInputRef.current;
      if (input) {
        input.files = event.dataTransfer.files;
        await handleFileSelect({ target: { files: event.dataTransfer.files } } as any);
      }
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  return (
    <div className="space-y-4">
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {isUploading ? (
          <div className="space-y-3">
            <Loader2 className="h-8 w-8 text-primary-500 mx-auto animate-spin" />
            <p className="text-sm text-gray-600">正在上传...</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <Upload className="h-8 w-8 text-gray-400 mx-auto" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                点击上传或拖拽图片到此处
              </p>
              <p className="text-xs text-gray-500 mt-1">
                支持 JPG、PNG 格式，最大 10MB
              </p>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-primary text-sm"
            >
              选择图片
            </button>
          </div>
        )}
      </div>

      {currentImageUrl && (
        <div className="relative">
          <img
            src={currentImageUrl}
            alt="预览"
            className="w-full h-48 object-cover rounded-lg"
          />
          <button
            type="button"
            onClick={() => onImageUpload('')}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
} 