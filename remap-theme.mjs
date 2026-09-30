import fs from "fs";
import path from "path";

const root = path.resolve("src");
const skip = new Set([
  path.normalize("src/index.css"),
  path.normalize("src/context/ThemeContext.jsx"),
  path.normalize("src/components/ui/ThemeToggle.jsx"),
  path.normalize("src/utils/themeColors.js"),
  path.normalize("src/components/ui/Button.jsx"),
  path.normalize("src/components/ui/Badge.jsx"),
  path.normalize("src/components/ui/Card.jsx"),
  path.normalize("src/components/ui/Input.jsx"),
  path.normalize("src/components/ui/Select.jsx")
]);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(jsx|js|css)$/.test(entry.name)) files.push(full);
  }
  return files;
}

const replacements = [
  ["[#a61c2e]", "primary"],
  ["[#8f1524]", "primary-hover"],
  ["[#7a101d]", "primary-dark"],
  ["[#630b16]", "primary-dark"],
  ["[#b91c3c]", "primary"],
  ["[#f5641f]", "secondary"],
  ["[#e0520d]", "secondary-hover"],
  ["[#cc4505]", "secondary-hover"],
  ["[#f5b82e]", "secondary"],
  ["[#e5a81e]", "secondary-hover"],
  ["[#e4e7ec]", "surface-muted"],
  ["bg-red-50/50", "bg-primary/10"],
  ["bg-red-50/30", "bg-primary/10"],
  ["hover:bg-red-100", "hover:bg-primary/15"],
  ["hover:bg-red-50", "hover:bg-primary/10"],
  ["bg-red-100", "bg-primary/15"],
  ["bg-red-50", "bg-primary/10"],
  ["border-red-100", "border-primary/20"],
  ["border-red-200", "border-primary/25"],
  ["placeholder-slate-400", "placeholder-muted"],
  ["hover:bg-slate-50/50", "hover:bg-surface-muted/50"],
  ["hover:bg-slate-50", "hover:bg-surface-muted"],
  ["hover:bg-slate-100/80", "hover:bg-surface-muted"],
  ["hover:bg-slate-100", "hover:bg-surface-muted"],
  ["hover:bg-slate-200", "hover:bg-surface-muted"],
  ["focus:bg-white", "focus:bg-surface"],
  ["bg-white/80", "bg-surface/80"],
  ["bg-white ", "bg-surface "],
  ["bg-white\"", "bg-surface\""],
  ["bg-white`", "bg-surface`"],
  ["bg-white}", "bg-surface}"],
  ["bg-slate-50", "bg-background"],
  ["bg-slate-100/80", "bg-surface-muted"],
  ["bg-slate-100", "bg-surface-muted"],
  ["bg-slate-200/80", "bg-surface-muted"],
  ["bg-slate-200", "bg-surface-muted"],
  ["text-slate-950", "text-on-secondary"],
  ["text-slate-900", "text-foreground"],
  ["text-slate-800", "text-foreground"],
  ["text-slate-700", "text-foreground"],
  ["text-slate-600", "text-muted"],
  ["text-slate-500", "text-muted"],
  ["text-slate-400", "text-muted"],
  ["text-slate-300", "text-muted"],
  ["border-slate-50", "border-border"],
  ["border-slate-100", "border-border"],
  ["border-slate-200/90", "border-border"],
  ["border-slate-200/80", "border-border"],
  ["border-slate-200/60", "border-border"],
  ["border-slate-200", "border-border"],
  ["border-slate-300", "border-border"],
  ["divide-slate-100", "divide-border"],
  ["divide-y divide-slate-200", "divide-y divide-border"],
  ["hover:border-slate-300", "hover:border-border"],
  ["hover:text-slate-900", "hover:text-foreground"],
  ["hover:text-slate-800", "hover:text-foreground"],
  ["hover:text-slate-700", "hover:text-foreground"],
  ["from-slate-900", "from-[#111111]"],
  ["to-slate-900", "to-[#111111]"],
  ["via-slate-900", "via-[#111111]"],
  ["to-slate-800", "to-[#242424]"],
  ["bg-slate-900/95", "bg-[#111111]/95"],
  ["bg-slate-900/90", "bg-[#111111]/90"],
  ["bg-slate-900/80", "bg-[#111111]/80"],
  ["bg-slate-900/60", "bg-black/60"],
  ["bg-slate-900", "bg-[#111111]"],
  ["bg-slate-950", "bg-[#111111]"],
  ["border-slate-800", "border-white/10"],
  ["hover:bg-slate-800", "hover:bg-white/10"],
  ["bg-slate-800/60", "bg-white/10"],
  ["bg-slate-800", "bg-white/10"]
];

let changed = 0;
for (const file of walk(root)) {
  const rel = path.relative(process.cwd(), file);
  if (skip.has(path.normalize(rel))) continue;
  let text = fs.readFileSync(file, "utf8");
  const original = text;
  for (const [from, to] of replacements) {
    text = text.split(from).join(to);
  }
  if (text !== original) {
    fs.writeFileSync(file, text);
    changed += 1;
    console.log("updated", rel);
  }
}
console.log("files changed:", changed);
