import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const ThemeToggle = ({ className = "", variant = "default" }) => {
  const { isDark, toggleTheme } = useTheme();
  const variants = {
    default:
      "text-foreground hover:bg-surface-muted border border-border bg-surface",
    inverse:
      "text-white hover:bg-white/15 border border-white/20 bg-white/10",
    ghost: "text-muted hover:text-foreground hover:bg-surface-muted border border-transparent"
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Light theme" : "Dark theme"}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${variants[variant] || variants.default} ${className}`}
    >
      {isDark ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
};

export default ThemeToggle;
