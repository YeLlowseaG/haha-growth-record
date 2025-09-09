import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { Todo } from '@/types';

// PUT - 更新待办事项
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { title, description, priority, status, dueDate, tags } = body;
    
    if (!title || !title.trim()) {
      return NextResponse.json({ error: '标题不能为空' }, { status: 400 });
    }
    
    const completedAt = status === 'completed' ? 'NOW()' : null;
    
    const result = await sql`
      UPDATE todos 
      SET 
        title = ${title.trim()},
        description = ${description || null},
        priority = ${priority || 'medium'},
        status = ${status || 'pending'},
        due_date = ${dueDate || null},
        tags = ${JSON.stringify(tags || [])},
        updated_at = NOW(),
        completed_at = ${completedAt}
      WHERE id = ${id}
      RETURNING *
    `;
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: '待办事项不存在' }, { status: 404 });
    }
    
    const todo = result.rows[0];
    const formattedTodo: Todo = {
      id: todo.id,
      title: todo.title,
      description: todo.description,
      priority: todo.priority,
      status: todo.status,
      dueDate: todo.due_date,
      tags: Array.isArray(todo.tags) ? todo.tags : (todo.tags ? JSON.parse(todo.tags) : []),
      createdAt: todo.created_at,
      updatedAt: todo.updated_at,
      completedAt: todo.completed_at
    };
    
    return NextResponse.json(formattedTodo);
  } catch (error) {
    console.error('更新待办事项失败:', error);
    return NextResponse.json({ error: '更新待办事项失败' }, { status: 500 });
  }
}

// DELETE - 删除待办事项
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    const result = await sql`
      DELETE FROM todos 
      WHERE id = ${id}
      RETURNING id
    `;
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: '待办事项不存在' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除待办事项失败:', error);
    return NextResponse.json({ error: '删除待办事项失败' }, { status: 500 });
  }
}