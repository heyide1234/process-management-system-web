#!/bin/bash

WEB_DIR="/opt/process-management-web"
NGINX_CONF_DIR="/etc/nginx/conf.d"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

set -e

echo "=== 流程管理系统前端部署 ==="

echo "[1/4] 安装依赖..."
cd "${PROJECT_DIR}"
npm ci

echo "[2/4] 构建项目..."
npm run build

echo "[3/4] 部署静态文件..."
sudo mkdir -p "${WEB_DIR}"
sudo rm -rf "${WEB_DIR:?}"/*
sudo cp -r dist/* "${WEB_DIR}/"

echo "[4/4] 部署 Nginx 配置..."
sudo cp "${SCRIPT_DIR}/nginx.conf" "${NGINX_CONF_DIR}/process-management.conf"
sudo nginx -t && sudo nginx -s reload

echo "=== 部署完成 ==="
echo "访问地址: http://$(hostname -I 2>/dev/null | awk '{print $1}' || echo '服务器IP')"
