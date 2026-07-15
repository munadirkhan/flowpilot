// Light/dark theme: stamps data-theme on <html>, persists in localStorage.

export type Theme = "light" | "dark";
const KEY = "relay-theme";

export function getTheme(): Theme {
  return (localStorage.getItem(KEY) as Theme) || "light";
}

export function applyTheme(t: Theme) {
  // Chromium freezes in-flight transitions when inherited CSS vars change, so
  // suppress all transitions for a frame while the theme flips.
  const html = document.documentElement;
  html.classList.add("theme-switching");
  html.dataset.theme = t;
  localStorage.setItem(KEY, t);
  requestAnimationFrame(() =>
    requestAnimationFrame(() => html.classList.remove("theme-switching"))
  );
}

export function initTheme() {
  applyTheme(getTheme());
}

export function toggleTheme(): Theme {
  const next: Theme = getTheme() === "dark" ? "light" : "dark";
  applyTheme(next);
  return next;
}
