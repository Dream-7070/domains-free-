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
        navMenu.style.background = '#090611';
        navMenu.style.padding = '1.5rem';
        navMenu.style.borderBottom = '1px solid rgba(168,85,247,0.2)';
      }
    });
  }

  /* 2. Neural Mesh Fabric Canvas */
  const canvas = document.getElementById('mesh-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height, points = [];

    function resize() {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
      initPoints();
    }
    window.addEventListener('resize', resize);

    function initPoints() {
      points = [];
      const num = Math.min(Math.floor((width * height) / 12000), 50);
      for (let i = 0; i < num; i++) {
        points.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          radius: Math.random() * 2 + 1
        });
      }
    }
    resize();

    function drawMesh() {
      ctx.clearRect(0, 0, width, height);

      // Connect points with lines (fabric)
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const dx = points[i].x - points[j].x;
          const dy = points[i].y - points[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            const alpha = 1 - dist / 130;
            ctx.beginPath();
            ctx.moveTo(points[i].x, points[i].y);
            ctx.lineTo(points[j].x, points[j].y);
            ctx.strokeStyle = `rgba(168, 85, 247, ${alpha * 0.35})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // Draw points
      points.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#EC4899';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#EC4899';
        ctx.fill();
      });

      requestAnimationFrame(drawMesh);
    }
    drawMesh();
  }

  /* 3. AI ROI Calculator */
  const reqRange = document.getElementById('req-range');
  const reqVal = document.getElementById('req-val');
  const opRange = document.getElementById('op-range');
  const opVal = document.getElementById('op-val');
  const humanCost = document.getElementById('human-cost');
  const aiSaved = document.getElementById('ai-saved');

  function recalc() {
    if (!reqRange || !opRange) return;
    const req = parseInt(reqRange.value, 10);
    const op = parseInt(opRange.value, 10);

    reqVal.textContent = req.toLocaleString('uz-UZ') + ' ta';
    opVal.textContent = op + ' kishi';

    const hCost = op * 6000000;
    const aiCost = Math.round(req * 500 + 2000000);
    const saved = Math.max(hCost - aiCost, 0);

    humanCost.textContent = '~' + hCost.toLocaleString('uz-UZ') + " so'm / oy";
    aiSaved.textContent = '~' + saved.toLocaleString('uz-UZ') + " so'm / oy";
  }

  if (reqRange && opRange) {
    reqRange.addEventListener('input', recalc);
    opRange.addEventListener('input', recalc);
    recalc();
  }

  /* 4. Form Handling */
  const form = document.getElementById('ai-form');
  const status = document.getElementById('aiStatus');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      status.innerHTML = '<p style="color: #A855F7; margin-top: 1rem;">🤖 So’rovingiz qabul qilindi. Tez orada Orzimurod (+998 94 405 70 70) siz bilan bog’lanadi.</p>';
      form.reset();
    });
  }
})();
