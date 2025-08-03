'use client';

import { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';

interface FileUploadProps {
  type: 'photo' | 'video';
  onFileUpload: (url: string) => void;
  currentUrl?: string;
}

export default function FileUpload({ type, onFileUpload, currentUrl }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('文件大小不能超过 10MB');
      return;
    }

    // Check file type
    if (type === 'photo' && !file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }
    if (type === 'video' && !file.type.startsWith('video/')) {
      alert('请选择视频文件');
      return;
    }

    setSelectedFile(file);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('上传失败');
      }

      const result = await response.json();
      onFileUpload(result.url);
      setUploadProgress(100);
      
      // Clear selected file after successful upload
      setSelectedFile(null);
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
    const file = event.dataTransfer.files[0];
    if (file) {
      const input = document.createElement('input');
      input.type = 'file';
      input.files = event.dataTransfer.files;
      input.onchange = (e) => handleFileSelect(e as any);
      input.click();
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
          accept={type === 'photo' ? 'image/*' : 'video/*'}
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
                点击上传或拖拽文件到此处
              </p>
              <p className="text-xs text-gray-500 mt-1">
                支持 {type === 'photo' ? 'JPG、PNG' : 'MP4、MOV'} 格式，最大 10MB
              </p>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-primary text-sm"
            >
              选择文件
            </button>
          </div>
        )}
      </div>

      {/* Selected File */}
      {selectedFile && !isUploading && (
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              type="button"
              onClick={handleFileUpload}
              className="btn-primary text-sm"
            >
              上传文件
            </button>
          </div>
        </div>
      )}

      {/* Uploaded Media Preview */}
      {currentUrl && (
        <div className="relative">
          {type === 'photo' ? (
            <img
              src={currentUrl}
              alt="预览"
              className="w-full h-48 object-cover rounded-lg"
            />
          ) : (
            <video
              src={currentUrl}
              controls
              className="w-full h-48 object-cover rounded-lg"
            />
          )}
          <button
            type="button"
            onClick={() => onFileUpload('')}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
} 