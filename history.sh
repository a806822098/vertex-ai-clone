#!/bin/bash
# 📜 查看历史记录 - 超级小白版

echo "📜 Git历史记录查看器"
echo "===================="
echo ""

# 检查参数
if [ "$1" = "detail" ] || [ "$1" = "详细" ]; then
    echo "📋 详细历史记录（最近20条）："
    echo ""
    git log --pretty=format:"%C(yellow)%h%Creset %C(blue)%ad%Creset | %C(green)%s%Creset %C(dim)by %an%Creset" --date=format:"%Y-%m-%d %H:%M" -20
elif [ "$1" = "file" ] || [ "$1" = "文件" ]; then
    if [ -z "$2" ]; then
        echo "❌ 请指定文件名！"
        echo "用法: ./history.sh file <文件名>"
    else
        echo "📄 文件 '$2' 的修改历史："
        echo ""
        git log --pretty=format:"%C(yellow)%h%Creset %C(blue)%ad%Creset | %C(green)%s%Creset" --date=format:"%Y-%m-%d %H:%M" -- "$2"
    fi
elif [ "$1" = "search" ] || [ "$1" = "搜索" ]; then
    if [ -z "$2" ]; then
        echo "❌ 请指定搜索关键词！"
        echo "用法: ./history.sh search <关键词>"
    else
        echo "🔍 搜索包含 '$2' 的提交："
        echo ""
        git log --pretty=format:"%C(yellow)%h%Creset %C(blue)%ad%Creset | %C(green)%s%Creset" --date=format:"%Y-%m-%d %H:%M" --grep="$2"
    fi
else
    echo "📋 最近的保存记录（最近10条）："
    echo ""
    git log --pretty=format:"%C(yellow)%h%Creset %C(blue)%ad%Creset | %C(green)%s%Creset" --date=format:"%Y-%m-%d %H:%M" -10
    echo ""
    echo ""
    echo "💡 更多用法："
    echo "  ./history.sh detail     - 查看详细历史"
    echo "  ./history.sh file <文件名> - 查看特定文件的历史"
    echo "  ./history.sh search <关键词> - 搜索提交信息"
fi

echo ""