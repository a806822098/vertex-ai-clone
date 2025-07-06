#!/bin/bash
# 🎯 自动保存所有更改 - 超级小白版

echo "🔍 正在检查更改..."

# 检查是否有更改
if [[ -z $(git status -s) ]]; then
    echo "✨ 没有需要保存的更改！"
    exit 0
fi

# 显示更改的文件
echo "📝 发现以下更改："
git status -s

# 自动添加所有更改
git add -A

# 生成智能提交信息
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
CHANGES=$(git diff --cached --stat | tail -1)

# 创建提交
git commit -m "💾 自动保存: $TIMESTAMP

更改统计: $CHANGES"

echo ""
echo "✅ 已成功保存所有更改！"
echo "💡 提示：如果想备份到云端，请运行 ./backup.sh"