import { useState } from "react";
import { Mail, Lock, User, Shield, CheckCircle2 } from "lucide-react";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useAppDispatch } from "../../app/store";
import { loginSuccess, setAdminMode } from "./authSlice";
const AuthModal = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("chukwuemeka.obi@example.com");
  const [password, setPassword] = useState("password123");
  const [fullName, setFullName] = useState("Chukwuemeka Obi");
  const [statusMsg, setStatusMsg] = useState(null);
  const handleLogin = (e) => {
    e.preventDefault();
    dispatch(
      loginSuccess({
        user: {
          id: "user-" + Date.now().toString().slice(-4),
          name: fullName || "Chukwuemeka Obi",
          email: email || "chukwuemeka.obi@example.com",
          role: "CUSTOMER"
        },
        token: "token-" + Math.random().toString(36).substring(7)
      })
    );
    onClose();
  };
  const handleAdminDemoLogin = () => {
    dispatch(setAdminMode(true));
    onClose();
  };
  const handleForgot = (e) => {
    e.preventDefault();
    setStatusMsg(`Password reset instructions have been sent to ${email}`);
    setTimeout(() => {
      setStatusMsg(null);
      setTab("login");
    }, 2500);
  };
  return <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={tab === "login" ? "Sign in to TigerAirlines" : tab === "register" ? "Create your Tiger Miles Account" : "Reset Your Password"}
    maxWidth="md"
  >
      <div className="space-y-4">
        {
    /* Tab Toggle */
  }
        {tab !== "forgot" && <div className="flex border-b border-border mb-4">
            <button
    onClick={() => setTab("login")}
    className={`flex-1 pb-2 text-xs font-bold text-center border-b-2 cursor-pointer ${tab === "login" ? "border-primary text-primary" : "border-transparent text-muted hover:text-foreground"}`}
  >
              Sign In
            </button>
            <button
    onClick={() => setTab("register")}
    className={`flex-1 pb-2 text-xs font-bold text-center border-b-2 cursor-pointer ${tab === "register" ? "border-primary text-primary" : "border-transparent text-muted hover:text-foreground"}`}
  >
              Create Account
            </button>
          </div>}

        {statusMsg && <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{statusMsg}</span>
          </div>}

        {tab === "login" && <form onSubmit={handleLogin} className="space-y-3.5">
            <Input
    label="Email Address"
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    icon={<Mail size={16} />}
    required
  />
            <Input
    label="Password"
    type="password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    icon={<Lock size={16} />}
    required
  />

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-1.5 text-muted cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-primary" />
                <span>Remember me</span>
              </label>
              <button
    type="button"
    onClick={() => setTab("forgot")}
    className="text-primary hover:underline font-semibold"
  >
                Forgot password?
              </button>
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full font-bold">
              Sign In to Account
            </Button>
          </form>}

        {tab === "register" && <form onSubmit={handleLogin} className="space-y-3.5">
            <Input
    label="Full Name"
    type="text"
    value={fullName}
    onChange={(e) => setFullName(e.target.value)}
    placeholder="e.g. Chukwuemeka Obi"
    icon={<User size={16} />}
    required
  />
            <Input
    label="Email Address"
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    icon={<Mail size={16} />}
    required
  />
            <Input
    label="Password"
    type="password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    icon={<Lock size={16} />}
    required
  />

            <Button type="submit" variant="accent" size="lg" className="w-full font-bold">
              Join Tiger Miles & Continue
            </Button>
          </form>}

        {tab === "forgot" && <form onSubmit={handleForgot} className="space-y-4">
            <p className="text-xs text-muted">
              Enter the email address associated with your account and we will send you a link to reset your credentials.
            </p>
            <Input
    label="Email Address"
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    icon={<Mail size={16} />}
    required
  />
            <Button type="submit" variant="primary" size="lg" className="w-full font-bold">
              Send Reset Link
            </Button>
            <button
    type="button"
    onClick={() => setTab("login")}
    className="w-full text-center text-xs text-muted hover:text-foreground"
  >
              Back to Sign In
            </button>
          </form>}

        {
    /* Quick Demo Access Bar */
  }
        <div className="pt-4 border-t border-border space-y-2">
          <p className="text-[11px] font-bold text-muted uppercase tracking-wider text-center">
            Fast One-Click Demo Logins
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
    type="button"
    onClick={() => {
      dispatch(
        loginSuccess({
          user: {
            id: "pass-1",
            name: "Chukwuemeka Obi",
            email: "chukwuemeka.obi@example.com",
            role: "CUSTOMER"
          },
          token: "tok-customer"
        })
      );
      onClose();
    }}
    className="py-1.5 px-3 rounded-lg bg-surface-muted hover:bg-surface-muted text-foreground text-xs font-semibold text-center transition cursor-pointer"
  >
              Customer Demo
            </button>

            <button
    type="button"
    onClick={handleAdminDemoLogin}
    className="py-1.5 px-3 rounded-lg bg-primary/10 hover:bg-primary/15 text-primary text-xs font-semibold text-center transition cursor-pointer flex items-center justify-center gap-1"
  >
              <Shield size={12} />
              <span>Admin Demo</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>;
};
var stdin_default = AuthModal;
export {
  AuthModal,
  stdin_default as default
};
