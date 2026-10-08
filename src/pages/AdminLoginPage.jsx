import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Lock,
  Mail,
  Plane,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { useAppDispatch } from "../app/store";
import { loginSuccess } from "../features/auth/authSlice";
import authService from "../services/authService";
import { getApiErrorMessage } from "../services/apiClient";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import ThemeToggle from "../components/ui/ThemeToggle";
import AuthShell from "../components/layout/AuthShell";

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(location.state?.error || null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const { data: session } = await authService.login({ email, password });
      if (!session?.token || !session?.user) {
        throw new Error("The server did not return a valid sign-in session.");
      }
      if (!["ADMINISTRATOR", "STAFF"].includes(session.user.role)) {
        throw new Error(
          "This account does not have staff or administrator access.",
        );
      }

      dispatch(loginSuccess(session));
      navigate("/admin", { replace: true });
    } catch (loginError) {
      setError(
        loginError.response
          ? getApiErrorMessage(
              loginError,
              "Unable to sign in. Please verify your staff credentials.",
            )
          : loginError.message ||
              "Unable to sign in. Please verify your staff credentials.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <AuthShell variant="operations">
        <div className="w-full max-w-md space-y-6">
          <div className="flex items-center justify-between gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-semibold text-muted transition hover:text-primary"
            >
              <ArrowLeft size={14} aria-hidden="true" />
              Customer portal
            </Link>
            <ThemeToggle />
          </div>

          <header className="space-y-2">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Plane size={23} className="-rotate-45" aria-hidden="true" />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
              Staff sign-in
            </p>
            <h1 className="text-3xl font-black tracking-tight text-foreground">
              Operations console
            </h1>
            <p className="text-sm leading-6 text-muted">
              Sign in to manage flights, fleet operations, and passenger bookings.
            </p>
          </header>

          <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-7">
            {error && (
              <div
                role="alert"
                className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-700/50 dark:bg-red-950/40 dark:text-red-300"
              >
                <AlertCircle size={16} className="shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-5">
              <Input
                label="Staff email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                icon={<Mail size={16} />}
                autoComplete="username"
                required
              />

              <Input
                label="Security access key"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                icon={<Lock size={16} />}
                autoComplete="current-password"
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full font-bold shadow-sm"
              >
                Sign in to operations
              </Button>
              </div>
            </form>

            <p className="mt-5 border-t border-border pt-4 text-center text-[11px] text-muted">
              Restricted to authorized Tiger Airlines personnel.
            </p>
          </section>
        </div>
      </AuthShell>
    </div>
  );
};

export default AdminLoginPage;
export { AdminLoginPage };
