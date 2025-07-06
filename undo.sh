#!/bin/bash
# ⏪ 一键撤销最近更改 - 超级小白版

echo "⚠️  准备撤销最近的更改..."
echo ""

# 显示最近的提交
echo "📋 最近的保存记录："
git log --oneline -5
echo ""

# 获取最新提交信息
LAST_COMMIT=$(git log -1 --pretty=format:"%h - %s (%cr)")
echo "即将撤销: $LAST_COMMIT"
echo ""

# 安全确认
echo "⚠️  警告：撤销后无法恢复！"
read -p "确定要撤销吗？(输入 y 确认): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # 执行撤销
    git reset --hard HEAD~1
    echo ""
    echo "⏪ 已成功撤销最近的更改！"
    echo "💡 当前版本: $(git log -1 --pretty=format:"%h - %s")"
else
    echo ""
    echo "❌ 已取消撤销操作"
fi