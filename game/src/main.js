// Twin Peeks — boot and the fixed-step game loop. Clicks are hit-tested
// against the renderer's buttons first, then the picture panels. The loop
// runs at a fixed 1/60 step with a 0.25s frame cap so a slow frame never
// jumps the clock. In shot mode (?shot=...) the game paints twice, sets
// window.__shotReady and stops, so a screenshot tool gets a settled frame.

import { FIELD, PANEL, STEP } from './config.js';
import { createAudio } from './audio.js';
import { ACTION_CONFIRM, ACTION_HINT, ACTION_MUTE, ACTION_PAUSE, ACTION_RESTART, createInput } from './input.js';
import { createRenderer } from './render.js';
import { stageShot } from './shots.js';
import { createWorld } from './world.js';

const MAX_FRAME = 0.25;
const canvas = document.getElementById('game');
const status = document.getElementById('status');

const world = createWorld();
const renderer = createRenderer(canvas);
const input = createInput();
const audio = createAudio();
// Debug handle (kept: lets the playtest read state without a DOM scrape).
window.__twinpeeks = { world, input, audio };

let regions = { buttons: [], panels: [] };
let shotMode = false;

function paint() {
  regions = renderer.draw({ ...world, audioMuted: audio.muted });
  if (status) {
    status.textContent =
      world.screen === 'play'
        ? `${world.level.name} — found ${world.found.size}/7 · ${world.totalScore + world.score} pts`
        : world.screen === 'title'
          ? 'Twin Peeks — spot the difference'
          : world.message;
  }
}

// Hit-tests a pointerdown in field coordinates: buttons first, then panels.
function onPointer(clientX, clientY) {
  const p = renderer.fieldCoords(clientX, clientY);
  for (const b of regions.buttons) {
    if (p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h) {
      pressButton(b.id);
      return;
    }
  }
  if (world.screen !== 'play') {
    // A click anywhere on the title screen starts the game.
    if (world.screen === 'title') {
      audio.find();
      world.startGame();
    }
    return;
  }
  for (const panel of regions.panels) {
    if (p.x >= panel.x && p.x <= panel.x + panel.w && p.y >= panel.y && p.y <= panel.y + panel.h) {
      const sx = p.x - panel.x;
      const sy = p.y - panel.y;
      const ev = world.clickAt(sx, sy, panel.panel);
      if (ev === 'FIND') audio.find();
      else if (ev === 'MISS') audio.miss();
      return;
    }
  }
}

function pressButton(id) {
  if (id === 'hint') {
    const d = world.useHint();
    if (d) audio.hint();
    return;
  }
  if (id === 'mute') {
    audio.toggleMute();
    return;
  }
  if (id.startsWith('level-')) {
    const i = Number(id.slice(6));
    audio.find();
    world.startLevel(i);
    return;
  }
  if (id === 'next') {
    world.nextLevel();
    return;
  }
  if (id === 'replay' || id === 'retry') {
    world.retryLevel();
    return;
  }
  if (id === 'again') {
    world.startGame();
    return;
  }
  if (id === 'menu') {
    world.backToTitle();
    return;
  }
  if (id === 'resume') {
    world.resume();
  }
}

// One fixed step: poll actions, advance the clock, play the low-time tick.
function step() {
  if (input.take(ACTION_MUTE)) audio.toggleMute();
  if (world.screen === 'title') {
    if (input.take(ACTION_CONFIRM)) {
      audio.find();
      world.startGame();
    }
    return;
  }
  if (world.screen === 'play') {
    if (input.take(ACTION_PAUSE)) {
      world.pause();
      return;
    }
    if (input.take(ACTION_HINT)) {
      const d = world.useHint();
      if (d) audio.hint();
    }
    if (input.take(ACTION_RESTART)) {
      world.retryLevel();
      return;
    }
    const ev = world.tick(STEP);
    if (ev === 'TIMEOUT') audio.timeout();
    const sec = Math.ceil(world.timeLeft);
    if (sec <= 10 && sec > 0 && sec !== world.lastTickSecond) {
      world.lastTickSecond = sec;
      audio.tick();
    }
    return;
  }
  if (world.screen === 'paused') {
    if (input.take(ACTION_PAUSE) || input.take(ACTION_CONFIRM)) world.resume();
    return;
  }
  if (world.screen === 'leveldone') {
    if (input.take(ACTION_CONFIRM)) world.nextLevel();
    return;
  }
  if (world.screen === 'timeout') {
    if (input.take(ACTION_CONFIRM)) world.retryLevel();
    return;
  }
  if (world.screen === 'results') {
    if (input.take(ACTION_CONFIRM)) world.startGame();
  }
}

function frame(now) {
  if (shotMode) return;
  const dt = Math.min(MAX_FRAME, (now - frame.last) / 1000 || 0);
  frame.last = now;
  frame.acc += dt;
  let guard = 0;
  while (frame.acc >= STEP && guard < 20) {
    step();
    frame.acc -= STEP;
    guard++;
  }
  paint();
  requestAnimationFrame(frame);
}
frame.last = 0;
frame.acc = 0;

function boot() {
  renderer.resize();
  window.addEventListener('resize', renderer.resize);
  input.attach(canvas);
  input.onPointer(onPointer);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && world.screen === 'play') world.pause();
  });
  const query = new URLSearchParams(window.location.search);
  const shot = query.get('shot');
  if (shot) {
    shotMode = true;
    if (stageShot(shot, world, query)) {
      paint();
      paint();
      window.__shotReady = true;
    }
    return;
  }
  paint();
  requestAnimationFrame(frame);
}

boot();
