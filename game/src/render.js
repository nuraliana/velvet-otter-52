// Twin Peeks — everything the player sees. The renderer keeps an offscreen
// cache of each panel's picture (re-painted when the level changes) and draws
// the header, panels, markers, footer and overlays on top. draw() returns
// the clickable regions (buttons and panels) in field coordinates so main.js
// can hit-test a click without knowing the layout.

import { FIELD, FONT, FONT_DISPLAY, HINT, PALETTE, PANEL } from './config.js';
import { allDiffIds, paintPanel } from './scenes.js';
import { circle, ellipse, line, poly, rect, roundRect, roundRectStroke, star, text } from './draw.js';

function fmtTime(s) {
  const t = Math.max(0, Math.ceil(s));
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;
  // Offscreen panel pictures for the current level: [left, right].
  let cacheLevel = -1;
  let cacheLeft = null;
  let cacheRight = null;

  function resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = window.innerWidth;
    const h = window.innerHeight;
    scale = Math.min(w / FIELD.w, h / FIELD.h);
    canvas.width = Math.round(FIELD.w * scale * dpr);
    canvas.height = Math.round(FIELD.h * scale * dpr);
    canvas.style.width = `${FIELD.w * scale}px`;
    canvas.style.height = `${FIELD.h * scale}px`;
    offsetX = (w - FIELD.w * scale) / 2;
    offsetY = (h - FIELD.h * scale) / 2;
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
  }

  // Client (page) coordinates -> field coordinates (1280x720 space).
  function fieldCoords(clientX, clientY) {
    const r = canvas.getBoundingClientRect();
    return { x: (clientX - r.left) / scale, y: (clientY - r.top) / scale };
  }

  // Repaints the offscreen panel pictures for a level index.
  function paintCache(levelIndex, level) {
    if (cacheLevel === levelIndex && cacheLeft) return;
    cacheLevel = levelIndex;
    cacheLeft = document.createElement('canvas');
    cacheLeft.width = PANEL.w;
    cacheLeft.height = PANEL.h;
    cacheRight = document.createElement('canvas');
    cacheRight.width = PANEL.w;
    cacheRight.height = PANEL.h;
    paintPanel(cacheLeft.getContext('2d'), level, new Set());
    paintPanel(cacheRight.getContext('2d'), level, allDiffIds(level));
  }

  // A small button; records its region and returns it.
  function button(regions, id, x, y, w, h, label, font, fill, ink) {
    roundRect(ctx, x, y, w, h, 9, fill);
    ctx.strokeStyle = 'rgba(32,36,46,0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 9);
    ctx.stroke();
    text(ctx, label, x + w / 2, y + h / 2 + 1, font, ink, 'center', 'middle');
    regions.push({ id, x, y, w, h });
  }

  function drawHeader(w, regions) {
    rect(ctx, 0, 0, FIELD.w, 64, PALETTE.header);
    text(ctx, 'TWIN PEEKS', 28, 33, `bold 30px ${FONT_DISPLAY}`, PALETTE.headerInk, 'left', 'middle');
    text(ctx, 'spot the difference', 232, 36, `italic 15px ${FONT_DISPLAY}`, '#c8b98a', 'left', 'middle');
    // Level name.
    text(ctx, `Level ${w.levelIndex + 1}/6 — ${w.level.name}`, 640, 26, `bold 19px ${FONT}`, '#f2ead8', 'center', 'middle');
    text(ctx, w.level.sub, 640, 48, `13px ${FONT}`, '#aab3c8', 'center', 'middle');
    // Score and best.
    // Score sits LEFT of the Hint/Mute buttons (x 1000, right-aligned) so it
    // never slides under them. While playing it is totalScore + the running
    // level score; once a level is banked (leveldone / gameover) totalScore
    // already holds it, so show totalScore alone.
    const total =
      w.screen === 'leveldone' || w.screen === 'gameover'
        ? w.totalScore
        : w.totalScore + w.score;
    text(ctx, `SCORE ${total}`, 1000, 24, `bold 20px ${FONT}`, '#ffd98a', 'right', 'middle');
    text(ctx, `BEST ${w.best}`, 1000, 46, `13px ${FONT}`, '#aab3c8', 'right', 'middle');
    // Hint and mute buttons.
    button(regions, 'hint', 1010, 14, 108, 36, `Hint ×${w.hintsLeft}`, `bold 15px ${FONT}`, w.hintsLeft > 0 ? '#d9a441' : '#6a6f80', '#20242e');
    button(regions, 'mute', 1126, 14, 44, 36, w.audioMuted ? '✕' : '♪', `bold 17px ${FONT}`, '#3a4a72', '#f2ead8');
    // Timer bar.
    const frac = Math.max(0, w.timeLeft / (w.level ? 100 : 100));
    const barW = FIELD.w - 56;
    roundRect(ctx, 28, 72, barW, 14, 7, '#20242e');
    const col = frac > 0.5 ? '#3d9b57' : frac > 0.25 ? '#d9a441' : '#c94f43';
    if (frac > 0) roundRect(ctx, 28, 72, Math.max(14, barW * frac), 14, 7, col);
    text(ctx, fmtTime(w.timeLeft), 640, 79, `bold 13px ${FONT}`, '#f2ead8', 'center', 'middle');
  }

  function drawPanels(w, regions) {
    // Panel labels.
    text(ctx, 'ORIGINAL', PANEL.leftX + PANEL.w / 2, 108, `bold 15px ${FONT}`, PALETTE.inkSoft, 'center', 'middle');
    text(ctx, 'SPOT THE DIFFERENCE', PANEL.rightX + PANEL.w / 2, 108, `bold 15px ${FONT}`, PALETTE.inkSoft, 'center', 'middle');
    // The pictures.
    ctx.drawImage(cacheLeft, PANEL.leftX, PANEL.y);
    ctx.drawImage(cacheRight, PANEL.rightX, PANEL.y);
    ctx.strokeStyle = '#b8a888';
    ctx.lineWidth = 2;
    ctx.strokeRect(PANEL.leftX, PANEL.y, PANEL.w, PANEL.h);
    ctx.strokeRect(PANEL.rightX, PANEL.y, PANEL.w, PANEL.h);
    regions.push({ panel: 'left', x: PANEL.leftX, y: PANEL.y, w: PANEL.w, h: PANEL.h });
    regions.push({ panel: 'right', x: PANEL.rightX, y: PANEL.y, w: PANEL.w, h: PANEL.h });
    // Found markers on both panels.
    for (const m of w.markers) {
      for (const px of [PANEL.leftX, PANEL.rightX]) {
        const cx = px + m.x;
        const cy = PANEL.y + m.y;
        ctx.strokeStyle = '#2f9e4f';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(cx, cy, 20, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cx - 9, cy);
        ctx.lineTo(cx - 2, cy + 7);
        ctx.lineTo(cx + 10, cy - 8);
        ctx.stroke();
      }
    }
    // Hint ring (pulsing gold) on both panels.
    if (w.hintRing) {
      const pulse = 1 + 0.18 * Math.sin(w.hintRing.t * 7);
      for (const px of [PANEL.leftX, PANEL.rightX]) {
        const cx = px + w.hintRing.x;
        const cy = PANEL.y + w.hintRing.y;
        ctx.strokeStyle = 'rgba(217, 164, 65, 0.95)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(cx, cy, 20 * pulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(217, 164, 65, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, 26 * pulse, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    // Miss effect: a fading red X on the clicked panel only.
    for (const e of w.effects) {
      if (e.kind !== 'miss') continue;
      const a = Math.max(0, 1 - e.t / 0.9);
      const px = e.panel === 'left' ? PANEL.leftX : PANEL.rightX;
      const cx = px + e.x;
      const cy = PANEL.y + e.y;
      ctx.strokeStyle = `rgba(201, 79, 67, ${a})`;
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - 11, cy - 11);
      ctx.lineTo(cx + 11, cy + 11);
      ctx.moveTo(cx + 11, cy - 11);
      ctx.lineTo(cx - 11, cy + 11);
      ctx.stroke();
    }
  }

  function drawFooter(w) {
    // Found counter with dots.
    const found = w.found.size;
    text(ctx, `FOUND ${found}/7`, 40, 580, `bold 18px ${FONT}`, PALETTE.ink, 'left', 'middle');
    for (let i = 0; i < 7; i++) {
      circle(ctx, 150 + i * 26, 580, 8, i < found ? '#3d9b57' : '#d8cdb4');
    }
    // Message line.
    text(ctx, w.message, 640, 580, `15px ${FONT}`, PALETTE.inkSoft, 'center', 'middle');
    // Level dots with stars.
    for (let i = 0; i < 6; i++) {
      const cx = 640 + (i - 2.5) * 44;
      const done = (w.stars[i] ?? 0) > 0;
      const cur = i === w.levelIndex && w.screen === 'play';
      circle(ctx, cx, 622, 13, cur ? '#2f6f5e' : done ? '#d9a441' : '#d8cdb4');
      text(ctx, String(i + 1), cx, 623, `bold 12px ${FONT}`, cur || done ? '#fff' : '#6a6f80', 'center', 'middle');
      if (done) text(ctx, '★'.repeat(w.stars[i]), cx, 648, `11px ${FONT}`, '#d9a441', 'center', 'middle');
    }
    // Controls line.
    text(
      ctx,
      'Click a difference · H hint (−25) · R restart level · P pause · M mute · Esc pause',
      640,
      690,
      `13px ${FONT}`,
      PALETTE.dim,
      'center',
      'middle',
    );
  }

  function overlayPanel(x, y, w, h, title) {
    ctx.fillStyle = 'rgba(20, 24, 38, 0.55)';
    ctx.fillRect(0, 0, FIELD.w, FIELD.h);
    roundRect(ctx, x, y, w, h, 16, '#f6f1e7');
    ctx.strokeStyle = '#d8cdb4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 16);
    ctx.stroke();
    text(ctx, title, 640, y + 52, `bold 34px ${FONT_DISPLAY}`, PALETTE.ink, 'center', 'middle');
  }

  function drawLevelDone(w, regions) {
    overlayPanel(380, 130, 520, 440, 'Level Complete!');
    const cy = 640;
    text(ctx, '★'.repeat(w.levelStars) + '☆'.repeat(3 - w.levelStars), cy, 230, `34px ${FONT}`, '#d9a441', 'center', 'middle');
    text(ctx, `${w.level.name} — all 7 differences found`, cy, 278, `17px ${FONT}`, PALETTE.inkSoft, 'center', 'middle');
    text(ctx, `Level score ${w.score}  +  time bonus ${w.timeBonus}  =  ${w.levelScore}`, cy, 318, `bold 18px ${FONT}`, PALETTE.ink, 'center', 'middle');
    text(ctx, `Total score ${w.totalScore}`, cy, 352, `16px ${FONT}`, PALETTE.inkSoft, 'center', 'middle');
    const last = w.levelIndex + 1 >= 6;
    button(regions, 'next', 470, 400, 340, 52, last ? 'See Results' : 'Next Level  →', `bold 19px ${FONT}`, '#2f6f5e', '#fff');
    button(regions, 'replay', 470, 464, 164, 44, 'Replay', `16px ${FONT}`, '#e8dfc8', PALETTE.ink);
    button(regions, 'menu', 646, 464, 164, 44, 'Menu', `16px ${FONT}`, '#e8dfc8', PALETTE.ink);
  }

  function drawResults(w, regions) {
    overlayPanel(340, 100, 600, 500, 'You found them all!');
    text(ctx, `42 differences · total score ${w.totalScore}`, 640, 180, `18px ${FONT}`, PALETTE.inkSoft, 'center', 'middle');
    text(ctx, `Best score ${w.best}`, 640, 212, `bold 18px ${FONT}`, PALETTE.ink, 'center', 'middle');
    const names = ['Harbor at Dawn', 'Jungle Temple', 'Space Station', 'Cozy Library', 'Autumn Park', 'Candy Kitchen'];
    for (let i = 0; i < 6; i++) {
      const y = 258 + i * 36;
      text(ctx, names[i], 430, y, `16px ${FONT}`, PALETTE.ink, 'left', 'middle');
      text(ctx, '★'.repeat(w.stars[i] ?? 0) + '☆'.repeat(3 - (w.stars[i] ?? 0)), 850, y, `16px ${FONT}`, '#d9a441', 'right', 'middle');
    }
    button(regions, 'again', 470, 500, 340, 52, 'Play Again', `bold 19px ${FONT}`, '#2f6f5e', '#fff');
    button(regions, 'menu', 550, 560, 180, 40, 'Menu', `16px ${FONT}`, '#e8dfc8', PALETTE.ink);
  }

  function drawTimeout(w, regions) {
    overlayPanel(400, 180, 480, 340, "Time's Up!");
    text(ctx, `You found ${w.found.size} of 7 in ${w.level.name}.`, 640, 268, `17px ${FONT}`, PALETTE.inkSoft, 'center', 'middle');
    text(ctx, 'The differences are still hiding…', 640, 300, `16px ${FONT}`, PALETTE.inkSoft, 'center', 'middle');
    button(regions, 'retry', 470, 360, 340, 52, 'Retry Level', `bold 19px ${FONT}`, '#2f6f5e', '#fff');
    button(regions, 'menu', 550, 428, 180, 44, 'Menu', `16px ${FONT}`, '#e8dfc8', PALETTE.ink);
  }

  function drawPaused(w, regions) {
    overlayPanel(430, 220, 420, 280, 'Paused');
    text(ctx, 'Take a breath. The differences will wait.', 640, 300, `16px ${FONT}`, PALETTE.inkSoft, 'center', 'middle');
    button(regions, 'resume', 490, 350, 300, 52, 'Resume', `bold 19px ${FONT}`, '#2f6f5e', '#fff');
    button(regions, 'menu', 550, 418, 180, 44, 'Menu', `16px ${FONT}`, '#e8dfc8', PALETTE.ink);
  }

  function drawTitle(w, regions) {
    rect(ctx, 0, 0, FIELD.w, FIELD.h, PALETTE.paper);
    // Warm header band.
    rect(ctx, 0, 0, FIELD.w, 150, PALETTE.header);
    text(ctx, 'TWIN PEEKS', 640, 68, `bold 58px ${FONT_DISPLAY}`, PALETTE.headerInk, 'center', 'middle');
    text(ctx, 'spot the difference', 640, 118, `italic 22px ${FONT_DISPLAY}`, '#c8b98a', 'center', 'middle');
    text(ctx, 'Two pictures. Seven differences. One sharp eye.', 640, 178, `17px ${FONT}`, PALETTE.inkSoft, 'center', 'middle');
    // Live preview of level 1 (two small panels).
    paintCache(0, w.level);
    const pw = 280;
    const ph = 210;
    const ly = 200;
    const lx = 640 - pw - 12;
    const rx = 640 + 12;
    ctx.drawImage(cacheLeft, lx, ly, pw, ph);
    ctx.drawImage(cacheRight, rx, ly, pw, ph);
    ctx.strokeStyle = '#b8a888';
    ctx.lineWidth = 2;
    ctx.strokeRect(lx, ly, pw, ph);
    ctx.strokeRect(rx, ly, pw, ph);
    text(ctx, 'ORIGINAL', lx + pw / 2, ly + ph + 22, `bold 13px ${FONT}`, PALETTE.inkSoft, 'center', 'middle');
    text(ctx, 'SPOT THE DIFFERENCE', rx + pw / 2, ly + ph + 22, `bold 13px ${FONT}`, PALETTE.inkSoft, 'center', 'middle');
    // Six level buttons with stars.
    const names = ['Harbor at Dawn', 'Jungle Temple', 'Space Station', 'Cozy Library', 'Autumn Park', 'Candy Kitchen'];
    for (let i = 0; i < 6; i++) {
      const bx = 100 + (i % 3) * 380;
      const by = 470 + Math.floor(i / 3) * 64;
      const st = w.stars[i] ?? 0;
      button(regions, `level-${i}`, bx, by, 360, 52, `${i + 1}. ${names[i]}  ${'★'.repeat(st)}${'☆'.repeat(3 - st)}`, `16px ${FONT}`, i === 0 ? '#2f6f5e' : '#fffdf6', i === 0 ? '#fff' : PALETTE.ink);
    }
    text(ctx, 'Click a level to play it, or press Enter to start from Level 1.', 640, 624, `15px ${FONT}`, PALETTE.inkSoft, 'center', 'middle');
    text(ctx, 'Click a difference on either picture · a wrong click costs 2 seconds · H for a hint (−25)', 640, 652, `14px ${FONT}`, PALETTE.dim, 'center', 'middle');
    if (w.best > 0) text(ctx, `Best score ${w.best}`, 640, 690, `bold 15px ${FONT}`, PALETTE.ink, 'center', 'middle');
  }

  // Draws the whole frame for the world; returns clickable regions.
  function draw(w) {
    const regions = [];
    ctx.clearRect(0, 0, FIELD.w, FIELD.h);
    if (w.screen === 'title') {
      drawTitle(w, regions);
      return { buttons: regions, panels: [] };
    }
    paintCache(w.levelIndex, w.level);
    rect(ctx, 0, 0, FIELD.w, FIELD.h, PALETTE.paper);
    drawHeader(w, regions);
    drawPanels(w, regions);
    drawFooter(w);
    if (w.screen === 'leveldone') drawLevelDone(w, regions);
    else if (w.screen === 'results') drawResults(w, regions);
    else if (w.screen === 'timeout') drawTimeout(w, regions);
    else if (w.screen === 'paused') drawPaused(w, regions);
    const buttons = regions.filter((r) => r.id !== undefined);
    const panels = regions.filter((r) => r.panel !== undefined);
    return { buttons, panels };
  }

  return { resize, fieldCoords, draw };
}
