// Twin Peeks — the six scenes. Each level paints its base picture into a
// 560x420 scene space, then applies the difference ids in `mods` (a Set).
// The left panel always paints with an empty set; the right panel paints with
// every diff id, so the two pictures differ in exactly the 7 listed places.
//
// Diff coordinates (x, y, r) are in scene space. Each diff also carries a
// short label the world uses for the "found" message.

import { PANEL } from './config.js';
import { mulberry32, range } from './random.js';
import { bird, circle, cloud, ellipse, line, poly, rect, roundRect, roundRectStroke, star, text, vgrad } from './draw.js';

// Paints one level into the current transform, clipped to a panel. The caller
// translates to the panel origin first.
export function paintPanel(ctx, level, mods) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, PANEL.w, PANEL.h);
  ctx.clip();
  level.paint(ctx, PANEL.w, PANEL.h, mods);
  ctx.restore();
}

// Every diff id of a level, as a Set.
export function allDiffIds(level) {
  return new Set(level.diffs.map((d) => d.id));
}

// ---------------------------------------------------------------- scene 1
// Harbor at Dawn (100s): dawn sky, sun, clouds, hills, sea, lighthouse,
// pier, sailboat, rowboat, buoy, jumping fish.
const harbor = {
  name: 'Harbor at Dawn',
  sub: 'First light over the bay',
  paint(ctx, W, H, mods) {
    // Dawn sky.
    ctx.fillStyle = vgrad(ctx, 0, 0, W, 240, [
      [0, '#2c3e6b'],
      [0.45, '#7a6a9e'],
      [0.8, '#e08a5a'],
      [1, '#f6c177'],
    ]);
    ctx.fillRect(0, 0, W, 240);
    // Sun low over the water.
    circle(ctx, 420, 168, 34, '#ffd98a');
    circle(ctx, 420, 168, 46, 'rgba(255, 217, 138, 0.35)');
    // Clouds (one goes missing as a diff).
    cloud(ctx, 120, 70, 34, 'rgba(255, 235, 220, 0.9)');
    if (!mods.has('cloud')) cloud(ctx, 398, 84, 30, 'rgba(255, 235, 220, 0.85)');
    cloud(ctx, 250, 46, 24, 'rgba(255, 235, 220, 0.7)');
    // Birds (one is removed as a diff).
    if (!mods.has('bird')) bird(ctx, 210, 52, 12, '#2c3242');
    bird(ctx, 300, 40, 10, '#2c3242');
    bird(ctx, 150, 90, 9, '#3a4152');
    // Distant hills.
    ctx.fillStyle = '#4a5a7d';
    ctx.beginPath();
    ctx.moveTo(0, 240);
    ctx.quadraticCurveTo(140, 170, 300, 235);
    ctx.quadraticCurveTo(430, 185, 560, 240);
    ctx.lineTo(560, 260);
    ctx.lineTo(0, 260);
    ctx.closePath();
    ctx.fill();
    // Sea.
    ctx.fillStyle = vgrad(ctx, 0, 240, W, 180, [
      [0, '#e8a06a'],
      [0.25, '#7d8fb5'],
      [1, '#33507a'],
    ]);
    ctx.fillRect(0, 240, W, 180);
    // Sun glitter on the water.
    const rng = mulberry32(11);
    for (let i = 0; i < 26; i++) {
      const x = range(rng, 340, 500);
      const y = range(rng, 250, 400);
      rect(ctx, x, y, range(rng, 14, 42), 2.5, 'rgba(255, 214, 140, 0.5)');
    }
    // Waves.
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 2;
    for (let y = 268; y < 410; y += 34) {
      ctx.beginPath();
      for (let x = 0; x <= W; x += 14) ctx.lineTo(x, y + Math.sin(x / 46 + y) * 4);
      ctx.stroke();
    }
    // Lighthouse on a rock (its stripe changes colour as a diff).
    poly(ctx, [[468, 250], [500, 250], [512, 320], [456, 320]], '#5a5f6e');
    rect(ctx, 462, 148, 44, 104, '#f4ede0');
    rect(ctx, 462, 150, 44, 16, mods.has('stripe') ? '#2f8f7a' : '#c94f43');
    rect(ctx, 462, 186, 44, 16, '#c94f43');
    rect(ctx, 458, 132, 52, 18, '#2f3a4e');
    circle(ctx, 484, 122, 12, '#ffe9a8');
    line(ctx, 484, 110, 484, 96, '#2f3a4e', 3);
    // Light beam.
    ctx.fillStyle = 'rgba(255, 233, 168, 0.28)';
    ctx.beginPath();
    ctx.moveTo(484, 122);
    ctx.lineTo(560, 92);
    ctx.lineTo(560, 142);
    ctx.closePath();
    ctx.fill();
    // Pier with a flag and crates.
    rect(ctx, 30, 300, 230, 14, '#7a5c40');
    for (let x = 44; x < 250; x += 18) rect(ctx, x, 314, 8, 44, '#6b4e35');
    line(ctx, 300, 300, 300, 222, '#4a3a28', 4);
    poly(ctx, [[300, 222], [300, 250], [334, 236]], mods.has('flag') ? '#3d9b57' : '#c94f43');
    // Crates (one is removed as a diff).
    rect(ctx, 252, 268, 26, 26, '#a87c4a');
    rect(ctx, 252, 268, 26, 6, '#8a6538');
    if (!mods.has('crate')) {
      rect(ctx, 266, 254, 22, 20, '#b98d55');
      rect(ctx, 266, 254, 22, 5, '#96703e');
    }
    rect(ctx, 228, 278, 20, 16, '#96683f');
    // Sailboat (its sail changes colour as a diff).
    poly(ctx, [[150, 268], [150, 340], [196, 340]], mods.has('sail') ? '#f2c14e' : '#f7f3e8');
    poly(ctx, [[146, 268], [146, 340], [112, 340]], '#e8ddc4');
    line(ctx, 148, 258, 148, 342, '#5a4632', 4);
    poly(ctx, [[148, 258], [172, 268], [148, 268]], '#c94f43');
    ellipse(ctx, 152, 342, 52, 12, '#7a4a32');
    // Rowboat.
    ellipse(ctx, 360, 372, 34, 9, '#8a5a3a');
    rect(ctx, 348, 356, 6, 12, '#6b4226');
    rect(ctx, 366, 356, 6, 12, '#6b4226');
    // Buoy (removed as a diff).
    if (!mods.has('buoy')) {
      circle(ctx, 430, 344, 12, '#e05a3a');
      rect(ctx, 424, 322, 12, 10, '#e05a3a');
      circle(ctx, 430, 320, 5, '#ffd98a');
    }
    // A jumping fish.
    ctx.strokeStyle = '#dfe9f5';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(96, 372, 12, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
    circle(ctx, 108, 360, 3, '#dfe9f5');
  },
  diffs: [
    { id: 'bird', x: 210, y: 52, r: 26, label: 'the missing bird' },
    { id: 'stripe', x: 485, y: 158, r: 26, label: 'the lighthouse stripe' },
    { id: 'sail', x: 168, y: 305, r: 32, label: 'the yellow sail' },
    { id: 'buoy', x: 430, y: 344, r: 28, label: 'the missing buoy' },
    { id: 'flag', x: 312, y: 238, r: 26, label: 'the green flag' },
    { id: 'cloud', x: 398, y: 84, r: 26, label: 'the missing cloud' },
    { id: 'crate', x: 277, y: 264, r: 26, label: 'the missing crate' },
  ],
};

// ---------------------------------------------------------------- scene 2
// Jungle Temple (95s): green jungle, stepped stone temple, torches, statue,
// waterfall, golden idol, flowers, hanging vines.
const temple = {
  name: 'Jungle Temple',
  sub: 'Stone and vines, deep in the green',
  paint(ctx, W, H, mods) {
    // Jungle sky and canopy.
    ctx.fillStyle = vgrad(ctx, 0, 0, W, H, [
      [0, '#bfe3a0'],
      [0.5, '#7fb069'],
      [1, '#3e6b34'],
    ]);
    ctx.fillRect(0, 0, W, H);
    circle(ctx, 480, 70, 30, '#fff3b0');
    cloud(ctx, 120, 60, 28, 'rgba(255,255,255,0.75)');
    cloud(ctx, 330, 40, 22, 'rgba(255,255,255,0.6)');
    // Back trees.
    const rng = mulberry32(23);
    for (let i = 0; i < 9; i++) {
      const x = range(rng, 0, W);
      const y = range(rng, 120, 260);
      circle(ctx, x, y, range(rng, 26, 48), '#2f5c2a');
    }
    // Ground.
    ctx.fillStyle = '#5d7a3a';
    ctx.fillRect(0, 330, W, 90);
    ctx.fillStyle = '#4c6a30';
    ctx.fillRect(0, 330, W, 10);
    // Stepped stone temple.
    ctx.fillStyle = '#9a8f7a';
    rect(ctx, 150, 300, 260, 30, '#9a8f7a');
    rect(ctx, 170, 270, 220, 30, '#a89c86');
    rect(ctx, 190, 240, 180, 30, '#b3a893');
    rect(ctx, 210, 210, 140, 30, '#bfb49e');
    // One step block is missing as a diff: the right panel shows a dark notch.
    if (mods.has('step')) rect(ctx, 280, 211, 28, 28, '#6b5f4a');
    // Temple top and doorway.
    rect(ctx, 230, 150, 100, 60, '#c4b9a5');
    poly(ctx, [[220, 150], [280, 118], [340, 150]], '#a89c86');
    roundRect(ctx, 258, 168, 44, 42, 8, '#3a2f26');
    // Columns.
    rect(ctx, 216, 160, 14, 50, '#c9bda6');
    rect(ctx, 330, 160, 14, 50, '#c9bda6');
    // Torches (the left one is unlit as a diff).
    for (const [tx, lit] of [[196, !mods.has('flame')], [364, true]]) {
      rect(ctx, tx, 250, 6, 40, '#5a4632');
      circle(ctx, tx + 3, 246, 9, '#8a5a2a');
      if (lit) {
        ellipse(ctx, tx + 3, 236, 7, 13, '#ff9d2e');
        ellipse(ctx, tx + 3, 240, 4, 8, '#ffd23e');
      }
    }
    // Statue head (its eye closes as a diff).
    circle(ctx, 106, 296, 34, '#8f8672');
    rect(ctx, 84, 326, 44, 10, '#8f8672');
    circle(ctx, 94, 290, 5, '#2c241c');
    if (mods.has('eye')) {
      line(ctx, 112, 290, 124, 290, '#2c241c', 3);
    } else {
      circle(ctx, 118, 290, 5, '#2c241c');
    }
    line(ctx, 100, 312, 114, 312, '#2c241c', 3);
    // Waterfall.
    ctx.fillStyle = 'rgba(190, 225, 245, 0.85)';
    ctx.beginPath();
    ctx.moveTo(430, 150);
    ctx.quadraticCurveTo(420, 240, 436, 330);
    ctx.lineTo(470, 330);
    ctx.quadraticCurveTo(458, 240, 468, 150);
    ctx.closePath();
    ctx.fill();
    // An extra droplet falls as a diff.
    if (mods.has('drop')) circle(ctx, 508, 200, 8, '#bfe1f5');
    circle(ctx, 452, 352, 6, 'rgba(190,225,245,0.9)');
    circle(ctx, 470, 366, 5, 'rgba(190,225,245,0.9)');
    // Golden idol with a gem (the gem changes colour as a diff).
    ellipse(ctx, 418, 336, 22, 30, '#d9a441');
    circle(ctx, 418, 312, 14, '#e8bc5a');
    circle(ctx, 418, 336, 8, mods.has('gem') ? '#c94f43' : '#3d9b57');
    // Flowers (one changes colour as a diff).
    for (const [fx, fy, col] of [[60, 392, '#e86a8a'], [150, 402, '#f2c14e'], [520, 396, '#e86a8a']]) {
      for (let p = 0; p < 5; p++) {
        const a = (p * Math.PI * 2) / 5;
        circle(ctx, fx + Math.cos(a) * 7, fy + Math.sin(a) * 7, 5, col);
      }
      circle(ctx, fx, fy, 5, '#ffd23e');
    }
    if (mods.has('flower')) {
      for (let p = 0; p < 5; p++) {
        const a = (p * Math.PI * 2) / 5;
        circle(ctx, 250 + Math.cos(a) * 7, 408 + Math.sin(a) * 7, 5, '#8a5fc0');
      }
      circle(ctx, 250, 408, 5, '#ffd23e');
    } else {
      for (let p = 0; p < 5; p++) {
        const a = (p * Math.PI * 2) / 5;
        circle(ctx, 250 + Math.cos(a) * 7, 408 + Math.sin(a) * 7, 5, '#e86a8a');
      }
      circle(ctx, 250, 408, 5, '#ffd23e');
    }
    // Hanging vines (an extra one appears as a diff).
    ctx.strokeStyle = '#2f5c2a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(60, 0);
    ctx.quadraticCurveTo(70, 60, 58, 110);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(520, 0);
    ctx.quadraticCurveTo(510, 50, 522, 96);
    ctx.stroke();
    if (mods.has('vine')) {
      ctx.beginPath();
      ctx.moveTo(300, 0);
      ctx.quadraticCurveTo(312, 40, 298, 74);
      ctx.stroke();
      ellipse(ctx, 298, 82, 8, 5, '#3e6b34');
    }
    ellipse(ctx, 58, 118, 9, 5, '#3e6b34');
    ellipse(ctx, 522, 104, 9, 5, '#3e6b34');
  },
  diffs: [
    { id: 'flame', x: 199, y: 250, r: 26, label: 'the unlit torch' },
    { id: 'flower', x: 250, y: 408, r: 24, label: 'the purple flower' },
    { id: 'vine', x: 300, y: 74, r: 26, label: 'the extra vine' },
    { id: 'eye', x: 106, y: 296, r: 20, label: 'the closed eye' },
    { id: 'gem', x: 418, y: 336, r: 22, label: 'the red gem' },
    { id: 'step', x: 280, y: 211, r: 28, label: 'the missing step' },
    { id: 'drop', x: 508, y: 200, r: 22, label: 'the extra droplet' },
  ],
};

// ---------------------------------------------------------------- scene 3
// Space Station (90s): deep space, ringed planet, station module, solar
// wings, astronaut, satellite, Earth crescent.
const station = {
  name: 'Space Station',
  sub: 'Quiet orbit above the blue marble',
  paint(ctx, W, H, mods) {
    // Deep space.
    ctx.fillStyle = '#0b1026';
    ctx.fillRect(0, 0, W, H);
    const rng = mulberry32(37);
    for (let i = 0; i < 90; i++) {
      const x = range(rng, 0, W);
      const y = range(rng, 0, H);
      const r = range(rng, 0.6, 2.2);
      circle(ctx, x, y, r, rng() > 0.85 ? '#ffe9a8' : '#dfe6ff');
    }
    // An extra bright star appears as a diff.
    if (mods.has('star')) star(ctx, 160, 120, 12, 4, '#ffffff');
    // Ringed planet (its ring is removed as a diff).
    circle(ctx, 460, 110, 46, '#c98a5a');
    circle(ctx, 446, 98, 14, '#b57a4e');
    circle(ctx, 474, 122, 10, '#d89a6a');
    if (!mods.has('ring')) {
      ctx.strokeStyle = 'rgba(232, 196, 140, 0.85)';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.ellipse(460, 110, 78, 18, -0.35, 0, Math.PI * 2);
      ctx.stroke();
    }
    // Earth crescent (becomes a full disc as a diff).
    if (mods.has('drop')) {
      circle(ctx, 500, 372, 30, '#5a9bd4');
      circle(ctx, 492, 364, 12, '#7ec850');
      circle(ctx, 508, 380, 8, '#7ec850');
    } else {
      ctx.fillStyle = '#5a9bd4';
      ctx.beginPath();
      ctx.arc(500, 372, 30, 0, Math.PI * 2);
      ctx.arc(512, 364, 26, 0, Math.PI * 2, true);
      ctx.fill();
      circle(ctx, 492, 364, 8, '#7ec850');
    }
    // Station module.
    roundRect(ctx, 180, 190, 260, 56, 18, '#c8ccd4');
    roundRect(ctx, 180, 190, 260, 14, 18, '#dde1e8');
    // Windows (one goes dark as a diff).
    for (const [wx, dark] of [[210, false], [250, false], [290, false], [330, mods.has('window')], [370, false]]) {
      circle(ctx, wx, 218, 11, dark ? '#2c3242' : '#8fd0ff');
      circle(ctx, wx - 3, 215, 3, 'rgba(255,255,255,0.7)');
    }
    // Docking port and antenna.
    rect(ctx, 440, 208, 34, 20, '#9aa0ac');
    line(ctx, 300, 190, 300, 150, '#c8ccd4', 5);
    circle(ctx, 300, 146, 6, '#e05a3a');
    line(ctx, 300, 150, 330, 132, '#c8ccd4', 2);
    // Solar wings (one cell turns magenta as a diff).
    for (const sx of [60, 470]) {
      rect(ctx, sx, 200, 110, 40, '#2c4a8a');
      for (let i = 0; i < 4; i++) {
        line(ctx, sx + 28 + i * 27, 200, sx + 28 + i * 27, 240, '#4a6ab0', 2);
      }
      line(ctx, sx, 220, sx + 110, 220, '#4a6ab0', 2);
    }
    if (mods.has('panel')) rect(ctx, 498, 206, 22, 28, '#c05a9e');
    // Docking arm and rocket.
    line(ctx, 440, 246, 500, 300, '#9aa0ac', 6);
    poly(ctx, [[500, 300], [524, 300], [512, 336]], '#e8e8e8');
    rect(ctx, 500, 276, 24, 26, '#e8e8e8');
    circle(ctx, 512, 288, 5, '#8fd0ff');
    poly(ctx, [[500, 302], [492, 316], [500, 310]], '#e05a3a');
    poly(ctx, [[524, 302], [532, 316], [524, 310]], '#e05a3a');
    // Astronaut on a tether (the visor changes colour as a diff).
    ctx.strokeStyle = 'rgba(220, 225, 240, 0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(250, 246);
    ctx.quadraticCurveTo(190, 300, 140, 330);
    ctx.stroke();
    circle(ctx, 140, 336, 18, '#f0f2f6');
    circle(ctx, 140, 330, 10, mods.has('visor') ? '#5a9bd4' : '#d9a441');
    rect(ctx, 128, 348, 24, 20, '#f0f2f6');
    rect(ctx, 122, 352, 8, 12, '#f0f2f6');
    rect(ctx, 150, 352, 8, 12, '#f0f2f6');
    // Satellite with a dish (the dish flips direction as a diff).
    rect(ctx, 90, 360, 60, 26, '#b9bec8');
    circle(ctx, 120, 373, 6, '#e05a3a');
    line(ctx, 150, 373, 168, 360, '#c8ccd4', 3);
    if (mods.has('dish')) {
      ctx.strokeStyle = '#dde1e8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(172, 352, 12, Math.PI * 0.9, Math.PI * 1.9);
      ctx.stroke();
    } else {
      ctx.strokeStyle = '#dde1e8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(172, 372, 12, -Math.PI * 0.1, Math.PI * 0.9);
      ctx.stroke();
    }
    line(ctx, 90, 373, 66, 360, '#c8ccd4', 3);
    line(ctx, 90, 373, 66, 386, '#c8ccd4', 3);
  },
  diffs: [
    { id: 'star', x: 160, y: 120, r: 24, label: 'the extra bright star' },
    { id: 'visor', x: 140, y: 336, r: 26, label: 'the blue visor' },
    { id: 'ring', x: 460, y: 110, r: 34, label: 'the missing ring' },
    { id: 'window', x: 330, y: 218, r: 24, label: 'the dark window' },
    { id: 'dish', x: 172, y: 372, r: 26, label: 'the flipped dish' },
    { id: 'panel', x: 509, y: 220, r: 26, label: 'the magenta solar cell' },
    { id: 'drop', x: 500, y: 372, r: 30, label: 'the full Earth disc' },
  ],
};

// ---------------------------------------------------------------- scene 4
// Cozy Library (85s): cream wall, window with moon and curtains, wall clock,
// bookshelves, rug, sleeping cat, desk with lamp, teapot and book, plant.
// NOTE: the clock is drawn AFTER the bookshelves so it is not hidden behind
// the right shelf.
const library = {
  name: 'Cozy Library',
  sub: 'Rain on the window, a cat asleep',
  paint(ctx, W, H, mods) {
    // Cream wall and wooden floor.
    ctx.fillStyle = '#efe3c8';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#8a6a48';
    ctx.fillRect(0, 356, W, 64);
    for (let y = 366; y < 420; y += 16) line(ctx, 0, y, W, y, '#7a5c3e', 1);
    // Window with the moon (full becomes crescent as a diff).
    rect(ctx, 260, 30, 120, 130, '#2c3a5e');
    rect(ctx, 266, 36, 108, 118, '#3a4a72');
    if (mods.has('moon')) {
      ctx.fillStyle = '#f2e6b8';
      ctx.beginPath();
      ctx.arc(300, 92, 26, 0, Math.PI * 2);
      ctx.arc(312, 84, 22, 0, Math.PI * 2, true);
      ctx.fill();
    } else {
      circle(ctx, 300, 92, 26, '#f2e6b8');
      circle(ctx, 292, 86, 6, '#e0d09a');
      circle(ctx, 308, 100, 4, '#e0d09a');
    }
    line(ctx, 320, 36, 320, 154, '#2c3a5e', 4);
    line(ctx, 266, 95, 374, 95, '#2c3a5e', 4);
    // Curtains.
    poly(ctx, [[252, 24], [272, 24], [264, 170], [248, 170]], '#a84a5a');
    poly(ctx, [[368, 24], [388, 24], [392, 170], [376, 170]], '#a84a5a');
    // Bookshelves with colourful spines.
    const spineCols = ['#c94f43', '#3d7a9b', '#3d9b57', '#d9a441', '#8a5fc0', '#e86a8a', '#2f6f5e'];
    const rng = mulberry32(53);
    for (const sx of [30, 430]) {
      rect(ctx, sx, 60, 120, 260, '#6b4e35');
      for (let shelf = 0; shelf < 3; shelf++) {
        const sy = 74 + shelf * 82;
        for (let i = 0; i < 8; i++) {
          const bx = sx + 8 + i * 13;
          const bh = 58 + Math.floor(rng() * 12);
          const col = spineCols[Math.floor(rng() * spineCols.length)];
          // One spine turns black as a diff.
          const black = mods.has('spine') && sx === 30 && i === 2 && shelf === 0;
          rect(ctx, bx, sy + 62 - bh, 11, bh, black ? '#1c1c22' : col);
        }
        rect(ctx, sx + 4, sy + 62, 112, 6, '#4a3524');
      }
    }
    // Wall clock (drawn AFTER the shelves so the right shelf cannot hide it).
    circle(ctx, 470, 80, 30, '#f7f3e8');
    circle(ctx, 470, 80, 30, 'rgba(0,0,0,0)');
    ctx.strokeStyle = '#4a3524';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(470, 80, 30, 0, Math.PI * 2);
    ctx.stroke();
    for (let h = 0; h < 12; h++) {
      const a = (h * Math.PI) / 6;
      circle(ctx, 470 + Math.sin(a) * 24, 80 - Math.cos(a) * 24, h % 3 === 0 ? 2.5 : 1.5, '#4a3524');
    }
    if (mods.has('clock')) {
      line(ctx, 470, 80, 470, 58, '#2c241c', 3);
      line(ctx, 470, 80, 488, 88, '#2c241c', 3);
    } else {
      line(ctx, 470, 80, 470, 58, '#2c241c', 3);
      line(ctx, 470, 80, 492, 80, '#2c241c', 3);
    }
    circle(ctx, 470, 80, 3, '#c94f43');
    // Rug.
    ellipse(ctx, 280, 384, 150, 22, '#a84a5a');
    ellipse(ctx, 280, 384, 110, 15, '#c98a7a');
    ellipse(ctx, 280, 384, 70, 9, '#e8c8a0');
    // Sleeping cat (its tail goes flat as a diff).
    ellipse(ctx, 246, 344, 34, 16, '#5a5f6e');
    circle(ctx, 276, 334, 13, '#5a5f6e');
    poly(ctx, [[268, 324], [272, 314], [278, 324]], '#5a5f6e');
    poly(ctx, [[280, 324], [286, 314], [288, 324]], '#5a5f6e');
    if (mods.has('cat')) {
      line(ctx, 212, 350, 186, 352, '#5a5f6e', 5);
    } else {
      ctx.strokeStyle = '#5a5f6e';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(214, 348);
      ctx.quadraticCurveTo(200, 330, 214, 322);
      ctx.stroke();
    }
    // Desk with a lamp, a teapot and an open book.
    rect(ctx, 150, 250, 260, 12, '#7a5c40');
    rect(ctx, 160, 262, 10, 70, '#6b4e35');
    rect(ctx, 390, 262, 10, 70, '#6b4e35');
    // Lamp (it goes off as a diff).
    line(ctx, 210, 250, 210, 210, '#3a2f26', 4);
    poly(ctx, [[190, 210], [230, 210], [222, 182], [198, 182]], mods.has('lamp') ? '#8a8fa3' : '#f2c14e');
    if (!mods.has('lamp')) {
      ctx.fillStyle = 'rgba(242, 193, 78, 0.25)';
      ctx.beginPath();
      ctx.moveTo(210, 210);
      ctx.lineTo(170, 250);
      ctx.lineTo(250, 250);
      ctx.closePath();
      ctx.fill();
    }
    // Teapot (removed as a diff).
    if (!mods.has('teapot')) {
      ellipse(ctx, 300, 234, 20, 14, '#3d7a9b');
      circle(ctx, 300, 218, 8, '#3d7a9b');
      ctx.strokeStyle = '#3d7a9b';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(322, 232, 10, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
      line(ctx, 280, 226, 272, 220, '#3d7a9b', 4);
    }
    // Open book.
    poly(ctx, [[330, 250], [380, 242], [380, 250], [330, 250]], '#f7f3e8');
    poly(ctx, [[330, 250], [380, 250], [380, 242], [330, 234]], '#efe8d2');
    line(ctx, 340, 242, 372, 238, '#8a8fa3', 1);
    line(ctx, 340, 247, 372, 244, '#8a8fa3', 1);
    // Potted plant (a flower appears as a diff).
    rect(ctx, 476, 300, 34, 30, '#a84a5a');
    line(ctx, 493, 300, 493, 272, '#3e6b34', 4);
    ellipse(ctx, 493, 268, 12, 8, '#4c8a3f');
    ellipse(ctx, 484, 276, 8, 6, '#5d9a4a');
    ellipse(ctx, 502, 276, 8, 6, '#5d9a4a');
    if (mods.has('plant')) {
      for (let p = 0; p < 5; p++) {
        const a = (p * Math.PI * 2) / 5;
        circle(ctx, 493 + Math.cos(a) * 7, 258 + Math.sin(a) * 7, 5, '#e86a8a');
      }
      circle(ctx, 493, 258, 5, '#ffd23e');
    }
  },
  diffs: [
    { id: 'cat', x: 246, y: 344, r: 26, label: 'the flat cat tail' },
    { id: 'clock', x: 470, y: 80, r: 30, label: 'the clock at 4:30' },
    { id: 'spine', x: 69, y: 104, r: 24, label: 'the black book spine' },
    { id: 'lamp', x: 210, y: 196, r: 28, label: 'the lamp switched off' },
    { id: 'teapot', x: 300, y: 234, r: 28, label: 'the missing teapot' },
    { id: 'plant', x: 488, y: 272, r: 22, label: 'the flower on the plant' },
    { id: 'moon', x: 300, y: 92, r: 30, label: 'the crescent moon' },
  ],
};

// ---------------------------------------------------------------- scene 5
// Autumn Park (80s): pale sky, kite, hills, path, autumn trees, squirrel,
// bench, fountain, pond with ducks, lamp post, leaf pile, falling leaves.
const park = {
  name: 'Autumn Park',
  sub: 'Leaves falling on the old fountain',
  paint(ctx, W, H, mods) {
    // Pale sky and kite.
    ctx.fillStyle = vgrad(ctx, 0, 0, W, 200, [
      [0, '#cfe0ee'],
      [1, '#f2ddba'],
    ]);
    ctx.fillRect(0, 0, W, 200);
    cloud(ctx, 110, 56, 26, 'rgba(255,255,255,0.85)');
    cloud(ctx, 330, 40, 20, 'rgba(255,255,255,0.7)');
    // Kite (red becomes blue as a diff).
    poly(ctx, [[470, 88], [492, 66], [500, 92], [478, 108]], mods.has('kite') ? '#3d7a9b' : '#c94f43');
    line(ctx, 484, 100, 470, 150, '#4a5064', 1.5);
    line(ctx, 470, 150, 452, 168, '#4a5064', 1.5);
    // Hills and path.
    ctx.fillStyle = '#8a9a5a';
    ctx.beginPath();
    ctx.moveTo(0, 200);
    ctx.quadraticCurveTo(180, 150, 380, 198);
    ctx.quadraticCurveTo(480, 170, 560, 200);
    ctx.lineTo(560, 420);
    ctx.lineTo(0, 420);
    ctx.closePath();
    ctx.fill();
    poly(ctx, [[250, 420], [310, 420], [300, 210], [262, 210]], '#d8c8a8');
    // Three autumn trees.
    const treeCols = ['#c96a2e', '#d9a441', '#a84a2e'];
    for (let t = 0; t < 3; t++) {
      const tx = 90 + t * 180;
      const ty = 190 + (t % 2) * 20;
      rect(ctx, tx - 6, ty + 40, 12, 60, '#6b4e35');
      circle(ctx, tx, ty + 20, 44, treeCols[t]);
      circle(ctx, tx - 30, ty + 36, 28, treeCols[t]);
      circle(ctx, tx + 30, ty + 36, 28, treeCols[t]);
      circle(ctx, tx, ty - 6, 30, treeCols[(t + 1) % 3]);
    }
    // Falling leaves.
    const rng = mulberry32(67);
    for (let i = 0; i < 14; i++) {
      const x = range(rng, 20, 540);
      const y = range(rng, 60, 380);
      ellipse(ctx, x, y, 6, 3.5, ['#d9a441', '#c96a2e', '#a84a2e'][Math.floor(rng() * 3)]);
    }
    // Leaf pile (it grows as a diff).
    ellipse(ctx, 140, 374, 52, 16, '#b57a2e');
    ellipse(ctx, 140, 368, 38, 12, '#c98a3a');
    if (mods.has('leaf')) ellipse(ctx, 140, 358, 26, 12, '#d9a441');
    // Squirrel (its tail goes thin and brown as a diff).
    ellipse(ctx, 172, 218, 18, 12, '#a86a3a');
    circle(ctx, 186, 206, 9, '#a86a3a');
    poly(ctx, [[182, 198], [186, 190], [190, 198]], '#a86a3a');
    if (mods.has('tail')) {
      ctx.strokeStyle = '#6b4e35';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(156, 214);
      ctx.quadraticCurveTo(140, 200, 148, 186);
      ctx.stroke();
    } else {
      ctx.strokeStyle = '#c98a4a';
      ctx.lineWidth = 9;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(156, 214);
      ctx.quadraticCurveTo(132, 196, 146, 172);
      ctx.stroke();
    }
    // Bench (one slat goes missing as a diff).
    rect(ctx, 320, 300, 90, 8, '#7a5c40');
    if (!mods.has('slat')) rect(ctx, 320, 314, 90, 8, '#7a5c40');
    rect(ctx, 320, 328, 90, 8, '#7a5c40');
    rect(ctx, 326, 336, 8, 22, '#6b4e35');
    rect(ctx, 396, 336, 8, 22, '#6b4e35');
    // Fountain with arcs (an extra arc appears as a diff).
    ellipse(ctx, 280, 330, 56, 14, '#8a9a9e');
    ellipse(ctx, 280, 328, 44, 10, '#7ec8e8');
    rect(ctx, 274, 290, 12, 40, '#9a9a8e');
    circle(ctx, 280, 286, 10, '#b0b0a4');
    ctx.strokeStyle = '#a8d8f0';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(258, 326, 18, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(302, 326, 18, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
    if (mods.has('arc')) {
      ctx.beginPath();
      ctx.arc(280, 326, 26, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
    }
    // Pond with two ducks (one is removed as a diff).
    ellipse(ctx, 470, 392, 70, 14, '#5a9bd4');
    ellipse(ctx, 470, 390, 56, 9, '#7ec8e8');
    ellipse(ctx, 452, 390, 12, 8, '#f7f3e8');
    circle(ctx, 462, 384, 6, '#f7f3e8');
    poly(ctx, [[466, 384], [472, 386], [466, 388]], '#e8a33d');
    if (!mods.has('duck')) {
      ellipse(ctx, 504, 392, 12, 8, '#efe8d2');
      circle(ctx, 514, 386, 6, '#efe8d2');
      poly(ctx, [[518, 386], [524, 388], [518, 390]], '#e8a33d');
    }
    // Lamp post (it goes off as a diff).
    line(ctx, 60, 262, 60, 180, '#3a3a3a', 5);
    circle(ctx, 60, 174, 10, mods.has('lamp') ? '#8a8fa3' : '#ffd23e');
    if (!mods.has('lamp')) {
      ctx.fillStyle = 'rgba(255, 210, 62, 0.22)';
      ctx.beginPath();
      ctx.moveTo(60, 180);
      ctx.lineTo(30, 240);
      ctx.lineTo(90, 240);
      ctx.closePath();
      ctx.fill();
    }
    poly(ctx, [[48, 176], [72, 176], [66, 164], [54, 164]], '#3a3a3a');
  },
  diffs: [
    { id: 'duck', x: 504, y: 392, r: 26, label: 'the missing duck' },
    { id: 'kite', x: 470, y: 88, r: 28, label: 'the blue kite' },
    { id: 'leaf', x: 140, y: 374, r: 26, label: 'the bigger leaf pile' },
    { id: 'slat', x: 355, y: 322, r: 26, label: 'the missing bench slat' },
    { id: 'lamp', x: 60, y: 180, r: 26, label: 'the lamp switched off' },
    { id: 'tail', x: 172, y: 218, r: 26, label: 'the thin squirrel tail' },
    { id: 'arc', x: 280, y: 330, r: 30, label: 'the extra water arc' },
  ],
};

// ---------------------------------------------------------------- scene 6
// Candy Kitchen (75s): mint wall, window with sun, balloons, chef hat,
// oven, counter with cupcakes, candy jars, mixer, plate of cookies.
const kitchen = {
  name: 'Candy Kitchen',
  sub: 'Sugar, steam and three pink balloons',
  paint(ctx, W, H, mods) {
    // Mint wall and floor.
    ctx.fillStyle = '#bfe3cf';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#e8c8a0';
    ctx.fillRect(0, 330, W, 90);
    // Window with the sun.
    rect(ctx, 60, 40, 120, 110, '#8fd0ff');
    circle(ctx, 100, 80, 22, '#ffd23e');
    cloud(ctx, 90, 60, 14, 'rgba(255,255,255,0.9)');
    cloud(ctx, 150, 110, 12, 'rgba(255,255,255,0.8)');
    line(ctx, 120, 40, 120, 150, '#7a5c40', 4);
    line(ctx, 60, 95, 180, 95, '#7a5c40', 4);
    // Balloons (the blue one turns green as a diff).
    const balloons = [
      [350, 50, '#e86a8a'],
      [410, 70, '#d9a441'],
      [300, 80, '#3d7a9b'],
    ];
    for (const [bx, by, col] of balloons) {
      const c = mods.has('balloon') && col === '#3d7a9b' ? '#3d9b57' : col;
      ellipse(ctx, bx, by, 16, 20, c);
      poly(ctx, [[bx - 5, by + 18], [bx + 5, by + 18], [bx, by + 26]], c);
      line(ctx, bx, by + 26, bx + 8, by + 70, '#8a8fa3', 1);
    }
    // Chef hat on a hook (its stripe goes missing as a diff).
    line(ctx, 490, 100, 490, 124, '#4a5064', 3);
    circle(ctx, 490, 124, 4, '#4a5064');
    ellipse(ctx, 490, 138, 26, 18, '#f7f3e8');
    rect(ctx, 468, 150, 44, 12, '#f7f3e8');
    if (!mods.has('hat')) rect(ctx, 468, 154, 44, 5, '#3d7a9b');
    // Oven with a glowing window and knobs.
    roundRect(ctx, 200, 200, 170, 130, 10, '#8a8fa3');
    roundRect(ctx, 212, 246, 90, 62, 6, mods.has('oven') ? '#3a3f4a' : '#ff9d2e');
    if (!mods.has('oven')) {
      circle(ctx, 257, 277, 18, 'rgba(255, 210, 62, 0.5)');
      rect(ctx, 222, 272, 70, 8, 'rgba(255,255,255,0.35)');
    }
    // Knobs (one goes missing as a diff).
    circle(ctx, 330, 222, 7, '#3a3f4a');
    circle(ctx, 352, 222, 7, '#3a3f4a');
    if (!mods.has('knob')) circle(ctx, 308, 222, 7, '#3a3f4a');
    line(ctx, 212, 232, 362, 232, '#6b7280', 2);
    // Counter.
    rect(ctx, 30, 330, 500, 16, '#a87c4a');
    rect(ctx, 30, 346, 500, 74, '#8a6538');
    // Cupcakes (the middle cherry is removed as a diff).
    const cupX = [80, 116, 152];
    for (let i = 0; i < 3; i++) {
      const cx = cupX[i];
      poly(ctx, [[cx - 12, 312], [cx + 12, 312], [cx + 8, 330], [cx - 8, 330]], '#e86a8a');
      circle(ctx, cx, 306, 12, '#f7f3e8');
      circle(ctx, cx - 5, 300, 4, '#e8a33d');
      circle(ctx, cx + 5, 302, 3, '#3d9b57');
      if (!(mods.has('cherry') && i === 1)) circle(ctx, cx, 292, 5, '#c94f43');
    }
    // Candy jars (one is half-full as a diff).
    for (const [jx, full] of [[340, true], [390, true], [440, true]]) {
      const half = mods.has('jar') && jx === 362 - 22;
      roundRect(ctx, jx, 276, 36, 54, 8, 'rgba(220, 235, 245, 0.75)');
      ctx.strokeStyle = '#7a8a9e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(jx, 276, 36, 54, 8);
      ctx.stroke();
      rect(ctx, jx + 4, 268, 28, 10, '#c94f43');
      const fillH = half ? 20 : 40;
      const cols = ['#e86a8a', '#d9a441', '#3d7a9b'];
      const ci = Math.floor((jx - 340) / 50);
      rect(ctx, jx + 4, 326 - fillH, 28, fillH, cols[ci]);
      for (let b = 0; b < 3; b++) circle(ctx, jx + 12 + b * 10, 322 - b * 6, 4, cols[(ci + b) % 3]);
    }
    // Mixer.
    rect(ctx, 480, 280, 40, 50, '#3d7a9b');
    circle(ctx, 500, 272, 10, '#3d7a9b');
    line(ctx, 500, 282, 500, 306, '#2c5a72', 4);
    // Plate of cookies (an extra cookie appears as a diff).
    ellipse(ctx, 497, 290, 26, 8, '#f7f3e8');
    circle(ctx, 488, 284, 8, '#c98a4a');
    circle(ctx, 506, 286, 8, '#c98a4a');
    circle(ctx, 497, 282, 8, '#c98a4a');
    if (mods.has('cookie')) circle(ctx, 514, 292, 8, '#c98a4a');
    circle(ctx, 486, 283, 1.5, '#5a3a1a');
    circle(ctx, 508, 285, 1.5, '#5a3a1a');
  },
  diffs: [
    { id: 'cherry', x: 116, y: 292, r: 22, label: 'the missing cherry' },
    { id: 'jar', x: 362, y: 278, r: 26, label: 'the half-full jar' },
    { id: 'balloon', x: 350, y: 50, r: 28, label: 'the green balloon' },
    { id: 'oven', x: 280, y: 295, r: 30, label: 'the oven light off' },
    { id: 'cookie', x: 497, y: 290, r: 22, label: 'the extra cookie' },
    { id: 'hat', x: 490, y: 124, r: 24, label: 'the missing hat stripe' },
    { id: 'knob', x: 308, y: 222, r: 20, label: 'the missing knob' },
  ],
};

// ---------------------------------------------------------------- the list
export const LEVELS = [harbor, temple, station, library, park, kitchen];
