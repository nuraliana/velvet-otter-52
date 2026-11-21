// Twin Peeks — canvas drawing primitives. Every scene is built from these
// small helpers, so the art stays consistent and the code stays readable.

// A filled circle.
export function circle(ctx, x, y, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

// A filled ellipse.
export function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

// A filled rectangle.
export function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

// A filled rounded rectangle.
export function roundRect(ctx, x, y, w, h, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

// A stroked rounded rectangle.
export function roundRectStroke(ctx, x, y, w, h, r, stroke, lw) {
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lw;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.stroke();
}

// A filled polygon from [[x, y], ...].
export function poly(ctx, points, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fill();
}

// A straight line.
export function line(ctx, x1, y1, x2, y2, stroke, lw) {
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lw;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

// A filled star with `points` spikes (outer radius r, inner radius r*0.45).
export function star(ctx, x, y, r, points, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = (i * Math.PI) / points - Math.PI / 2;
    const px = x + Math.cos(a) * rad;
    const py = y + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

// A puffy cloud: three overlapping circles plus a flat base.
export function cloud(ctx, x, y, s, fill) {
  circle(ctx, x, y, s * 0.55, fill);
  circle(ctx, x + s * 0.5, y + s * 0.08, s * 0.42, fill);
  circle(ctx, x - s * 0.5, y + s * 0.1, s * 0.4, fill);
  ellipse(ctx, x, y + s * 0.28, s * 0.95, s * 0.32, fill);
}

// A small bird: two curved strokes meeting in the middle.
export function bird(ctx, x, y, s, fill) {
  ctx.strokeStyle = fill;
  ctx.lineWidth = Math.max(1.5, s * 0.14);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - s, y);
  ctx.quadraticCurveTo(x - s * 0.45, y - s * 0.7, x, y);
  ctx.quadraticCurveTo(x + s * 0.45, y - s * 0.7, x + s, y);
  ctx.stroke();
}

// A vertical gradient over (x, y, w, h); stops are [[offset, color], ...].
export function vgrad(ctx, x, y, w, h, stops) {
  const g = ctx.createLinearGradient(x, y, x, y + h);
  for (const [o, c] of stops) g.addColorStop(o, c);
  return g;
}

// Text with a font, fill, alignment and baseline.
export function text(ctx, str, x, y, font, fill, align = 'left', baseline = 'alphabetic') {
  ctx.font = font;
  ctx.fillStyle = fill;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  ctx.fillText(str, x, y);
}
