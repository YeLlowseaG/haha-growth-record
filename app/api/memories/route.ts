import { sql } from '@vercel/postgres';
import { NextRequest, NextResponse } from 'next/server';
import { MemoryType, Conversation, Photo } from '@/types';

// 获取所有记录
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    
    let query = 'SELECT * FROM memories';
    const conditions: string[] = [];
    const values: any[] = [];
    
    if (type && type !== 'all') {
      conditions.push(`type = $${values.length + 1}`);
      values.push(type);
    }
    
    if (search) {
      conditions.push(`(title ILIKE $${values.length + 1} OR content ILIKE $${values.length + 2} OR $${values.length + 3} = ANY(tags))`);
      values.push(`%${search}%`, `%${search}%`, search);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await sql.query(query, values);
    
    // 转换数据库行为前端类型
    const memories: MemoryType[] = result.rows.map(row => {
      if (row.type === 'conversation') {
        return {
          id: row.id,
          type: 'conversation',
          title: row.title,
          content: row.content,
          date: row.date,
          tags: Array.isArray(row.tags) ? row.tags : (typeof row.tags === 'string' ? JSON.parse(row.tags) : (row.tags || [])),
          childName: row.child_name,
          age: row.age,
          context: row.context,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        } as Conversation;
      } else {
        return {
          id: row.id,
          type: 'photo',
          title: row.title,
          content: row.content,
          date: row.date,
          tags: Array.isArray(row.tags) ? row.tags : (typeof row.tags === 'string' ? JSON.parse(row.tags) : (row.tags || [])),
          imageUrls: Array.isArray(row.image_urls) ? row.image_urls : (typeof row.image_urls === 'string' ? JSON.parse(row.image_urls) : (row.image_urls || [])),
          imageUrl: row.image_url,
          location: row.location,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        } as Photo;
      }
    });
    
    return NextResponse.json(memories);
  } catch (error) {
    console.error('获取记录失败:', error);
    return NextResponse.json(
      { error: '获取记录失败' },
      { status: 500 }
    );
  }
}

// 创建新记录
export async function POST(request: NextRequest) {
  try {
    const memory: MemoryType = await request.json();
    
    if (memory.type === 'conversation') {
      const conv = memory as Conversation;
      const result = await sql`
        INSERT INTO memories (
          id, type, title, content, date, tags,
          child_name, age, context
        ) VALUES (
          ${conv.id}, ${conv.type}, ${conv.title}, ${conv.content}, ${conv.date}, ${JSON.stringify(conv.tags)},
          ${conv.childName}, ${conv.age || null}, ${conv.context || null}
        )
        RETURNING *
      `;
      
      const row = result.rows[0];
      const savedMemory: Conversation = {
        id: row.id,
        type: 'conversation',
        title: row.title,
        content: row.content,
        date: row.date,
        tags: Array.isArray(row.tags) ? row.tags : (row.tags ? JSON.parse(row.tags) : []),
        childName: row.child_name,
        age: row.age,
        context: row.context,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
      
      return NextResponse.json(savedMemory);
    } else {
      const photo = memory as Photo;
      const result = await sql`
        INSERT INTO memories (
          id, type, title, content, date, tags,
          image_urls, image_url, location
        ) VALUES (
          ${photo.id}, ${photo.type}, ${photo.title}, ${photo.content}, ${photo.date}, ${JSON.stringify(photo.tags)},
          ${JSON.stringify(photo.imageUrls)}, ${photo.imageUrls?.[0] || null}, ${photo.location || null}
        )
        RETURNING *
      `;
      
      const row = result.rows[0];
      const savedMemory: Photo = {
        id: row.id,
        type: 'photo',
        title: row.title,
        content: row.content,
        date: row.date,
        tags: Array.isArray(row.tags) ? row.tags : (row.tags ? JSON.parse(row.tags) : []),
        imageUrls: Array.isArray(row.image_urls) ? row.image_urls : (row.image_urls ? JSON.parse(row.image_urls) : []),
        imageUrl: row.image_url,
        location: row.location,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
      
      return NextResponse.json(savedMemory);
    }
  } catch (error) {
    console.error('创建记录失败:', error);
    return NextResponse.json(
      { error: '创建记录失败' },
      { status: 500 }
    );
  }
}