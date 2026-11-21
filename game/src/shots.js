// Twin Peeks — staged screenshots. A ?shot= URL puts the game into a fixed
// pose and paints it twice so the frame is settled, then main.js sets
// window.__shotReady for the screenshot tool.
//
//   start : the title screen with the level-1 preview
//   play  : a level in progress (found list, time and score from the query)
//   play2 : another level in progress (same shape as play)
//   end   : the level-complete overlay, all 7 found, 3 stars
//
// Query params: level (0-based), found (comma diff ids), time (seconds
// left), score (points this level).

import { LEVEL_TIMES } from './config.js';
import { LEVELS } from './scenes.js';

export function stageShot(name, world, query) {
  const level = Math.min(5, Math.max(0, Number(query.get('level') ?? 0)));
  if (name === 'start') {
    world.backToTitle();
    return true;
  }
  if (name === 'play' || name === 'play2') {
    world.startLevel(level);
    const found = (query.get('found') ?? '').split(',').filter(Boolean);
    for (const id of found) {
      const d = LEVELS[level].diffs.find((x) => x.id === id);
      if (!d) continue;
      world.found.add(d.id);
      world.markers.push({ x: d.x, y: d.y, panel: 'left' });
    }
    world.combo = found.length;
    world.score = Number(query.get('score') ?? found.length * 100);
    world.timeLeft = Number(query.get('time') ?? LEVEL_TIMES[level]);
    world.message = `Found ${found.length}/7 — ${7 - found.length} more hiding!`;
    return true;
  }
  if (name === 'end') {
    world.startLevel(level);
    for (const d of LEVELS[level].diffs) {
      world.found.add(d.id);
      world.markers.push({ x: d.x, y: d.y, panel: 'left' });
    }
    // Real combo total for 7 finds: 100+115+130+145+160+175+190 = 1015.
    world.score = 1015;
    world.timeLeft = 42;
    world.timeBonus = 42 * 10;
    world.levelScore = 1015 + 420;
    world.totalScore = 1435;
    world.levelStars = 3;
    world.screen = 'leveldone';
    world.message = 'Level clear! +420 time bonus';
    return true;
  }
  return false;
}
