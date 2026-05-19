module.exports = {
  apps: [{
    name: 'llmcluster',
    cwd: '/workspace/llmcluster',
    script: './start.sh',
    interpreter: 'none',
    env: {
      NODE_ENV: 'production',
      DATABASE_URL: 'postgresql://postgres:postgres123@localhost:5432/llmcluster',
      NEXTAUTH_SECRET: 'llmcluster-secret-change-in-production-2024',
      NEXTAUTH_URL: 'http://43.162.121.156:3000',
      SILICONFLOW_API_KEY: '',
      SILICONFLOW_API_URL: 'https://api.siliconflow.cn/v1',
      NEXT_PUBLIC_APP_URL: 'http://43.162.121.156:3000',
    },
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
  }],
}
