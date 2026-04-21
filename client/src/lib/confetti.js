/**
 * Confetti burst — pure vanilla JS / DOM, no external library
 * Call launchConfetti() to trigger a burst of colorful confetti pieces.
 */

const COLORS = ["#ff6b6b", "#feca57", "#48dbfb", "#ff9ff3", "#54a0ff", "#5f27cd", "#1dd1a1", "#ff9f43"];

export function launchConfetti(count = 80, durationMs = 2200) {
  const pieces = [];

  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    el.className = "confetti-piece";
    el.style.left = `${Math.random() * 100}vw`;
    el.style.background = COLORS[Math.floor(Math.random() * COLORS.length)];
    el.style.width = `${6 + Math.random() * 8}px`;
    el.style.height = `${6 + Math.random() * 8}px`;
    el.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
    el.style.animationDuration = `${durationMs / 1000 * (0.6 + Math.random() * 0.8)}s`;
    el.style.animationDelay = `${Math.random() * 0.4}s`;
    document.body.appendChild(el);
    pieces.push(el);
  }

  setTimeout(() => {
    pieces.forEach((el) => el.remove());
  }, durationMs + 500);
}
