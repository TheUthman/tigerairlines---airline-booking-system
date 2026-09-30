import { forwardRef } from "react";
const Input = forwardRef(
  ({ label, error, helperText, icon, className = "", id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : void 0);
    return <div className="w-full">
        {label && <label htmlFor={inputId} className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
            {label}
          </label>}
        <div className="relative">
          {icon && <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
              {icon}
            </div>}
          <input
      id={inputId}
      ref={ref}
      className={`w-full bg-surface border ${error ? "border-red-500 focus:ring-red-400" : "border-border focus:border-primary focus:ring-primary/20"} rounded-lg ${icon ? "pl-10" : "pl-3.5"} pr-3.5 py-2.5 text-sm text-foreground placeholder-muted focus:outline-none focus:ring-2 transition duration-150 ${className}`}
      {...props}
    />
        </div>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        {helperText && !error && <p className="mt-1 text-xs text-muted">{helperText}</p>}
      </div>;
  }
);
Input.displayName = "Input";
var stdin_default = Input;
export {
  Input,
  stdin_default as default
};
