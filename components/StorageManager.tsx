'use client';

import { useState, useEffect } from 'react';
import { HardDrive, Download, Upload, Trash2, AlertTriangle } from 'lucide-react';
import { checkStorageSpace, exportData, importData, cleanupOldData } from '@/lib/storage';

export default function StorageManager() {
  const [storageInfo, setStorageInfo] = useState({ used: 0, available: 0, percentage: 0 });
  const [showImport, setShowImport] = useState(false);

  useEffect(() => {
    updateStorageInfo();
  }, []);

  const updateStorageInfo = () => {
    const info = checkStorageSpace();
    setStorageInfo(info);
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kids-memories-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (importData(content)) {
        alert('数据导入成功！');
        updateStorageInfo();
        window.location.reload();
      } else {
        alert('数据格式错误，导入失败');
      }
    };
    reader.readAsText(file);
  };

  const handleCleanup = () => {
    if (confirm('确定要清理一年前的数据吗？此操作不可恢复。')) {
      cleanupOldData(365);
      updateStorageInfo();
      alert('清理完成！');
      window.location.reload();
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStorageColor = (percentage: number) => {
    if (percentage > 80) return 'text-red-500';
    if (percentage > 60) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center space-x-2 mb-4">
        <HardDrive className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">存储管理</h3>
      </div>

      {/* 存储使用情况 */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">存储空间使用情况</span>
          <span className={`text-sm font-medium ${getStorageColor(storageInfo.percentage)}`}>
            {formatBytes(storageInfo.used)} / {formatBytes(storageInfo.available)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              storageInfo.percentage > 80 ? 'bg-red-500' : 
              storageInfo.percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${storageInfo.percentage}%` }}
          />
        </div>
        <div className="flex items-center space-x-2 mt-2">
          <span className="text-xs text-gray-500">
            {storageInfo.percentage.toFixed(1)}% 已使用
          </span>
          {storageInfo.percentage > 80 && (
            <div className="flex items-center space-x-1 text-xs text-red-500">
              <AlertTriangle className="h-3 w-3" />
              <span>存储空间不足</span>
            </div>
          )}
        </div>
      </div>

      {/* 数据管理操作 */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            onClick={handleExport}
            className="flex items-center justify-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium">导出数据</span>
          </button>
          
          <button
            onClick={() => setShowImport(!showImport)}
            className="flex items-center justify-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Upload className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium">导入数据</span>
          </button>
        </div>

        {showImport && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-3">
              选择之前导出的 JSON 文件进行导入
            </p>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
          </div>
        )}

        <button
          onClick={handleCleanup}
          className="w-full flex items-center justify-center space-x-2 p-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
          <span className="text-sm font-medium">清理一年前的数据</span>
        </button>
      </div>

      {/* 存储优化建议 */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">存储优化建议</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• 定期导出重要数据到本地文件</li>
          <li>• 删除不需要的旧记录</li>
          <li>• 使用云存储服务保存大文件</li>
          <li>• 压缩照片以减少存储空间</li>
        </ul>
      </div>
    </div>
  );
} 