#!/usr/bin/env bash
# Saytlarni GitHub'dagi oxirgi holatga yangilaydi.
#   sudo bash /var/www/domains/scripts/update.sh
set -euo pipefail
ROOT="/var/www/domains"
git -C "$ROOT" pull --ff-only
chown -R root:www-data "$ROOT"
find "$ROOT" -type d -exec chmod 755 {} +
find "$ROOT" -type f -exec chmod 644 {} +
echo "Yangilandi: $(git -C "$ROOT" log -1 --format='%h %s')"
