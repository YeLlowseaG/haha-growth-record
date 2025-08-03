'use client';

import { useState, useRef } from 'react';
import { X, Upload, FileText, AlertCircle, CheckCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { Conversation } from '@/types';
import { parseWordContent, ParsedWordContent, cleanTextContent } from '@/lib/word-parser';

interface WordImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (memories: Conversation[]) => void;
}

export default function WordImportDialog({ isOpen, onClose, onImport }: WordImportDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<Conversation[]>([]);
  const [fileName, setFileName] = useState('');
  const [parsedContent, setParsedContent] = useState<ParsedWordContent | null>(null);
  const [showPreview, setShowPreview] = useState(false);
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
    setParsedContent(null);
    setPreview([]);

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
      const cleanedContent = cleanTextContent(content);
      
      // 解析内容
      const parsed = parseWordContent(cleanedContent);
      setParsedContent(parsed);
      
      // 转换为对话记录
      const conversations: Conversation[] = parsed.sections.map((section, index) => ({
        id: crypto.randomUUID(),
        type: 'conversation',
        title: section.title,
        content: section.content,
        date: section.date || new Date().toISOString().split('T')[0],
        tags: section.tags,
        childName: '哈哈',
        age: '',
        context: `从Word文档导入 - ${fileName}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      
      setPreview(conversations);
      
      clearInterval(progressInterval);
      setProgress(100);
      
    } catch (error) {
      console.error('读取Word文件失败:', error);
      setError('读取Word文件失败，请检查文件格式或重新上传');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  // 使用mammoth库读取Word文件
  const readWordFile = async (file: File): Promise<string> => {
    try {
      // 只支持.docx格式，因为mammoth主要支持.docx
      if (file.name.toLowerCase().endsWith('.docx')) {
        // 动态导入mammoth，避免服务端渲染问题
        const mammoth = await import('mammoth');
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.default.extractRawText({ arrayBuffer });
        return result.value;
      } else {
        // 对于.doc文件，提示用户转换为.docx
        throw new Error('目前只支持.docx格式，请将.doc文件转换为.docx格式后重试');
      }
    } catch (error) {
      console.error('Word文件解析失败:', error);
      if (error instanceof Error) {
        throw new Error(`Word文件解析失败: ${error.message}`);
      } else {
        throw new Error('Word文件解析失败，请确保文件格式正确');
      }
    }
  };

  const handleImport = () => {
    if (preview.length > 0) {
      onImport(preview);
      handleClose();
    }
  };

  const handleClose = () => {
    setFileName('');
    setError('');
    setProgress(0);
    setParsedContent(null);
    setPreview([]);
    setShowPreview(false);
    onClose();
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-900">导入Word文档</h2>
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
                <h3 className="text-sm font-medium text-blue-900 mb-2">Word文档导入说明</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• 目前支持 .docx 格式（推荐）</li>
                  <li>• .doc 格式请先转换为 .docx</li>
                  <li>• 文件大小不超过10MB</li>
                  <li>• 自动识别对话内容和日期</li>
                  <li>• 智能生成标签</li>
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
          {!fileName && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".docx,.doc"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                选择Word文档
              </h3>
              <p className="text-gray-600 mb-4">
                推荐使用 .docx 格式
              </p>
              <button
                onClick={handleFileSelect}
                className="btn-primary"
              >
                选择文件
              </button>
            </div>
          )}

          {/* Processing */}
          {isProcessing && (
            <div className="text-center py-8">
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
              <p className="text-sm text-gray-500 mt-2">{progress}%</p>
            </div>
          )}

          {/* Preview */}
          {preview.length > 0 && !isProcessing && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  预览导入内容 ({preview.length} 条记录)
                </h3>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span>{showPreview ? '隐藏预览' : '显示预览'}</span>
                </button>
              </div>

              {showPreview && (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {preview.map((conversation, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{conversation.title}</h4>
                        <span className="text-sm text-gray-500">{conversation.date}</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2 line-clamp-3">
                        {conversation.content}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {conversation.tags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleFileSelect}
                  className="btn-secondary"
                >
                  重新选择文件
                </button>
                <button
                  onClick={handleImport}
                  className="btn-primary"
                >
                  导入 {preview.length} 条记录
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 