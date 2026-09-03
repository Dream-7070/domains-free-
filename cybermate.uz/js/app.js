(function () {
  'use strict';

  /* 1. Mobile Menu */
  const toggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  if (toggle && navMenu) {
    toggle.addEventListener('click', () => {
      const isBlock = navMenu.style.display === 'flex';
      navMenu.style.display = isBlock ? 'none' : 'flex';
      if (!isBlock) {
        navMenu.style.flexDirection = 'column';
        navMenu.style.position = 'absolute';
        navMenu.style.top = '100%';
        navMenu.style.left = '0';
        navMenu.style.width = '100%';
        navMenu.style.background = '#04070F';
        navMenu.style.padding = '1.5rem';
        navMenu.style.borderBottom = '1px solid rgba(0,245,155,0.2)';
      }
    });
  }

  /* 2. Cyber Matrix Canvas Rain */
  const canvas = document.getElementById('matrix-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height, columns, drops = [];
    const chars = '01CYBERMATE_SHIELD_SECURE_HASH_256_RSA_AES_SOC';

    function resize() {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
      columns = Math.floor(width / 20);
      drops = [];
      for (let i = 0; i < columns; i++) {
        drops[i] = Math.random() * -100;
      }
    }
    window.addEventListener('resize', resize);
    resize();

    function drawMatrix() {
      ctx.fillStyle = 'rgba(4, 7, 15, 0.08)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#00F59B';
      ctx.font = '12px JetBrains Mono';

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * 20, drops[i] * 20);

        if (drops[i] * 20 > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      requestAnimationFrame(drawMatrix);
    }
    drawMatrix();
  }

  /* 3. Vulnerability Scanner Simulator */
  const scanBtn = document.getElementById('start-scan-btn');
  const targetDomain = document.getElementById('target-domain');
  const consoleBox = document.getElementById('scan-console');

  if (scanBtn && targetDomain && consoleBox) {
    scanBtn.addEventListener('click', () => {
      const domain = targetDomain.value.trim() || 'example.uz';
      consoleBox.innerHTML = '';
      
      const logs = [
        `[+] Skanerlash boshlandi: https://${domain}`,
        `[i] DNS & SSL TLS 1.3 shifrlash tekshirilmoqda...`,
        `[i] Ochiq portlar qidirilmoqda: 80, 443, 8080, 22, 3306...`,
        `[✓] SSL Sertifikati faol.`,
        `[!] DIQQAT: 1 ta potentsial WAF xavfsizlik konfiguratsiyasi zaifligi topildi.`,
        `[✓] Tahlil yakunlandi. To'liq PenTest hisoboti uchun quyidagi forma orqali bog'laning.`
      ];

      logs.forEach((msg, idx) => {
        setTimeout(() => {
          const p = document.createElement('p');
          p.className = 'console-line';
          p.style.color = msg.includes('DIQQAT') ? '#FFD600' : (msg.includes('Skanerlash') ? '#00E5FF' : '#00F59B');
          p.textContent = msg;
          consoleBox.appendChild(p);
          consoleBox.scrollTop = consoleBox.scrollHeight;
        }, (idx + 1) * 450);
      });
    });
  }

  /* 4. Form Handling */
  const form = document.getElementById('cyber-form');
  const status = document.getElementById('cStatus');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      status.innerHTML = '<p style="color: #00F59B; margin-top: 1rem;">🛡️ So’rovingiz qabul qilindi. Tez orada Orzimurod (+998 94 405 70 70) kiber-audit bo’yicha bog’lanadi.</p>';
      form.reset();
    });
  }
})();
