'use client';

import { useState, useEffect } from 'react';
import { Trash2, AlertTriangle, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { deleteAllConversations, deleteAllMemories, loadMemories } from '@/lib/storage';

export default function CleanupPage() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [memories, setMemories] = useState<any[]>([]);
  
  useEffect(() => {
    const loadData = async () => {
      const data = await loadMemories();
      setMemories(data);
    };
    loadData();
  }, []);

  const handleDeleteConversations = async () => {
    setIsDeleting(true);
    try {
      await deleteAllConversations();
      const updatedMemories = await loadMemories();
      setMemories(updatedMemories);
      setDeleted(true);
    } catch (error) {
      console.error('删除对话失败:', error);
    }
    setIsDeleting(false);
  };

  const handleDeleteAll = async () => {
    setIsDeleting(true);
    try {
      await deleteAllMemories();
      setMemories([]);
      setDeleted(true);
    } catch (error) {
      console.error('删除所有记录失败:', error);
    }
    setIsDeleting(false);
  };

  const conversations = memories.filter(m => m.type === 'conversation');
  const photos = memories.filter(m => m.type === 'photo');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* 头部 */}
        <div className="flex items-center mb-6">
          <Link href="/" className="mr-4 p-2 hover:bg-gray-200 rounded-lg">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">数据清理</h1>
        </div>

        {/* 当前数据统计 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">当前数据统计</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{conversations.length}</div>
              <div className="text-sm text-gray-600">对话记录</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{photos.length}</div>
              <div className="text-sm text-gray-600">照片记录</div>
            </div>
          </div>
        </div>

        {/* 删除选项 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            删除选项
          </h2>
          
          <div className="space-y-4">
            {/* 删除对话记录 */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">删除所有对话记录</h3>
                  <p className="text-sm text-gray-600">
                    这将删除所有哈哈的对话记录，但保留照片
                  </p>
                </div>
                <button
                  onClick={handleDeleteConversations}
                  disabled={isDeleting || conversations.length === 0}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      删除中...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      删除对话
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 删除所有记录 */}
            <div className="border border-red-200 rounded-lg p-4 bg-red-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-red-900">删除所有记录</h3>
                  <p className="text-sm text-red-700">
                    这将删除所有记录，包括对话和照片
                  </p>
                </div>
                <button
                  onClick={handleDeleteAll}
                  disabled={isDeleting || memories.length === 0}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      删除中...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      删除全部
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 成功提示 */}
        {deleted && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-green-800">删除成功！</span>
            </div>
          </div>
        )}

        {/* 返回按钮 */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
} 