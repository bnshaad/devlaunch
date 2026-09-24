"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }
  const mql = window.matchMedia("(hover: hover)");
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getSnapshot() {
  if (typeof window === "undefined") {
    return false;
  }
  return window.matchMedia("(hover: hover)").matches;
}

function getServerSnapshot() {
  return false;
}

export function useCanHover() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
