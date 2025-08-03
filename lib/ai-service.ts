interface AIServiceConfig {
  qwenKey: string;
  deepseekKey: string;
}

interface AITitleResult {
  title: string;
  tags: string[];
}

interface AIFormatResult {
  content: string;
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
- 标题必须具体反映对话的核心内容，不能只是通用的"哈哈的对话"
- 标题应该简洁明了，8-15字
- 突出对话的关键词、主题或情感
- 体现对话中的具体事件、物品或行为
- 避免使用"哈哈的对话"这样的通用标题
- 如果对话涉及具体物品，在标题中体现（如"想吃苹果"、"讨论小秘密"）
- 如果对话表达情感，在标题中体现（如"感觉开心"、"表达爱意"）
- 如果对话有趣味性，在标题中体现（如"调皮否认"、"机智回答"）

## 标签生成规则（选择3-4个最有价值的标签）

### 成长发展标签（体现孩子发展阶段）
- 语言发展：词汇丰富、表达清楚、语法进步
- 逻辑思维：因果推理、分类概念、数字理解
- 想象创造：编故事、角色扮演、创意想法
- 情绪管理：表达感受、情绪调节、情感认知
- 社交能力：分享合作、解决冲突、关心他人
- 自理独立：自主选择、承担责任、解决问题

### 性格特质标签（记录个性特点）
- 好奇探索：爱问问题、主动学习、探索欲强
- 幽默风趣：说笑话、逗人开心、机智回应
- 温柔体贴：关心他人、安慰别人、表达爱意
- 坚持专注：不轻易放弃、专心致志、持续努力
- 勇敢自信：敢于尝试、相信自己、面对挑战
- 细心观察：注意细节、善于发现、观察入微

### 亲子关系标签（记录互动质量）
- 信任依恋：愿意分享秘密、寻求安慰、表达爱意
- 模仿学习：学习言行、模仿行为、跟随示范
- 撒娇任性：寻求关注、表达不满、测试边界
- 协商沟通：表达需求、协商规则、理性对话
- 教学互动：回答问题、教授知识、角色互换

### 记忆价值标签（标记珍贵时刻）
- 第一次：首次体验、重要里程碑、新技能习得
- 金句名言：经典话语、有趣表达、童言无忌
- 温馨时刻：亲密互动、情感表达、美好回忆
- 成长瞬间：突然懂事、认知飞跃、行为进步
- 可爱趣事：天真想法、有趣行为、搞笑瞬间

## 标题生成示例（重要：必须参考这些示例的具体化程度）

输入："哈哈说：妈妈我想吃苹果。妈妈说：好的给你一个。哈哈说：谢谢妈妈！"
输出：{"title": "想吃苹果的请求", "tags": ["社交能力", "温馨时刻", "自理独立"]}

输入："哈哈右手压在我肩膀上,我跟他讲不要压着我,很不舒服。手挪开了一秒,又放回来。我盯着他,他秒回:我又没压啊。"
输出：{"title": "调皮压肩膀游戏", "tags": ["幽默风趣", "撒娇任性", "可爱趣事"]}

输入："爸爸发来：笑噻嘛地走到我旁边，'爸爸，我今天有一个秘密' '是什么秘密呀？' '不能告诉你' '为什么呀？'"
输出：{"title": "神秘的小秘密", "tags": ["信任依恋", "想象创造", "金句名言"]}

输入："哈：人是怎么出生的？我：嗯，你呢，从妈妈肚子里童出来的，切开妈妈肚子。哈：竖切还是横切？"
输出：{"title": "好奇出生过程", "tags": ["好奇探索", "逻辑思维", "语言发展"]}

输入："哈：谢谢你的温菜话，我喜欢你的温柔话。哈：我是一个很厉害的聪明哥哥。"
输出：{"title": "温柔话和聪明哥哥", "tags": ["温柔体贴", "勇敢自信", "金句名言"]}

输入："哈：我感觉。我：感觉什么？哈：我感觉想要抱一抱你。上学路上，人还没醒，走了两步，累。哈：妈妈，我想你最爱我。我：我一直都最爱你呢。"
输出：{"title": "表达爱意的早晨", "tags": ["温柔体贴", "情绪管理", "温馨时刻"]}

## 输出格式要求
- 必须是有效的JSON对象
- 包含：title(具体的标题)、tags(标签数组)  
- title必须具体描述对话内容，绝对不能是"哈哈的对话"
- tags选择3-5个最相关的标签`
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
- 标题必须具体反映对话的核心内容，不能只是通用的"哈哈的对话"
- 标题应该简洁明了，8-15字
- 突出对话的关键词、主题或情感
- 体现对话中的具体事件、物品或行为
- 避免使用"哈哈的对话"这样的通用标题
- 如果对话涉及具体物品，在标题中体现（如"想吃苹果"、"讨论小秘密"）
- 如果对话表达情感，在标题中体现（如"感觉开心"、"表达爱意"）
- 如果对话有趣味性，在标题中体现（如"调皮否认"、"机智回答"）

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

## 标签选择注意事项
- 绝对不要使用"导入"、"哈哈"这样的无意义标签
- 专注于对话的实际内容、情感和场景
- 每个标签都应该有明确的含义和价值

## 输出格式要求  
- 必须是有效的JSON对象
- 包含：title(具体标题)、tags(有意义的标签数组)
- title必须具体描述对话内容，不能是"哈哈的对话"
- tags选择3-5个最相关且有意义的标签

## 标题生成示例（重要：必须参考这些示例的具体化程度）

输入："哈哈说：妈妈我想吃苹果。妈妈说：好的给你一个。哈哈说：谢谢妈妈！"
输出：{"title": "想吃苹果的请求", "tags": ["家人", "礼貌", "吃饭"]}

输入："哈哈右手压在我肩膀上,我跟他讲不要压着我,很不舒服。手挪开了一秒,又放回来。我盯着他,他秒回:我又没压啊。"
输出：{"title": "调皮压肩膀游戏", "tags": ["调皮", "游戏", "聪明"]}

输入："爸爸发来：笑噻嘛地走到我旁边，'爸爸，我今天有一个秘密' '是什么秘密呀？' '不能告诉你' '为什么呀？'"
输出：{"title": "神秘的小秘密", "tags": ["家人", "好奇", "调皮"]}

输入："妈:你今天开心吗?哈:今天很开心,玩得很快乐。妈:今天跟谁一起玩呢? 哈:跟拉拉、雯雯一起玩。"
输出：{"title": "分享今天的快乐", "tags": ["家人", "开心", "朋友"]}`
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

  // 使用AI格式化对话内容，保持对话格式
  async formatConversationWithQwen(content: string): Promise<AIFormatResult> {
    try {
      console.log('使用Qwen API格式化对话内容');
      
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
                content: `你是一个专门处理儿童对话记录的AI助手。你的任务是：
1. 格式化对话内容，保持清晰的对话结构
2. 生成合适的标题
3. 生成相关标签

## 内容格式化规则
- 保持对话的分段结构
- 每句对话占一行
- 妈妈/我/哈哈的对话要清晰区分
- 保留原有的对话顺序和逻辑
- 去除多余的空行，但保持必要的段落分隔
- 对话格式：说话者：对话内容

## 标题生成规则
- 标题应该简洁明了，8-15字
- 突出对话的核心内容或情感
- 体现哈哈的特点和可爱之处

## 标签生成规则（选择3-5个最相关的）
### 情感类标签
- 好奇、兴奋、开心、生气、害怕、害羞、惊讶、困惑

### 关系类标签
- 家人、朋友、老师、同学、亲戚

### 活动类标签
- 游戏、学习、吃饭、洗澡、睡觉、玩耍、运动、画画

### 性格类标签
- 礼貌、调皮、聪明、勇敢、善良、独立、合作

## 输出格式要求
- 必须是有效的JSON对象
- 包含：content(格式化后的内容)、title(标题)、tags(标签数组)

## 示例

输入："妈:你今天开心吗?哈:今天很开心,玩得很快乐。妈:今天跟谁一起玩呢? 哈:跟拉拉、雯雯一起玩。"

输出：
{
  "content": "妈：你今天开心吗？\n哈：今天很开心，玩得很快乐。\n妈：今天跟谁一起玩呢？\n哈：跟拉拉、雯雯一起玩。",
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
            max_tokens: 1000
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
          content: parsed.content || content,
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

  // 使用DeepSeek格式化对话内容
  async formatConversationWithDeepSeek(content: string): Promise<AIFormatResult> {
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
              content: `你是一个专门处理儿童对话记录的AI助手。你的任务是：
1. 格式化对话内容，保持清晰的对话结构
2. 生成合适的标题
3. 生成相关标签

## 内容格式化规则
- 保持对话的分段结构
- 每句对话占一行
- 妈妈/我/哈哈的对话要清晰区分
- 保留原有的对话顺序和逻辑
- 去除多余的空行，但保持必要的段落分隔
- 对话格式：说话者：对话内容

## 标题生成规则
- 标题应该简洁明了，8-15字
- 突出对话的核心内容或情感
- 体现哈哈的特点和可爱之处

## 标签生成规则（选择3-5个最相关的）
### 情感类标签
- 好奇、兴奋、开心、生气、害怕、害羞、惊讶、困惑

### 关系类标签
- 家人、朋友、老师、同学、亲戚

### 活动类标签
- 游戏、学习、吃饭、洗澡、睡觉、玩耍、运动、画画

### 性格类标签
- 礼貌、调皮、聪明、勇敢、善良、独立、合作

## 输出格式要求
- 必须是有效的JSON对象
- 包含：content(格式化后的内容)、title(标题)、tags(标签数组)

## 示例

输入："妈:你今天开心吗?哈:今天很开心,玩得很快乐。妈:今天跟谁一起玩呢? 哈:跟拉拉、雯雯一起玩。"

输出：
{
  "content": "妈：你今天开心吗？\n哈：今天很开心，玩得很快乐。\n妈：今天跟谁一起玩呢？\n哈：跟拉拉、雯雯一起玩。",
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
          max_tokens: 1000
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
          content: parsed.content || content,
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

  // 智能格式化对话内容
  async formatConversation(content: string, preferredAPI: 'qwen' | 'deepseek' = 'qwen'): Promise<AIFormatResult> {
    console.log('开始格式化对话内容，选择的API:', preferredAPI);
    
    if (preferredAPI === 'qwen') {
      return await this.formatConversationWithQwen(content);
    } else {
      return await this.formatConversationWithDeepSeek(content);
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