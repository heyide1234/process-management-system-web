#!/bin/sh
# Docker 启动脚本：替换 nginx 配置中的 CAMUNDA_HOST 占位符

set -e

# 只替换 __CAMUNDA_HOST__ 占位符，不影响 nginx 内置变量
sed -i "s/__CAMUNDA_HOST__/${CAMUNDA_HOST:-camunda-server}/g" /etc/nginx/conf.d/default.conf

echo "Camunda backend: ${CAMUNDA_HOST:-camunda-server}"
echo "Starting nginx..."

exec nginx -g 'daemon off;'
