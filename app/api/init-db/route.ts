import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST() {
  try {
    console.log('开始初始化数据库...');
    
    // 读取SQL初始化脚本
    const sqlPath = path.join(process.cwd(), 'scripts', 'init-db.sql');
    console.log('SQL文件路径:', sqlPath);
    
    const initSQL = fs.readFileSync(sqlPath, 'utf8');
    console.log('SQL内容长度:', initSQL.length);
    
    // 执行初始化SQL
    const result = await sql.query(initSQL);
    console.log('数据库初始化结果:', result);
    
    return NextResponse.json({ 
      message: '数据库初始化成功！',
      success: true 
    });
  } catch (error) {
    console.error('数据库初始化失败:', error);
    return NextResponse.json({ 
      error: '数据库初始化失败',
      details: error instanceof Error ? error.message : '未知错误',
      stack: error instanceof Error ? error.stack : null,
      success: false 
    }, { status: 500 });
  }
}