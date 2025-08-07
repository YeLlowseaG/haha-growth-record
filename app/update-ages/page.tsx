'use client';

import { useState } from 'react';
import { ArrowLeft, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function UpdateAgesPage() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const handleUpdateAges = async () => {
    setIsUpdating(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/update-ages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || '更新失败');
      }
    } catch (err) {
      setError('网络错误，请重试');
      console.error('更新失败:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link
            href="/"
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            返回首页
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            更新年龄数据
          </h1>

          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                📅 年龄计算说明
              </h3>
              <ul className="text-blue-800 space-y-1 text-sm">
                <li>• 哈哈的生日：2019年7月19日</li>
                <li>• 将根据每条记录的日期重新计算准确年龄</li>
                <li>• 只更新计算结果与现有数据不同的记录</li>
                <li>• 操作是安全的，可以随时执行</li>
              </ul>
            </div>

            {!result && !error && (
              <button
                onClick={handleUpdateAges}
                disabled={isUpdating}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  isUpdating
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                {isUpdating ? (
                  <div className="flex items-center justify-center">
                    <RefreshCw className="animate-spin h-5 w-5 mr-2" />
                    正在更新年龄数据...
                  </div>
                ) : (
                  '开始更新所有记录的年龄'
                )}
              </button>
            )}

            {/* Success Result */}
            {result && (
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                  <h3 className="text-lg font-semibold text-green-900">
                    更新完成！
                  </h3>
                </div>
                <div className="text-green-800 space-y-1">
                  <p>📊 总记录数：{result.totalRecords} 条</p>
                  <p>✅ 已更新：{result.updatedRecords} 条</p>
                  <p>📝 {result.message}</p>
                </div>
                <div className="mt-4">
                  <Link
                    href="/"
                    className="inline-flex items-center text-green-700 hover:text-green-800 font-medium"
                  >
                    返回首页查看更新结果 →
                  </Link>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <AlertCircle className="h-6 w-6 text-red-600 mr-2" />
                  <h3 className="text-lg font-semibold text-red-900">更新失败</h3>
                </div>
                <p className="text-red-800">{error}</p>
                <button
                  onClick={() => {
                    setError('');
                    setResult(null);
                  }}
                  className="mt-3 text-red-700 hover:text-red-800 font-medium"
                >
                  重试
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}