# Despliegue manual en un VPS (Ubuntu)

Runbook de referencia. Todo corre en la misma instancia, sin Redis ni servicios externos.

## 1. Prerrequisitos del sistema

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs nginx
sudo corepack enable
corepack prepare pnpm@11.9.0 --activate
sudo npm install -g pm2
```

Postgres: si no está instalado, `sudo apt-get install -y postgresql`. Luego crear rol y base de datos:

```bash
sudo -u postgres psql -c "CREATE ROLE activity WITH LOGIN PASSWORD 'una-clave-fuerte';"
sudo -u postgres psql -c "CREATE DATABASE activity OWNER activity;"
```

## 2. Código

```bash
cd ~
git clone https://github.com/Reyloso/Activity.git activity
cd activity
```

Para actualizar más adelante: `cd ~/activity && git pull && pnpm install && pnpm build && pm2 restart all`.

## 3. Variables de entorno

Copiar `.env.example` a `.env` y completar con valores reales (nunca se commitea):

```bash
cp .env.example .env
nano .env
```

- `DATABASE_URL`: `postgresql://activity:una-clave-fuerte@localhost:5432/activity`
- `AUTH_SECRET`: generar con `openssl rand -base64 32`
- `ALLOWED_EMAIL_DOMAIN`: dominio corporativo permitido
- `TRIVIA_SOCKET_PORT`: `4001`
- `NEXT_PUBLIC_SOCKET_URL`: la URL pública del sitio (ej. `https://teambuilding.milio.com.co`), ya que nginx enruta `/socket.io` al mismo origen. **Se hornea en el build** — si cambia, hay que correr `pnpm build` de nuevo.

## 4. Instalar, migrar, construir

```bash
pnpm install
pnpm dlx prisma migrate deploy
pnpm build
```

## 5. Levantar los dos procesos con PM2

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup   # corre el comando sudo que imprime, una sola vez
```

## 6. nginx

```bash
sudo cp deploy/nginx.conf.example /etc/nginx/sites-available/activity
sudo ln -s /etc/nginx/sites-available/activity /etc/nginx/sites-enabled/activity
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

## 7. HTTPS con certbot

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d teambuilding.milio.com.co
```

Certbot reescribe el bloque de nginx para redirigir a HTTPS y renueva automáticamente.

## 8. Firewall

Solo 80 y 443 deben estar expuestos públicamente. 3000 y 4001 quedan internos (nginx habla con ellos por `127.0.0.1`).

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## Verificación

- `pm2 status` — ambos procesos `online`.
- `curl -I https://teambuilding.milio.com.co` — 200/307.
- Crear una sala de Trivias y unirse desde otro dispositivo para confirmar que el WebSocket funciona a través de nginx.
