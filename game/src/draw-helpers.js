// Shared canvas helpers: rounded rectangles, pills, the flower face every
// plant shares, and the one font family the whole game uses. Every draw
// module imports these; render.js itself draws nothing but orchestration.

export const FONT = '"Trebuchet MS", Verdana, sans-serif';

export function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function pill(ctx, x, y, w, h, fill, stroke) {
  ctx.fillStyle = fill;
  rr(ctx, x, y, w, h, 10);
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    rr(ctx, x, y, w, h, 10);
    ctx.stroke();
  }
}

export function bigButton(ctx, rect, label, enabled = true) {
  ctx.globalAlpha = enabled ? 1 : 0.5;
  pill(ctx, rect.x, rect.y, rect.w, rect.h, '#2e7d32', '#a5d6a7');
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px ' + FONT;
  ctx.textAlign = 'center';
  ctx.fillText(label, rect.x + rect.w / 2, rect.y + rect.h / 2 + 1);
  ctx.textAlign = 'left';
  ctx.globalAlpha = 1;
}

// The flower face: eight petals around a smiling centre. Plants that are
// flowers reuse it; the torch and the crystal bloom draw their own shapes.
export function flower(ctx, x, y, petal, center, r, t, flash) {
  ctx.save();
  ctx.translate(x, y);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.sin(t * 2 + i) * 0.05;
    ctx.fillStyle = petal;
    ctx.beginPath();
    ctx.ellipse(Math.cos(a) * r * 0.75, Math.sin(a) * r * 0.75 - 4, r * 0.52, r * 0.34, a, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = center;
  ctx.beginPath();
  ctx.arc(0, -4, r * 0.58, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3a2b12';
  ctx.beginPath();
  ctx.arc(-r * 0.2, -6, r * 0.09, 0, Math.PI * 2);
  ctx.arc(r * 0.2, -6, r * 0.09, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#3a2b12';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(0, -2, r * 0.22, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  if (flash > 0) {
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, -4, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}
