-- 创建哈哈的成长记录数据库表
CREATE TABLE IF NOT EXISTS memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) NOT NULL,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  date DATE NOT NULL,
  tags JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 对话特有字段
  child_name VARCHAR(100),
  age VARCHAR(50),
  context TEXT,
  
  -- 照片特有字段  
  image_urls JSONB DEFAULT '[]',
  image_url TEXT,
  location VARCHAR(200)
);

-- 创建索引提高查询性能
CREATE INDEX IF NOT EXISTS idx_memories_type ON memories(type);
CREATE INDEX IF NOT EXISTS idx_memories_date ON memories(date);
CREATE INDEX IF NOT EXISTS idx_memories_created_at ON memories(created_at);