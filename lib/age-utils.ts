// 哈哈的生日：2019年7月19日
export const HAHA_BIRTHDAY = new Date('2019-07-19');

/**
 * 计算哈哈的真实年龄
 * @param targetDate 目标日期，默认为今天
 * @returns 返回年龄字符串，如 "5岁2个月" 或 "2岁11个月"
 */
export function calculateHahaAge(targetDate: Date = new Date()): string {
  const birthYear = HAHA_BIRTHDAY.getFullYear();
  const birthMonth = HAHA_BIRTHDAY.getMonth();
  const birthDay = HAHA_BIRTHDAY.getDate();
  
  const targetYear = targetDate.getFullYear();
  const targetMonth = targetDate.getMonth();
  const targetDay = targetDate.getDate();
  
  let years = targetYear - birthYear;
  let months = targetMonth - birthMonth;
  
  // 如果目标日期还没到生日那天，年龄减1，月份调整
  if (targetDay < birthDay) {
    months--;
  }
  
  // 如果月份为负，年龄减1，月份加12
  if (months < 0) {
    years--;
    months += 12;
  }
  
  // 格式化输出
  if (years === 0) {
    return `${months}个月`;
  } else if (months === 0) {
    return `${years}岁`;
  } else {
    return `${years}岁${months}个月`;
  }
}

/**
 * 根据记录日期计算哈哈当时的年龄
 * @param recordDate 记录的日期字符串 "YYYY-MM-DD"
 * @returns 返回年龄字符串
 */
export function calculateHahaAgeAtDate(recordDate: string): string {
  const date = new Date(recordDate);
  return calculateHahaAge(date);
}

/**
 * 获取哈哈当前的年龄
 * @returns 返回当前年龄字符串
 */
export function getCurrentHahaAge(): string {
  return calculateHahaAge();
}