// Twin Peeks — keyboard and pointer input. Keys become one-shot action
// flags that main.js polls once per frame and clears; a pointerdown hands
// its client coordinates to a callback the game registers.

// The action flags main.js reads (set on keydown, cleared after use).
export const ACTION_CONFIRM = 'confirm';
export const ACTION_PAUSE = 'pause';
export const ACTION_HINT = 'hint';
export const ACTION_RESTART = 'restart';
export const ACTION_MUTE = 'mute';

export function createInput() {
  const pending = new Set();
  let pointerCb = null;

  const KEY_ACTIONS = {
    Enter: ACTION_CONFIRM,
    ' ': ACTION_CONFIRM,
    Escape: ACTION_PAUSE,
    p: ACTION_PAUSE,
    P: ACTION_PAUSE,
    h: ACTION_HINT,
    H: ACTION_HINT,
    r: ACTION_RESTART,
    R: ACTION_RESTART,
    m: ACTION_MUTE,
    M: ACTION_MUTE,
  };

  function onKey(e) {
    const a = KEY_ACTIONS[e.key];
    if (a === undefined) return;
    // Space scrolls the page; Enter/Space also re-click focused buttons.
    if (e.key === ' ' || e.key === 'Enter') e.preventDefault();
    pending.add(a);
  }

  function onPointer(e) {
    if (pointerCb) pointerCb(e.clientX, e.clientY);
  }

  return {
    // True when the action was pressed since the last poll; clears it.
    take(action) {
      if (!pending.has(action)) return false;
      pending.delete(action);
      return true;
    },
    // Registers the pointerdown callback (clientX, clientY).
    onPointer(cb) {
      pointerCb = cb;
    },
    // Attaches the listeners (call once, with the canvas for pointer input).
    attach(canvas) {
      window.addEventListener('keydown', onKey);
      canvas.addEventListener('pointerdown', onPointer);
    },
  };
}
