// Scorpio Constellation Animation


const canvas = document.getElementById('stars-canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Scorpio constellation star positions (simplified)
const scorpioStars = [
  { x: 0.3, y: 0.3 }, // Head
  { x: 0.35, y: 0.35 },
  { x: 0.4, y: 0.4 },
  { x: 0.45, y: 0.45 }, // Body
  { x: 0.5, y: 0.5 },
  { x: 0.55, y: 0.52 },
  { x: 0.6, y: 0.48 }, // Tail curve
  { x: 0.65, y: 0.45 },
  { x: 0.68, y: 0.42 },
  { x: 0.7, y: 0.38 }, // Stinger
];

// Convert relative positions to absolute
const stars = scorpioStars.map(star => ({
  x: star.x * canvas.width,
  y: star.y * canvas.height,
  size: Math.random() * 2 + 2,
  opacity: Math.random() * 0.5 + 0.5,
  twinkleSpeed: Math.random() * 0.02 + 0.01,
}));

// Add random background stars
for (let i = 0; i < 100; i++) {
  stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 1.5 + 0.5,
    opacity: Math.random() * 0.3 + 0.2,
    twinkleSpeed: Math.random() * 0.01 + 0.005,
  });
}

// Movement variables
let offsetX = 0;
let offsetY = 0;

function drawStars() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw constellation connections
  ctx.strokeStyle = 'rgba(100, 255, 218, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i < scorpioStars.length - 1; i++) {
    const star1 = stars[i];
    const star2 = stars[i + 1];
    ctx.moveTo(star1.x + offsetX, star1.y + offsetY);
    ctx.lineTo(star2.x + offsetX, star2.y + offsetY);
  }
  ctx.stroke();
  
  // Draw stars
  stars.forEach((star, index) => {
    star.opacity += star.twinkleSpeed;
    if (star.opacity > 1 || star.opacity < 0.2) {
      star.twinkleSpeed *= -1;
    }
    
    ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
    ctx.beginPath();
    ctx.arc(star.x + offsetX, star.y + offsetY, star.size, 0, Math.PI * 2);
    ctx.fill();
    
    // Highlight constellation stars
    if (index < scorpioStars.length) {
      ctx.fillStyle = `rgba(100, 255, 218, ${star.opacity * 0.8})`;
      ctx.beginPath();
      ctx.arc(star.x + offsetX, star.y + offsetY, star.size + 1, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  
  // Slow drift movement
  offsetX += 0.1;
  offsetY += 0.05;
  
  // Reset if moved too far
  if (offsetX > 100) offsetX = -100;
  if (offsetY > 100) offsetY = -100;
  
  requestAnimationFrame(drawStars);
}

drawStars();

// Resize handler
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});


// Top navigation bar - show on scroll


const topNav = document.querySelector('.top-nav');

window.addEventListener('scroll', () => {
  if (window.scrollY > 100) {
    topNav.classList.add('visible');
  } else {
    topNav.classList.remove('visible');
  }
});


// Smooth scroll for all links


document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
}); 