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
        navMenu.style.background = '#0A0D14';
        navMenu.style.padding = '1.5rem';
        navMenu.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
      }
    });
  }

  /* 2. Hero Canvas - Thermal Particles (Heat & Cool convection) */
  const canvas = document.getElementById('thermo-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height, particles = [];

    function resize() {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.isHeat = Math.random() > 0.5;
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = this.isHeat ? -(Math.random() * 1.2 + 0.3) : (Math.random() * 1.2 + 0.3);
        this.radius = Math.random() * 3 + 1.5;
        this.alpha = Math.random() * 0.5 + 0.2;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.y < 0 || this.y > height || this.x < 0 || this.x > width) {
          this.reset();
          this.y = this.isHeat ? height : 0;
        }
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.isHeat 
          ? `rgba(255, 87, 34, ${this.alpha})`
          : `rgba(0, 229, 255, ${this.alpha})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.isHeat ? '#FF5722' : '#00E5FF';
        ctx.fill();
      }
    }

    for (let i = 0; i < 45; i++) {
      particles.push(new Particle());
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(animate);
    }
    animate();
  }

  /* 3. Thermal Mode Selector */
  const heatMode = document.getElementById('mode-heat');
  const coolMode = document.getElementById('mode-cool');
  const tempGauge = document.getElementById('gauge-temp');
  if (heatMode && coolMode && tempGauge) {
    heatMode.addEventListener('click', () => {
      heatMode.classList.add('active');
      coolMode.classList.remove('active');
      tempGauge.textContent = '+24.5°C';
      tempGauge.style.color = '#FF5722';
    });
    coolMode.addEventListener('click', () => {
      coolMode.classList.add('active');
      heatMode.classList.remove('active');
      tempGauge.textContent = '+19.0°C';
      tempGauge.style.color = '#00E5FF';
    });
  }

  /* 4. Interactive Energy Calculator */
  const areaRange = document.getElementById('area-range');
  const areaVal = document.getElementById('area-val');
  const resPower = document.getElementById('res-power');
  const resSaving = document.getElementById('res-saving');
  const objButtons = document.querySelectorAll('#obj-type .btn-toggle');
  let currentObjType = 'commercial';

  objButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      objButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentObjType = btn.dataset.type;
      recalc();
    });
  });

  function recalc() {
    if (!areaRange) return;
    const area = parseInt(areaRange.value, 10);
    areaVal.textContent = area + ' m²';

    let multiplier = 0.12;
    if (currentObjType === 'industry') multiplier = 0.18;
    if (currentObjType === 'house') multiplier = 0.10;

    const power = Math.round(area * multiplier);
    resPower.textContent = power + ' kVt';

    const savingAmount = Math.round(area * 70000);
    resSaving.textContent = '~' + savingAmount.toLocaleString('uz-UZ') + " so'm / yil";
  }

  if (areaRange) {
    areaRange.addEventListener('input', recalc);
    recalc();
  }

  /* 5. Lead Form Simulation */
  const form = document.getElementById('thermo-form');
  const formStatus = document.getElementById('form-status');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      formStatus.innerHTML = '<p style="color: #00F59B; margin-top: 1rem;">✅ Rahmat! So’rovingiz qabul qilindi. Tez orada Orzimurod (+998 94 405 70 70) siz bilan bog’lanadi.</p>';
      form.reset();
    });
  }
})();
