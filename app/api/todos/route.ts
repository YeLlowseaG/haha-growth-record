import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { Todo } from '@/types';

// GET - 获取待办事项列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const search = searchParams.get('search');
    
    const offset = (page - 1) * limit;
    
    // 构建查询条件
    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;
    
    if (status && status !== 'all') {
      whereConditions.push(`status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }
    
    if (priority && priority !== 'all') {
      whereConditions.push(`priority = $${paramIndex}`);
      queryParams.push(priority);
      paramIndex++;
    }
    
    if (search && search.trim()) {
      whereConditions.push(`(title ILIKE $${paramIndex} OR description ILIKE $${paramIndex + 1} OR tags::text ILIKE $${paramIndex + 2})`);
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
      paramIndex += 3;
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    // 获取总数
    const countQuery = `
      SELECT COUNT(*) as count 
      FROM todos 
      ${whereClause}
    `;
    const countResult = await sql.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].count);
    
    // 获取数据
    const dataQuery = `
      SELECT * FROM todos 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    queryParams.push(limit, offset);
    
    const result = await sql.query(dataQuery, queryParams);
    
    const todos: Todo[] = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      priority: row.priority,
      status: row.status,
      dueDate: row.due_date,
      tags: Array.isArray(row.tags) ? row.tags : (row.tags ? JSON.parse(row.tags) : []),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      completedAt: row.completed_at
    }));
    
    return NextResponse.json({
      todos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: offset + todos.length < total
      }
    });
  } catch (error) {
    console.error('获取待办事项失败:', error);
    return NextResponse.json({ error: '获取待办事项失败' }, { status: 500 });
  }
}

// POST - 创建新的待办事项
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, priority, status, dueDate, tags } = body;
    
    if (!title || !title.trim()) {
      return NextResponse.json({ error: '标题不能为空' }, { status: 400 });
    }
    
    const result = await sql`
      INSERT INTO todos (title, description, priority, status, due_date, tags, created_at, updated_at, completed_at)
      VALUES (
        ${title.trim()},
        ${description || null},
        ${priority || 'medium'},
        ${status || 'pending'},
        ${dueDate || null},
        ${JSON.stringify(tags || [])},
        NOW(),
        NOW(),
        ${status === 'completed' ? 'NOW()' : null}
      )
      RETURNING *
    `;
    
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
    
    return NextResponse.json(formattedTodo, { status: 201 });
  } catch (error) {
    console.error('创建待办事项失败:', error);
    return NextResponse.json({ error: '创建待办事项失败' }, { status: 500 });
  }
}