'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import MemoryCard from '@/components/MemoryCard';
import AddMemoryModal from '@/components/AddMemoryModal';
import ImportDialog from '@/components/ImportDialog';
import { MemoryType, Conversation } from '@/types';
import { loadMemories, addMemory, updateMemory, deleteMemory, searchMemories, getMemoriesByType } from '@/lib/storage';
import { Inbox, Smile, Download, Brain } from 'lucide-react';

export default function Home() {
  const [memories, setMemories] = useState<MemoryType[]>([]);
  const [filteredMemories, setFilteredMemories] = useState<MemoryType[]>([]);
  const [selectedType, setSelectedType] = useState<MemoryType['type'] | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingMemory, setEditingMemory] = useState<MemoryType | undefined>();

  // Load memories on component mount
  useEffect(() => {
    const loadedMemories = loadMemories();
    setMemories(loadedMemories);
    setFilteredMemories(loadedMemories);
  }, []);

  // Filter memories based on type and search
  useEffect(() => {
    let filtered = memories;

    // Filter by type
    if (selectedType !== 'all') {
      filtered = getMemoriesByType(selectedType);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = searchMemories(searchQuery);
      if (selectedType !== 'all') {
        filtered = filtered.filter(memory => memory.type === selectedType);
      }
    }

    setFilteredMemories(filtered);
  }, [memories, selectedType, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleAddNew = () => {
    setEditingMemory(undefined);
    setIsModalOpen(true);
  };

  const handleSaveMemory = (memory: MemoryType) => {
    if (editingMemory) {
      updateMemory(memory.id, memory);
    } else {
      addMemory(memory);
    }
    
    // Reload memories
    const updatedMemories = loadMemories();
    setMemories(updatedMemories);
  };

  const handleEditMemory = (memory: MemoryType) => {
    setEditingMemory(memory);
    setIsModalOpen(true);
  };

  const handleDeleteMemory = (id: string) => {
    if (confirm('确定要删除这条哈哈的记录吗？')) {
      deleteMemory(id);
      const updatedMemories = loadMemories();
      setMemories(updatedMemories);
    }
  };

  const handleImportMemories = (importedMemories: Conversation[]) => {
    importedMemories.forEach(memory => {
      addMemory(memory);
    });
    const updatedMemories = loadMemories();
    setMemories(updatedMemories);
  };

  const typeCounts = {
    conversation: memories.filter(m => m.type === 'conversation').length,
    photo: memories.filter(m => m.type === 'photo').length,
    video: memories.filter(m => m.type === 'video').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onSearch={handleSearch} onAddNew={handleAddNew} />
      
      <div className="flex">
        <Sidebar
          selectedType={selectedType}
          onTypeChange={setSelectedType}
          totalCount={memories.length}
          typeCounts={typeCounts}
        />
        
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            {/* Stats */}
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Smile className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">哈哈的视频</p>
                      <p className="text-2xl font-bold text-purple-600">{typeCounts.video}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            {filteredMemories.length === 0 ? (
              <div className="text-center py-12">
                <Inbox className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery ? '没有找到哈哈的相关记录' : '还没有哈哈的成长记录'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery 
                    ? '尝试使用不同的关键词搜索哈哈的记录'
                    : '开始记录哈哈的成长瞬间吧！'
                  }
                </p>
                {!searchQuery && (
                  <div className="space-y-3">
                    <button
                      onClick={handleAddNew}
                      className="btn-primary"
                    >
                      记录哈哈的第一个瞬间
                    </button>
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={() => setIsImportOpen(true)}
                        className="flex items-center space-x-2 text-sm text-primary-600 hover:text-primary-700"
                      >
                        <Download className="h-4 w-4" />
                        <span>导入哈哈的对话</span>
                      </button>
                      <a
                        href="/test-ai"
                        className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700"
                      >
                        <Brain className="h-4 w-4" />
                        <span>AI测试工具</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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