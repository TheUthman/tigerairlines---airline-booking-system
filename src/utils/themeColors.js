export function getThemeColors() {
  if (typeof window === "undefined") {
    return {
      primary: "#e87516",
      secondary: "#ffb52e",
      muted: "#6b7280",
      border: "#e6e0d6",
      surface: "#ffffff",
      foreground: "#171717",
      background: "#faf7f2"
    };
  }
  const styles = getComputedStyle(document.documentElement);
  const read = (name, fallback) => styles.getPropertyValue(name).trim() || fallback;
  return {
    primary: read("--primary", "#e87516"),
    secondary: read("--secondary", "#ffb52e"),
    muted: read("--muted", "#6b7280"),
    border: read("--border", "#e6e0d6"),
    surface: read("--surface", "#ffffff"),
    foreground: read("--foreground", "#171717"),
    background: read("--background", "#faf7f2")
  };
}
