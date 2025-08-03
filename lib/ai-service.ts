interface AIServiceConfig {
  qwenKey: string;
  deepseekKey: string;
}

interface ConversationGroup {
  content: string;
  date?: string;
  tags: string[];
  context?: string;
}

export class AIService {
  private qwenKey: string;
  private deepseekKey: string;

  constructor(config: AIServiceConfig) {
    this.qwenKey = config.qwenKey;
    this.deepseekKey = config.deepseekKey;
  }

  // 使用Qwen API处理对话
  async processWithQwen(text: string): Promise<ConversationGroup[]> {
    try {
      console.log('使用Qwen API，密钥:', this.qwenKey.substring(0, 10) + '...');
      
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
                content: `你是一个专门处理儿童对话记录的AI助手。你的任务是将输入的文本分割成有意义的对话片段。

核心原则：
1. 保持对话的自然完整性 - 不要过度分割
2. 只在明确的时间、场景或主题转换时分割
3. 每个片段应该是一个完整的对话场景
4. 尊重原文格式，不要修改对话内容
5. 优先保持对话的连贯性

分割标准（按优先级）：
1. 时间转换：看到"然后"、"接着"、"后来"、"过了一会儿"、"第二天"、"晚上"、"早上"、"洗澡时"、"吃饭时"等
2. 场景转换：从"洗澡时"到"吃饭时"，从"家里"到"外面"，从"客厅"到"卧室"等
3. 主题转换：从"吃饭"话题转到"游戏"话题，从"学习"转到"玩耍"，从"玩具"转到"故事"等
4. 对话对象变化：从"妈妈"换成"爸爸"，从"家人"换成"朋友"，从"哈哈"换成"其他孩子"等
5. 话题转换：当对话明显转向新的话题时（如从"今天开心吗"转到"和谁一起玩"）
6. 动作与对话转换：从描述动作转向对话，或从对话转向动作描述

特别注意：
- 如果对话很短（少于3轮），通常不需要分割
- 如果对话是连续的问答，即使有"然后"也不一定要分割
- 只有在明显的时间间隔或场景变化时才分割
- 儿童对话经常跳跃，要理解这是正常的，不要过度分割
- 关注对话的情感连贯性，而不是机械地按时间分割
- 长对话（超过5轮）应该考虑按话题分割

标签生成规则（选择最相关的2-4个）：
- 情感类：好奇、兴奋、开心、生气、害怕、害羞、惊讶、困惑
- 关系类：家人、朋友、老师、同学、亲戚
- 活动类：游戏、学习、吃饭、洗澡、睡觉、玩耍、运动、画画
- 性格类：礼貌、调皮、聪明、勇敢、善良、独立、合作
- 场景类：家里、外面、学校、公园、商场、医院、游乐场
- 主题类：饮食、教育、娱乐、健康、社交、成长

输出格式要求：
- 必须是有效的JSON数组
- 每个对象包含：content(对话内容)、date(日期，可选)、tags(标签数组)、context(简短描述)
- content保持原文格式，不要修改对话内容
- context用8-12字描述对话场景，突出关键信息
- tags选择2-4个最相关的标签

示例：
输入："哈哈说：妈妈我想吃苹果。妈妈说：好的给你一个。哈哈说：谢谢妈妈！然后哈哈又问：妈妈我可以看电视吗？"

输出：
[
  {
    "content": "哈哈说：妈妈我想吃苹果。妈妈说：好的给你一个。哈哈说：谢谢妈妈！",
    "date": "2024-01-01",
    "tags": ["家人", "礼貌", "饮食"],
    "context": "哈哈和妈妈关于吃苹果的对话"
  },
  {
    "content": "然后哈哈又问：妈妈我可以看电视吗？",
    "date": "2024-01-01", 
    "tags": ["家人", "好奇", "娱乐"],
    "context": "哈哈询问看电视的对话"
  }
]

动作对话示例：
输入："哈哈右手压在我肩膀上,我跟他讲不要压着我,很不舒服。手挪开了一秒,又放回来。我盯着他,他秒回:我又没压啊。"

输出：
[
  {
    "content": "哈哈右手压在我肩膀上,我跟他讲不要压着我,很不舒服。手挪开了一秒,又放回来。",
    "date": "2024-01-01",
    "tags": ["调皮", "互动", "拒绝"],
    "context": "哈哈调皮地压肩膀，被拒绝后挪开"
  },
  {
    "content": "我盯着他,他秒回:我又没压啊。",
    "date": "2024-01-01",
    "tags": ["调皮", "互动", "否认"],
    "context": "哈哈被盯着时否认压肩膀"
  }
]

长对话示例：
输入："妈:你今天开心吗?哈:今天很开心,玩得很快乐。妈:今天跟谁一起玩呢? 哈:跟拉拉、雯雯一起玩。妈:你有几个好朋友?哈:我有两个好朋友。妈:谁是你的好朋友?哈:妈妈是我的好朋友,爸爸是我的好朋友。妈:拉拉和雯雯是不是你的好朋友?哈:不是,雯雯是别人家的女儿。妈:哦,对,雯雯是别人家的女儿,那拉拉呢? 哈:不知道。妈:拉拉也是别人家的女儿,那别人家的女儿是你的好朋友吗?哈:不是,还不是,过段时间就是了,3月31号就是了。妈:噢,这样啊。"

输出：
[
  {
    "content": "妈:你今天开心吗?哈:今天很开心,玩得很快乐。",
    "date": "2024-01-01",
    "tags": ["家人", "开心", "情感"],
    "context": "妈妈询问哈哈今天是否开心"
  },
  {
    "content": "妈:今天跟谁一起玩呢? 哈:跟拉拉、雯雯一起玩。",
    "date": "2024-01-01",
    "tags": ["家人", "社交", "朋友"],
    "context": "妈妈询问哈哈和谁一起玩"
  },
  {
    "content": "妈:你有几个好朋友?哈:我有两个好朋友。妈:谁是你的好朋友?哈:妈妈是我的好朋友,爸爸是我的好朋友。",
    "date": "2024-01-01",
    "tags": ["家人", "情感", "社交"],
    "context": "妈妈询问哈哈的好朋友"
  },
  {
    "content": "妈:拉拉和雯雯是不是你的好朋友?哈:不是,雯雯是别人家的女儿。妈:哦,对,雯雯是别人家的女儿,那拉拉呢? 哈:不知道。妈:拉拉也是别人家的女儿,那别人家的女儿是你的好朋友吗?哈:不是,还不是,过段时间就是了,3月31号就是了。妈:噢,这样啊。",
    "date": "2024-01-01",
    "tags": ["家人", "好奇", "社交"],
    "context": "妈妈询问关于拉拉和雯雯是否是好朋友"
  }
]`
              },
              {
                role: 'user',
                content: text
              }
            ]
          },
          parameters: {
            temperature: 0.3,
            max_tokens: 2000
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
        return Array.isArray(parsed) ? parsed : [parsed];
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

  // 使用DeepSeek API处理对话
  async processWithDeepSeek(text: string): Promise<ConversationGroup[]> {
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
              content: `你是一个专门处理儿童对话记录的AI助手。你的任务是将输入的文本分割成有意义的对话片段。

核心原则：
1. 保持对话的自然完整性 - 不要过度分割
2. 只在明确的时间、场景或主题转换时分割
3. 每个片段应该是一个完整的对话场景
4. 尊重原文格式，不要修改对话内容
5. 优先保持对话的连贯性

分割标准（按优先级）：
1. 时间转换：看到"然后"、"接着"、"后来"、"过了一会儿"、"第二天"、"晚上"、"早上"、"洗澡时"、"吃饭时"等
2. 场景转换：从"洗澡时"到"吃饭时"，从"家里"到"外面"，从"客厅"到"卧室"等
3. 主题转换：从"吃饭"话题转到"游戏"话题，从"学习"转到"玩耍"，从"玩具"转到"故事"等
4. 对话对象变化：从"妈妈"换成"爸爸"，从"家人"换成"朋友"，从"哈哈"换成"其他孩子"等
5. 话题转换：当对话明显转向新的话题时（如从"今天开心吗"转到"和谁一起玩"）
6. 动作与对话转换：从描述动作转向对话，或从对话转向动作描述

特别注意：
- 如果对话很短（少于3轮），通常不需要分割
- 如果对话是连续的问答，即使有"然后"也不一定要分割
- 只有在明显的时间间隔或场景变化时才分割
- 儿童对话经常跳跃，要理解这是正常的，不要过度分割
- 关注对话的情感连贯性，而不是机械地按时间分割
- 长对话（超过5轮）应该考虑按话题分割

标签生成规则（选择最相关的2-4个）：
- 情感类：好奇、兴奋、开心、生气、害怕、害羞、惊讶、困惑
- 关系类：家人、朋友、老师、同学、亲戚
- 活动类：游戏、学习、吃饭、洗澡、睡觉、玩耍、运动、画画
- 性格类：礼貌、调皮、聪明、勇敢、善良、独立、合作
- 场景类：家里、外面、学校、公园、商场、医院、游乐场
- 主题类：饮食、教育、娱乐、健康、社交、成长

输出格式要求：
- 必须是有效的JSON数组
- 每个对象包含：content(对话内容)、date(日期，可选)、tags(标签数组)、context(简短描述)
- content保持原文格式，不要修改对话内容
- context用8-12字描述对话场景，突出关键信息
- tags选择2-4个最相关的标签

示例：
输入："哈哈说：妈妈我想吃苹果。妈妈说：好的给你一个。哈哈说：谢谢妈妈！然后哈哈又问：妈妈我可以看电视吗？"

输出：
[
  {
    "content": "哈哈说：妈妈我想吃苹果。妈妈说：好的给你一个。哈哈说：谢谢妈妈！",
    "date": "2024-01-01",
    "tags": ["家人", "礼貌", "饮食"],
    "context": "哈哈和妈妈关于吃苹果的对话"
  },
  {
    "content": "然后哈哈又问：妈妈我可以看电视吗？",
    "date": "2024-01-01", 
    "tags": ["家人", "好奇", "娱乐"],
    "context": "哈哈询问看电视的对话"
  }
]

动作对话示例：
输入："哈哈右手压在我肩膀上,我跟他讲不要压着我,很不舒服。手挪开了一秒,又放回来。我盯着他,他秒回:我又没压啊。"

输出：
[
  {
    "content": "哈哈右手压在我肩膀上,我跟他讲不要压着我,很不舒服。手挪开了一秒,又放回来。",
    "date": "2024-01-01",
    "tags": ["调皮", "互动", "拒绝"],
    "context": "哈哈调皮地压肩膀，被拒绝后挪开"
  },
  {
    "content": "我盯着他,他秒回:我又没压啊。",
    "date": "2024-01-01",
    "tags": ["调皮", "互动", "否认"],
    "context": "哈哈被盯着时否认压肩膀"
  }
]

长对话示例：
输入："妈:你今天开心吗?哈:今天很开心,玩得很快乐。妈:今天跟谁一起玩呢? 哈:跟拉拉、雯雯一起玩。妈:你有几个好朋友?哈:我有两个好朋友。妈:谁是你的好朋友?哈:妈妈是我的好朋友,爸爸是我的好朋友。妈:拉拉和雯雯是不是你的好朋友?哈:不是,雯雯是别人家的女儿。妈:哦,对,雯雯是别人家的女儿,那拉拉呢? 哈:不知道。妈:拉拉也是别人家的女儿,那别人家的女儿是你的好朋友吗?哈:不是,还不是,过段时间就是了,3月31号就是了。妈:噢,这样啊。"

输出：
[
  {
    "content": "妈:你今天开心吗?哈:今天很开心,玩得很快乐。",
    "date": "2024-01-01",
    "tags": ["家人", "开心", "情感"],
    "context": "妈妈询问哈哈今天是否开心"
  },
  {
    "content": "妈:今天跟谁一起玩呢? 哈:跟拉拉、雯雯一起玩。",
    "date": "2024-01-01",
    "tags": ["家人", "社交", "朋友"],
    "context": "妈妈询问哈哈和谁一起玩"
  },
  {
    "content": "妈:你有几个好朋友?哈:我有两个好朋友。妈:谁是你的好朋友?哈:妈妈是我的好朋友,爸爸是我的好朋友。",
    "date": "2024-01-01",
    "tags": ["家人", "情感", "社交"],
    "context": "妈妈询问哈哈的好朋友"
  },
  {
    "content": "妈:拉拉和雯雯是不是你的好朋友?哈:不是,雯雯是别人家的女儿。妈:哦,对,雯雯是别人家的女儿,那拉拉呢? 哈:不知道。妈:拉拉也是别人家的女儿,那别人家的女儿是你的好朋友吗?哈:不是,还不是,过段时间就是了,3月31号就是了。妈:噢,这样啊。",
    "date": "2024-01-01",
    "tags": ["家人", "好奇", "社交"],
    "context": "妈妈询问关于拉拉和雯雯是否是好朋友"
  }
]`
            },
            {
              role: 'user',
              content: text
            }
          ],
          temperature: 0.3,
          max_tokens: 2000
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
        return Array.isArray(parsed) ? parsed : [parsed];
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

  // 智能选择API处理
  async processText(text: string, preferredAPI: 'qwen' | 'deepseek' = 'qwen'): Promise<ConversationGroup[]> {
    console.log('开始处理文本，长度:', text.length);
    console.log('选择的API:', preferredAPI);
    
    if (preferredAPI === 'qwen') {
      return await this.processWithQwen(text);
    } else {
      return await this.processWithDeepSeek(text);
    }
  }

  // 测试API连接
  async testAPI(apiType: 'qwen' | 'deepseek'): Promise<boolean> {
    try {
      const testText = "测试文本";
      if (apiType === 'qwen') {
        await this.processWithQwen(testText);
      } else {
        await this.processWithDeepSeek(testText);
      }
      return true;
    } catch (error) {
      console.error(`${apiType} API测试失败:`, error);
      return false;
    }
  }
} 