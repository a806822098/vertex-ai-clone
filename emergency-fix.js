// 🚨 紧急修复脚本 - SRE风格快速诊断和修复

console.log('🚑 开始紧急诊断...\n');

// 诊断1: 检查错误来源
console.log('📋 错误分析：');
console.log('错误信息："Unexpected value `xxx（首次提问）~,false` for `children` prop"');
console.log('分析：ReactMarkdown收到了一个包含逗号和false的字符串');
console.log('推测：可能是数组或多个值被错误地转换为字符串\n');

// 诊断2: 可能的原因
console.log('🔍 可能的原因：');
console.log('1. ReactMarkdown的children包含多个元素');
console.log('2. safeContent和isStreaming indicator被一起传入');
console.log('3. 某处将数组[content, false]转换成了字符串\n');

// 紧急修复方案
console.log('💊 紧急修复方案：\n');

const emergencyFix = `
// 修复1: MessageContent.jsx - 将streaming indicator移到ReactMarkdown外部
function MessageContent({ content, isStreaming = false }) {
  // ... safeContent处理逻辑 ...
  
  return (
    <>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeHighlight]}
        className={...}
        components={...}
      >
        {safeContent}
      </ReactMarkdown>
      {isStreaming && <span className="inline-block w-1 h-4 bg-vertex-accent animate-pulse ml-0.5" />}
    </>
  )
}

// 修复2: 确保content始终是纯字符串
const ensureString = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'boolean') return '';
  if (typeof value === 'number') return String(value);
  if (Array.isArray(value)) {
    // 过滤掉非字符串元素
    return value.filter(v => typeof v === 'string').join('');
  }
  if (typeof value === 'object') {
    // 尝试提取文本内容
    return value.text || value.message || value.content || '';
  }
  return '';
};
`;

console.log(emergencyFix);

console.log('\n🚀 立即执行修复步骤：');
console.log('1. 修改MessageContent组件，将streaming indicator移到ReactMarkdown外部');
console.log('2. 增强safeContent处理，过滤掉所有非字符串值');
console.log('3. 添加更多防御性检查');
console.log('\n⏰ 预计修复时间：2分钟');