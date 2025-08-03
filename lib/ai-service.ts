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
                content: `你是一个专门处理儿童对话记录的AI助手。你的任务是将输入的文本智能分割成有意义的对话片段。

## 核心处理原则

### 1. 保持对话的自然完整性
- 不要过度分割，保持对话的情感连贯性
- 儿童对话经常跳跃，这是正常的，不要强制分割
- 优先保持对话的完整性和可读性

### 2. 智能分割标准（按优先级）

**第一优先级：明确的时间/场景转换**
- 时间标记：然后、接着、后来、过了一会儿、第二天、晚上、早上
- 场景标记：洗澡时、吃饭时、睡觉时、玩耍时、学习时
- 地点转换：从家里到外面、从客厅到卧室、从学校到家里

**第二优先级：对话对象变化**
- 从"妈妈"换成"爸爸"
- 从"家人"换成"朋友"或"老师"
- 从"哈哈"换成其他孩子的名字

**第三优先级：话题明显转换**
- 从"吃饭"话题转到"游戏"话题
- 从"学习"转到"玩耍"
- 从"玩具"转到"故事"
- 从"今天做了什么"转到"明天想做什么"

**第四优先级：动作与对话转换**
- 从描述动作转向对话：如"哈哈跑过来，说：..."
- 从对话转向动作描述：如"哈哈说：我想玩。然后他拿起玩具。"

**第五优先级：情感状态变化**
- 从"开心"转到"生气"
- 从"好奇"转到"害怕"
- 从"兴奋"转到"平静"

### 3. 不分割的情况
- 连续的问答（少于3轮）
- 同一话题的连续对话
- 动作描述与相关对话
- 情感连贯的对话片段

### 4. 儿童对话的特殊处理
- 理解儿童语言的跳跃性
- 保持对话的童真和可爱
- 不要过度规范化儿童表达
- 关注对话的情感而非语法

## 标签生成规则

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

### 场景类标签（选择1个）
- 家里：在家中的对话
- 外面：户外活动的对话
- 学校：在学校或学习场所的对话
- 公园：在公园或游乐场所的对话
- 商场：在商场或购物场所的对话
- 医院：在医院或医疗场所的对话
- 游乐场：在游乐场的对话

### 主题类标签（选择1个）
- 饮食：关于食物、吃饭的对话
- 教育：关于学习、知识的对话
- 娱乐：关于游戏、娱乐的对话
- 健康：关于身体、健康的对话
- 社交：关于人际关系的对话
- 成长：关于成长、发展的对话

## 输出格式要求

- 必须是有效的JSON数组
- 每个对象包含：content(对话内容)、date(日期，可选)、tags(标签数组)、context(简短描述)
- content保持原文格式，不要修改对话内容
- context用8-12字描述对话场景，突出关键信息
- tags选择3-4个最相关的标签（情感类1个+关系类1个+活动类1个+其他类1个）

## 处理示例

### 示例1：简单对话
输入："哈哈说：妈妈我想吃苹果。妈妈说：好的给你一个。哈哈说：谢谢妈妈！"

输出：
[
  {
    "content": "哈哈说：妈妈我想吃苹果。妈妈说：好的给你一个。哈哈说：谢谢妈妈！",
    "date": "2024-01-01",
    "tags": ["家人", "礼貌", "饮食"],
    "context": "哈哈和妈妈关于吃苹果的对话"
  }
]

### 示例2：动作与对话
输入："哈哈右手压在我肩膀上,我跟他讲不要压着我,很不舒服。手挪开了一秒,又放回来。我盯着他,他秒回:我又没压啊。"

输出：
[
  {
    "content": "哈哈右手压在我肩膀上,我跟他讲不要压着我,很不舒服。",
    "date": "2024-01-01",
    "tags": ["调皮", "互动", "拒绝"],
    "context": "哈哈压肩膀被拒绝"
  },
  {
    "content": "手挪开了一秒,又放回来。",
    "date": "2024-01-01",
    "tags": ["调皮", "互动"],
    "context": "手挪开又放回"
  },
  {
    "content": "我盯着他,他秒回:我又没压啊。",
    "date": "2024-01-01",
    "tags": ["调皮", "互动", "否认"],
    "context": "哈哈否认压肩膀"
  }
]

### 示例3：长对话
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
]

### 示例4：场景转换
输入："洗澡时的对话。哈哈说：妈妈，水好热。妈妈说：那我调凉一点。哈哈说：谢谢妈妈。吃饭时的对话。哈哈说：妈妈，这个菜好吃。妈妈说：那你多吃点。"

输出：
[
  {
    "content": "洗澡时的对话。哈哈说：妈妈，水好热。妈妈说：那我调凉一点。哈哈说：谢谢妈妈。",
    "date": "2024-01-01",
    "tags": ["家人", "礼貌", "洗澡"],
    "context": "哈哈洗澡时关于水温的对话"
  },
  {
    "content": "吃饭时的对话。哈哈说：妈妈，这个菜好吃。妈妈说：那你多吃点。",
    "date": "2024-01-01",
    "tags": ["家人", "开心", "饮食"],
    "context": "哈哈吃饭时关于菜品的对话"
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
              content: `你是一个专门处理儿童对话记录的AI助手。你的任务是将输入的文本智能分割成有意义的对话片段。

## 核心处理原则

### 1. 保持对话的自然完整性
- 不要过度分割，保持对话的情感连贯性
- 儿童对话经常跳跃，这是正常的，不要强制分割
- 优先保持对话的完整性和可读性

### 2. 智能分割标准（按优先级）

**第一优先级：明确的时间/场景转换**
- 时间标记：然后、接着、后来、过了一会儿、第二天、晚上、早上
- 场景标记：洗澡时、吃饭时、睡觉时、玩耍时、学习时
- 地点转换：从家里到外面、从客厅到卧室、从学校到家里

**第二优先级：对话对象变化**
- 从"妈妈"换成"爸爸"
- 从"家人"换成"朋友"或"老师"
- 从"哈哈"换成其他孩子的名字

**第三优先级：话题明显转换**
- 从"吃饭"话题转到"游戏"话题
- 从"学习"转到"玩耍"
- 从"玩具"转到"故事"
- 从"今天做了什么"转到"明天想做什么"

**第四优先级：动作与对话转换**
- 从描述动作转向对话：如"哈哈跑过来，说：..."
- 从对话转向动作描述：如"哈哈说：我想玩。然后他拿起玩具。"

**第五优先级：情感状态变化**
- 从"开心"转到"生气"
- 从"好奇"转到"害怕"
- 从"兴奋"转到"平静"

### 3. 不分割的情况
- 连续的问答（少于3轮）
- 同一话题的连续对话
- 动作描述与相关对话
- 情感连贯的对话片段

### 4. 儿童对话的特殊处理
- 理解儿童语言的跳跃性
- 保持对话的童真和可爱
- 不要过度规范化儿童表达
- 关注对话的情感而非语法

## 标签生成规则

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

### 场景类标签（选择1个）
- 家里：在家中的对话
- 外面：户外活动的对话
- 学校：在学校或学习场所的对话
- 公园：在公园或游乐场所的对话
- 商场：在商场或购物场所的对话
- 医院：在医院或医疗场所的对话
- 游乐场：在游乐场的对话

### 主题类标签（选择1个）
- 饮食：关于食物、吃饭的对话
- 教育：关于学习、知识的对话
- 娱乐：关于游戏、娱乐的对话
- 健康：关于身体、健康的对话
- 社交：关于人际关系的对话
- 成长：关于成长、发展的对话

## 输出格式要求

- 必须是有效的JSON数组
- 每个对象包含：content(对话内容)、date(日期，可选)、tags(标签数组)、context(简短描述)
- content保持原文格式，不要修改对话内容
- context用8-12字描述对话场景，突出关键信息
- tags选择3-4个最相关的标签（情感类1个+关系类1个+活动类1个+其他类1个）

## 处理示例

### 示例1：简单对话
输入："哈哈说：妈妈我想吃苹果。妈妈说：好的给你一个。哈哈说：谢谢妈妈！"

输出：
[
  {
    "content": "哈哈说：妈妈我想吃苹果。妈妈说：好的给你一个。哈哈说：谢谢妈妈！",
    "date": "2024-01-01",
    "tags": ["家人", "礼貌", "饮食"],
    "context": "哈哈和妈妈关于吃苹果的对话"
  }
]

### 示例2：动作与对话
输入："哈哈右手压在我肩膀上,我跟他讲不要压着我,很不舒服。手挪开了一秒,又放回来。我盯着他,他秒回:我又没压啊。"

输出：
[
  {
    "content": "哈哈右手压在我肩膀上,我跟他讲不要压着我,很不舒服。",
    "date": "2024-01-01",
    "tags": ["调皮", "互动", "拒绝"],
    "context": "哈哈压肩膀被拒绝"
  },
  {
    "content": "手挪开了一秒,又放回来。",
    "date": "2024-01-01",
    "tags": ["调皮", "互动"],
    "context": "手挪开又放回"
  },
  {
    "content": "我盯着他,他秒回:我又没压啊。",
    "date": "2024-01-01",
    "tags": ["调皮", "互动", "否认"],
    "context": "哈哈否认压肩膀"
  }
]

### 示例3：长对话
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
]

### 示例4：场景转换
输入："洗澡时的对话。哈哈说：妈妈，水好热。妈妈说：那我调凉一点。哈哈说：谢谢妈妈。吃饭时的对话。哈哈说：妈妈，这个菜好吃。妈妈说：那你多吃点。"

输出：
[
  {
    "content": "洗澡时的对话。哈哈说：妈妈，水好热。妈妈说：那我调凉一点。哈哈说：谢谢妈妈。",
    "date": "2024-01-01",
    "tags": ["家人", "礼貌", "洗澡"],
    "context": "哈哈洗澡时关于水温的对话"
  },
  {
    "content": "吃饭时的对话。哈哈说：妈妈，这个菜好吃。妈妈说：那你多吃点。",
    "date": "2024-01-01",
    "tags": ["家人", "开心", "饮食"],
    "context": "哈哈吃饭时关于菜品的对话"
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