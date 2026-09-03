#!/usr/bin/env bash
# Beshta static landing page'ni MAVJUD Apache serveriga qo'shadi.
# Ubuntu/Debian + Apache 2.4.
#
#   sudo bash setup-server.sh
#
# Skript idempotent. Mavjud saytlarga (default vhost) TEGMAYDI.

set -euo pipefail

REPO="https://github.com/Dream-7070/domains-free-.git"
ROOT="/var/www/domains"
DOMAINS=(aifabric.uz alphior.uz cybermate.uz protsess.uz thermotrade.uz)

log() { printf '\n\033[1;36m==> %s\033[0m\n' "$1"; }

[[ $EUID -eq 0 ]] || { echo "root kerak: sudo bash $0"; exit 1; }
command -v apache2 >/dev/null || { echo "Apache topilmadi. Bu skript mavjud Apache uchun."; exit 1; }

log "Apache konfiguratsiyasi zaxiraga olinmoqda"
BK="/root/apache-backup-$(date +%Y%m%d-%H%M%S).tar.gz"
tar czf "$BK" /etc/apache2 2>/dev/null || true
echo "  Zaxira: $BK"
echo "  Hozirgi holat (o'zgarishdan oldin):"
apache2ctl -S 2>&1 | sed 's/^/    /' | head -20

log "Kerakli paketlar"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq git dnsutils curl certbot python3-certbot-apache

log "Apache modullari"
a2enmod headers expires deflate >/dev/null

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
  cat > "/etc/apache2/sites-available/$d.conf" <<EOF
<VirtualHost *:80>
    ServerName $d
    ServerAlias www.$d
    DocumentRoot $ROOT/$d

    <Directory $ROOT/$d>
        Options -Indexes +FollowSymLinks
        AllowOverride None
        Require all granted
    </Directory>

    <IfModule mod_expires.c>
        ExpiresActive On
        ExpiresByType text/css "access plus 30 days"
        ExpiresByType application/javascript "access plus 30 days"
        ExpiresByType image/png "access plus 30 days"
        ExpiresByType image/jpeg "access plus 30 days"
        ExpiresByType image/svg+xml "access plus 30 days"
        ExpiresByType image/webp "access plus 30 days"
        ExpiresByType font/woff2 "access plus 30 days"
    </IfModule>

    <IfModule mod_deflate.c>
        AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json image/svg+xml
    </IfModule>

    <IfModule mod_headers.c>
        Header always set X-Content-Type-Options "nosniff"
        Header always set X-Frame-Options "SAMEORIGIN"
        Header always set Referrer-Policy "strict-origin-when-cross-origin"
    </IfModule>

    ErrorLog \${APACHE_LOG_DIR}/$d-error.log
    CustomLog \${APACHE_LOG_DIR}/$d-access.log combined
</VirtualHost>
EOF
  a2ensite "$d.conf" >/dev/null
  echo "  + $d"
done

log "Konfiguratsiya tekshirilmoqda"
apache2ctl configtest

log "Apache qayta yuklanmoqda (reload — uzilishsiz)"
systemctl reload apache2

log "Natija"
apache2ctl -S 2>&1 | sed 's/^/  /' | head -25

echo
for d in "${DOMAINS[@]}"; do
  code=$(curl -s -o /dev/null -w '%{http_code}' -H "Host: $d" http://127.0.0.1/ || echo "---")
  echo "  $d -> HTTP $code"
done

cat <<EOF

TAYYOR — saytlar HTTP orqali ishlayapti.
Mavjud "EVE" ilovasi default vhost sifatida joyida qoldi.

Keyingi qadam (DNS allaqachon tayyor):

    sudo bash $ROOT/scripts/setup-ssl.sh

Biror narsa noto'g'ri ketsa, Apache konfiguratsiyasini qaytarish:

    tar xzf $BK -C / && systemctl reload apache2

EOF
