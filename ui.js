import { buildInitialState } from "./seed.js";

const STORAGE_KEY = "lifesyncai:v2";

let currentState = null;
const listeners = new Set();

export function getConfig() {
  return window.LifeSyncConfig || {};
}

export function loadState() {
  if (currentState) return currentState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    currentState = raw ? JSON.parse(raw) : buildInitialState(getConfig());
  } catch (error) {
    console.warn("Falling back to seed state:", error);
    currentState = buildInitialState(getConfig());
  }
  return currentState;
}

export function saveState(nextState) {
  currentState = nextState;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
  listeners.forEach((cb) => cb(currentState));
  return currentState;
}

export function updateState(updater) {
  const prev = loadState();
  const next = typeof updater === "function" ? updater(structuredClone(prev)) : { ...prev, ...updater };
  return saveState(next);
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function resetState() {
  currentState = buildInitialState(getConfig());
  localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
  listeners.forEach((cb) => cb(currentState));
  return currentState;
}

export function exportState() {
  return JSON.stringify(loadState(), null, 2);
}

export function importState(json) {
  const parsed = JSON.parse(json);
  saveState(parsed);
  return parsed;
}
