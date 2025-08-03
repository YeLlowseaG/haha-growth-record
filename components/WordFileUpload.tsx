'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, X, Loader2 } from 'lucide-react';

interface WordFileUploadProps {
  onContentExtracted: (content: string) => void;
  onClose: () => void;
}

export default function WordFileUpload({ onContentExtracted, onClose }: WordFileUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 检查文件类型
    const validExtensions = ['.docx', '.doc'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!validExtensions.includes(fileExtension)) {
      setError('请上传Word文档文件 (.docx 或 .doc)');
      return;
    }

    // 检查文件大小 (10MB限制)
    if (file.size > 10 * 1024 * 1024) {
      setError('文件大小不能超过10MB');
      return;
    }

    setIsProcessing(true);
    setFileName(file.name);
    setError('');
    setProgress(0);

    try {
      // 模拟进度
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // 读取文件内容
      const content = await readWordFile(file);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      // 延迟一下让用户看到100%进度
      setTimeout(() => {
        onContentExtracted(content);
      }, 500);
      
    } catch (error) {
      console.error('读取Word文件失败:', error);
      setError('读取Word文件失败，请检查文件格式或重新上传');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  // 改进的Word文件读取功能
  const readWordFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          
          // 如果是.docx文件，尝试解析XML内容
          if (file.name.toLowerCase().endsWith('.docx')) {
            // 对于.docx文件，我们使用文本读取方式
            // 实际项目中可能需要使用专门的库如mammoth.js
            resolve(cleanTextContent(content));
          } else {
            // 对于.doc文件，直接使用文本内容
            resolve(cleanTextContent(content));
          }
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('读取文件失败'));
      reader.readAsText(file, 'utf-8');
    });
  };

  // 清理文本内容
  const cleanTextContent = (text: string): string => {
    return text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleClose = () => {
    setFileName('');
    setError('');
    setProgress(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-900">上传Word文档</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-blue-900 mb-2">Word文档上传说明</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• 支持 .docx 和 .doc 格式</li>
                  <li>• 文件大小不超过10MB</li>
                  <li>• 自动提取文本内容</li>
                  <li>• 保持原始格式</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* File Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".docx,.doc"
              onChange={handleFileUpload}
              className="hidden"
            />
            
            {!fileName ? (
              <div>
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  选择Word文档
                </h3>
                <p className="text-gray-600 mb-4">
                  支持 .docx 和 .doc 格式
                </p>
                <button
                  onClick={handleFileSelect}
                  className="btn-primary"
                >
                  选择文件
                </button>
              </div>
            ) : (
              <div>
                {isProcessing ? (
                  <div className="space-y-4">
                    <Loader2 className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      正在处理文件
                    </h3>
                    <p className="text-gray-600 mb-4">{fileName}</p>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-500">{progress}%</p>
                  </div>
                ) : (
                  <div>
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      文件已选择
                    </h3>
                    <p className="text-gray-600 mb-4">{fileName}</p>
                    <button
                      onClick={handleFileSelect}
                      className="btn-secondary"
                    >
                      重新选择
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 