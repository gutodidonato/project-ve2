# Deploy na VPS (Hostinger)

O portfólio roda como um app Next.js (Node 22) atrás do Nginx, ao lado do que já existe na VPS. Ele usa uma porta própria (3010 por padrão) e um processo PM2 próprio (`portfolio`).

## Uma vez, no servidor

1. **Node 22 e PM2.** Confira com `node -v` e `pm2 -v`.
   - Se o Node faltar, instale pelo NodeSource (22.x).
   - Se o PM2 faltar, rode `npm i -g pm2` e depois `pm2 startup`.
2. **Pastas e variáveis de ambiente.**
   - Crie as pastas com `mkdir -p /var/www/portfolio/shared`.
   - Copie `deploy/env.production.example` para `/var/www/portfolio/shared/.env.production` e preencha lá mesmo. Esse arquivo guarda a chave do Resend e os e-mails do contato.
   - O `NEXT_PUBLIC_SITE_URL` é lido no build, então precisa estar certo antes do primeiro deploy.
3. **Nginx.** Use `deploy/nginx-portfolio.conf.example`.
   - Troque o domínio e a porta.
   - Salve em `/etc/nginx/sites-available/portfolio` e crie o link em `sites-enabled`.
   - Rode `nginx -t && systemctl reload nginx`.
4. **HTTPS.** Rode `certbot --nginx -d <domínio> -d www.<domínio>`.

## Cada deploy, daqui

```bash
DEPLOY_HOST=root@<ip> DEPLOY_KEY=~/.ssh/<chave> bash scripts/deploy-vps.sh
```

O script faz isto, nesta ordem:

1. Manda o código commitado (`git archive`), então a VPS não precisa de acesso ao GitHub.
2. Faz `npm ci` e `npm run build` numa pasta nova em `releases/`.
3. Só se o build passar, aponta `current` para essa pasta e recarrega o PM2.
4. Confere se o site responde na porta.
5. Guarda as 3 últimas versões.

Se o build falhar, o site que está no ar continua o mesmo.

**Voltar uma versão:**

```bash
ln -sfn /var/www/portfolio/releases/<anterior> /var/www/portfolio/current && pm2 reload portfolio
```
