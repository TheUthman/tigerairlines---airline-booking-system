import { useEffect, useRef } from "react";
import { AlertTriangle, X } from "lucide-react";
import Button from "./Button";
const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
  children
}) => {
  const modalRef = useRef(null);
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);
  if (!isOpen) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {
    /* Backdrop */
  }
      <div
    className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
    onClick={onClose}
    aria-hidden="true"
  />

      {
    /* Modal Dialog */
  }
      <div
    ref={modalRef}
    role="dialog"
    aria-modal="true"
    aria-labelledby="confirm-modal-title"
    className="relative bg-surface rounded-3xl shadow-2xl border border-border max-w-md w-full p-6 md:p-8 z-10 animate-in fade-in zoom-in-95 duration-200"
  >
        <button
    onClick={onClose}
    className="absolute top-5 right-5 p-1 rounded-full text-muted hover:text-foreground hover:bg-surface-muted transition"
    aria-label="Close dialog"
  >
          <X size={18} />
        </button>

        <div className="flex items-start gap-4">
          <div
    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${variant === "danger" ? "bg-primary/10 text-red-600 border border-primary/25" : variant === "warning" ? "bg-amber-50 text-amber-600 border border-amber-200" : "bg-surface-muted text-foreground"}`}
  >
            <AlertTriangle size={22} />
          </div>

          <div>
            <h3 id="confirm-modal-title" className="text-base font-black text-foreground">
              {title}
            </h3>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {children && <div className="mt-4">{children}</div>}

        <div className="mt-6 pt-4 border-t border-border flex items-center justify-end gap-3">
          <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
    type="button"
    variant={variant === "danger" ? "primary" : "accent"}
    size="sm"
    onClick={onConfirm}
    isLoading={isLoading}
    className={`font-bold ${variant === "danger" ? "!bg-red-600 hover:!bg-red-700" : ""}`}
  >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>;
};
var stdin_default = ConfirmModal;
export {
  ConfirmModal,
  stdin_default as default
};
