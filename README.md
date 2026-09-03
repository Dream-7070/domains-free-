# Domains

Beshta static landing page. Har bir sayt o'z papkasida, build talab qilmaydi.

| Domen | Papka |
|---|---|
| aifabric.uz | `aifabric.uz/` |
| alphior.uz | `alphior.uz/` |
| cybermate.uz | `cybermate.uz/` |
| protsess.uz | `protsess.uz/` |
| thermotrade.uz | `thermotrade.uz/` |

## Struktura

Har bir sayt bir xil ko'rinishda:

```
<domen>/
├── index.html
├── css/style.css
└── js/app.js
```

## Lokal ko'rish

Bitta saytni brauzerda ochish uchun:

```bash
cd aifabric.uz && python -m http.server 8000
```

## Deploy

Server: mavjud **Apache 2.4**, har bir domen uchun alohida virtual host,
DocumentRoot sifatida shu repodagi domen papkasi. SSL — Let's Encrypt.

Serverda avvaldan boshqa ilova ishlaydi (default vhost) — unga tegilmaydi.

Yangilash:

```bash
cd /var/www/domains && git pull
```

Build yo'q, restart yo'q — o'zgargan fayllar joyiga tushadi.

Skriptlar: `scripts/setup-server.sh`, `scripts/setup-ssl.sh`, `scripts/update.sh`
