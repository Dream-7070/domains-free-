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
        navMenu.style.background = '#08070E';
        navMenu.style.padding = '1.5rem';
        navMenu.style.borderBottom = '1px solid rgba(255,51,102,0.2)';
      }
    });
  }

  /* 2. Hero Background Viral Particles Canvas */
  const canvas = document.getElementById('media-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height, particles = [];

    function resize() {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 2.5 + 1,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        alpha: Math.random() * 0.5 + 0.2
      });
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 51, 102, ${p.alpha})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#FF3366';
        ctx.fill();
      });
      requestAnimationFrame(animate);
    }
    animate();
  }

  /* 3. Interactive SMM Calculator */
  const budgetRange = document.getElementById('budget-range');
  const budgetVal = document.getElementById('budget-val');
  const resReach = document.getElementById('res-reach');
  const resLeads = document.getElementById('res-leads');
  const bizBtns = document.querySelectorAll('#biz-toggle .btn-toggle');
  let bizMult = 1.2;

  bizBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      bizBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      bizMult = parseFloat(btn.dataset.mult);
      recalc();
    });
  });

  function recalc() {
    if (!budgetRange) return;
    const budget = parseInt(budgetRange.value, 10);
    budgetVal.textContent = '$' + budget.toLocaleString('en-US');

    const reach = Math.round(budget * 300 * bizMult);
    const minLeads = Math.round(budget * 0.6 * bizMult);
    const maxLeads = Math.round(budget * 0.9 * bizMult);

    resReach.textContent = '~' + reach.toLocaleString('uz-UZ') + ' odam';
    resLeads.textContent = `~${minLeads} - ${maxLeads} ta`;
  }

  if (budgetRange) {
    budgetRange.addEventListener('input', recalc);
    recalc();
  }

  /* 4. Lead Form Handling */
  const form = document.getElementById('smm-form');
  const status = document.getElementById('sStatus');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      status.innerHTML = '<p style="color: #FF80AB; margin-top: 1rem;">🎬 Rahmat! SMM arizangiz qabul qilindi. Tez orada Orzimurod (+998 94 405 70 70, @dream_0044) siz bilan bog’lanadi.</p>';
      form.reset();
    });
  }
})();
