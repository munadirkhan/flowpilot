import { useState } from "react";
import { getTheme, toggleTheme, type Theme } from "../lib/theme";

export function ThemeToggle({ style }: { style?: React.CSSProperties }) {
  const [theme, setTheme] = useState<Theme>(getTheme());
  return (
    <button
      onClick={() => setTheme(toggleTheme())}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        width: 34,
        height: 34,
        borderRadius: "50%",
        border: "1px solid var(--line-2)",
        background: "var(--card)",
        color: "var(--ink)",
        cursor: "pointer",
        fontSize: 15,
        lineHeight: 1,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "border-color .2s, background .2s",
        ...style,
      }}
    >
      {theme === "dark" ? "☀" : "☾"}
    </button>
  );
}
