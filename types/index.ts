export interface Memory {
  id: string;
  type: 'conversation' | 'photo';
  title: string;
  content: string;
  date: string;
  tags: string[];
  mediaUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation extends Memory {
  type: 'conversation';
  childName: string;
  age: string;
  context?: string;
}

export interface Photo extends Memory {
  type: 'photo';
  imageUrls: string[];
  imageUrl?: string; // 保持向后兼容
  location?: string;
}

export type MemoryType = Conversation | Photo;

// 待办事项相关类型
export interface Todo {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  dueDate?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

// 每日作业相关类型
export interface DailyTask {
  id: string;
  title: string;
  description?: string;
  subject: string; // 科目
  status: 'pending' | 'in_progress' | 'completed';
  dueDate: string; // 作业截止日期
  estimatedTime?: number; // 预计完成时间（分钟）
  actualTime?: number; // 实际完成时间（分钟）
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  attachments?: string[]; // 附件链接
  notes?: string; // 备注
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

// 课程表相关类型
export interface Course {
  id: string;
  name: string;
  subject: string; // 科目
  teacher?: string;
  location?: string;
  color: string; // 课程颜色
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Schedule {
  id: string;
  courseId: string;
  course: Course;
  dayOfWeek: number; // 0-6 (周日-周六)
  startTime: string; // HH:mm 格式
  endTime: string; // HH:mm 格式
  isRecurring: boolean; // 是否重复
  startDate: string; // 开始日期
  endDate?: string; // 结束日期
  createdAt: string;
  updatedAt: string;
}

// 梦想相关类型
export interface Dream {
  id: string;
  title: string;
  description: string;
  category: 'career' | 'personal' | 'academic' | 'hobby' | 'family' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'idea' | 'planning' | 'in_progress' | 'achieved' | 'paused' | 'cancelled';
  targetDate?: string; // 目标完成日期
  progress: number; // 进度百分比 0-100
  milestones: DreamMilestone[]; // 里程碑
  tags: string[];
  imageUrl?: string; // 梦想图片
  notes?: string; // 备注
  createdAt: string;
  updatedAt: string;
  achievedAt?: string; // 实现日期
}

export interface DreamMilestone {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
}

// 梦想分类配置
export const DREAM_CATEGORIES = {
  career: { name: '职业梦想', icon: '💼', color: 'blue' },
  personal: { name: '个人成长', icon: '🌱', color: 'green' },
  academic: { name: '学习目标', icon: '📚', color: 'purple' },
  hobby: { name: '兴趣爱好', icon: '🎨', color: 'pink' },
  family: { name: '家庭愿望', icon: '👨‍👩‍👧‍👦', color: 'orange' },
  other: { name: '其他', icon: '⭐', color: 'gray' }
} as const;

// 统计数据类型
export interface DashboardStats {
  totalMemories: number;
  totalTodos: number;
  completedTodos: number;
  pendingTodos: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  upcomingCourses: number;
  totalDreams: number;
  activeDreams: number;
  achievedDreams: number;
} 