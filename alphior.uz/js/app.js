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
        navMenu.style.background = '#060709';
        navMenu.style.padding = '1.5rem';
        navMenu.style.borderBottom = '1px solid rgba(212,175,55,0.2)';
      }
    });
  }

  /* 2. Hero Background Stars/Gold Dust */
  const bgCanvas = document.getElementById('gold-canvas');
  if (bgCanvas) {
    const ctx = bgCanvas.getContext('2d');
    let width, height, stars = [];

    function resize() {
      width = bgCanvas.width = bgCanvas.offsetWidth;
      height = bgCanvas.height = bgCanvas.offsetHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    for (let i = 0; i < 60; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.6 + 0.2,
        speed: Math.random() * 0.3 + 0.1
      });
    }

    function animateBg() {
      ctx.clearRect(0, 0, width, height);
      stars.forEach(s => {
        s.y -= s.speed;
        if (s.y < 0) s.y = height;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 175, 55, ${s.alpha})`;
        ctx.fill();
      });
      requestAnimationFrame(animateBg);
    }
    animateBg();
  }

  /* 3. 3D Rotating Golden Icosahedron / Polyhedron Canvas */
  const polyCanvas = document.getElementById('poly-canvas');
  if (polyCanvas) {
    const ctx = polyCanvas.getContext('2d');
    const cx = polyCanvas.width / 2;
    const cy = polyCanvas.height / 2;
    const size = 90;
    let angleX = 0;
    let angleY = 0;

    // Vertices of Octahedron
    const vertices = [
      [0, size, 0],
      [0, -size, 0],
      [size, 0, 0],
      [-size, 0, 0],
      [0, 0, size],
      [0, 0, -size]
    ];

    const edges = [
      [0, 2], [0, 3], [0, 4], [0, 5],
      [1, 2], [1, 3], [1, 4], [1, 5],
      [2, 4], [4, 3], [3, 5], [5, 2]
    ];

    function project(p) {
      // Rotation Y
      const radY = angleY;
      const x1 = p[0] * Math.cos(radY) + p[2] * Math.sin(radY);
      const z1 = -p[0] * Math.sin(radY) + p[2] * Math.cos(radY);
      
      // Rotation X
      const radX = angleX;
      const y2 = p[1] * Math.cos(radX) - z1 * Math.sin(radX);
      const z2 = p[1] * Math.sin(radX) + z1 * Math.cos(radX);

      const fov = 350;
      const scale = fov / (fov + z2 + 150);
      return [x1 * scale + cx, y2 * scale + cy, z2];
    }

    function renderPoly() {
      ctx.clearRect(0, 0, polyCanvas.width, polyCanvas.height);

      const proj = vertices.map(v => project(v));

      ctx.lineWidth = 2;
      ctx.strokeStyle = '#D4AF37';
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#FFDF73';

      edges.forEach(e => {
        const p1 = proj[e[0]];
        const p2 = proj[e[1]];
        ctx.beginPath();
        ctx.moveTo(p1[0], p1[1]);
        ctx.lineTo(p2[0], p2[1]);
        ctx.stroke();
      });

      // Nodes
      proj.forEach(p => {
        ctx.beginPath();
        ctx.arc(p[0], p[1], 4, 0, Math.PI * 2);
        ctx.fillStyle = '#FFDF73';
        ctx.fill();
      });

      angleX += 0.008;
      angleY += 0.012;
      requestAnimationFrame(renderPoly);
    }
    renderPoly();
  }

  /* 4. Venture Valuation Simulator */
  const arrRange = document.getElementById('arr-range');
  const arrVal = document.getElementById('arr-val');
  const growthTarget = document.getElementById('growth-target');
  const valOut = document.getElementById('valuation-val');
  const growthOut = document.getElementById('growth-val');
  const sectorBtns = document.querySelectorAll('#sector-toggle .btn-toggle');
  let sectorMult = 4.5;

  sectorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sectorBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      sectorMult = parseFloat(btn.dataset.mult);
      calcValuation();
    });
  });

  function calcValuation() {
    if (!arrRange) return;
    const arr = parseInt(arrRange.value, 10);
    arrVal.textContent = '$' + arr.toLocaleString('en-US');

    const targetMult = parseFloat(growthTarget.value);
    const valuation = Math.round(arr * sectorMult * targetMult);
    const growthPercent = Math.round((targetMult - 1) * 100 + (sectorMult * 40));

    valOut.textContent = '$' + valuation.toLocaleString('en-US');
    growthOut.textContent = '+' + growthPercent + '%';
  }

  if (arrRange && growthTarget) {
    arrRange.addEventListener('input', calcValuation);
    growthTarget.addEventListener('change', calcValuation);
    calcValuation();
  }

  /* 5. Form Handling */
  const form = document.getElementById('alphior-form');
  const status = document.getElementById('aStatus');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      status.innerHTML = '<p style="color: #FFDF73; margin-top: 1rem;">💎 So’rovingiz qabul qilindi. Tez orada Orzimurod (+998 94 405 70 70) konfidentsial aloqaga chiqadi.</p>';
      form.reset();
    });
  }
})();
