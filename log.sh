#!/bin/bash

case "$1" in
  "error")
    tail -f logs/pm2/error.log
    ;;
  "out")
    tail -f logs/pm2/out.log
    ;;
  "all")
    tail -f logs/pm2/combined.log
    ;;
  "docker")
    docker-compose logs -f app
    ;;
  *)
    echo "使用方法: ./scripts/logs.sh [error|out|all|docker]"
    ;;
esac