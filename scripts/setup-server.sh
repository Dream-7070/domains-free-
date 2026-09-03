#!/usr/bin/env bash
# Beshta static landing page uchun serverni noldan sozlaydi.
# Ubuntu/Debian. root yoki sudo bilan ishga tushiriladi.
#
#   sudo bash setup-server.sh
#
# Skript idempotent: qayta-qayta ishga tushirsa bo'ladi.

set -euo pipefail

REPO="https://github.com/Dream-7070/domains-free-.git"
ROOT="/var/www/domains"
EMAIL="dream.5650044@gmail.com"       # Let's Encrypt ogohlantirishlari shu manzilga keladi
DOMAINS=(aifabric.uz alphior.uz cybermate.uz protsess.uz thermotrade.uz)

log() { printf '\n\033[1;36m==> %s\033[0m\n' "$1"; }

[[ $EUID -eq 0 ]] || { echo "root kerak: sudo bash $0"; exit 1; }

log "Paketlar o'rnatilmoqda"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq nginx git certbot python3-certbot-nginx ufw dnsutils curl

log "Repo klon qilinmoqda -> $ROOT"
if [[ -d "$ROOT/.git" ]]; then
  git -C "$ROOT" pull --ff-only
else
  mkdir -p "$(dirname "$ROOT")"
  git clone "$REPO" "$ROOT"
fi
# Nginx (www-data) o'qiy olishi uchun
chown -R root:www-data "$ROOT"
find "$ROOT" -type d -exec chmod 755 {} +
find "$ROOT" -type f -exec chmod 644 {} +

log "Nginx virtual hostlar yaratilmoqda"
for d in "${DOMAINS[@]}"; do
  [[ -f "$ROOT/$d/index.html" ]] || { echo "OGOHLANTIRISH: $ROOT/$d/index.html topilmadi, o'tkazib yuborildi"; continue; }
  cat > "/etc/nginx/sites-available/$d" <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name $d www.$d;

    root $ROOT/$d;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Statik fayllar uchun kesh
    location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg|webp|woff|woff2|ttf)\$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;

    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    location ~ /\.(?!well-known) { deny all; }
}
EOF
  ln -sfn "/etc/nginx/sites-available/$d" "/etc/nginx/sites-enabled/$d"
  echo "  + $d"
done

# Standart "Welcome to nginx" sahifasi noma'lum domenlarni ushlab qolmasin
rm -f /etc/nginx/sites-enabled/default

log "Nginx konfiguratsiyasi tekshirilmoqda"
nginx -t
systemctl reload nginx
systemctl enable --now nginx

log "Firewall"
ufw allow OpenSSH >/dev/null
ufw allow 'Nginx Full' >/dev/null
ufw --force enable >/dev/null
ufw status | head -20

log "TAYYOR — HTTP ishlayapti"
cat <<EOF

Keyingi qadam: SSL.
DNS yozuvlari serverga yo'naltirilganiga ISHONCH HOSIL QILING, keyin:

    sudo bash $ROOT/scripts/setup-ssl.sh

Tekshirish uchun (DNS tarqalganini bilish):
$(for d in "${DOMAINS[@]}"; do echo "    dig +short $d"; done)

EOF
