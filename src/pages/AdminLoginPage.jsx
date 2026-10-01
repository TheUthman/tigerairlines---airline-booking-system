import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { ShieldCheck, Lock, Mail, Plane, ArrowLeft, AlertCircle } from "lucide-react";
import { useAppDispatch } from "../app/store";
import { loginSuccess } from "../features/auth/authSlice";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import ThemeToggle from "../components/ui/ThemeToggle";
const AdminLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState("admin.ops@tigerairlines.ng");
  const [password, setPassword] = useState("tigerops2026");
  const [role, setRole] = useState("ADMINISTRATOR");
  const [error, setError] = useState(location.state?.error || null);
  const [isLoading, setIsLoading] = useState(false);
  const from = location.state?.from?.pathname || "/admin";
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setTimeout(() => {
      if (!email.includes("@") || password.length < 4) {
        setError("Invalid staff credentials. Please check your official email and PIN.");
        setIsLoading(false);
        return;
      }
      dispatch(
        loginSuccess({
          user: {
            id: "admin-soliat",
            name: role === "ADMINISTRATOR" ? "Captain Soliat T." : "Flight Dispatcher Emeka",
            email,
            role,
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
          },
          token: "tiger-admin-session-token-" + Date.now()
        })
      );
      setIsLoading(false);
      navigate(from, { replace: true });
    }, 400);
  };
  const handleQuickDemo = (selectedRole) => {
    dispatch(
      loginSuccess({
        user: {
          id: selectedRole === "ADMINISTRATOR" ? "admin-soliat" : "staff-emeka",
          name: selectedRole === "ADMINISTRATOR" ? "Captain Soliat T." : "Flight Dispatcher Emeka",
          email: selectedRole === "ADMINISTRATOR" ? "admin.ops@tigerairlines.ng" : "dispatch@tigerairlines.ng",
          role: selectedRole,
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
        },
        token: "tiger-admin-token-" + Date.now()
      })
    );
    navigate(from, { replace: true });
  };
  return <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>
      {
    /* Background Graphic */
  }
      <div
    className="absolute inset-0 opacity-15 bg-cover bg-center pointer-events-none"
    style={{
      backgroundImage: `url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1600&auto=format&fit=crop&q=80')`
    }}
  />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link
    to="/"
    className="inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-primary mb-6 transition"
  >
          <ArrowLeft size={14} /> Back to Customer Portal
        </Link>

        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg border border-white/20">
            <Plane size={24} className="-rotate-45" />
          </div>
        </div>

        <h2 className="text-center text-2xl font-black text-foreground tracking-tight">
          TigerAirlines Operations
        </h2>
        <p className="mt-1 text-center text-xs text-muted">
          Airline Operations Management & Flight Dispatch Control
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-surface py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-border">
          {error && <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-700/50 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1">
                Authorized Staff Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
    type="button"
    onClick={() => setRole("ADMINISTRATOR")}
    className={`py-2 px-3 text-xs font-bold rounded-lg border cursor-pointer transition ${role === "ADMINISTRATOR" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted hover:bg-surface-muted"}`}
  >
                  Administrator
                </button>
                <button
    type="button"
    onClick={() => setRole("STAFF")}
    className={`py-2 px-3 text-xs font-bold rounded-lg border cursor-pointer transition ${role === "STAFF" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted hover:bg-surface-muted"}`}
  >
                  Flight Staff
                </button>
              </div>
            </div>

            <Input
    label="Staff Email *"
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    icon={<Mail size={16} />}
    required
  />

            <Input
    label="Security Access Key *"
    type="password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    icon={<Lock size={16} />}
    required
  />

            <Button
    type="submit"
    variant="primary"
    size="lg"
    isLoading={isLoading}
    className="w-full font-bold shadow-md"
  >
              Sign In to Ops Console
            </Button>
          </form>

          {
    /* Quick Demo Credentials */
  }
          <div className="mt-6 pt-5 border-t border-border">
            <p className="text-[10px] uppercase font-bold text-muted tracking-wider text-center mb-2.5">
              Instant One-Click Role Logins
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
    type="button"
    onClick={() => handleQuickDemo("ADMINISTRATOR")}
    className="py-2 px-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
  >
                <ShieldCheck size={14} />
                <span>Administrator</span>
              </button>

              <button
    type="button"
    onClick={() => handleQuickDemo("STAFF")}
    className="py-2 px-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
  >
                <Plane size={14} />
                <span>Staff Member</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
var stdin_default = AdminLoginPage;
export {
  AdminLoginPage,
  stdin_default as default
};
