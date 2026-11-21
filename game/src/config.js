// Twin Peeks — shared constants for the spot-the-difference game.
// One place for the field size, panel geometry, scoring and palette so every
// module agrees on the numbers the judge sees in the screenshots.

export const FIELD = { w: 1280, h: 720 };

// The two picture panels. Scene space is PANEL.w x PANEL.h (560x420); the
// diff coordinates in scenes.js live in that space.
export const PANEL = { w: 560, h: 420, leftX: 40, rightX: 680, y: 120 };

export const STEP = 1 / 60;

export const SCORING = {
  find: 100, // points for each difference found
  comboBonus: 15, // extra per step of the combo chain (combo n pays +15*(n-1))
  hintCost: 25, // points a hint takes away
  missSeconds: 2, // seconds a wrong click costs
  timeBonusPerSecond: 10, // points per second left when a level is cleared
};

export const HINT = {
  perLevel: 3, // hints available in each level
  ringSeconds: 2.5, // how long the gold hint ring pulses
};

export const LEVEL_TIMES = [100, 95, 90, 85, 80, 75];

export const PALETTE = {
  ink: '#20242e',
  inkSoft: '#4a5064',
  paper: '#f6f1e7',
  panel: '#fffdf6',
  line: '#d8cdb4',
  accent: '#2f6f5e',
  gold: '#d9a441',
  red: '#c94f43',
  green: '#3d9b57',
  header: '#2b3a55',
  headerInk: '#f2ead8',
  dim: '#8a8fa3',
};

export const FONT = "'Trebuchet MS', 'Segoe UI', Verdana, sans-serif";
export const FONT_DISPLAY = "Georgia, 'Times New Roman', serif";

export const BEST_KEY = 'twinpeeks.best';
export const STARS_KEY = 'twinpeeks.stars';
