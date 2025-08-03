// Word文档解析工具

export interface ParsedWordContent {
  title: string;
  content: string;
  date?: string;
  tags: string[];
  sections: WordSection[];
}

export interface WordSection {
  title: string;
  content: string;
  date?: string;
  tags: string[];
}

// 解析Word文档内容
export const parseWordContent = (text: string): ParsedWordContent => {
  const lines = text.split('\n').filter(line => line.trim());
  const sections: WordSection[] = [];
  
  let currentSection: WordSection | null = null;
  let currentDate = new Date().toISOString().split('T')[0];
  let mainTitle = '哈哈的对话记录';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // 检查是否是日期行 (格式: 2022.3.30 或 2022-03-30 或 2022年3月30日)
    const dateMatch = line.match(/^(\d{4})[.-年](\d{1,2})[.-月](\d{1,2})/);
    if (dateMatch) {
      // 保存之前的段落
      if (currentSection && currentSection.content.trim()) {
        sections.push(currentSection);
      }
      
      // 开始新段落
      currentDate = `${dateMatch[1]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[3].padStart(2, '0')}`;
      currentSection = {
        title: `哈哈的对话 - ${currentDate}`,
        content: '',
        date: currentDate,
        tags: ['导入', '哈哈', '对话']
      };
      continue;
    }
    
    // 检查是否是标题行
    if (isTitleLine(line)) {
      if (currentSection && currentSection.content.trim()) {
        sections.push(currentSection);
      }
      
      currentSection = {
        title: line,
        content: '',
        date: currentDate,
        tags: ['导入', '哈哈', '对话']
      };
      continue;
    }
    
    // 检查是否是主标题
    if (line.includes('哈哈') && (line.includes('对话') || line.includes('记录'))) {
      mainTitle = line;
      continue;
    }
    
    // 添加到当前段落内容
    if (currentSection) {
      if (currentSection.content) {
        currentSection.content += '\n' + line;
      } else {
        currentSection.content = line;
      }
    } else {
      // 如果没有当前段落，创建一个默认段落
      currentSection = {
        title: `哈哈的对话 - ${currentDate}`,
        content: line,
        date: currentDate,
        tags: ['导入', '哈哈', '对话']
      };
    }
  }
  
  // 添加最后一个段落
  if (currentSection && currentSection.content.trim()) {
    sections.push(currentSection);
  }
  
  // 如果没有找到任何段落，创建一个默认段落
  if (sections.length === 0) {
    sections.push({
      title: mainTitle,
      content: text,
      date: currentDate,
      tags: ['导入', '哈哈', '对话']
    });
  }
  
  return {
    title: mainTitle,
    content: text,
    date: currentDate,
    tags: ['导入', '哈哈', '对话'],
    sections
  };
};

// 判断是否是标题行
const isTitleLine = (line: string): boolean => {
  // 包含"对话"但不包含冒号，且长度较短
  if (line.includes('对话') && !line.includes('：') && !line.includes(':') && line.length < 30) {
    return true;
  }
  
  // 包含"哈哈"且长度较短
  if (line.includes('哈哈') && line.length < 20) {
    return true;
  }
  
  // 以数字开头的行（可能是章节标题）
  if (/^\d+[.、]/.test(line) && line.length < 50) {
    return true;
  }
  
  return false;
};

// 生成智能标签
export const generateTags = (content: string): string[] => {
  const tags = ['导入', '哈哈'];
  
  // 根据内容生成标签
  if (content.includes('爸爸') || content.includes('妈妈')) {
    tags.push('家庭');
  }
  
  if (content.includes('学校') || content.includes('老师') || content.includes('同学')) {
    tags.push('学校');
  }
  
  if (content.includes('玩具') || content.includes('游戏')) {
    tags.push('游戏');
  }
  
  if (content.includes('吃饭') || content.includes('食物')) {
    tags.push('饮食');
  }
  
  if (content.includes('睡觉') || content.includes('床')) {
    tags.push('睡眠');
  }
  
  if (content.includes('哭') || content.includes('笑')) {
    tags.push('情绪');
  }
  
  return tags;
};

// 清理文本内容
export const cleanTextContent = (text: string): string => {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[^\S\n]+/g, ' ') // 合并多个空格
    .trim();
};

// 提取对话内容
export const extractConversations = (text: string): string[] => {
  const conversations: string[] = [];
  const lines = text.split('\n');
  
  let currentConversation = '';
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // 如果行包含引号，可能是对话
    if (trimmedLine.includes('"') || trimmedLine.includes('"') || trimmedLine.includes('：')) {
      if (currentConversation) {
        currentConversation += '\n' + trimmedLine;
      } else {
        currentConversation = trimmedLine;
      }
    } else if (currentConversation) {
      // 结束当前对话
      conversations.push(currentConversation);
      currentConversation = '';
    }
  }
  
  // 添加最后一个对话
  if (currentConversation) {
    conversations.push(currentConversation);
  }
  
  return conversations;
}; 