// ============================================================
// GLOBAL BACKGROUND - Single Scorpio constellation floating
// ============================================================

const bgCanvas = document.getElementById('bg-stars-canvas');
const bgCtx = bgCanvas.getContext('2d');

bgCanvas.width = window.innerWidth;
bgCanvas.height = window.innerHeight;

const scorpioShape = [
  { x: 0.00, y: 0.00 },
  { x: 0.04, y: 0.05 },
  { x: 0.08, y: 0.10 },
  { x: 0.12, y: 0.15 },
  { x: 0.16, y: 0.20 },
  { x: 0.22, y: 0.21 },
  { x: 0.28, y: 0.17 },
  { x: 0.33, y: 0.13 },
  { x: 0.36, y: 0.09 },
  { x: 0.38, y: 0.04 },
];

let scorpioInstance = null;
let bgRandomStars = [];

function initBgStars() {
  bgRandomStars = [];

  const W = window.innerWidth;
  const H = document.body.scrollHeight;

  const scale = 150 + Math.random() * 100;
  const ox = Math.random() * W;
  const oy = Math.random() * H;
  const angle = Math.random() * Math.PI * 2;
  const speed = 0.3 + Math.random() * 0.3;

  const stars = scorpioShape.map(s => ({
    x: ox + s.x * scale,
    y: oy + s.y * scale,
    baseOpacity: 0.5 + Math.random() * 0.3,
    opacity: 0.5,
    twinkleSpeed: Math.random() * 0.02 + 0.008,
    size: 2 + Math.random() * 2,
  }));

  scorpioInstance = {
    stars,
    offsetX: 0,
    offsetY: 0,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
  };

  for (let i = 0; i < 200; i++) {
    bgRandomStars.push({
      x: Math.random() * W,
      y: Math.random() * H,
      size: 0.8 + Math.random() * 1.5,
      opacity: 0.3 + Math.random() * 0.5,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      driftX: (Math.random() - 0.5) * 0.3,
      driftY: (Math.random() - 0.5) * 0.2,
    });
  }
}

function drawBgStars() {
  bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);

  const scrollY = window.scrollY;
  const W = window.innerWidth;
  const H = window.innerHeight;

  bgRandomStars.forEach(star => {
    star.opacity += star.twinkleSpeed;
    if (star.opacity > 0.9 || star.opacity < 0.2) star.twinkleSpeed *= -1;

    star.x += star.driftX;
    star.y += star.driftY;

    if (star.x < 0) star.x = W;
    if (star.x > W) star.x = 0;
    if (star.y - scrollY < -50) star.y += H + 100;
    if (star.y - scrollY > H + 50) star.y -= H + 100;

    const grd = bgCtx.createRadialGradient(star.x, star.y - scrollY, 0, star.x, star.y - scrollY, star.size * 2.5);
    grd.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`);
    grd.addColorStop(1, `rgba(255, 255, 255, 0)`);
    bgCtx.fillStyle = grd;
    bgCtx.beginPath();
    bgCtx.arc(star.x, star.y - scrollY, star.size * 2.5, 0, Math.PI * 2);
    bgCtx.fill();

    bgCtx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
    bgCtx.beginPath();
    bgCtx.arc(star.x, star.y - scrollY, star.size, 0, Math.PI * 2);
    bgCtx.fill();
  });

  const inst = scorpioInstance;
  inst.offsetX += inst.vx;
  inst.offsetY += inst.vy;

  const firstX = inst.stars[0].x + inst.offsetX;
  const firstY = inst.stars[0].y + inst.offsetY;
  const lastX  = inst.stars[inst.stars.length - 1].x + inst.offsetX;
  const lastY  = inst.stars[inst.stars.length - 1].y + inst.offsetY;

  if (firstX < -300 || lastX > W + 300) inst.vx *= -1;
  if (firstY < -300 || lastY > document.body.scrollHeight + 300) inst.vy *= -1;

  bgCtx.strokeStyle = `rgba(255, 255, 255, 0.25)`;
  bgCtx.lineWidth = 1;
  bgCtx.beginPath();
  inst.stars.forEach((star, idx) => {
    const x = star.x + inst.offsetX;
    const y = star.y + inst.offsetY - scrollY;
    if (idx === 0) bgCtx.moveTo(x, y);
    else bgCtx.lineTo(x, y);
  });
  bgCtx.stroke();

  inst.stars.forEach(star => {
    star.opacity += star.twinkleSpeed;
    if (star.opacity > star.baseOpacity + 0.2 || star.opacity < star.baseOpacity - 0.2) {
      star.twinkleSpeed *= -1;
    }

    const x = star.x + inst.offsetX;
    const y = star.y + inst.offsetY - scrollY;

    const grd = bgCtx.createRadialGradient(x, y, 0, x, y, star.size * 3);
    grd.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`);
    grd.addColorStop(1, `rgba(255, 255, 255, 0)`);
    bgCtx.fillStyle = grd;
    bgCtx.beginPath();
    bgCtx.arc(x, y, star.size * 3, 0, Math.PI * 2);
    bgCtx.fill();

    bgCtx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
    bgCtx.beginPath();
    bgCtx.arc(x, y, star.size, 0, Math.PI * 2);
    bgCtx.fill();
  });

  requestAnimationFrame(drawBgStars);
}

initBgStars();
drawBgStars();


// ============================================================
// HERO - Neural Network
// Forward: blue signals, neurons light blue when touched
// Backward: orange/red signals, neurons light orange when touched
// No trails — clean sharp signal head only
// ============================================================

const nnCanvas = document.getElementById('nn-canvas');
const nnCtx = nnCanvas.getContext('2d');

nnCanvas.width = window.innerWidth;
nnCanvas.height = window.innerHeight;

const LAYERS = [3, 10, 10, 10, 10, 6];

// Layer delay scales with max neurons in adjacent layers
// More connections = slightly more time to travel
function getLayerDelay(li) {
  const maxN = Math.max(LAYERS[li] || 1, LAYERS[li + 1] || 1);
  return 300 + maxN * 20;
}

// Signal speed — faster for smaller layers, adjusted per connection distance
function getSignalSpeed(li) {
  return 0.018 + Math.random() * 0.008;
}

let nnNodes = [];
let nnEdges = [];
let signals = [];
let activationWaves = [];
let currentPass = 'forward'; // 'forward' or 'backward'

function buildNetwork() {
  nnNodes = [];
  nnEdges = [];
  signals = [];
  activationWaves = [];

  const W = nnCanvas.width;
  const H = nnCanvas.height;

  const layerXPositions = LAYERS.map((_, i) =>
    W * 0.05 + (i / (LAYERS.length - 1)) * W * 0.90
  );

  LAYERS.forEach((count, li) => {
    const layer = [];
    for (let ni = 0; ni < count; ni++) {
      layer.push({
        x: layerXPositions[li],
        y: (H / (count + 1)) * (ni + 1),
        layer: li,
        activation: 0,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.015,
        radius: 9,
        lit: false,
        litColor: 'forward',
      });
    }
    nnNodes.push(layer);
  });

  for (let li = 0; li < LAYERS.length - 1; li++) {
    nnNodes[li].forEach(src => {
      nnNodes[li + 1].forEach(dst => {
        nnEdges.push({ src, dst, weight: Math.random() * 2 - 1 });
      });
    });
  }
}

// Fire all signals from a layer simultaneously
// direction: 'forward' fires src->dst, 'backward' fires dst->src
function fireLayer(li, direction) {
  if (!nnNodes[li]) return;

  nnNodes[li].forEach(node => {
    // Light up node
    node.activation = 0.7 + Math.random() * 0.3;
    node.litColor = direction;

    activationWaves.push({
      x: node.x,
      y: node.y,
      r: node.radius,
      opacity: 0.9,
      speed: 2.0,
      direction,
    });

    // Spawn signals to next/prev layer
    nnEdges.forEach(edge => {
      if (direction === 'forward' && edge.src === node) {
        signals.push({
          edge,
          t: 0,
          speed: getSignalSpeed(li),
          direction: 'forward',
        });
      } else if (direction === 'backward' && edge.dst === node) {
        signals.push({
          edge,
          t: 0,
          speed: getSignalSpeed(li),
          direction: 'backward',
        });
      }
    });
  });
}

function runCycle() {
  signals = [];
  nnNodes.forEach(layer => layer.forEach(node => {
    node.activation = 0;
  }));

  // Build forward pass schedule
  let t = 0;
  LAYERS.forEach((_, li) => {
    setTimeout(() => {
      currentPass = 'forward';
      fireLayer(li, 'forward');
    }, t);
    t += getLayerDelay(li);
  });

  const forwardEnd = t + 300;

  // Build backward pass schedule
  let tb = forwardEnd;
  for (let li = LAYERS.length - 1; li >= 0; li--) {
    const delay = tb;
    setTimeout(() => {
      currentPass = 'backward';
      fireLayer(li, 'backward');
    }, delay);
    tb += getLayerDelay(li);
  }

  const cycleEnd = tb + 500;
  setTimeout(runCycle, cycleEnd);
}

setTimeout(runCycle, 600);

function drawNN() {
  nnCtx.clearRect(0, 0, nnCanvas.width, nnCanvas.height);

  nnCtx.globalAlpha = 0.4;

  const scrollY = window.scrollY;

  // Random stars on hero
  bgRandomStars.forEach(star => {
    const grd = nnCtx.createRadialGradient(star.x, star.y - scrollY, 0, star.x, star.y - scrollY, star.size * 2.5);
    grd.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`);
    grd.addColorStop(1, `rgba(255, 255, 255, 0)`);
    nnCtx.fillStyle = grd;
    nnCtx.beginPath();
    nnCtx.arc(star.x, star.y - scrollY, star.size * 2.5, 0, Math.PI * 2);
    nnCtx.fill();

    nnCtx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
    nnCtx.beginPath();
    nnCtx.arc(star.x, star.y - scrollY, star.size, 0, Math.PI * 2);
    nnCtx.fill();
  });

  // Scorpio on hero
  const inst = scorpioInstance;
  nnCtx.strokeStyle = `rgba(255, 255, 255, 0.25)`;
  nnCtx.lineWidth = 1;
  nnCtx.beginPath();
  inst.stars.forEach((star, idx) => {
    const x = star.x + inst.offsetX;
    const y = star.y + inst.offsetY - scrollY;
    if (idx === 0) nnCtx.moveTo(x, y);
    else nnCtx.lineTo(x, y);
  });
  nnCtx.stroke();

  inst.stars.forEach(star => {
    const x = star.x + inst.offsetX;
    const y = star.y + inst.offsetY - scrollY;

    const grd = nnCtx.createRadialGradient(x, y, 0, x, y, star.size * 3);
    grd.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`);
    grd.addColorStop(1, `rgba(255, 255, 255, 0)`);
    nnCtx.fillStyle = grd;
    nnCtx.beginPath();
    nnCtx.arc(x, y, star.size * 3, 0, Math.PI * 2);
    nnCtx.fill();

    nnCtx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
    nnCtx.beginPath();
    nnCtx.arc(x, y, star.size, 0, Math.PI * 2);
    nnCtx.fill();
  });

  // Edges
  nnEdges.forEach(edge => {
    const w = edge.weight;
    const absW = Math.abs(w);
    const alpha = 0.03 + absW * 0.08;
    const thickness = 0.2 + absW * 0.8;
    let r, g, b;
    if (w >= 0) { r = 80;  g = 160; b = 220; }
    else        { r = 220; g = 130; b = 60;  }

    nnCtx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
    nnCtx.lineWidth = thickness;
    nnCtx.beginPath();
    nnCtx.moveTo(edge.src.x, edge.src.y);
    nnCtx.lineTo(edge.dst.x, edge.dst.y);
    nnCtx.stroke();
  });

  // Signals — no trail, just a sharp moving dot with glow
  for (let i = signals.length - 1; i >= 0; i--) {
    const sig = signals[i];
    const { src, dst } = sig.edge;

    // Forward travels src->dst, backward travels dst->src
    const t = sig.direction === 'forward' ? sig.t : 1 - sig.t;

    const headX = src.x + (dst.x - src.x) * t;
    const headY = src.y + (dst.y - src.y) * t;

    // Longer glowing body — no hard trail, just radial glow
    let r, g, b;
    if (sig.direction === 'forward') {
      r = 100; g = 200; b = 255; // blue
    } else {
      r = 255; g = 90;  b = 60;  // orange-red
    }

    // Elongated glow along the direction of travel
    const angle = Math.atan2(dst.y - src.y, dst.x - src.x);
    const len = 18; // longer body

    nnCtx.save();
    nnCtx.translate(headX, headY);
    nnCtx.rotate(angle);

    const bodyGrad = nnCtx.createLinearGradient(-len, 0, 4, 0);
    bodyGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0)`);
    bodyGrad.addColorStop(0.6, `rgba(${r}, ${g}, ${b}, 0.5)`);
    bodyGrad.addColorStop(1, `rgba(255, 255, 255, 0.95)`);

    nnCtx.strokeStyle = bodyGrad;
    nnCtx.lineWidth = 2.5;
    nnCtx.beginPath();
    nnCtx.moveTo(-len, 0);
    nnCtx.lineTo(4, 0);
    nnCtx.stroke();

    // Bright head dot
    const headDot = nnCtx.createRadialGradient(2, 0, 0, 2, 0, 7);
    headDot.addColorStop(0, `rgba(255, 255, 255, 1)`);
    headDot.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, 0.8)`);
    headDot.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
    nnCtx.fillStyle = headDot;
    nnCtx.beginPath();
    nnCtx.arc(2, 0, 7, 0, Math.PI * 2);
    nnCtx.fill();

    nnCtx.restore();

    sig.t += sig.speed;
    if (sig.t >= 1) signals.splice(i, 1);
  }

  // Activation ripples
  for (let i = activationWaves.length - 1; i >= 0; i--) {
    const wave = activationWaves[i];
    const isBack = wave.direction === 'backward';
    nnCtx.strokeStyle = isBack
      ? `rgba(255, 120, 60, ${wave.opacity})`
      : `rgba(100, 200, 255, ${wave.opacity})`;
    nnCtx.lineWidth = 1.2;
    nnCtx.beginPath();
    nnCtx.arc(wave.x, wave.y, wave.r, 0, Math.PI * 2);
    nnCtx.stroke();
    wave.r += wave.speed;
    wave.opacity -= 0.018;
    if (wave.opacity <= 0) activationWaves.splice(i, 1);
  }

  // Nodes
  nnNodes.forEach(layer => {
    layer.forEach(node => {
      node.pulsePhase += node.pulseSpeed;
      node.activation *= 0.993;

      const act = node.activation;
      const pulse = 0.5 + 0.5 * Math.sin(node.pulsePhase);

      // Glow color depends on whether forward or backward pass lit this node
      const isBack = node.litColor === 'backward';
      const glowR = isBack ? 255 : 100;
      const glowG = isBack ? 100 : 200;
      const glowB = isBack ? 60  : 255;

      if (act > 0.1) {
        const grd = nnCtx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.radius * 2.8);
        grd.addColorStop(0, `rgba(${glowR}, ${glowG}, ${glowB}, ${act * 0.5})`);
        grd.addColorStop(1, `rgba(${glowR}, ${glowG}, ${glowB}, 0)`);
        nnCtx.fillStyle = grd;
        nnCtx.beginPath();
        nnCtx.arc(node.x, node.y, node.radius * 2.8, 0, Math.PI * 2);
        nnCtx.fill();
      }

      // Node fill — blue tint forward, orange tint backward
      const brightness = Math.round(25 + act * 180 + pulse * 12);
      const nr = isBack ? Math.min(255, brightness + act * 80) : brightness;
      const ng = isBack ? Math.max(0,  brightness - act * 40) : brightness;
      const nb = isBack ? Math.max(0,  brightness - act * 60) : Math.min(255, brightness + act * 40);

      nnCtx.fillStyle = `rgb(${Math.round(nr)}, ${Math.round(ng)}, ${Math.round(nb)})`;
      nnCtx.beginPath();
      nnCtx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      nnCtx.fill();

      // Border
      nnCtx.strokeStyle = `rgba(${glowR}, ${glowG}, ${glowB}, ${0.25 + act * 0.5})`;
      nnCtx.lineWidth = 1;
      nnCtx.beginPath();
      nnCtx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      nnCtx.stroke();
    });
  });

  nnCtx.globalAlpha = 1.0;

  requestAnimationFrame(drawNN);
}

buildNetwork();
drawNN();


// ============================================================
// TOP NAV
// ============================================================

const topNav = document.querySelector('.top-nav');

window.addEventListener('scroll', () => {
  topNav.classList.toggle('visible', window.scrollY > 100);
});


// ============================================================
// SMOOTH SCROLL
// ============================================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});


// ============================================================
// RESIZE
// ============================================================

window.addEventListener('resize', () => {
  bgCanvas.width = window.innerWidth;
  bgCanvas.height = window.innerHeight;
  initBgStars();

  nnCanvas.width = window.innerWidth;
  nnCanvas.height = window.innerHeight;
  buildNetwork();
});