import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";
const Select = forwardRef(
  ({ label, options, error, className = "", id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : void 0);
    return <div className="w-full">
        {label && <label htmlFor={selectId} className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
            {label}
          </label>}
        <div className="relative">
          <select
      id={selectId}
      ref={ref}
      className={`w-full bg-surface border appearance-none ${error ? "border-red-500" : "border-border focus:border-primary focus:ring-primary/20"} rounded-lg pl-3.5 pr-10 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 transition duration-150 cursor-pointer ${className}`}
      {...props}
    >
            {options.map((opt) => <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>)}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted">
            <ChevronDown size={16} />
          </div>
        </div>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>;
  }
);
Select.displayName = "Select";
var stdin_default = Select;
export {
  Select,
  stdin_default as default
};
