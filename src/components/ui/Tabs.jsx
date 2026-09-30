const Tabs = ({
  tabs,
  activeTab,
  onChange,
  variant = "underline",
  className = ""
}) => {
  if (variant === "pills") {
    return <div className={`inline-flex p-1 bg-surface-muted rounded-xl gap-1 ${className}`}>
        {tabs.map((tab) => {
      const isActive = tab.id === activeTab;
      return <button
        key={tab.id}
        type="button"
        onClick={() => onChange(tab.id)}
        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${isActive ? "bg-surface text-primary shadow-xs" : "text-muted hover:text-foreground hover:bg-surface/50"}`}
      >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge !== void 0 && <span
        className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? "bg-primary/10 text-primary" : "bg-surface-muted text-foreground"}`}
      >
                  {tab.badge}
                </span>}
            </button>;
    })}
      </div>;
  }
  return <div className={`flex border-b border-border gap-2 ${className}`}>
      {tabs.map((tab) => {
    const isActive = tab.id === activeTab;
    return <button
      key={tab.id}
      type="button"
      onClick={() => onChange(tab.id)}
      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors duration-150 cursor-pointer ${isActive ? "border-primary text-primary" : "border-transparent text-muted hover:text-foreground hover:border-border"}`}
    >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge !== void 0 && <span
      className={`text-xs px-2 py-0.5 rounded-full ${isActive ? "bg-primary/15 text-primary" : "bg-surface-muted text-muted"}`}
    >
                {tab.badge}
              </span>}
          </button>;
  })}
    </div>;
};
var stdin_default = Tabs;
export {
  Tabs,
  stdin_default as default
};
