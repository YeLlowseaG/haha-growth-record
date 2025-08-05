'use client';

import { useState } from 'react';
import { Search, Plus, Heart, Settings } from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  onSearch: (query: string) => void;
  onAddNew: () => void;
}

export default function Header({ onSearch, onAddNew }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 桌面版布局 */}
        <div className="hidden lg:flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <Heart className="h-8 w-8 text-primary-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">哈哈的成长记录</h1>
              <p className="text-sm text-gray-500">Harvest的可爱瞬间</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="搜索哈哈的成长记录..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-64"
              />
            </form>
            
            <button
              onClick={onAddNew}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>记录哈哈</span>
            </button>

            <Link
              href="/settings"
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="设置"
            >
              <Settings className="h-5 w-5" />
            </Link>
          </div>
        </div>
        
        {/* 移动端布局 */}
        <div className="lg:hidden">
          {/* 顶部行 */}
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center space-x-2">
              <Heart className="h-6 w-6 text-primary-500" />
              <div>
                <h1 className="text-lg font-bold text-gray-900">哈哈的成长记录</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={onAddNew}
                className="btn-primary flex items-center space-x-1 text-sm px-3 py-2"
              >
                <Plus className="h-4 w-4" />
                <span>记录</span>
              </button>

              <Link
                href="/settings"
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="设置"
              >
                <Settings className="h-5 w-5" />
              </Link>
            </div>
          </div>
          
          {/* 搜索行 */}
          <div className="pb-3">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="搜索哈哈的记录..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
              />
            </form>
          </div>
        </div>
      </div>
    </header>
  );
} 