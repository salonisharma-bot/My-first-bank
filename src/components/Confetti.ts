import confetti from "canvas-confetti";

export function celebrate() {
  const end = Date.now() + 800;
  const colors = ["#0d2547", "#27b3a8", "#f5b941", "#ffffff"];
  (function frame() {
    confetti({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0 }, colors });
    confetti({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1 }, colors });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}