'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import MemoryCard from '@/components/MemoryCard';
import AddMemoryModal from '@/components/AddMemoryModal';
import ImportDialog from '@/components/ImportDialog';
import { MemoryType, Conversation } from '@/types';
import { loadMemories, addMemory, updateMemory, deleteMemory, searchMemories, getMemoriesByType, initDatabase } from '@/lib/storage';
import { Inbox, Smile, Download } from 'lucide-react';

export default function Home() {
  const [memories, setMemories] = useState<MemoryType[]>([]);
  const [filteredMemories, setFilteredMemories] = useState<MemoryType[]>([]);
  const [selectedType, setSelectedType] = useState<MemoryType['type'] | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingMemory, setEditingMemory] = useState<MemoryType | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  // Load memories on component mount
  useEffect(() => {
    let mounted = true;
    
    const initAndLoadMemories = async () => {
      try {
        // 初始化数据库
        await initDatabase();
        
        // 加载记录
        const loadedMemories = await loadMemories();
        
        if (mounted) {
          setMemories(loadedMemories);
          setFilteredMemories(loadedMemories);
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

  // Filter memories based on type and search
  useEffect(() => {
    let mounted = true;
    
    const filterMemories = async () => {
      try {
        let filtered: MemoryType[];
        
        // 如果有搜索查询，使用搜索API
        if (searchQuery.trim()) {
          filtered = await searchMemories(searchQuery);
          // 如果还有类型筛选，进一步过滤
          if (selectedType !== 'all') {
            filtered = filtered.filter(memory => memory.type === selectedType);
          }
        } else if (selectedType !== 'all') {
          // 只有类型筛选
          filtered = await getMemoriesByType(selectedType);
        } else {
          // 没有筛选，使用已加载的数据
          filtered = memories;
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
  }, [memories, selectedType, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
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
      const updatedMemories = await loadMemories();
      setMemories(updatedMemories);
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
          const updatedMemories = await loadMemories();
          setMemories(updatedMemories);
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
      
      const updatedMemories = await loadMemories();
      setMemories(updatedMemories);
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
      <Header onSearch={handleSearch} onAddNew={handleAddNew} />
      
      <div className="flex flex-col lg:flex-row">
        {/* 移动端侧边栏 */}
        <div className="lg:hidden">
          <div className="bg-white border-b border-gray-200 p-4">
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
        </div>
        
        {/* 桌面系统侧边栏 */}
        <div className="hidden lg:block">
          <Sidebar
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            totalCount={memories.length}
            typeCounts={typeCounts}
          />
        </div>
        
        <main className="flex-1 p-4 lg:p-6">
          <div className="max-w-6xl mx-auto">
            {/* Loading State */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600">正在加载哈哈的记录...</p>
              </div>
            ) : (
              <>
            {/* Stats */}
            <div className="mb-4 lg:mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Smile className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">哈哈的记录总数</p>
                      <p className="text-2xl font-bold text-gray-900">{memories.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Smile className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">哈哈的对话</p>
                      <p className="text-2xl font-bold text-blue-600">{typeCounts.conversation}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Smile className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">哈哈的照片</p>
                      <p className="text-2xl font-bold text-green-600">{typeCounts.photo}</p>
                    </div>
                  </div>
                </div>
                
              </div>
            </div>

            {/* Content */}
            {filteredMemories.length === 0 ? (
              <div className="text-center py-8 lg:py-12">
                <Inbox className="h-12 w-12 lg:h-16 lg:w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-2">
                  {searchQuery ? '没有找到哈哈的相关记录' : '还没有哈哈的成长记录'}
                </h3>
                <p className="text-sm lg:text-base text-gray-600 mb-6 px-4">
                  {searchQuery 
                    ? '尝试使用不同的关键词搜索哈哈的记录'
                    : '开始记录哈哈的成长瞬间吧！'
                  }
                </p>
                {!searchQuery && (
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
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                {filteredMemories.map((memory) => (
                  <MemoryCard
                    key={memory.id}
                    memory={memory}
                    onEdit={handleEditMemory}
                    onDelete={handleDeleteMemory}
                  />
                ))}
              </div>
            )}
              </>
            )}
          </div>
        </main>
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