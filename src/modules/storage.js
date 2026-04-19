const STORAGE_KEY = "wizardMansion";

const defaultState = {
  smiles: 0,
  badges: [],
  streaks: {
    kindness: 0,
    nature: 0,
    friendship: 0,
    learning: 0
  },
  challengesDoneByDay: {},
  gameProgress: {},
  drawings: [],
  /** 'y2' | 'y3' — companion mode aligned to England Year 2 / Year 3 curriculum expectations */
  yearBand: "y2",
  settings: {
    muted: true
  },
  /** Progress for standalone curriculum mini-apps (not milestone booleans). */
  castleProgress: {
    score: 0,
    level: 1,
    lessonProgress: 0,
    /** Persisted 10–99 challenge while playing Number Castle */
    activeChallenge: null
  },
  academyProgress: {
    phase1: { best: 0, attempts: 0, passed: false },
    phase2: { best: 0, attempts: 0, passed: false },
    phase3: { best: 0, attempts: 0, passed: false },
    phase4: { best: 0, attempts: 0, passed: false }
  }
};

export function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    return parsed ? { ...defaultState, ...parsed } : structuredClone(defaultState);
  } catch {
    return structuredClone(defaultState);
  }
}

export function saveState(nextState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
}

/** Merge partial updates into saved state (for activities that avoid full app setState). */
function mergePartial(base, partial) {
  const next = { ...base, ...partial };
  if (partial.castleProgress) {
    next.castleProgress = { ...base.castleProgress, ...partial.castleProgress };
  }
  if (partial.academyProgress) {
    next.academyProgress = { ...base.academyProgress, ...partial.academyProgress };
  }
  if (partial.badges) {
    next.badges = partial.badges;
  }
  return next;
}

/** Save merged state without re-render (mini-games can pair with syncWizardHeader). */
export function patchStateSilent(partial) {
  const base = loadState();
  saveState(mergePartial(base, partial));
}

export function patchState(partial) {
  const base = loadState();
  saveState(mergePartial(base, partial));
  window.dispatchEvent(new CustomEvent("wizard-storage-update"));
}

export function getStorageKey() {
  return STORAGE_KEY;
}
