import { sql } from '@vercel/postgres';
import { NextRequest, NextResponse } from 'next/server';
import { MemoryType, Conversation, Photo } from '@/types';

// 更新记录
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const memory: MemoryType = await request.json();
    
    if (memory.type === 'conversation') {
      const conv = memory as Conversation;
      const result = await sql`
        UPDATE memories SET
          type = ${conv.type},
          title = ${conv.title},
          content = ${conv.content},
          date = ${conv.date},
          tags = ${JSON.stringify(conv.tags)},
          child_name = ${conv.childName},
          age = ${conv.age || null},
          context = ${conv.context || null},
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: '记录不存在' },
          { status: 404 }
        );
      }
      
      const row = result.rows[0];
      const updatedMemory: Conversation = {
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
      
      return NextResponse.json(updatedMemory);
    } else {
      const photo = memory as Photo;
      const result = await sql`
        UPDATE memories SET
          type = ${photo.type},
          title = ${photo.title},
          content = ${photo.content},
          date = ${photo.date},
          tags = ${JSON.stringify(photo.tags)},
          image_urls = ${JSON.stringify(photo.imageUrls)},
          image_url = ${photo.imageUrls?.[0] || null},
          location = ${photo.location || null},
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: '记录不存在' },
          { status: 404 }
        );
      }
      
      const row = result.rows[0];
      const updatedMemory: Photo = {
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
      
      return NextResponse.json(updatedMemory);
    }
  } catch (error) {
    console.error('更新记录失败:', error);
    return NextResponse.json(
      { error: '更新记录失败' },
      { status: 500 }
    );
  }
}

// 删除记录
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const result = await sql`
      DELETE FROM memories WHERE id = ${id}
      RETURNING id
    `;
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: '记录不存在' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      message: '删除成功',
      id: result.rows[0].id 
    });
  } catch (error) {
    console.error('删除记录失败:', error);
    return NextResponse.json(
      { error: '删除记录失败' },
      { status: 500 }
    );
  }
}