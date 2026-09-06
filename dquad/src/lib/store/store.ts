import type { AppState } from "./types";
import { createSeedState, SEED_VERSION } from "./seed";

const KEY = "dquad.state.v1";

type Listener = () => void;

let state: AppState = createSeedState();
const serverSnapshot: AppState = createSeedState();
let listeners = new Set<Listener>();
let hydrated = false;

function readStorage(): AppState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AppState;
    if (parsed.seedVersion !== SEED_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStorage(next: AppState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage may be unavailable, state still lives in memory */
  }
}

export function hydrateStore() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  const stored = readStorage();
  if (stored) {
    state = stored;
    emit();
  }
  window.addEventListener("storage", (e) => {
    if (e.key === KEY && e.newValue) {
      try {
        state = JSON.parse(e.newValue) as AppState;
        emit();
      } catch {
        /* ignore */
      }
    }
  });
}

function emit() {
  listeners.forEach((l) => l());
}

export const store = {
  get: () => state,
  getServer: () => serverSnapshot,
  subscribe(l: Listener) {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
  set(updater: (s: AppState) => AppState) {
    state = updater(state);
    writeStorage(state);
    emit();
  },
  reset() {
    state = createSeedState();
    writeStorage(state);
    emit();
  },
  /** Test helper: replace listeners and state without touching storage. */
  __replace(next: AppState) {
    state = next;
    listeners = new Set();
  },
};
