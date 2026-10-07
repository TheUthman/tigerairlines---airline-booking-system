import { useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Shield,
  Plane,
  CheckCircle2,
} from "lucide-react";
import authService from "../services/authService";
import { useAppDispatch, useAppSelector } from "../app/store";
import { loginSuccess } from "../features/auth/authSlice";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useToast } from "../components/ui/Toast";
import AuthShell from "../components/layout/AuthShell";
const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const isStaff =
    isAuthenticated &&
    user &&
    (user.role === "ADMINISTRATOR" || user.role === "STAFF");
  const containerRef = useRef(null);
  const initialEmail =
    location.state?.email || localStorage.getItem("tiger_remember_email") || "";
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(
    Boolean(localStorage.getItem("tiger_remember_email")),
  );
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(location.state?.error || null);
  useGSAP(
    () => {
      gsap.from(".login-card", {
        opacity: 0,
        y: 20,
        duration: 0.5,
        ease: "power3.out",
      });
      gsap.from(".login-item", {
        opacity: 0,
        y: 10,
        duration: 0.35,
        stagger: 0.06,
        delay: 0.15,
        ease: "power2.out",
      });
    },
    { scope: containerRef },
  );
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please enter both your email address and password.");
      return;
    }
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await authService.login({ email, password, rememberMe });
      dispatch(loginSuccess(res.data));
      toast.success(`Welcome back, ${res.data.user.name}!`);
      const targetDestination = location.state?.from?.pathname || "/my-trips";
      navigate(targetDestination, { replace: true });
    } catch (err) {
      setErrorMsg(
        err.message || "Login failed. Please verify your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div ref={containerRef} className="auth-page">
      <AuthShell>
        <div className="max-w-md w-full space-y-8 login-card bg-surface p-6 sm:p-8 md:p-10 rounded-2xl shadow-sm border border-border">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-md group-hover:scale-105 transition">
              <Plane size={20} className="-rotate-45" />
            </div>
            <span className="text-2xl font-black text-primary tracking-tight">
              Tiger<span className="font-normal">Airlines</span>
            </span>
          </Link>
          <h1 className="text-2xl font-black text-foreground tracking-tight pt-2">
            Welcome Back
          </h1>
          <p className="text-xs text-muted">
            Sign in to access your flight bookings, boarding passes, and
            TigerMiles.
          </p>
        </div>

        {/* Staff Session Active Notice */}
        {isStaff && user && (
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Shield size={15} className="text-amber-700 shrink-0" />
              <span>
                Operations account active (<strong>{user.name}</strong>). Sign
                in below to switch to customer portal.
              </span>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div
            role="alert"
            className="p-3.5 bg-primary/10 border border-primary/25 text-red-800 rounded-xl text-xs flex items-start gap-2.5 animate-in fade-in duration-200"
          >
            <AlertCircle size={16} className="text-primary shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="login-item">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrorMsg(null);
              }}
              placeholder="name@domain.com"
              icon={<Mail size={16} />}
              required
            />
          </div>

          <div className="login-item space-y-1.5">
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="Enter your password"
                icon={<Lock size={16} />}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[34px] text-muted hover:text-muted cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember me & Forgot Password */}
          <div className="login-item flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-muted">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary"
              />
              <span>Remember me</span>
            </label>

            <Link
              to="/forgot-password"
              className="font-bold text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <div className="login-item pt-2">
            <Button
              type="submit"
              variant="primary"
              isLoading={loading}
              className="w-full h-11 font-bold shadow-md gap-2"
            >
              <span>Sign In to Account</span>
              <ArrowRight size={16} />
            </Button>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center pt-2 text-xs text-muted">
          Don't have a TigerMiles account?{" "}
          <Link
            to="/register"
            className="font-bold text-primary hover:underline"
          >
            Register for free
          </Link>
        </div>
        </div>
      </AuthShell>
    </div>
  );
};
var stdin_default = LoginPage;
export { LoginPage, stdin_default as default };
