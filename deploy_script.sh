#!/bin/bash

# ssh volvo@172.26.197.23
# cd nodeServer
# tar -xf dist.tar
# ps aux | grep "npm run serve:dev"
# kill -9 12345
# nohup npm run serve:dev

# 服务器连接信息
USER="volvo"
HOST="172.26.197.23"
PASSWORD="P@ssw1rd"
TARGET_DIR="/home/volvo/nodeServer"
TAR_FILE="dist.tar"

# 使用 sshpass 工具进行 SSH 连接并执行命令
sshpass -p "$PASSWORD" ssh "$USER@$HOST" << EOF
  # 检查目标目录是否存在，不存在则创建
  if [ ! -d "$TARGET_DIR" ]; then
    mkdir -p "$TARGET_DIR"
  fi

  # 切换到目标目录
  cd "$TARGET_DIR" || exit

  # 解压 dist.tar 文件
  if [ -f "$TAR_FILE" ]; then
    tar -xf "$TAR_FILE"
    echo "文件解压完成"
  else
    echo "错误：未找到 $TAR_FILE 文件"
    exit 1
  fi

  # 使用 nohup 运行 npm 命令，使其在后台持续运行
  # 输出会被重定向到 npm_dev.log 文件
  nohup npm run dev > npm_dev.log 2>&1 &

  # 显示后台进程信息
  echo "Node.js 服务已在后台启动"
  echo "进程 ID: $(pgrep -f 'npm run dev')"
  echo "日志文件: $TARGET_DIR/npm_dev.log"
EOF    