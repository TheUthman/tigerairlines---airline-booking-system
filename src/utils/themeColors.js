export function getThemeColors() {
  if (typeof window === "undefined") {
    return {
      primary: "#f28c28",
      secondary: "#292929",
      muted: "#666666",
      border: "#e5e5e2",
      surface: "#ffffff",
      foreground: "#171717",
      background: "#f7f7f5",
    };
  }

  const styles = getComputedStyle(document.documentElement);
  const read = (name, fallback) => styles.getPropertyValue(name).trim() || fallback;

  return {
    primary: read("--primary", "#f28c28"),
    secondary: read("--secondary", "#292929"),
    muted: read("--muted", "#666666"),
    border: read("--border", "#e5e5e2"),
    surface: read("--surface", "#ffffff"),
    foreground: read("--foreground", "#171717"),
    background: read("--background", "#f7f7f5"),
  };
}
