// 基础对话功能测试脚本
// import { callAPI } from './utils/api.js'

// 测试各种可能的API响应格式
const testResponses = [
  // 标准OpenAI格式
  { choices: [{ message: { content: "这是OpenAI格式的响应" } }] },
  
  // 简单文本
  { text: "这是简单文本响应" },
  
  // 直接内容
  { content: "这是直接内容响应" },
  
  // 消息格式
  { message: "这是消息格式响应" },
  
  // 自定义格式
  { answer: "这是answer字段响应" },
  { response: "这是response字段响应" },
  { reply: "这是reply字段响应" },
  
  // 数组格式
  ["这是数组格式的第一个响应", "第二个响应"],
  
  // 数字
  42,
  
  // 空响应
  null,
  {},
  [],
  
  // 复杂对象（应该触发友好错误）
  { some: { nested: { object: "value" } } },
  
  // 字符串
  "直接的字符串响应"
]

// 模拟parseAPIResponse函数的行为
function testParseResponse(data, format = 'custom') {
  try {
    if (format === 'custom') {
      const content = data.content || 
                     data.message || 
                     data.text || 
                     data.choices?.[0]?.message?.content || 
                     data.result
      
      if (content) {
        return String(content)
      }
      
      if (typeof data === 'string') {
        return data
      }
      
      const possibleTextFields = ['answer', 'response', 'reply', 'output', 'completion']
      for (const field of possibleTextFields) {
        if (data[field] && typeof data[field] === 'string') {
          return data[field]
        }
      }
      
      if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'string') {
        return data[0]
      }
      
      console.warn('Unexpected API response format:', data)
      return '抱歉，无法解析API响应。请检查API配置是否正确。'
    }
  } catch (error) {
    console.error('Error parsing response:', error)
    return 'Error parsing response'
  }
}

// 运行测试
console.log('=== API响应解析测试 ===\n')

testResponses.forEach((response, index) => {
  const result = testParseResponse(response)
  console.log(`测试 ${index + 1}:`)
  console.log('输入:', JSON.stringify(response))
  console.log('输出:', result)
  console.log('类型:', typeof result)
  console.log('---')
})

console.log('\n✅ 所有测试完成！')
console.log('说明：所有输出都应该是字符串类型，不应该有JSON.stringify的对象输出')