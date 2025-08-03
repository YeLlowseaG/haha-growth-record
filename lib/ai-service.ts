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
                content: `你是一个专门处理儿童对话记录的AI助手。请帮我分析以下文本，将其分割成有意义的对话组。

要求：
1. 将相关的对话合并在一起
2. 提取日期信息（如果有）
3. 生成合适的标签（如：好奇、兴奋、家人、游戏等）
4. 为每组对话生成简短的上下文描述
5. 返回JSON格式的结果

示例输出格式：
[
  {
    "content": "妈妈，我想吃苹果！妈妈说：好的，给你一个。哈哈说：谢谢妈妈！",
    "date": "2024-01-01",
    "tags": ["家人", "礼貌", "饮食"],
    "context": "哈哈和妈妈关于吃苹果的对话"
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

      if (!response.ok) {
        throw new Error(`Qwen API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.output?.text || data.output?.choices?.[0]?.message?.content;
      
      if (!aiResponse) {
        throw new Error('No response from Qwen API');
      }

      // 尝试解析JSON响应
      try {
        const parsed = JSON.parse(aiResponse);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch (parseError) {
        // 如果JSON解析失败，使用备用处理
        return this.fallbackProcessing(text);
      }
    } catch (error) {
      console.error('Qwen API error:', error);
      return this.fallbackProcessing(text);
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
              content: `你是一个专门处理儿童对话记录的AI助手。请帮我分析以下文本，将其分割成有意义的对话组。

要求：
1. 将相关的对话合并在一起
2. 提取日期信息（如果有）
3. 生成合适的标签（如：好奇、兴奋、家人、游戏等）
4. 为每组对话生成简短的上下文描述
5. 返回JSON格式的结果

示例输出格式：
[
  {
    "content": "妈妈，我想吃苹果！妈妈说：好的，给你一个。哈哈说：谢谢妈妈！",
    "date": "2024-01-01",
    "tags": ["家人", "礼貌", "饮食"],
    "context": "哈哈和妈妈关于吃苹果的对话"
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

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices?.[0]?.message?.content;
      
      if (!aiResponse) {
        throw new Error('No response from DeepSeek API');
      }

      // 尝试解析JSON响应
      try {
        const parsed = JSON.parse(aiResponse);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch (parseError) {
        // 如果JSON解析失败，使用备用处理
        return this.fallbackProcessing(text);
      }
    } catch (error) {
      console.error('DeepSeek API error:', error);
      return this.fallbackProcessing(text);
    }
  }

  // 备用处理（当AI API失败时使用）
  private fallbackProcessing(text: string): ConversationGroup[] {
    const lines = text.split('\n').filter(line => line.trim());
    return lines.map((line, index) => ({
      content: line.trim(),
      date: new Date().toISOString().split('T')[0],
      tags: ['导入', '哈哈'],
      context: `第${index + 1}条记录`
    }));
  }

  // 智能选择API处理
  async processText(text: string, preferredAPI: 'qwen' | 'deepseek' = 'qwen'): Promise<ConversationGroup[]> {
    try {
      if (preferredAPI === 'qwen') {
        return await this.processWithQwen(text);
      } else {
        return await this.processWithDeepSeek(text);
      }
    } catch (error) {
      console.error('AI processing failed, using fallback:', error);
      return this.fallbackProcessing(text);
    }
  }
} 