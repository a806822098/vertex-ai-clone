#!/bin/bash
# 🤖 自动备份脚本 - 定时运行版

LOG_FILE="auto-backup.log"

# 记录开始时间
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 开始自动备份检查..." >> $LOG_FILE

# 检查是否有未提交的更改
if [[ -n $(git status -s) ]]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 发现未提交的更改，开始备份..." >> $LOG_FILE
    
    # 统计更改
    CHANGED_FILES=$(git status -s | wc -l)
    
    # 添加所有更改
    git add -A
    
    # 创建提交
    git commit -m "🤖 自动备份: $(date '+%Y-%m-%d %H:%M:%S')

自动备份系统检测到 $CHANGED_FILES 个文件有更改" >> $LOG_FILE 2>&1
    
    # 如果有远程仓库，尝试推送
    if git remote | grep -q origin; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] 推送到远程仓库..." >> $LOG_FILE
        git push origin main >> $LOG_FILE 2>&1
        
        if [ $? -eq 0 ]; then
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ 自动备份完成！" >> $LOG_FILE
        else
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️  推送失败，但本地备份已完成" >> $LOG_FILE
        fi
    else
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ 本地备份完成（无远程仓库）" >> $LOG_FILE
    fi
else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 无需备份：没有未提交的更改" >> $LOG_FILE
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 备份检查结束" >> $LOG_FILE
echo "----------------------------------------" >> $LOG_FILE