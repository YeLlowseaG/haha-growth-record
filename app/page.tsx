'use client';

import { useState, useEffect } from 'react';
import MemoryCard from '@/components/MemoryCard';
import TimelineView from '@/components/TimelineView';
import AddMemoryModal from '@/components/AddMemoryModal';
import ImportDialog from '@/components/ImportDialog';
import { MemoryType, Conversation } from '@/types';
import { loadMemories, addMemory, updateMemory, deleteMemory, searchMemories, getMemoriesByType, initDatabase, PaginatedResponse } from '@/lib/storage';
import { Inbox, Smile, Download, Grid3X3, Calendar, Plus } from 'lucide-react';
import { getCurrentHahaAge } from '@/lib/age-utils';

export default function Home() {
  const [memories, setMemories] = useState<MemoryType[]>([]);
  const [filteredMemories, setFilteredMemories] = useState<MemoryType[]>([]);
  const [selectedType, setSelectedType] = useState<MemoryType['type'] | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingMemory, setEditingMemory] = useState<MemoryType | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');

  // Load memories on component mount
  useEffect(() => {
    let mounted = true;
    
    const initAndLoadMemories = async () => {
      try {
        // 初始化数据库
        await initDatabase();
        
        // 加载记录
        const response = await loadMemories();
        
        if (mounted) {
          setMemories(response.memories);
          setFilteredMemories(response.memories);
        }
      } catch (error) {
        console.error('初始化失败:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };
    
    initAndLoadMemories();
    
    return () => {
      mounted = false;
    };
  }, []);

  // Filter memories based on type, search, and tag
  useEffect(() => {
    let mounted = true;
    
    const filterMemories = async () => {
      try {
        let filtered: MemoryType[];
        
        // 如果有搜索查询，使用搜索API
        if (searchQuery.trim()) {
          filtered = await searchMemories(searchQuery);
        } else if (selectedType !== 'all') {
          // 只有类型筛选
          filtered = await getMemoriesByType(selectedType);
        } else {
          // 没有搜索和类型筛选，使用已加载的数据
          filtered = memories;
        }
        
        // 在前端进行类型和标签的进一步筛选
        if (selectedType !== 'all') {
          filtered = filtered.filter(memory => memory.type === selectedType);
        }
        
        if (selectedTag) {
          filtered = filtered.filter(memory => memory.tags.includes(selectedTag));
        }
        
        if (mounted) {
          setFilteredMemories(filtered);
        }
      } catch (error) {
        console.error('筛选记录失败:', error);
      }
    };
    
    filterMemories();
    
    return () => {
      mounted = false;
    };
  }, [memories, selectedType, searchQuery, selectedTag]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleTagClick = (tag: string) => {
    setSelectedTag(selectedTag === tag ? '' : tag); // 点击相同标签取消筛选
    setSearchQuery(''); // 清除搜索查询
  };

  const handleAddNew = () => {
    setEditingMemory(undefined);
    setIsModalOpen(true);
  };

  const handleSaveMemory = async (memory: MemoryType) => {
    try {
      if (editingMemory) {
        await updateMemory(memory.id, memory);
      } else {
        await addMemory(memory);
      }
      
      // Reload memories
      const response = await loadMemories();
      setMemories(response.memories);
    } catch (error) {
      console.error('保存记录失败:', error);
      alert('保存失败，请重试');
    }
  };

  const handleEditMemory = (memory: MemoryType) => {
    setEditingMemory(memory);
    setIsModalOpen(true);
  };

  const handleDeleteMemory = async (id: string) => {
    if (confirm('确定要删除这条哈哈的记录吗？')) {
      try {
        const success = await deleteMemory(id);
        if (success) {
          const response = await loadMemories();
          setMemories(response.memories);
        } else {
          alert('删除失败，请重试');
        }
      } catch (error) {
        console.error('删除记录失败:', error);
        alert('删除失败，请重试');
      }
    }
  };

  const handleImportMemories = async (importedMemories: Conversation[]) => {
    try {
      // 并行上传所有记录
      await Promise.all(
        importedMemories.map(memory => addMemory(memory))
      );
      
      const response = await loadMemories();
      setMemories(response.memories);
    } catch (error) {
      console.error('导入记录失败:', error);
      alert('导入失败，请重试');
    }
  };


  const typeCounts = {
    conversation: memories.filter(m => m.type === 'conversation').length,
    photo: memories.filter(m => m.type === 'photo').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 lg:p-6">
        <div className="max-w-6xl mx-auto">
          {/* 页面标题和操作 */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">哈哈的成长记录</h1>
                <p className="text-gray-600">记录Harvest的每一个可爱瞬间</p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleAddNew}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>记录哈哈</span>
                </button>
              </div>
            </div>
            
            {/* 搜索栏 */}
            <div className="relative max-w-md">
              <input
                type="text"
                placeholder="搜索哈哈的成长记录..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <Inbox className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>
          </div>

          {/* 筛选标签 */}
          <div className="mb-6">
            <div className="flex space-x-2 overflow-x-auto">
              {[
                { type: 'all' as const, label: '全部', count: memories.length },
                { type: 'conversation' as const, label: '对话', count: typeCounts.conversation },
                { type: 'photo' as const, label: '照片', count: typeCounts.photo },
              ].map(({ type, label, count }) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedType === type
                      ? 'bg-primary-100 text-primary-700 border border-primary-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {label} ({count})
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">正在加载哈哈的记录...</p>
            </div>
          ) : (
            <>
              {/* View Toggle */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">成长记录</h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-primary-100 text-primary-700 border border-primary-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Grid3X3 className="h-4 w-4" />
                    <span>网格视图</span>
                  </button>
                  <button
                    onClick={() => setViewMode('timeline')}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      viewMode === 'timeline'
                        ? 'bg-primary-100 text-primary-700 border border-primary-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Calendar className="h-4 w-4" />
                    <span>时间轴</span>
                  </button>
                </div>
              </div>

            {/* Active Filters */}
            {(selectedTag || searchQuery) && (
              <div className="mb-4 lg:mb-6">
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>筛选条件:</span>
                      {selectedTag && (
                        <span className="inline-flex items-center px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs">
                          标签: {selectedTag}
                          <button
                            onClick={() => setSelectedTag('')}
                            className="ml-1 text-primary-500 hover:text-primary-700"
                            title="清除标签筛选"
                          >
                            ×
                          </button>
                        </span>
                      )}
                      {searchQuery && (
                        <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                          搜索: {searchQuery}
                          <button
                            onClick={() => setSearchQuery('')}
                            className="ml-1 text-blue-500 hover:text-blue-700"
                            title="清除搜索"
                          >
                            ×
                          </button>
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedTag('');
                        setSearchQuery('');
                      }}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      清除所有筛选
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Content */}
            {filteredMemories.length === 0 ? (
              <div className="text-center py-8 lg:py-12">
                <Inbox className="h-12 w-12 lg:h-16 lg:w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-2">
                  {searchQuery || selectedTag ? '没有找到哈哈的相关记录' : '还没有哈哈的成长记录'}
                </h3>
                <p className="text-sm lg:text-base text-gray-600 mb-6 px-4">
                  {searchQuery 
                    ? '尝试使用不同的关键词搜索哈哈的记录'
                    : selectedTag 
                    ? `没有找到标签为"${selectedTag}"的记录，尝试其他标签`
                    : '开始记录哈哈的成长瞬间吧！'
                  }
                </p>
                {!searchQuery && !selectedTag && (
                  <div className="space-y-3 px-4">
                    <button
                      onClick={handleAddNew}
                      className="btn-primary w-full sm:w-auto"
                    >
                      记录哈哈的第一个瞬间
                    </button>
                    <br />
                    <button
                      onClick={() => setIsImportOpen(true)}
                      className="inline-flex items-center space-x-2 text-sm text-primary-600 hover:text-primary-700"
                    >
                      <Download className="h-4 w-4" />
                      <span>导入哈哈的对话</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                    {filteredMemories.map((memory) => (
                      <MemoryCard
                        key={memory.id}
                        memory={memory}
                        onEdit={handleEditMemory}
                        onDelete={handleDeleteMemory}
                        onTagClick={handleTagClick}
                      />
                    ))}
                  </div>
                ) : (
                  <TimelineView
                    memories={filteredMemories}
                    onEdit={handleEditMemory}
                    onDelete={handleDeleteMemory}
                    onTagClick={handleTagClick}
                  />
                )}
              </>
            )}
              </>
            )}
        </div>
      </div>

      <AddMemoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveMemory}
        editingMemory={editingMemory}
      />

      <ImportDialog
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={handleImportMemories}
      />
    </div>
  );
} 