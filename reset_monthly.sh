#!/bin/bash
# Reset monthly_used to 0 for all users on the 1st of each month
# Cron: 0 0 1 * * /workspace/llmcluster/reset_monthly.sh
# Credentials are read from ~/.pgpass (permissions 600)
export PGPASSFILE=/root/.pgpass
psql -U postgres -h localhost -d llmcluster -c "UPDATE users SET monthly_used = 0, quota_reset_at = NOW() WHERE monthly_used != 0;"
echo "[$(date)] Monthly quota reset done"
