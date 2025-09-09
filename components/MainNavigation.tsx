'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Heart, 
  Home, 
  CheckSquare, 
  BookOpen, 
  Calendar, 
  Star,
  Settings,
  Menu,
  X
} from 'lucide-react';

interface MainNavigationProps {
  onAddNew?: () => void;
}

export default function MainNavigation({ onAddNew }: MainNavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navigationItems = [
    {
      name: '成长记录',
      href: '/',
      icon: Home,
      description: '记录哈哈的可爱瞬间'
    },
    {
      name: '待办事项',
      href: '/todos',
      icon: CheckSquare,
      description: '管理哈哈的待办任务'
    },
    {
      name: '每日作业',
      href: '/tasks',
      icon: BookOpen,
      description: '跟踪每日作业进度'
    },
    {
      name: '课程表',
      href: '/schedule',
      icon: Calendar,
      description: '查看课程安排'
    }
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* 桌面版导航 */}
      <div className="hidden lg:block">
        <div className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Heart className="h-8 w-8 text-primary-500" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">哈哈的成长记录</h1>
                <p className="text-sm text-gray-500">Harvest的可爱瞬间</p>
              </div>
            </div>
          </div>

          {/* 导航菜单 */}
          <nav className="p-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-colors group ${
                    isActive(item.href)
                      ? 'bg-primary-50 text-primary-700 border border-primary-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${
                    isActive(item.href) ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-gray-500 truncate">{item.description}</p>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* 快速操作 */}
          {onAddNew && (
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={onAddNew}
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                <Heart className="h-4 w-4" />
                <span>记录哈哈</span>
              </button>
            </div>
          )}

          {/* 设置链接 */}
          <div className="p-4 border-t border-gray-200">
            <Link
              href="/settings"
              className={`flex items-center space-x-3 p-3 rounded-lg transition-colors group ${
                pathname === '/settings'
                  ? 'bg-primary-50 text-primary-700 border border-primary-200'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Settings className={`h-5 w-5 ${
                pathname === '/settings' ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'
              }`} />
              <span className="font-medium">设置</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 移动版导航 */}
      <div className="lg:hidden">
        {/* 顶部栏 */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex justify-between items-center h-14 px-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-6 w-6 text-primary-500" />
              <h1 className="text-lg font-bold text-gray-900">哈哈的成长记录</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              {onAddNew && (
                <button
                  onClick={onAddNew}
                  className="btn-primary flex items-center space-x-1 text-sm px-3 py-2"
                >
                  <Heart className="h-4 w-4" />
                  <span>记录</span>
                </button>
              )}
              
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* 移动版菜单 */}
        {isMobileMenuOpen && (
          <div className="bg-white border-b border-gray-200 shadow-lg">
            <nav className="p-4 space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                      isActive(item.href)
                        ? 'bg-primary-50 text-primary-700 border border-primary-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${
                      isActive(item.href) ? 'text-primary-600' : 'text-gray-400'
                    }`} />
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.description}</p>
                    </div>
                  </Link>
                );
              })}
              
              <Link
                href="/settings"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  pathname === '/settings'
                    ? 'bg-primary-50 text-primary-700 border border-primary-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Settings className={`h-5 w-5 ${
                  pathname === '/settings' ? 'text-primary-600' : 'text-gray-400'
                }`} />
                <span className="font-medium">设置</span>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </>
  );
}
