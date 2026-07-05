module.exports = {
  apps: [{
    name: 'llmcluster',
    cwd: '/workspace/llmcluster',
    script: 'pnpm',
    args: 'start',
    interpreter: '/root/.nvm/versions/node/v22.22.3/bin/node',
    env: { NODE_ENV: 'production' }
  }]
};
