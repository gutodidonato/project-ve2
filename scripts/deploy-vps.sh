#!/usr/bin/env bash
# Deploy the portfolio to the VPS (Hostinger): ship the committed tree (git archive, so the VPS needs no access to GitHub), build it
# there, switch the "current" link and (re)start it under PM2 on its own port. Releases are kept side by side; the last 3 stay.
# Nothing else on the server is touched: another site keeps its own Nginx server block and its own process.
#
#   DEPLOY_HOST=user@ip [DEPLOY_KEY=~/.ssh/key] [DEPLOY_DIR=/var/www/portfolio] [PORT=3010] bash scripts/deploy-vps.sh [git ref]
#
# The server keeps its secrets in $DEPLOY_DIR/shared/.env.production (see deploy/env.production.example); the script only links it.
set -euo pipefail
REF=${1:-HEAD}
HOST=${DEPLOY_HOST:?set DEPLOY_HOST=user@ip}
DIR=${DEPLOY_DIR:-/var/www/portfolio}
PORT=${PORT:-3010}
APP=${PM2_NAME:-portfolio}
SSH=(ssh -o BatchMode=yes ${DEPLOY_KEY:+-i "$DEPLOY_KEY"} "$HOST")
REL="$DIR/releases/$(date +%Y%m%d%H%M%S)"

git diff --quiet HEAD -- || echo "aviso: há mudanças não commitadas; o deploy leva só o que está em $REF" >&2

"${SSH[@]}" "mkdir -p '$REL' '$DIR/shared' && test -f '$DIR/shared/.env.production' || { echo 'falta $DIR/shared/.env.production no servidor' >&2; exit 1; }"
git archive --format=tar "$REF" | "${SSH[@]}" "tar -x -C '$REL'"

"${SSH[@]}" bash -s <<EOF
set -euo pipefail
cd '$REL'
ln -sf '$DIR/shared/.env.production' .env.production
npm ci --no-audit --no-fund
npm run build
ln -sfn '$REL' '$DIR/current'
if pm2 describe '$APP' > /dev/null 2>&1; then pm2 reload '$APP' --update-env; else pm2 start npm --name '$APP' --cwd '$DIR/current' -- start -- -p $PORT; fi
pm2 save > /dev/null
ls -1dt '$DIR'/releases/* | tail -n +4 | xargs -r rm -rf
for i in 1 2 3 4 5 6 7 8 9 10; do curl -fsS -o /dev/null "http://127.0.0.1:$PORT/" && { echo "no ar: http://127.0.0.1:$PORT/ ($REL)"; exit 0; }; sleep 2; done
echo "o site não respondeu em http://127.0.0.1:$PORT/" >&2; pm2 logs '$APP' --lines 40 --nostream >&2; exit 1
EOF
