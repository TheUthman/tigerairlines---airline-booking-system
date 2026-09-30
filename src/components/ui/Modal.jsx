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
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
    className="fixed inset-0"
    onClick={onClose}
    aria-hidden="true"
  />
      <div
    className={`relative w-full ${maxWidths[maxWidth]} bg-surface rounded-2xl shadow-2xl z-10 overflow-hidden border border-border flex flex-col max-h-[90vh]`}
  >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            {title && <h3 className="text-lg font-bold text-foreground">{title}</h3>}
            {description && <p className="text-xs text-muted mt-0.5">{description}</p>}
          </div>
          <button
    onClick={onClose}
    className="p-1 rounded-full text-muted hover:text-foreground hover:bg-surface-muted transition"
  >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>;
};
var stdin_default = Modal;
export {
  Modal,
  stdin_default as default
};
