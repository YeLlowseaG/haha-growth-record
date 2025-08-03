interface AIServiceConfig {
  qwenKey: string;
  deepseekKey: string;
}

interface AITitleResult {
  title: string;
  tags: string[];
}

export class AIService {
  private qwenKey: string;
  private deepseekKey: string;

  constructor(config: AIServiceConfig) {
    this.qwenKey = config.qwenKey;
    this.deepseekKey = config.deepseekKey;
  }

  // 使用Qwen API生成标题和标签
  async generateTitleWithQwen(content: string): Promise<AITitleResult> {
    try {
      console.log('使用Qwen API生成标题和标签');
      
      const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.qwenKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'qwen-turbo',
          input: {
            messages: [
              {
                role: 'system',
                content: `你是一个专门处理儿童对话记录的AI助手。你的任务是为对话内容生成合适的标题和标签。

## 标题生成规则
- 标题应该简洁明了，8-15字
- 突出对话的核心内容或情感
- 体现哈哈的特点和可爱之处
- 避免过于复杂的描述

## 标签生成规则（选择3-5个最相关的）

### 情感类标签（选择1-2个）
- 好奇：包含"为什么"、"什么"、"怎么"等疑问
- 兴奋：包含"哇"、"好棒"、"太棒了"等感叹
- 开心：包含"开心"、"快乐"、"高兴"等正面情绪
- 生气：包含"不要"、"讨厌"、"生气"等负面情绪
- 害怕：包含"害怕"、"不敢"、"担心"等恐惧情绪
- 害羞：包含"不好意思"、"害羞"、"脸红"等
- 惊讶：包含"啊"、"咦"、"真的吗"等惊讶表达
- 困惑：包含"不知道"、"不明白"、"为什么"等困惑表达

### 关系类标签（选择1个）
- 家人：与父母、祖父母的对话
- 朋友：与同龄朋友的对话
- 老师：与老师或教育者的对话
- 同学：与学校同学的对话
- 亲戚：与亲戚的对话

### 活动类标签（选择1个）
- 游戏：玩耍、游戏相关的对话
- 学习：读书、学习、教育相关的对话
- 吃饭：饮食相关的对话
- 洗澡：洗澡、清洁相关的对话
- 睡觉：睡眠相关的对话
- 玩耍：户外活动、运动相关的对话
- 运动：体育活动的对话
- 画画：艺术创作相关的对话

### 性格类标签（选择1个）
- 礼貌：包含"谢谢"、"请"、"对不起"等礼貌用语
- 调皮：包含恶作剧、捣蛋、不听话等行为
- 聪明：包含机智回答、解决问题等表现
- 勇敢：包含克服困难、尝试新事物等表现
- 善良：包含关心他人、分享等表现
- 独立：包含自己做决定、独立行动等表现
- 合作：包含与他人协作、配合等表现

## 输出格式要求
- 必须是有效的JSON对象
- 包含：title(标题)、tags(标签数组)
- title用8-15字描述对话核心
- tags选择3-5个最相关的标签

## 示例

输入："哈哈说：妈妈我想吃苹果。妈妈说：好的给你一个。哈哈说：谢谢妈妈！"

输出：
{
  "title": "哈哈想吃苹果",
  "tags": ["家人", "礼貌", "饮食"]
}

输入："哈哈右手压在我肩膀上,我跟他讲不要压着我,很不舒服。手挪开了一秒,又放回来。我盯着他,他秒回:我又没压啊。"

输出：
{
  "title": "哈哈调皮压肩膀",
  "tags": ["调皮", "互动", "否认"]
}

输入："妈:你今天开心吗?哈:今天很开心,玩得很快乐。妈:今天跟谁一起玩呢? 哈:跟拉拉、雯雯一起玩。"

输出：
{
  "title": "哈哈分享今天的快乐",
  "tags": ["家人", "开心", "朋友"]
}`
              },
              {
                role: 'user',
                content: content
              }
            ]
          },
          parameters: {
            temperature: 0.3,
            max_tokens: 500
          }
        })
      });

      console.log('Qwen API响应状态:', response.status);

      if (!response.ok) {
        throw new Error(`Qwen API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Qwen API response:', data);
      
      const aiResponse = data.output?.text || 
                        data.output?.choices?.[0]?.message?.content ||
                        data.output?.content ||
                        data.choices?.[0]?.message?.content;
      
      if (!aiResponse) {
        console.error('No AI response from Qwen API');
        throw new Error('No response from Qwen API');
      }

      console.log('AI response text:', aiResponse);

      // 尝试解析JSON响应
      try {
        const parsed = JSON.parse(aiResponse);
        console.log('Parsed AI response:', parsed);
        return {
          title: parsed.title || '哈哈的对话',
          tags: parsed.tags || ['哈哈']
        };
      } catch (parseError) {
        console.error('Failed to parse AI response as JSON:', parseError);
        console.log('Raw AI response:', aiResponse);
        throw new Error('AI返回的格式不正确');
      }
    } catch (error) {
      console.error('Qwen API error:', error);
      throw error;
    }
  }

  // 使用DeepSeek API生成标题和标签
  async generateTitleWithDeepSeek(content: string): Promise<AITitleResult> {
    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.deepseekKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: `你是一个专门处理儿童对话记录的AI助手。你的任务是为对话内容生成合适的标题和标签。

## 标题生成规则
- 标题应该简洁明了，8-15字
- 突出对话的核心内容或情感
- 体现哈哈的特点和可爱之处
- 避免过于复杂的描述

## 标签生成规则（选择3-5个最相关的）

### 情感类标签（选择1-2个）
- 好奇：包含"为什么"、"什么"、"怎么"等疑问
- 兴奋：包含"哇"、"好棒"、"太棒了"等感叹
- 开心：包含"开心"、"快乐"、"高兴"等正面情绪
- 生气：包含"不要"、"讨厌"、"生气"等负面情绪
- 害怕：包含"害怕"、"不敢"、"担心"等恐惧情绪
- 害羞：包含"不好意思"、"害羞"、"脸红"等
- 惊讶：包含"啊"、"咦"、"真的吗"等惊讶表达
- 困惑：包含"不知道"、"不明白"、"为什么"等困惑表达

### 关系类标签（选择1个）
- 家人：与父母、祖父母的对话
- 朋友：与同龄朋友的对话
- 老师：与老师或教育者的对话
- 同学：与学校同学的对话
- 亲戚：与亲戚的对话

### 活动类标签（选择1个）
- 游戏：玩耍、游戏相关的对话
- 学习：读书、学习、教育相关的对话
- 吃饭：饮食相关的对话
- 洗澡：洗澡、清洁相关的对话
- 睡觉：睡眠相关的对话
- 玩耍：户外活动、运动相关的对话
- 运动：体育活动的对话
- 画画：艺术创作相关的对话

### 性格类标签（选择1个）
- 礼貌：包含"谢谢"、"请"、"对不起"等礼貌用语
- 调皮：包含恶作剧、捣蛋、不听话等行为
- 聪明：包含机智回答、解决问题等表现
- 勇敢：包含克服困难、尝试新事物等表现
- 善良：包含关心他人、分享等表现
- 独立：包含自己做决定、独立行动等表现
- 合作：包含与他人协作、配合等表现

## 输出格式要求
- 必须是有效的JSON对象
- 包含：title(标题)、tags(标签数组)
- title用8-15字描述对话核心
- tags选择3-5个最相关的标签

## 示例

输入："哈哈说：妈妈我想吃苹果。妈妈说：好的给你一个。哈哈说：谢谢妈妈！"

输出：
{
  "title": "哈哈想吃苹果",
  "tags": ["家人", "礼貌", "饮食"]
}

输入："哈哈右手压在我肩膀上,我跟他讲不要压着我,很不舒服。手挪开了一秒,又放回来。我盯着他,他秒回:我又没压啊。"

输出：
{
  "title": "哈哈调皮压肩膀",
  "tags": ["调皮", "互动", "否认"]
}

输入："妈:你今天开心吗?哈:今天很开心,玩得很快乐。妈:今天跟谁一起玩呢? 哈:跟拉拉、雯雯一起玩。"

输出：
{
  "title": "哈哈分享今天的快乐",
  "tags": ["家人", "开心", "朋友"]
}`
            },
            {
              role: 'user',
              content: content
            }
          ],
          temperature: 0.3,
          max_tokens: 500
        })
      });

      console.log('DeepSeek API响应状态:', response.status);

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('DeepSeek API response:', data);
      
      const aiResponse = data.choices?.[0]?.message?.content;
      
      if (!aiResponse) {
        console.error('No AI response from DeepSeek API');
        throw new Error('No response from DeepSeek API');
      }

      console.log('AI response text:', aiResponse);

      // 尝试解析JSON响应
      try {
        const parsed = JSON.parse(aiResponse);
        console.log('Parsed AI response:', parsed);
        return {
          title: parsed.title || '哈哈的对话',
          tags: parsed.tags || ['哈哈']
        };
      } catch (parseError) {
        console.error('Failed to parse AI response as JSON:', parseError);
        console.log('Raw AI response:', aiResponse);
        throw new Error('AI返回的格式不正确');
      }
    } catch (error) {
      console.error('DeepSeek API error:', error);
      throw error;
    }
  }

  // 智能选择API生成标题和标签
  async generateTitle(content: string, preferredAPI: 'qwen' | 'deepseek' = 'qwen'): Promise<AITitleResult> {
    console.log('开始生成标题和标签，选择的API:', preferredAPI);
    
    if (preferredAPI === 'qwen') {
      return await this.generateTitleWithQwen(content);
    } else {
      return await this.generateTitleWithDeepSeek(content);
    }
  }

  // 测试API连接
  async testAPI(apiType: 'qwen' | 'deepseek'): Promise<boolean> {
    try {
      const testContent = "测试对话内容";
      if (apiType === 'qwen') {
        await this.generateTitleWithQwen(testContent);
      } else {
        await this.generateTitleWithDeepSeek(testContent);
      }
      return true;
    } catch (error) {
      console.error(`${apiType} API测试失败:`, error);
      return false;
    }
  }
} 