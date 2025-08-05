'use client';

import { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';

interface FileUploadProps {
  type: 'photo';
  onFileUpload: (urls: string[]) => void;
  currentUrls?: string[];
}

export default function FileUpload({ type, onFileUpload, currentUrls = [] }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const validFiles: File[] = [];
    
    for (const file of files) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(`文件 ${file.name} 大小不能超过 10MB`);
        continue;
      }

      // Check file type
      if (type === 'photo' && !file.type.startsWith('image/')) {
        alert(`请选择图片文件: ${file.name}`);
        continue;
      }
      
      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const handleFileUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const uploadedUrls: string[] = [];
      
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        
        // 使用 FileReader 转为 Base64，避免上传服务器
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        
        uploadedUrls.push(base64);
        setUploadProgress(((i + 1) / selectedFiles.length) * 100);
      }
      
      onFileUpload([...currentUrls, ...uploadedUrls]);
      setSelectedFiles([]);
    } catch (error) {
      console.error('文件上传失败:', error);
      alert('文件上传失败，请重试');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) {
      const mockEvent = {
        target: { files: event.dataTransfer.files }
      } as React.ChangeEvent<HTMLInputElement>;
      handleFileSelect(mockEvent);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  return (
    <div className="space-y-4">
      {/* File Upload Area */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
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
                <span className="hidden sm:inline">点击上传或拖拽文件到此处</span>
                <span className="sm:hidden">点击拍照或选择照片</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                支持 JPG、PNG 格式，最大 10MB，可多选
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.setAttribute('capture', 'environment');
                    fileInputRef.current.click();
                  }
                }}
                className="btn-primary text-sm flex-1 sm:hidden"
              >
                📷 拍照
              </button>
              <button
                type="button"
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.removeAttribute('capture');
                    fileInputRef.current.click();
                  }
                }}
                className="btn-secondary text-sm flex-1"
              >
                <span className="sm:hidden">🖼️ 选择照片</span>
                <span className="hidden sm:inline">选择文件</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && !isUploading && (
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-900">已选择 {selectedFiles.length} 个文件</p>
            <div className="space-y-1">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <span className="text-gray-700 truncate">{file.name}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                    <button
                      type="button"
                      onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleFileUpload}
              className="btn-primary text-sm w-full"
            >
              上传所有文件
            </button>
          </div>
        </div>
      )}

      {/* Uploaded Images Preview */}
      {currentUrls.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-900">已上传的图片 ({currentUrls.length})</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {currentUrls.map((url, index) => (
              <div key={index} className="relative">
                <img
                  src={url}
                  alt={`预览 ${index + 1}`}
                  className="w-full h-24 sm:h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newUrls = currentUrls.filter((_, i) => i !== index);
                    onFileUpload(newUrls);
                  }}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 