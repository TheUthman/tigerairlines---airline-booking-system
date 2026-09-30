import { Component } from "react";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";
class ErrorBoundary extends Component {
  state = {
    hasError: false,
    error: null
  };
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error in application:", error, errorInfo);
  }
  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };
  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-surface rounded-2xl shadow-xl border border-border p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto border border-primary/20 shadow-inner">
              <AlertTriangle size={32} />
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                System Error
              </span>
              <h1 className="text-2xl font-black text-foreground mt-3 tracking-tight">
                Something Went Unexpectedly Wrong
              </h1>
              <p className="text-xs text-muted mt-2 leading-relaxed">
                An unforeseen error occurred during flight operations. Our technical crew has been notified.
              </p>
            </div>

            {this.state.error && <div className="bg-surface-muted rounded-lg p-3 text-left font-mono text-[11px] text-foreground max-h-24 overflow-y-auto border border-border">
                {this.state.error.message}
              </div>}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
        type="button"
        onClick={() => window.location.reload()}
        className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-surface-muted hover:bg-surface-muted text-foreground text-xs font-bold rounded-xl transition cursor-pointer"
      >
                <RotateCcw size={14} /> Reload Page
              </button>
              <button
        type="button"
        onClick={this.handleReset}
        className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
      >
                <Home size={14} /> Back to Home
              </button>
            </div>
          </div>
        </div>;
    }
    return this.props.children;
  }
}
var stdin_default = ErrorBoundary;
export {
  ErrorBoundary,
  stdin_default as default
};
