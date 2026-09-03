#!/usr/bin/env bash
# Har bir domenga Let's Encrypt sertifikati oladi va HTTPS'ga yo'naltiradi.
# FAQAT DNS yozuvlari shu serverga yo'naltirilgandan KEYIN ishga tushiring.
#
#   sudo bash setup-ssl.sh

set -euo pipefail

EMAIL="dream.5650044@gmail.com"
DOMAINS=(aifabric.uz alphior.uz cybermate.uz protsess.uz thermotrade.uz)

log() { printf '\n\033[1;36m==> %s\033[0m\n' "$1"; }

[[ $EUID -eq 0 ]] || { echo "root kerak: sudo bash $0"; exit 1; }

MYIP=$(curl -s https://api.ipify.org || echo "?")
log "Serverning tashqi IP manzili: $MYIP"

ok=(); skip=()
for d in "${DOMAINS[@]}"; do
  resolved=$(dig +short "$d" A | tail -1)
  if [[ "$resolved" == "$MYIP" ]]; then
    ok+=("$d"); echo "  ✓ $d -> $resolved"
  else
    skip+=("$d"); echo "  ✗ $d -> ${resolved:-YOQ}  [kutilgan: $MYIP]"
  fi
done

if [[ ${#ok[@]} -eq 0 ]]; then
  echo
  echo "Hech bir domen serverga yo'naltirilmagan. DNS A yozuvlarini tekshiring."
  exit 1
fi

if [[ ${#skip[@]} -gt 0 ]]; then
  echo
  echo "Quyidagilar o'tkazib yuboriladi (DNS hali tayyor emas): ${skip[*]}"
  echo "Ular uchun DNS tarqalgach shu skriptni qayta ishga tushiring."
fi

for d in "${ok[@]}"; do
  log "Sertifikat: $d"
  args=(-d "$d")
  # www subdomeni ham yo'naltirilgan bo'lsagina qo'shamiz
  if [[ "$(dig +short "www.$d" A | tail -1)" == "$MYIP" ]]; then
    args+=(-d "www.$d")
  else
    echo "  (www.$d yo'naltirilmagan — sertifikatga qo'shilmadi)"
  fi
  certbot --nginx "${args[@]}" \
    --non-interactive --agree-tos -m "$EMAIL" \
    --redirect --keep-until-expiring
done

log "Avtomatik yangilanish tekshirilmoqda"
systemctl list-timers certbot.timer --no-pager | head -3 || true
certbot renew --dry-run

log "TAYYOR — HTTPS yoqildi"
for d in "${ok[@]}"; do echo "    https://$d"; done
