'use client';

import { useState, useRef } from 'react';
import { X, Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { Conversation } from '@/types';

interface WordImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (memories: Conversation[]) => void;
}

interface ParsedSection {
  title: string;
  content: string;
  date?: string;
  tags: string[];
}

export default function WordImportDialog({ isOpen, onClose, onImport }: WordImportDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<Conversation[]>([]);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 解析Word文档内容
  const parseWordContent = (text: string): ParsedSection[] => {
    const sections: ParsedSection[] = [];
    const lines = text.split('\n').filter(line => line.trim());
    
    let currentSection: ParsedSection | null = null;
    let currentDate = new Date().toISOString().split('T')[0];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // 检查是否是日期行 (格式: 2022.3.30 或 2022-03-30)
      const dateMatch = line.match(/^(\d{4})[.-](\d{1,2})[.-](\d{1,2})/);
      if (dateMatch) {
        // 保存之前的段落
        if (currentSection) {
          sections.push(currentSection);
        }
        
        // 开始新段落
        currentDate = `${dateMatch[1]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[3].padStart(2, '0')}`;
        currentSection = {
          title: `哈哈的对话 - ${currentDate}`,
          content: '',
          date: currentDate,
          tags: ['导入', '哈哈']
        };
        continue;
      }
      
      // 检查是否是标题行（包含"对话"但不包含冒号）
      if (line.includes('对话') && !line.includes('：') && !line.includes(':') && line.length < 20) {
        if (currentSection) {
          sections.push(currentSection);
        }
        
        currentSection = {
          title: line,
          content: '',
          date: currentDate,
          tags: ['导入', '哈哈']
        };
        continue;
      }
      
      // 添加到当前段落内容
      if (currentSection) {
        if (currentSection.content) {
          currentSection.content += '\n' + line;
        } else {
          currentSection.content = line;
        }
      } else {
        // 如果没有当前段落，创建一个默认段落
        currentSection = {
          title: `哈哈的对话 - ${currentDate}`,
          content: line,
          date: currentDate,
          tags: ['导入', '哈哈']
        };
      }
    }
    
    // 添加最后一个段落
    if (currentSection) {
      sections.push(currentSection);
    }
    
    return sections;
  };

  // 生成智能标签
  const generateTags = (content: string): string[] => {
    const tags = ['导入', '哈哈'];
    
    // 情感标签
    if (content.includes('？') || content.includes('什么') || content.includes('为什么')) tags.push('好奇');
    if (content.includes('！') || content.includes('哇') || content.includes('好')) tags.push('兴奋');
    if (content.includes('开心') || content.includes('快乐') || content.includes('高兴')) tags.push('开心');
    if (content.includes('不要') || content.includes('讨厌') || content.includes('生气')) tags.push('生气');
    if (content.includes('害怕') || content.includes('不敢') || content.includes('担心')) tags.push('害怕');
    if (content.includes('谢谢') || content.includes('请') || content.includes('对不起')) tags.push('礼貌');
    
    // 关系标签
    if (content.includes('妈妈') || content.includes('爸爸') || content.includes('奶奶') || content.includes('爷爷')) tags.push('家人');
    if (content.includes('朋友') || content.includes('同学')) tags.push('朋友');
    if (content.includes('老师')) tags.push('老师');
    
    // 活动标签
    if (content.includes('玩') || content.includes('游戏')) tags.push('游戏');
    if (content.includes('学习') || content.includes('读书')) tags.push('学习');
    if (content.includes('吃') || content.includes('饭')) tags.push('吃饭');
    if (content.includes('洗澡')) tags.push('洗澡');
    if (content.includes('睡觉') || content.includes('睡')) tags.push('睡觉');
    if (content.includes('运动') || content.includes('跑') || content.includes('跳')) tags.push('运动');
    if (content.includes('画画')) tags.push('画画');
    
    // 性格标签
    if (content.includes('调皮') || content.includes('捣蛋')) tags.push('调皮');
    if (content.includes('聪明') || content.includes('机智')) tags.push('聪明');
    if (content.includes('勇敢')) tags.push('勇敢');
    if (content.includes('善良') || content.includes('分享')) tags.push('善良');
    
    return tags.slice(0, 5); // 最多5个标签
  };

  // 处理文件上传
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 检查文件类型
    if (!file.name.toLowerCase().endsWith('.docx') && !file.name.toLowerCase().endsWith('.doc')) {
      alert('请上传Word文档文件 (.docx 或 .doc)');
      return;
    }

    setIsProcessing(true);
    setFileName(file.name);

    try {
      // 读取文件内容
      const text = await readWordFile(file);
      
      // 解析内容
      const sections = parseWordContent(text);
      
      // 转换为Conversation格式
      const memories: Conversation[] = sections.map((section, index) => ({
        id: crypto.randomUUID(),
        type: 'conversation' as const,
        title: section.title,
        content: section.content,
        date: section.date || new Date().toISOString().split('T')[0],
        tags: generateTags(section.content),
        childName: '哈哈',
        age: '',
        context: section.title,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      setPreview(memories);
    } catch (error) {
      console.error('处理Word文档失败:', error);
      alert('处理Word文档失败，请检查文件格式');
    } finally {
      setIsProcessing(false);
    }
  };

  // 读取Word文件内容
  const readWordFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          resolve(content);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('读取文件失败'));
      reader.readAsText(file);
    });
  };

  const handleImport = () => {
    if (preview.length > 0) {
      onImport(preview);
      handleClose();
    }
  };

  const handleClose = () => {
    setPreview([]);
    setFileName('');
    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
                  <li>• 支持 .docx 和 .doc 格式的Word文档</li>
                  <li>• 自动识别日期格式：2022.3.30 或 2022-03-30</li>
                  <li>• 自动识别标题行（包含"对话"的短行）</li>
                  <li>• 保持原始段落格式，不进行AI处理</li>
                  <li>• 智能生成相关标签</li>
                </ul>
              </div>
            </div>
          </div>

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
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  文件已选择
                </h3>
                <p className="text-gray-600 mb-4">{fileName}</p>
                {isProcessing ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-blue-600">正在处理...</span>
                  </div>
                ) : (
                  <button
                    onClick={handleFileSelect}
                    className="btn-secondary"
                  >
                    重新选择
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                预览 ({preview.length} 条记录)
              </h3>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {preview.map((memory, index) => (
                  <div key={memory.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{memory.title}</p>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{memory.content}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <p className="text-xs text-gray-500">日期: {memory.date}</p>
                          <div className="flex flex-wrap gap-1">
                            {memory.tags.map((tag, tagIndex) => (
                              <span key={tagIndex} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleImport}
              disabled={preview.length === 0}
              className="btn-primary"
            >
              导入 {preview.length} 条记录
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 