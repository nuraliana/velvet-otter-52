// Twin Peeks — game state and rules. Screens: title, play, leveldone,
// results, paused, timeout. The world knows nothing about pixels on the
// page: clicks arrive in scene space (0..560, 0..420) with a panel name,
// and the renderer turns that into markers and overlays.

import { HINT, LEVEL_TIMES, SCORING } from './config.js';
import { LEVELS } from './scenes.js';

// Best score / stars live in localStorage; missing entries read as 0 / none.
function loadBest() {
  try {
    return Number(localStorage.getItem('twinpeeks.best') ?? 0) || 0;
  } catch {
    return 0;
  }
}
function loadStars() {
  try {
    return JSON.parse(localStorage.getItem('twinpeeks.stars') ?? '[]');
  } catch {
    return [];
  }
}
function saveBest(v) {
  try {
    localStorage.setItem('twinpeeks.best', String(v));
  } catch {}
}
function saveStars(arr) {
  try {
    localStorage.setItem('twinpeeks.stars', JSON.stringify(arr));
  } catch {}
}

export function createWorld() {
  const w = {
    screen: 'title',
    levelIndex: 0,
    level: LEVELS[0],
    found: new Set(),
    combo: 0,
    score: 0,
    totalScore: 0,
    timeLeft: LEVEL_TIMES[0],
    hintsLeft: HINT.perLevel,
    hintsUsed: 0,
    markers: [], // {x, y, panel} in scene space, shown on both panels
    effects: [], // {kind: 'find'|'miss', x, y, panel, t} fading feedback
    hintRing: null, // {x, y, t} the pulsing gold ring, or null
    stars: loadStars(), // stars per level, index = level
    best: loadBest(),
    timeBonus: 0,
    levelStars: 0,
    levelScore: 0,
    message: '',
    lastTickSecond: -1,
  };

  // Starts a fresh game from level 0.
  function startGame() {
    w.totalScore = 0;
    w.stars = loadStars();
    startLevel(0);
  }

  // Sets up level i (0-based) and switches to the play screen.
  function startLevel(i) {
    w.levelIndex = i;
    w.level = LEVELS[i];
    w.found = new Set();
    w.combo = 0;
    w.score = 0;
    w.timeLeft = LEVEL_TIMES[i];
    w.hintsLeft = HINT.perLevel;
    w.hintsUsed = 0;
    w.markers = [];
    w.effects = [];
    w.hintRing = null;
    w.timeBonus = 0;
    w.levelStars = 0;
    w.levelScore = 0;
    w.message = `Find 7 differences in ${w.level.name}!`;
    w.lastTickSecond = -1;
    w.screen = 'play';
  }

  // A click in scene space on one panel. Returns 'FIND', 'MISS' or null
  // (null when the click cannot do anything, e.g. not on the play screen).
  function clickAt(x, y, panel) {
    if (w.screen !== 'play') return null;
    // A click on an already-found difference is ignored (no penalty).
    for (const d of w.level.diffs) {
      if (w.found.has(d.id)) continue;
      const dx = x - d.x;
      const dy = y - d.y;
      if (dx * dx + dy * dy <= d.r * d.r) {
        w.found.add(d.id);
        const pts = SCORING.find + SCORING.comboBonus * w.combo;
        w.combo += 1;
        w.score += pts;
        w.markers.push({ x: d.x, y: d.y, panel });
        w.effects.push({ kind: 'find', x: d.x, y: d.y, panel, t: 0 });
        w.message = `Found ${d.label}! +${pts}`;
        if (w.found.size === w.level.diffs.length) finishLevel();
        return 'FIND';
      }
    }
    // A miss: combo resets and the clock loses time.
    w.combo = 0;
    w.timeLeft = Math.max(0, w.timeLeft - SCORING.missSeconds);
    w.effects.push({ kind: 'miss', x, y, panel, t: 0 });
    w.message = `Not a difference — ${SCORING.missSeconds}s!`;
    return 'MISS';
  }

  // Spends a hint: -25 points, a gold ring pulses on an unfound difference
  // for HINT.ringSeconds. Returns the diff it points at, or null.
  function useHint() {
    if (w.screen !== 'play' || w.hintsLeft <= 0) return null;
    const rest = w.level.diffs.filter((d) => !w.found.has(d.id));
    if (rest.length === 0) return null;
    const d = rest[Math.floor(Math.random() * rest.length)];
    w.hintsLeft -= 1;
    w.hintsUsed += 1;
    w.score = Math.max(0, w.score - SCORING.hintCost);
    w.hintRing = { x: d.x, y: d.y, t: 0 };
    w.message = `Hint: look near ${d.label} (−${SCORING.hintCost})`;
    return d;
  }

  // Advances the clock by dt seconds. Returns 'TIMEOUT' when time runs out.
  function tick(dt) {
    if (w.screen !== 'play') return null;
    w.timeLeft -= dt;
    // Fade the click effects and the hint ring.
    for (const e of w.effects) e.t += dt;
    w.effects = w.effects.filter((e) => e.t < 0.9);
    if (w.hintRing) {
      w.hintRing.t += dt;
      if (w.hintRing.t >= HINT.ringSeconds) w.hintRing = null;
    }
    if (w.timeLeft <= 0) {
      w.timeLeft = 0;
      w.screen = 'timeout';
      w.message = 'Time is up!';
      return 'TIMEOUT';
    }
    return null;
  }

  // Called when the last difference of a level is found: time bonus, stars,
  // and the level-done screen.
  function finishLevel() {
    const secs = Math.floor(w.timeLeft);
    w.timeBonus = secs * SCORING.timeBonusPerSecond;
    w.levelScore = w.score + w.timeBonus;
    w.totalScore += w.levelScore;
    if (secs >= 30 && w.hintsUsed === 0) w.levelStars = 3;
    else if (secs >= 12 && w.hintsUsed <= 1) w.levelStars = 2;
    else w.levelStars = 1;
    const prev = w.stars[w.levelIndex] ?? 0;
    if (w.levelStars > prev) {
      w.stars[w.levelIndex] = w.levelStars;
      saveStars(w.stars);
    }
    if (w.totalScore > w.best) {
      w.best = w.totalScore;
      saveBest(w.best);
    }
    w.screen = 'leveldone';
    w.message = `Level clear! +${w.timeBonus} time bonus`;
  }

  // Moves to the next level, or to the results screen after the last one.
  function nextLevel() {
    if (w.levelIndex + 1 >= LEVELS.length) {
      w.screen = 'results';
      if (w.totalScore > w.best) {
        w.best = w.totalScore;
        saveBest(w.best);
      }
    } else {
      startLevel(w.levelIndex + 1);
    }
  }

  function retryLevel() {
    startLevel(w.levelIndex);
  }

  function backToTitle() {
    w.screen = 'title';
    w.message = '';
  }

  function pause() {
    if (w.screen === 'play') w.screen = 'paused';
  }

  function resume() {
    if (w.screen === 'paused') w.screen = 'play';
  }

  // The methods above mutate `w` itself, so return `w` (not a spread copy:
  // a copy would freeze the state at creation time and the caller would
  // never see a screen change, a find or a score).
  return Object.assign(w, {
    startGame,
    startLevel,
    clickAt,
    useHint,
    tick,
    nextLevel,
    retryLevel,
    backToTitle,
    pause,
    resume,
  });
}
