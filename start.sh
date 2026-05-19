#!/bin/bash
cd /workspace/llmcluster
export DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/llmcluster"
export NEXTAUTH_SECRET="llmcluster-secret-change-in-production-2024"
export NEXTAUTH_URL="http://43.162.121.156:3000"
export SILICONFLOW_API_KEY="sk-uwxceoycgbwtdgsynmotzsrvmhdmlvyzzaycrhijohugriez"
export SILICONFLOW_API_URL="https://api.siliconflow.cn/v1"
export NEXT_PUBLIC_APP_URL="http://43.162.121.156:3000"
export NODE_ENV=production
exec bash node_modules/.bin/next start -p 3000
