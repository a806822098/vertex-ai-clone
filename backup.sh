#!/bin/bash
# ☁️ 一键备份到GitHub - 超级小白版

echo "🚀 开始备份到GitHub..."

# 先保存本地更改
./save.sh

# 检查是否有远程仓库
if ! git remote | grep -q origin; then
    echo "❌ 错误：还没有关联GitHub仓库！"
    echo "💡 请先运行以下命令关联仓库："
    echo "   git remote add origin <你的GitHub仓库地址>"
    exit 1
fi

# 获取远程仓库信息
REMOTE_URL=$(git remote get-url origin)
echo "📡 远程仓库: $REMOTE_URL"

# 推送到远程仓库
echo "⬆️ 正在上传..."
if git push origin main 2>&1; then
    echo ""
    echo "☁️ 备份成功！您的代码已安全保存到GitHub"
    echo "🔗 仓库地址: $REMOTE_URL"
    echo "📅 备份时间: $(date '+%Y-%m-%d %H:%M:%S')"
else
    echo ""
    echo "❌ 备份失败！可能的原因："
    echo "1. 网络连接问题"
    echo "2. GitHub账号未授权"
    echo "3. 仓库地址错误"
    echo ""
    echo "💡 解决方法："
    echo "1. 检查网络连接"
    echo "2. 运行 'gh auth login' 登录GitHub"
    echo "3. 确认仓库地址正确"
fi