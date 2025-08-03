'use client';

import { useState } from 'react';
import { Brain, Zap, Settings, Play, RotateCcw, Copy, Check } from 'lucide-react';
import { AIService } from '@/lib/ai-service';

interface TestResult {
  api: string;
  result: any[];
  processingTime: number;
  error?: string;
}

export default function TestAIPage() {
  const [inputText, setInputText] = useState('');
  const [results, setResults] = useState<TestResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAPI, setSelectedAPI] = useState<'qwen' | 'deepseek'>('qwen');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const aiService = new AIService({
    qwenKey: 'sk-2e0ccd4afce04e608b3eda9dce40e2de',
    deepseekKey: 'sk-0f273a605d75468eb410d88d1ad8877b',
  });

  const handleTest = async () => {
    if (!inputText.trim()) return;

    setIsProcessing(true);
    setResults([]);

    try {
      const startTime = Date.now();
      const result = await aiService.processText(inputText, selectedAPI);
      const processingTime = Date.now() - startTime;

      setResults([{
        api: selectedAPI,
        result,
        processingTime
      }]);
    } catch (error) {
      setResults([{
        api: selectedAPI,
        result: [],
        processingTime: 0,
        error: error instanceof Error ? error.message : '未知错误'
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTestBoth = async () => {
    if (!inputText.trim()) return;

    setIsProcessing(true);
    setResults([]);

    const newResults: TestResult[] = [];

    // 测试 Qwen
    try {
      const startTime = Date.now();
      const result = await aiService.processText(inputText, 'qwen');
      const processingTime = Date.now() - startTime;
      newResults.push({ api: 'qwen', result, processingTime });
    } catch (error) {
      newResults.push({
        api: 'qwen',
        result: [],
        processingTime: 0,
        error: error instanceof Error ? error.message : '未知错误'
      });
    }

    // 测试 DeepSeek
    try {
      const startTime = Date.now();
      const result = await aiService.processText(inputText, 'deepseek');
      const processingTime = Date.now() - startTime;
      newResults.push({ api: 'deepseek', result, processingTime });
    } catch (error) {
      newResults.push({
        api: 'deepseek',
        result: [],
        processingTime: 0,
        error: error instanceof Error ? error.message : '未知错误'
      });
    }

    setResults(newResults);
    setIsProcessing(false);
  };

  const handleCopyResult = (index: number) => {
    const result = results[index];
    const jsonString = JSON.stringify(result.result, null, 2);
    navigator.clipboard.writeText(jsonString);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleReset = () => {
    setInputText('');
    setResults([]);
    setCopiedIndex(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Brain className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">AI 处理测试工具</h1>
          </div>
          <p className="text-gray-600">
            测试和优化哈哈对话的AI处理效果，比较不同API的处理结果
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">输入测试文本</h2>
                <button
                  onClick={handleReset}
                  className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>重置</span>
                </button>
              </div>

              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="粘贴哈哈的对话内容进行测试..."
              />

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="api"
                      value="qwen"
                      checked={selectedAPI === 'qwen'}
                      onChange={(e) => setSelectedAPI(e.target.value as 'qwen' | 'deepseek')}
                      className="text-blue-600"
                    />
                    <span className="text-sm text-gray-700">Qwen</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="api"
                      value="deepseek"
                      checked={selectedAPI === 'deepseek'}
                      onChange={(e) => setSelectedAPI(e.target.value as 'qwen' | 'deepseek')}
                      className="text-blue-600"
                    />
                    <span className="text-sm text-gray-700">DeepSeek</span>
                  </label>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleTest}
                    disabled={!inputText.trim() || isProcessing}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Play className="h-4 w-4" />
                    <span>测试 {selectedAPI}</span>
                  </button>
                  <button
                    onClick={handleTestBoth}
                    disabled={!inputText.trim() || isProcessing}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <Zap className="h-4 w-4" />
                    <span>测试两个</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Processing Status */}
            {isProcessing && (
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="text-blue-800">正在处理中...</span>
                </div>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">处理结果</h2>
            
            {results.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">输入文本并点击测试按钮查看结果</p>
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          result.api === 'qwen' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {result.api === 'qwen' ? 'Qwen' : 'DeepSeek'}
                        </div>
                        {result.processingTime > 0 && (
                          <span className="text-sm text-gray-500">
                            {result.processingTime}ms
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleCopyResult(index)}
                        className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-700"
                      >
                        {copiedIndex === index ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        <span>{copiedIndex === index ? '已复制' : '复制'}</span>
                      </button>
                    </div>

                    {result.error ? (
                      <div className="bg-red-50 rounded-lg p-4">
                        <p className="text-red-800 text-sm">{result.error}</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="text-sm text-gray-600">
                          生成了 {result.result.length} 个对话片段
                        </div>
                        <div className="max-h-96 overflow-y-auto space-y-3">
                          {result.result.map((item, itemIndex) => (
                            <div key={itemIndex} className="border border-gray-200 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-900">
                                  {item.context || `对话 ${itemIndex + 1}`}
                                </span>
                                <div className="flex flex-wrap gap-1">
                                  {item.tags?.map((tag, tagIndex) => (
                                    <span key={tagIndex} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                {item.content}
                              </p>
                              {item.date && (
                                <p className="text-xs text-gray-500 mt-2">日期: {item.date}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tips */}
        <div className="mt-8 bg-yellow-50 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <Settings className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-yellow-900 mb-2">使用提示</h3>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• 可以测试不同长度的对话文本</li>
                <li>• 比较两个API的处理效果差异</li>
                <li>• 复制结果用于进一步分析</li>
                <li>• 观察标签生成和分割逻辑</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 