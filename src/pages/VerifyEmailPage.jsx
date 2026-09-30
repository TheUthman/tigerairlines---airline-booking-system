import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Mail, AlertCircle, ArrowLeft, RefreshCw, Plane } from "lucide-react";
import authService from "../services/authService";
import Button from "../components/ui/Button";
import { useToast } from "../components/ui/Toast";
const VerifyEmailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const email = location.state?.email || "chukwuemeka.obi@example.com";
  const [verificationToken, setVerificationToken] = useState("");
  const [cooldown, setCooldown] = useState(30);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const containerRef = useRef(null);
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1e3);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [cooldown]);
  useGSAP(
    () => {
      gsap.from(".verify-card", {
        opacity: 0,
        y: 20,
        duration: 0.5,
        ease: "power3.out"
      });
      gsap.from(".otp-box", {
        scale: 0.8,
        opacity: 0,
        stagger: 0.05,
        duration: 0.4,
        ease: "back.out(1.7)",
        delay: 0.2
      });
    },
    { scope: containerRef }
  );
  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    if (!verificationToken.trim()) {
      setErrorMsg("Please paste the verification token from your email.");
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      await authService.confirmEmailVerification(verificationToken.trim());
      toast.success("Email verified successfully! You can now log in to your account.");
      navigate("/login", { state: { email } });
    } catch (err) {
      setErrorMsg(err.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setErrorMsg(null);
    try {
      const res = await authService.requestEmailVerification(email);
      toast.info(res.data?.message || "A new verification email has been requested.");
      setCooldown(30);
      setVerificationToken("");
    } catch (err) {
      toast.error("Failed to resend code. Please try again later.");
    } finally {
      setResending(false);
    }
  };
  return <div
    ref={containerRef}
    className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
  >
      <div className="max-w-md w-full space-y-8 verify-card bg-surface p-8 md:p-10 rounded-3xl shadow-xl border border-border">
        {
    /* Header */
  }
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-md group-hover:scale-105 transition">
              <Plane size={20} className="-rotate-45" />
            </div>
            <span className="text-2xl font-black text-primary tracking-tight">
              Tiger<span className="font-normal">Airlines</span>
            </span>
          </Link>
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-full mx-auto flex items-center justify-center mt-3">
            <Mail size={22} />
          </div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">
            Verify Your Email
          </h1>
          <p className="text-xs text-muted leading-relaxed">
            We sent a verification link/token to{" "}
            <strong className="text-foreground font-semibold">{email}</strong>.
            Paste the token from that email below to activate your account.
          </p>
        </div>

        {
    /* Error Alert */
  }
        {errorMsg && <div
    role="alert"
    className="p-3.5 bg-primary/10 border border-primary/25 text-red-800 rounded-xl text-xs flex items-start gap-2.5 animate-in fade-in duration-200"
  >
            <AlertCircle size={16} className="text-primary shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>}

        {
    /* Token confirmation form */
  }
        <form onSubmit={handleVerify} className="space-y-6">
          <input
            type="text"
            value={verificationToken}
            onChange={(e) => { setVerificationToken(e.target.value); setErrorMsg(null); }}
            placeholder="Paste verification token"
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm font-mono text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition"
            aria-label="Verification token"
          />

          <Button
    type="submit"
    variant="primary"
    isLoading={loading}
    disabled={!verificationToken.trim()}
    className="w-full h-11 font-bold shadow-md"
  >
            Verify & Continue
          </Button>
        </form>

        {
    /* Resend Cooldown */
  }
        <div className="text-center space-y-3 pt-2 border-t border-border">
          <div className="text-xs text-muted">
            Didn't receive the email?{" "}
            {cooldown > 0 ? <span className="text-muted font-mono font-semibold">
                Resend available in {cooldown}s
              </span> : <button
    type="button"
    onClick={handleResend}
    disabled={resending}
    className="font-bold text-primary hover:underline cursor-pointer inline-flex items-center gap-1"
  >
                <RefreshCw size={12} className={resending ? "animate-spin" : ""} />
                Resend Verification Email
              </button>}
          </div>

          <div className="pt-2">
            <Link
    to="/login"
    className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-foreground font-medium transition"
  >
              <ArrowLeft size={13} />
              Back to Login
            </Link>
          </div>
        </div>

        {
    /* Verification tip */
  }
        <div className="p-3 bg-background rounded-xl border border-border text-[11px] text-muted text-center">
          <span className="font-semibold text-foreground">Verification tip:</span> Use the token supplied by the verification email.
        </div>
      </div>
    </div>;
};
var stdin_default = VerifyEmailPage;
export {
  VerifyEmailPage,
  stdin_default as default
};
