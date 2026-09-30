import { useState } from "react";
import { ChevronDown } from "lucide-react";
const Accordion = ({
  items,
  allowMultiple = false,
  defaultExpanded = [],
  className = "",
  variant = "bordered"
}) => {
  const [expandedIds, setExpandedIds] = useState(defaultExpanded);
  const toggleItem = (id) => {
    if (allowMultiple) {
      setExpandedIds(
        (prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
      );
    } else {
      setExpandedIds((prev) => prev.includes(id) ? [] : [id]);
    }
  };
  const variantContainerStyles = {
    bordered: "border border-border rounded-2xl divide-y divide-border overflow-hidden bg-surface shadow-xs",
    separated: "space-y-3 bg-transparent",
    flush: "divide-y divide-border bg-transparent"
  };
  const itemWrapperStyles = {
    bordered: "bg-surface",
    separated: "border border-border rounded-2xl bg-surface shadow-xs overflow-hidden",
    flush: "py-1"
  };
  return <div className={`${variantContainerStyles[variant]} ${className}`}>
      {items.map((item) => {
    const isExpanded = expandedIds.includes(item.id);
    return <div key={item.id} className={itemWrapperStyles[variant]}>
            <button
      type="button"
      onClick={() => toggleItem(item.id)}
      aria-expanded={isExpanded}
      aria-controls={`accordion-content-${item.id}`}
      className="w-full flex items-center justify-between p-4 md:p-5 text-left font-semibold text-foreground hover:text-primary hover:bg-surface-muted/50 transition cursor-pointer gap-3"
    >
              <div className="flex items-center gap-3">
                {item.icon && <span className="text-primary shrink-0">{item.icon}</span>}
                <span className="text-sm font-bold tracking-tight">{item.title}</span>
                {item.badge && <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {item.badge}
                  </span>}
              </div>
              <ChevronDown
      size={18}
      className={`text-muted shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180 text-primary" : ""}`}
    />
            </button>

            {isExpanded && <div
      id={`accordion-content-${item.id}`}
      role="region"
      className="px-4 md:px-5 pb-5 pt-1 text-xs md:text-sm text-muted leading-relaxed animate-in fade-in duration-200"
    >
                {item.content}
              </div>}
          </div>;
  })}
    </div>;
};
var stdin_default = Accordion;
export {
  Accordion,
  stdin_default as default
};
