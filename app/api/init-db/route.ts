import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST() {
  try {
    // 读取SQL初始化脚本
    const sqlPath = path.join(process.cwd(), 'scripts', 'init-db.sql');
    const initSQL = fs.readFileSync(sqlPath, 'utf8');
    
    // 执行初始化SQL
    await sql.query(initSQL);
    
    return NextResponse.json({ 
      message: '数据库初始化成功！',
      success: true 
    });
  } catch (error) {
    console.error('数据库初始化失败:', error);
    return NextResponse.json({ 
      error: '数据库初始化失败',
      details: error instanceof Error ? error.message : '未知错误',
      success: false 
    }, { status: 500 });
  }
}