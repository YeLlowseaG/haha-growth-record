'use client';

import { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, MapPin, User, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Course, Schedule } from '@/types';

export default function SchedulePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  // 模拟数据
  useEffect(() => {
    const mockCourses: Course[] = [
      {
        id: '1',
        name: '数学课',
        subject: '数学',
        teacher: '张老师',
        location: '教室A101',
        color: '#3B82F6',
        description: '高中数学课程',
        createdAt: '2024-09-01',
        updatedAt: '2024-09-01'
      },
      {
        id: '2',
        name: '语文课',
        subject: '语文',
        teacher: '李老师',
        location: '教室B201',
        color: '#10B981',
        description: '高中语文课程',
        createdAt: '2024-09-01',
        updatedAt: '2024-09-01'
      },
      {
        id: '3',
        name: '英语课',
        subject: '英语',
        teacher: '王老师',
        location: '教室C301',
        color: '#8B5CF6',
        description: '高中英语课程',
        createdAt: '2024-09-01',
        updatedAt: '2024-09-01'
      },
      {
        id: '4',
        name: '物理课',
        subject: '物理',
        teacher: '赵老师',
        location: '实验室D401',
        color: '#F59E0B',
        description: '高中物理课程',
        createdAt: '2024-09-01',
        updatedAt: '2024-09-01'
      }
    ];

    const mockSchedules: Schedule[] = [
      {
        id: '1',
        courseId: '1',
        course: mockCourses[0],
        dayOfWeek: 1, // 周一
        startTime: '08:00',
        endTime: '09:00',
        isRecurring: true,
        startDate: '2024-09-01',
        createdAt: '2024-09-01',
        updatedAt: '2024-09-01'
      },
      {
        id: '2',
        courseId: '2',
        course: mockCourses[1],
        dayOfWeek: 1, // 周一
        startTime: '09:30',
        endTime: '10:30',
        isRecurring: true,
        startDate: '2024-09-01',
        createdAt: '2024-09-01',
        updatedAt: '2024-09-01'
      },
      {
        id: '3',
        courseId: '3',
        course: mockCourses[2],
        dayOfWeek: 2, // 周二
        startTime: '08:00',
        endTime: '09:00',
        isRecurring: true,
        startDate: '2024-09-01',
        createdAt: '2024-09-01',
        updatedAt: '2024-09-01'
      },
      {
        id: '4',
        courseId: '4',
        course: mockCourses[3],
        dayOfWeek: 3, // 周三
        startTime: '10:00',
        endTime: '11:00',
        isRecurring: true,
        startDate: '2024-09-01',
        createdAt: '2024-09-01',
        updatedAt: '2024-09-01'
      }
    ];
    
    setTimeout(() => {
      setCourses(mockCourses);
      setSchedules(mockSchedules);
      setIsLoading(false);
    }, 500);
  }, []);

  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
  ];

  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  const getWeekDates = (weekStart: Date) => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const getSchedulesForDay = (dayOfWeek: number) => {
    return schedules.filter(schedule => schedule.dayOfWeek === dayOfWeek);
  };

  const getSchedulesForTimeSlot = (dayOfWeek: number, timeSlot: string) => {
    return schedules.filter(schedule => 
      schedule.dayOfWeek === dayOfWeek && 
      schedule.startTime <= timeSlot && 
      schedule.endTime > timeSlot
    );
  };

  const formatTime = (time: string) => {
    return time;
  };

  const deleteSchedule = (id: string) => {
    if (confirm('确定要删除这个课程安排吗？')) {
      setSchedules(schedules.filter(schedule => schedule.id !== id));
    }
  };

  const deleteCourse = (id: string) => {
    if (confirm('确定要删除这个课程吗？这将删除所有相关的课程安排。')) {
      setCourses(courses.filter(course => course.id !== id));
      setSchedules(schedules.filter(schedule => schedule.courseId !== id));
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const weekStart = getWeekStart(currentWeek);
  const weekDates = getWeekDates(weekStart);

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">课程表</h1>
              <p className="text-gray-600">查看课程安排</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === 'week'
                      ? 'bg-primary-100 text-primary-700 border border-primary-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  周视图
                </button>
                <button
                  onClick={() => setViewMode('month')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === 'month'
                      ? 'bg-primary-100 text-primary-700 border border-primary-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  月视图
                </button>
              </div>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>添加课程</span>
              </button>
            </div>
          </div>
        </div>

        {/* 周导航 */}
        {viewMode === 'week' && (
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentWeek(new Date(currentWeek.getTime() - 7 * 24 * 60 * 60 * 1000))}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h2 className="text-lg font-semibold text-gray-900">
                {weekStart.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })} 第{Math.ceil(weekStart.getDate() / 7)}周
              </h2>
              <button
                onClick={() => setCurrentWeek(new Date(currentWeek.getTime() + 7 * 24 * 60 * 60 * 1000))}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <button
              onClick={() => setCurrentWeek(new Date())}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              回到本周
            </button>
          </div>
        )}

        {/* 课程表 */}
        {viewMode === 'week' ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-8 gap-0">
              {/* 时间列标题 */}
              <div className="bg-gray-50 p-4 border-r border-gray-200">
                <div className="text-sm font-medium text-gray-500">时间</div>
              </div>
              
              {/* 日期列标题 */}
              {weekDates.map((date, index) => (
                <div key={index} className="bg-gray-50 p-4 border-r border-gray-200 last:border-r-0">
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-900">{weekDays[index]}</div>
                    <div className="text-xs text-gray-500">{date.getDate()}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* 时间槽 */}
            {timeSlots.map((timeSlot, timeIndex) => (
              <div key={timeSlot} className="grid grid-cols-8 gap-0 border-t border-gray-200">
                {/* 时间标签 */}
                <div className="bg-gray-50 p-2 border-r border-gray-200">
                  <div className="text-xs text-gray-500 text-center">{timeSlot}</div>
                </div>
                
                {/* 课程格子 */}
                {weekDates.map((date, dayIndex) => {
                  const daySchedules = getSchedulesForTimeSlot(dayIndex, timeSlot);
                  return (
                    <div
                      key={dayIndex}
                      className="p-2 border-r border-gray-200 last:border-r-0 min-h-[60px] bg-white hover:bg-gray-50 transition-colors"
                    >
                      {daySchedules.map((schedule) => (
                        <div
                          key={schedule.id}
                          className="mb-1 p-2 rounded text-xs text-white relative group"
                          style={{ backgroundColor: schedule.course.color }}
                        >
                          <div className="font-medium truncate">{schedule.course.name}</div>
                          <div className="text-xs opacity-90 truncate">
                            {schedule.course.teacher}
                          </div>
                          <div className="text-xs opacity-90 truncate">
                            {schedule.course.location}
                          </div>
                          
                          {/* 操作按钮 */}
                          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => console.log('编辑', schedule.id)}
                                className="p-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded transition-colors"
                                title="编辑"
                              >
                                <Edit className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => deleteSchedule(schedule.id)}
                                className="p-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded transition-colors"
                                title="删除"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ) : (
          /* 月视图 */
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">月视图</h3>
            <p className="text-gray-600">月视图功能正在开发中...</p>
          </div>
        )}

        {/* 课程列表 */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">课程管理</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: course.color }}
                    ></div>
                    <h4 className="font-medium text-gray-900">{course.name}</h4>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => console.log('编辑课程', course.id)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title="编辑课程"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteCourse(course.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      title="删除课程"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{course.teacher}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>{course.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{course.subject}</span>
                  </div>
                </div>
                
                {course.description && (
                  <p className="text-sm text-gray-500 mt-3">{course.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
