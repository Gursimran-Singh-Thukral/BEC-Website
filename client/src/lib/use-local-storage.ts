"use client";

import { useCallback, useSyncExternalStore } from "react";

const EVT = "bec-storage";

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(EVT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(EVT, cb);
  };
}

/** A JSON value kept in localStorage. Renders `fallback` on the server and during hydration. */
export function useLocalStorage<T>(key: string, fallback: T): [T, (update: (prev: T) => T) => void] {
  const raw = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    () => null,
  );
  let value = fallback;
  if (raw) {
    try {
      value = JSON.parse(raw) as T;
    } catch {}
  }
  const set = useCallback(
    (update: (prev: T) => T) => {
      let prev = fallback;
      try {
        prev = JSON.parse(localStorage.getItem(key) ?? "null") ?? fallback;
      } catch {}
      try {
        localStorage.setItem(key, JSON.stringify(update(prev)));
      } catch {}
      window.dispatchEvent(new Event(EVT));
    },
    [key, fallback],
  );
  return [value, set];
}
