import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { calculateHahaAgeAtDate } from '@/lib/age-utils';

// 更新所有对话记录的年龄为计算后的准确年龄
export async function POST() {
  try {
    console.log('开始更新所有记录的年龄...');
    
    // 获取所有对话记录
    const result = await sql`
      SELECT id, date, age
      FROM memories 
      WHERE type = 'conversation'
    `;
    
    console.log(`找到 ${result.rows.length} 条对话记录`);
    
    let updatedCount = 0;
    
    // 遍历每条记录，计算并更新年龄
    for (const record of result.rows) {
      const calculatedAge = calculateHahaAgeAtDate(record.date);
      
      // 只有当计算的年龄与现有年龄不同时才更新
      if (record.age !== calculatedAge) {
        await sql`
          UPDATE memories 
          SET age = ${calculatedAge}, updated_at = NOW()
          WHERE id = ${record.id}
        `;
        
        console.log(`更新记录 ${record.id}: ${record.age} -> ${calculatedAge}`);
        updatedCount++;
      }
    }
    
    console.log(`完成！更新了 ${updatedCount} 条记录`);
    
    return NextResponse.json({
      success: true,
      message: `成功更新了 ${updatedCount} 条记录的年龄`,
      totalRecords: result.rows.length,
      updatedRecords: updatedCount
    });
    
  } catch (error) {
    console.error('更新年龄失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '更新年龄失败',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}