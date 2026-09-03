#!/usr/bin/env bash
# Beshta static landing page uchun toza serverni sozlaydi.
# Ubuntu 24.04 LTS. root bilan ishga tushiriladi.
#
#   curl -fsSL <raw-url> | sudo bash
#
# Skript idempotent: qayta-qayta ishga tushirsa bo'ladi.

set -euo pipefail

REPO="https://github.com/Dream-7070/domains-free-.git"
ROOT="/var/www/domains"
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
chown -R root:www-data "$ROOT"
find "$ROOT" -type d -exec chmod 755 {} +
find "$ROOT" -type f -exec chmod 644 {} +

log "Virtual hostlar yaratilmoqda"
for d in "${DOMAINS[@]}"; do
  [[ -f "$ROOT/$d/index.html" ]] || { echo "  ! $ROOT/$d/index.html yo'q, o'tkazib yuborildi"; continue; }
  cat > "/etc/nginx/sites-available/$d" <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name $d www.$d;

    root $ROOT/$d;
    index index.html;

    location / {
        try_files \$uri \$uri/ =404;
    }

    location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg|webp|woff|woff2|ttf)\$ {
        expires 30d;
        add_header Cache-Control "public";
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

    access_log /var/log/nginx/$d-access.log;
    error_log  /var/log/nginx/$d-error.log;
}
EOF
  ln -sfn "/etc/nginx/sites-available/$d" "/etc/nginx/sites-enabled/$d"
  echo "  + $d"
done

# Noma'lum domen yoki IP orqali kelgan so'rovlarni to'sadigan default
cat > /etc/nginx/sites-available/000-catchall <<'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    return 444;
}
EOF
ln -sfn /etc/nginx/sites-available/000-catchall /etc/nginx/sites-enabled/000-catchall
rm -f /etc/nginx/sites-enabled/default

# Domen nomlari standart 32-baytlik xesh chelagiga sig'maydi
cat > /etc/nginx/conf.d/00-tuning.conf <<'EOF'
server_names_hash_bucket_size 64;
EOF

log "Konfiguratsiya tekshirilmoqda"
nginx -t

log "Nginx ishga tushirilmoqda"
systemctl enable --now nginx
systemctl reload nginx

log "Firewall"
ufw allow OpenSSH >/dev/null
ufw allow 'Nginx Full' >/dev/null
ufw --force enable >/dev/null
ufw status | sed 's/^/  /' | head -12

log "Lokal tekshiruv"
for d in "${DOMAINS[@]}"; do
  code=$(curl -s -o /dev/null -w '%{http_code}' -H "Host: $d" http://127.0.0.1/ || echo "---")
  echo "  $d -> HTTP $code"
done

MYIP=$(curl -s https://api.ipify.org || echo "?")
cat <<EOF

TAYYOR — saytlar HTTP orqali ishlayapti.
Serverning tashqi IP manzili: $MYIP

Keyingi qadamlar:
  1) DNS: har bir domenning @ va www A yozuvini $MYIP ga o'zgartiring
  2) Tarqalgach:  sudo bash $ROOT/scripts/setup-ssl.sh

EOF
