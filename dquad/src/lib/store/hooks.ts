"use client";
import { useEffect, useSyncExternalStore } from "react";
import { hydrateStore, store } from "./store";
import type { AppState } from "./types";

export function useAppState(): AppState {
  useEffect(() => {
    hydrateStore();
  }, []);
  return useSyncExternalStore(store.subscribe, store.get, store.getServer);
}

/** True once the client has read persisted state at least once. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
