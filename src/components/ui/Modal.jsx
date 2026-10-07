import { useEffect } from "react";
import { X } from "lucide-react";
const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "lg"
}) => {
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
  const maxWidths = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl"
  };
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div
    className="fixed inset-0"
    onClick={onClose}
    aria-hidden="true"
  />
      <div
    role="dialog"
    aria-modal="true"
    aria-labelledby={title ? "modal-title" : undefined}
    className={`relative z-10 flex max-h-[90vh] w-full flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-2xl ${maxWidths[maxWidth]}`}
  >
        <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 md:px-6">
          <div>
            {title && <h3 id="modal-title" className="text-lg font-semibold text-foreground">{title}</h3>}
            {description && <p className="mt-1 text-sm leading-relaxed text-muted">{description}</p>}
          </div>
          <button
    type="button"
    onClick={onClose}
    className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    aria-label="Close dialog"
  >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <div className="overflow-y-auto p-5 md:p-6">{children}</div>
      </div>
    </div>;
};
var stdin_default = Modal;
export {
  Modal,
  stdin_default as default
};
