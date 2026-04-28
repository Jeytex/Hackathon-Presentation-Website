const deck = document.getElementById("deck");
const progressBar = document.querySelector(".progress span");
const cursorGlow = document.querySelector(".cursor-glow");
const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");

let particles = [];
let cartItems = [];

document.querySelectorAll(".slide").forEach((slide) => {
  const motionField = document.createElement("div");
  motionField.className = "motion-field";
  motionField.setAttribute("aria-hidden", "true");

  for (let index = 0; index < 4; index += 1) {
    motionField.appendChild(document.createElement("span"));
  }

  slide.appendChild(motionField);
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
      }
    });
  },
  { root: deck, threshold: 0.28 }
);

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

document.querySelectorAll(".word-line").forEach((line) => {
  const words = line.dataset.words.split(" ");
  line.innerHTML = words.map((word) => `<span>${word}</span>`).join(" ");

  const wordObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        line.querySelectorAll("span").forEach((span, index) => {
          window.setTimeout(() => span.classList.add("visible"), index * 95);
        });
        wordObserver.unobserve(line);
      });
    },
    { root: deck, threshold: 0.55 }
  );

  wordObserver.observe(line);
});

deck.addEventListener("scroll", () => {
  const maxScroll = deck.scrollHeight - deck.clientHeight;
  const progress = maxScroll <= 0 ? 0 : (deck.scrollTop / maxScroll) * 100;
  progressBar.style.width = `${progress}%`;
});

window.addEventListener("pointermove", (event) => {
  cursorGlow.style.opacity = "1";
  cursorGlow.style.transform = `translate(${event.clientX}px, ${event.clientY}px) translate(-50%, -50%)`;
});

window.addEventListener("pointerleave", () => {
  cursorGlow.style.opacity = "0";
});

document.querySelectorAll(".add-cart").forEach((button) => {
  button.addEventListener("click", () => {
    const productName = button.dataset.name;
    cartItems.push(productName);
    updateCart(productName);
    pulseSound();
  });
});

const viewCartButton = document.getElementById("viewCartButton");
if (viewCartButton) {
  viewCartButton.addEventListener("click", () => {
    document.getElementById("cartPreview").classList.add("flash");
    window.setTimeout(() => document.getElementById("cartPreview").classList.remove("flash"), 560);
  });
}

const soundButton = document.getElementById("soundButton");
if (soundButton) {
  soundButton.addEventListener("click", pulseSound);
}

function updateCart(productName) {
  const cartCount = document.getElementById("cartCount");
  const cartStatus = document.getElementById("cartStatus");
  const cartPreview = document.getElementById("cartPreview");

  cartCount.textContent = cartItems.length;
  cartStatus.textContent = `${productName} added. ${cartItems.length} item${cartItems.length === 1 ? "" : "s"} in session.`;
  cartPreview.classList.remove("flash");
  void cartPreview.offsetWidth;
  cartPreview.classList.add("flash");
}

function pulseSound() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;

  const audio = new AudioContext();
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(620, audio.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(940, audio.currentTime + 0.08);
  gain.gain.setValueAtTime(0.0001, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.05, audio.currentTime + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.14);

  oscillator.connect(gain);
  gain.connect(audio.destination);
  oscillator.start();
  oscillator.stop(audio.currentTime + 0.16);
}

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * ratio);
  canvas.height = Math.floor(window.innerHeight * ratio);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  const count = Math.min(90, Math.max(36, Math.floor(window.innerWidth / 18)));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    radius: Math.random() * 1.8 + 0.4,
    speedX: (Math.random() - 0.5) * 0.28,
    speedY: (Math.random() - 0.5) * 0.28,
    alpha: Math.random() * 0.55 + 0.18,
  }));
}

function drawParticles() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  particles.forEach((particle, index) => {
    particle.x += particle.speedX;
    particle.y += particle.speedY;

    if (particle.x < 0 || particle.x > window.innerWidth) particle.speedX *= -1;
    if (particle.y < 0 || particle.y > window.innerHeight) particle.speedY *= -1;

    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(34, 247, 183, ${particle.alpha})`;
    ctx.fill();

    for (let next = index + 1; next < particles.length; next += 1) {
      const other = particles[next];
      const distance = Math.hypot(particle.x - other.x, particle.y - other.y);
      if (distance < 118) {
        ctx.strokeStyle = `rgba(72, 167, 255, ${(1 - distance / 118) * 0.13})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(other.x, other.y);
        ctx.stroke();
      }
    }
  });

  window.requestAnimationFrame(drawParticles);
}

resizeCanvas();
drawParticles();
window.addEventListener("resize", resizeCanvas);
