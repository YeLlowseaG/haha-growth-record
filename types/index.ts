export interface Memory {
  id: string;
  type: 'conversation' | 'photo' | 'video';
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
  imageUrl: string;
  location?: string;
}

export interface Video extends Memory {
  type: 'video';
  videoUrl: string;
  duration?: number;
  thumbnail?: string;
}

export type MemoryType = Conversation | Photo | Video; 