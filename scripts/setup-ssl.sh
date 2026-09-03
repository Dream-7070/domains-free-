#!/usr/bin/env bash
# Har bir domenga Let's Encrypt sertifikati (Apache plugin).
#   sudo bash setup-ssl.sh
set -euo pipefail

EMAIL="dream.5650044@gmail.com"
DOMAINS=(aifabric.uz alphior.uz cybermate.uz protsess.uz thermotrade.uz)

log() { printf '\n\033[1;36m==> %s\033[0m\n' "$1"; }
[[ $EUID -eq 0 ]] || { echo "root kerak: sudo bash $0"; exit 1; }

MYIP=$(curl -s https://api.ipify.org || echo "?")
log "Serverning tashqi IP manzili: $MYIP"

ok=()
for d in "${DOMAINS[@]}"; do
  r=$(dig +short "$d" A | tail -1)
  if [[ "$r" == "$MYIP" ]]; then ok+=("$d"); echo "  OK  $d -> $r"
  else echo "  --  $d -> ${r:-YOQ}  [kutilgan: $MYIP]"; fi
done

[[ ${#ok[@]} -gt 0 ]] || { echo; echo "Hech bir domen serverga yo'naltirilmagan."; exit 1; }

for d in "${ok[@]}"; do
  log "Sertifikat: $d"
  args=(-d "$d")
  if [[ "$(dig +short "www.$d" A | tail -1)" == "$MYIP" ]]; then
    args+=(-d "www.$d")
  else
    echo "  (www.$d yo'naltirilmagan — qo'shilmadi)"
  fi
  certbot --apache "${args[@]}" \
    --non-interactive --agree-tos -m "$EMAIL" \
    --redirect --keep-until-expiring
done

log "Avtomatik yangilanish"
certbot renew --dry-run

log "TAYYOR"
for d in "${ok[@]}"; do echo "    https://$d"; done
