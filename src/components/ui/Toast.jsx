import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
const ToastContext = createContext(void 0);
const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);
  const showToast = useCallback(
    ({ type, title, message, duration = 4e3 }) => {
      const id = "toast-" + Math.random().toString(36).substring(2, 9) + Date.now();
      const newToast = { id, type, title, message, duration };
      setToasts((prev) => [...prev.slice(-4), newToast]);
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );
  const success = useCallback((message, title) => showToast({ type: "success", message, title }), [showToast]);
  const error = useCallback((message, title) => showToast({ type: "error", message, title }), [showToast]);
  const warning = useCallback((message, title) => showToast({ type: "warning", message, title }), [showToast]);
  const info = useCallback((message, title) => showToast({ type: "info", message, title }), [showToast]);
  return <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      {
    /* Toast Render Viewport */
  }
      <div
    aria-live="polite"
    className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
  >
        {toasts.map((toast) => {
    const isSuccess = toast.type === "success";
    const isError = toast.type === "error";
    const isWarning = toast.type === "warning";
    return <div
      key={toast.id}
      role={isError ? "alert" : "status"}
      className={`pointer-events-auto flex translate-y-0 items-start gap-3 rounded-xl border bg-surface p-4 text-foreground opacity-100 shadow-lg shadow-black/10 backdrop-blur-md transition-all duration-300 ${isSuccess ? "border-success/25" : isError ? "border-danger/25" : isWarning ? "border-warning/25" : "border-border"}`}
    >
              <div className="shrink-0 mt-0.5">
                {isSuccess && <CheckCircle2 size={18} className="text-success" />}
                {isError && <AlertCircle size={18} className="text-danger" />}
                {isWarning && <AlertTriangle size={18} className="text-warning" />}
                {!isSuccess && !isError && !isWarning && <Info size={18} className="text-primary" />}
              </div>

              <div className="flex-1 text-xs">
                {toast.title && <p className="mb-0.5 font-semibold text-foreground">{toast.title}</p>}
                <p className="leading-relaxed opacity-90">{toast.message}</p>
              </div>

              <button
      type="button"
      onClick={() => removeToast(toast.id)}
      className="shrink-0 p-1 text-white/60 hover:text-white rounded-lg transition"
      aria-label="Close notification"
    >
                <X size={14} />
              </button>
            </div>;
  })}
      </div>
    </ToastContext.Provider>;
};
const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
var stdin_default = ToastProvider;
export {
  ToastProvider,
  stdin_default as default,
  useToast
};
