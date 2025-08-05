// 标签颜色配置
export interface TagColorConfig {
  bg: string;
  text: string;
  border: string;
}

// 不同类型标签的颜色配置
const tagColorMap: Record<string, TagColorConfig> = {
  // 家庭关系类 - 蓝色系
  '家人': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  '朋友': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  '老师': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  '同学': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },

  // 情感表达类 - 粉色系
  '好奇': { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-200' },
  '兴奋': { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-200' },
  '开心': { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-200' },
  '生气': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  '害怕': { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' },
  '惊讶': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  '困惑': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },

  // 性格特质类 - 绿色系
  '礼貌': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  '调皮': { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
  '聪明': { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' },
  '勇敢': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  '善良': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  '独立': { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-200' },
  '合作': { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-200' },

  // 活动场景类 - 黄色/橙色系
  '游戏': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  '学习': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  '饮食': { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
  '吃饭': { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
  '洗澡': { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-200' },
  '睡觉': { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' },
  '睡眠': { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' },
  '玩耍': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  '运动': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  '画画': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },

  // 成长发展类 - 紫色/靛蓝系
  '语言发展': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
  '逻辑思维': { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' },
  '想象创造': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
  '情绪管理': { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-200' },
  '社交能力': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  '社交': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  '自理独立': { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-200' },

  // 性格特质类 - 扩展
  '好奇探索': { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-200' },
  '幽默风趣': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  '温柔体贴': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  '坚持专注': { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' },
  '勇敢自信': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  '细心观察': { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-200' },

  // 亲子关系类
  '信任依恋': { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-200' },
  '模仿学习': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  '撒娇任性': { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
  '协商沟通': { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-200' },
  '教学互动': { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' },

  // 记忆价值类
  '第一次': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  '金句名言': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  '温馨时刻': { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-200' },
  '成长瞬间': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  '可爱趣事': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },

  // 地铁相关标签 - 蓝色/青色系
  '地铁': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  '1号线': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  '2号线': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  '3号线': { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
  '4号线': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  '5号线': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  '6号线': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
  '7号线': { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' },
  '8号线': { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-200' },
  '9号线': { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' },
  '13号线': { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-200' },
  '14号线': { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-200' },
  '21号线': { bg: 'bg-lime-100', text: 'text-lime-800', border: 'border-lime-200' },
  'APM线': { bg: 'bg-violet-100', text: 'text-violet-800', border: 'border-violet-200' },
  '广佛线': { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-200' },
  
  // 地铁站点和地点标签
  '地铁站': { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-200' },
  '换乘站': { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' },
  '起点站': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  '终点站': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  '打卡': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  '探索': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
  '旅程': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  '出行': { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-200' },
  
  // 其他常见标签
  '拒绝': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  '决策': { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' },
  '互动': { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-200' },
};

// 默认颜色配置
const defaultTagColor: TagColorConfig = {
  bg: 'bg-gray-100',
  text: 'text-gray-800',
  border: 'border-gray-200'
};

// 获取标签颜色配置
export function getTagColor(tag: string): TagColorConfig {
  return tagColorMap[tag] || defaultTagColor;
}

// 获取标签的完整CSS类名
export function getTagClasses(tag: string): string {
  const config = getTagColor(tag);
  return `px-2 py-1 ${config.bg} ${config.text} ${config.border} text-xs rounded-full border`;
}