'use client';

import { useState } from 'react';
import { X, Upload, MessageCircle, AlertCircle, Settings, Brain, Zap } from 'lucide-react';
import { Conversation } from '@/types';
import { AIService } from '@/lib/ai-service';
import { getTagClasses } from '@/lib/tag-colors';

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (memories: Conversation[]) => void;
}

interface ProcessingOptions {
  useAI: boolean;
  preferredAPI: 'qwen' | 'deepseek';
}



export default function ImportDialog({ isOpen, onClose, onImport }: ImportDialogProps) {
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<Conversation[]>([]);
  const [options, setOptions] = useState<ProcessingOptions>({
    useAI: true,
    preferredAPI: 'qwen',
  });

  // 初始化AI服务
  const aiService = new AIService({
    qwenKey: 'sk-2e0ccd4afce04e608b3eda9dce40e2de',
    deepseekKey: 'sk-0f273a605d75468eb410d88d1ad8877b',
  });






  // 本地智能处理 - 基于原始格式，保持换行
  const processLocally = (text: string) => {
    const lines = text.split('\n'); // 不过滤空行，保持原始格式
    const conversations: Array<{content: string, date: string, tags: string[], context: string}> = [];
    let currentConversation = '';
    let currentDate = new Date().toISOString().split('T')[0];
    let currentContext = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      // 如果是空行，加入到当前对话中保持格式
      if (!trimmedLine) {
        if (currentConversation) {
          currentConversation += '\n';
        }
        continue;
      }
      
      // 检查是否是日期行 (支持多种格式)
      const dateMatch = trimmedLine.match(/^(\d{4})[.-](\d{1,2})[.-](\d{1,2})/);
      if (dateMatch) {
        // 保存之前的对话
        if (currentConversation) {
          conversations.push({
            content: currentConversation, // 保持原始格式，不trim
            date: currentDate,
            tags: generateLocalTags(currentConversation),
            context: currentContext || '哈哈的对话记录'
          });
        }
        
        // 开始新对话
        currentDate = `${dateMatch[1]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[3].padStart(2, '0')}`;
        currentConversation = '';
        currentContext = '';
        continue;
      }
      
      // 检查是否是标题行（如"洗澡时的对话"）
      if (trimmedLine.includes('对话') && !trimmedLine.includes('：') && !trimmedLine.includes(':') && trimmedLine.length < 30) {
        currentContext = trimmedLine;
        continue;
      }
      
      // 检查是否是对话内容
      if (trimmedLine.includes('：') || trimmedLine.includes(':')) {
        // 添加到当前对话，保持原有格式（使用原始行，不是trimmed的）
        if (currentConversation) {
          currentConversation += '\n' + line;
        } else {
          currentConversation = line;
        }
      } else if (trimmedLine.length > 5 && !trimmedLine.match(/^\d{4}[.-]\d{1,2}[.-]\d{1,2}/)) {
        // 可能是描述性文本，也加入对话（排除日期行，使用原始行保持缩进）
        if (currentConversation) {
          currentConversation += '\n' + line;
        } else {
          currentConversation = line;
        }
      }
    }
    
    // 添加最后一个对话
    if (currentConversation) {
      conversations.push({
        content: currentConversation, // 保持原始格式，不trim
        date: currentDate,
        tags: generateLocalTags(currentConversation),
        context: currentContext || '哈哈的对话记录'
      });
    }
    
    return conversations;
  };

  // 生成对话标题
  const generateConversationTitle = (text: string, context: string): string => {
    // 如果有上下文标题，使用它
    if (context && context !== '哈哈的对话记录') {
      return context;
    }
    
    // 根据内容智能生成标题
    if (text.includes('朋友') && text.includes('妈妈')) {
      return '关于朋友和家人的对话';
    }
    if (text.includes('选择') || text.includes('刷牙') || text.includes('洗脸')) {
      return '日常选择的对话';
    }
    if (text.includes('压') || text.includes('肩膀')) {
      return '调皮互动的对话';
    }
    if (text.includes('洗澡')) {
      return '洗澡时的对话';
    }
    if (text.includes('吃饭') || text.includes('吃')) {
      return '吃饭时的对话';
    }
    if (text.includes('睡觉') || text.includes('睡')) {
      return '睡觉前的对话';
    }
    if (text.includes('玩') || text.includes('游戏')) {
      return '玩耍时的对话';
    }
    if (text.includes('学习') || text.includes('读书')) {
      return '学习时的对话';
    }
    
    // 默认标题
    return '哈哈的对话';
  };

  // 生成本地标签（不包含"导入"和"哈哈"等无意义标签）
  const generateLocalTags = (text: string): string[] => {
    const tags: string[] = [];
    
    // 家庭关系
    if (text.includes('妈妈') || text.includes('爸爸')) tags.push('家人');
    
    // 情感表达
    if (text.includes('？') || text.includes('什么') || text.includes('为什么')) tags.push('好奇');
    if (text.includes('！') || text.includes('哇') || text.includes('好')) tags.push('兴奋');
    if (text.includes('不') || text.includes('不要')) tags.push('拒绝');
    if (text.includes('谢谢')) tags.push('礼貌');
    
    // 活动场景
    if (text.includes('玩') || text.includes('游戏')) tags.push('游戏');
    if (text.includes('吃') || text.includes('饭')) tags.push('饮食');
    if (text.includes('睡') || text.includes('觉')) tags.push('睡眠');
    if (text.includes('朋友')) tags.push('社交');
    if (text.includes('选择')) tags.push('决策');
    if (text.includes('压') || text.includes('肩膀')) tags.push('互动');
    
    return tags;
  };

  const processText = async () => {
    if (!text.trim()) return;

    setIsProcessing(true);
    
    try {
      console.log('开始处理...');
      
      // 使用本地处理进行分段
      const localResults = processLocally(text);
      console.log('本地分段结果:', localResults);
      
      // 为每个分段生成标题和标签
      const memories: Conversation[] = [];
      
      for (const result of localResults) {
        let title = generateConversationTitle(result.content, result.context);
        let tags = result.tags;
        
        // 如果启用AI，使用AI生成标题和标签（保持原始内容格式）
        if (options.useAI) {
          try {
            console.log('使用AI生成标题和标签...');
            const aiResult = await aiService.generateTitle(result.content, options.preferredAPI);
            title = aiResult.title;
            tags = aiResult.tags;
            console.log('AI生成结果:', aiResult);
          } catch (aiError) {
            console.error('AI生成失败，使用本地生成:', aiError);
            // 如果AI失败，继续使用本地生成的标题和标签
          }
        }
        
        memories.push({
          id: crypto.randomUUID(),
          type: 'conversation' as const,
          title,
          content: result.content,
          date: result.date,
          tags,
          childName: '哈哈',
          age: '',
          context: result.context,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      
      console.log('处理成功，生成', memories.length, '条记录');
      setPreview(memories);
    } catch (error) {
      console.error('处理失败:', error);
      alert('处理失败，请检查文本格式');
    } finally {
      setIsProcessing(false);
    }
  };



  const handleImport = () => {
    if (preview.length > 0) {
      onImport(preview);
      handleClose();
    }
  };

  const handleClose = () => {
    setText('');
    setPreview([]);
    setIsProcessing(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <MessageCircle className="h-6 w-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-900">智能导入哈哈的对话</h2>
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
                <h3 className="text-sm font-medium text-blue-900 mb-2">智能导入说明</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• 将对话内容复制粘贴到下面的文本框</li>
                  <li>• ✅ 完全保持你复制的原始格式（包括换行、空行、缩进）</li>
                  <li>• 自动识别日期格式：2022.3.30、2022-03-30等</li>
                  <li>• 自动识别标题行（包含"对话"的短行）</li>
                  <li>• AI智能生成标题和标签，更准确有趣</li>
                  <li>• 输入框使用等宽字体，便于查看格式</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Processing Options */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Settings className="h-4 w-4 text-gray-600" />
              <h3 className="text-sm font-medium text-gray-900">处理选项</h3>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.useAI}
                  onChange={(e) => setOptions({...options, useAI: e.target.checked})}
                  className="rounded"
                />
                <span className="text-sm text-gray-700 flex items-center">
                  <Brain className="h-4 w-4 mr-1" />
                  AI智能生成标题和标签（保持原文本格式）
                </span>
              </label>
            </div>
            
            {/* AI API 选择 */}
            {options.useAI && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-blue-900">选择AI服务</span>
                </div>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="ai-api"
                      value="qwen"
                      checked={options.preferredAPI === 'qwen'}
                      onChange={(e) => setOptions({...options, preferredAPI: e.target.value as 'qwen' | 'deepseek'})}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Qwen (推荐)</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="ai-api"
                      value="deepseek"
                      checked={options.preferredAPI === 'deepseek'}
                      onChange={(e) => setOptions({...options, preferredAPI: e.target.value as 'qwen' | 'deepseek'})}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">DeepSeek</span>
                  </label>
                </div>
              </div>
            )}
          </div>



          {/* Text Input */}
          <div>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700">
                哈哈的对话内容
              </label>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm whitespace-pre-wrap"
              style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}
              placeholder="将对话内容复制粘贴到这里..."
            />
            <div className="mt-2 flex justify-between items-center">
              <span className="text-xs text-gray-500">
                共 {text.split('\n').filter(line => line.trim()).length} 行内容
              </span>
              <button
                type="button"
                onClick={processText}
                disabled={!text.trim() || isProcessing}
                className="btn-primary text-sm"
              >
                {isProcessing ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {options.useAI ? 'AI处理中...' : '处理中...'}
                  </span>
                ) : (
                  <span className="flex items-center">
                    {options.useAI ? <Brain className="h-4 w-4 mr-1" /> : <Zap className="h-4 w-4 mr-1" />}
                    {options.useAI ? 'AI智能处理' : '直接处理'}
                  </span>
                )}
              </button>
            </div>
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
                        <pre className="text-sm text-gray-600 mt-1 whitespace-pre-wrap font-mono bg-white p-2 rounded border max-w-full overflow-x-auto">{memory.content}</pre>
                        <div className="flex items-center space-x-4 mt-1">
                          <p className="text-xs text-gray-500">日期: {memory.date}</p>
                          <div className="flex flex-wrap gap-1">
                            {memory.tags.map((tag, tagIndex) => (
                              <span key={tagIndex} className={getTagClasses(tag)}>
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