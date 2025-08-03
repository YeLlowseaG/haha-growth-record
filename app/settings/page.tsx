'use client';

import { useState } from 'react';
import { ArrowLeft, Settings, HardDrive, Database, Shield, Upload, CheckCircle } from 'lucide-react';
import StorageManager from '@/components/StorageManager';
import ImportDialog from '@/components/ImportDialog';
import Link from 'next/link';
import { Conversation } from '@/types';
import { addMemory } from '@/lib/storage';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('storage');
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importSuccess, setImportSuccess] = useState<{ show: boolean; count: number }>({ show: false, count: 0 });

  const handleImport = (memories: Conversation[]) => {
    // 将导入的对话保存到本地存储
    memories.forEach(memory => {
      const now = new Date().toISOString();
      addMemory({
        ...memory,
        type: 'conversation',
        id: memory.id || `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        childName: memory.childName || '哈哈',
        age: memory.age || '3岁',
        createdAt: memory.createdAt || now,
        updatedAt: now
      });
    });
    
    console.log(`成功导入 ${memories.length} 条对话记录`);
    setIsImportDialogOpen(false);
    
    // 显示成功提示
    setImportSuccess({ show: true, count: memories.length });
    
    // 3秒后自动隐藏提示
    setTimeout(() => {
      setImportSuccess({ show: false, count: 0 });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span>返回首页</span>
            </Link>
            <div className="flex items-center space-x-3 ml-6">
              <Settings className="h-6 w-6 text-primary-500" />
              <h1 className="text-xl font-semibold text-gray-900">设置</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'storage', label: '存储管理', icon: HardDrive },
              { id: 'data', label: '数据管理', icon: Database },
              { id: 'privacy', label: '隐私设置', icon: Shield },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'storage' && (
            <div>
              <StorageManager />
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">数据管理</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2 flex items-center">
                      <Upload className="h-4 w-4 mr-2" />
                      导入对话
                    </h4>
                    <p className="text-sm text-green-800 mb-3">
                      从文本文件导入对话记录，支持AI智能分段和标签生成。
                    </p>
                    <button 
                      onClick={() => setIsImportDialogOpen(true)}
                      className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                    >
                      开始导入
                    </button>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">数据备份</h4>
                    <p className="text-sm text-blue-800 mb-3">
                      定期备份你的数据，防止意外丢失。建议每月备份一次。
                    </p>
                    <button className="btn-primary text-sm">
                      立即备份
                    </button>
                  </div>

                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h4 className="font-medium text-yellow-900 mb-2">数据恢复</h4>
                    <p className="text-sm text-yellow-800 mb-3">
                      从之前的备份文件恢复数据。
                    </p>
                    <button className="btn-secondary text-sm">
                      恢复数据
                    </button>
                  </div>

                  <div className="p-4 bg-red-50 rounded-lg">
                    <h4 className="font-medium text-red-900 mb-2">数据清理</h4>
                    <p className="text-sm text-red-800 mb-3">
                      删除导入错误的对话记录或清除所有数据。
                    </p>
                    <Link href="/cleanup" className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm inline-block">
                      进入数据清理
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">隐私设置</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">本地存储</h4>
                      <p className="text-sm text-gray-600">所有数据仅保存在你的设备上</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-green-600 font-medium">已启用</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">数据加密</h4>
                      <p className="text-sm text-gray-600">本地数据使用浏览器加密存储</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-green-600 font-medium">已启用</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">自动清理</h4>
                      <p className="text-sm text-gray-600">定期清理过期的临时数据</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-green-600 font-medium">已启用</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">隐私说明</h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <p>
                    • 所有数据仅保存在你的浏览器本地存储中，不会上传到任何服务器
                  </p>
                  <p>
                    • 你可以随时导出数据到本地文件进行备份
                  </p>
                  <p>
                    • 清除浏览器数据会导致所有记录丢失，请提前备份
                  </p>
                  <p>
                    • 建议定期导出重要数据到本地文件
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Import Dialog */}
      <ImportDialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onImport={handleImport}
      />

      {/* Success Notification */}
      {importSuccess.show && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 z-50">
          <CheckCircle className="h-5 w-5" />
          <span>成功导入 {importSuccess.count} 条对话记录！</span>
        </div>
      )}
    </div>
  );
} 