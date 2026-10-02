import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Mail, AlertCircle, ArrowLeft, RefreshCw, Plane } from "lucide-react";
import authService from "../services/authService";
import { getApiErrorMessage } from "../services/apiClient";
import Button from "../components/ui/Button";
import { useToast } from "../components/ui/Toast";

const VerifyEmailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const searchParams = new URLSearchParams(location.search);
  const email = location.state?.email || searchParams.get("email") || "";
  const tokenFromUrl = searchParams.get("token") || "";
  const [verificationToken, setVerificationToken] = useState(tokenFromUrl);
  const [cooldown, setCooldown] = useState(60);
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
        ease: "power3.out",
      });
      gsap.from(".otp-box", {
        scale: 0.8,
        opacity: 0,
        stagger: 0.05,
        duration: 0.4,
        ease: "back.out(1.7)",
        delay: 0.2,
      });
    },
    { scope: containerRef },
  );

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    if (!verificationToken.trim()) {
      setErrorMsg("Please enter or paste the verification token from your email.");
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      await authService.confirmEmailVerification(verificationToken.trim());
      toast.success(
        "Email verified successfully! You can now log in to your account.",
      );
      navigate("/login", { state: { email } });
    } catch (err) {
      setErrorMsg(
        getApiErrorMessage(
          err,
          "Verification failed. The token may be invalid or expired. Please request a new one.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    if (!email) {
      toast.error("No email address provided. Please return to registration.");
      return;
    }
    setResending(true);
    setErrorMsg(null);
    try {
      const res = await authService.requestEmailVerification(email);
      toast.info(
        res?.data?.message || "A new verification email has been requested.",
      );
      setCooldown(60);
      setVerificationToken("");
    } catch (err) {
      setCooldown(15);
      toast.error(
        getApiErrorMessage(err, "Failed to resend verification code. Please try again later."),
      );
    } finally {
      setResending(false);
    }
  };
  return (
    <div
      ref={containerRef}
      className="bg-background flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-md w-full space-y-8 verify-card bg-surface p-8 md:p-10 rounded-3xl shadow-xl border border-border">
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

        {/* Error Alert */}
        {errorMsg && (
          <div
            role="alert"
            className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 rounded-xl text-xs flex items-start gap-2.5 animate-in fade-in duration-200"
          >
            <AlertCircle size={16} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">
              <span className="font-semibold block mb-0.5">Verification Error</span>
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        {/* Token confirmation form */}
        <form onSubmit={handleVerify} className="space-y-6">
          <input
            type="text"
            value={verificationToken}
            onChange={(e) => {
              setVerificationToken(e.target.value);
              setErrorMsg(null);
            }}
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

        {/* Resend Cooldown */}
        <div className="text-center space-y-3 pt-4 border-t border-border">
          <p className="text-xs text-muted">Didn't receive the email or token expired?</p>
          
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0 || resending}
              className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 ${
                cooldown > 0
                  ? "bg-surface text-muted/70 border border-border filter blur-[0.8px] opacity-60 cursor-not-allowed pointer-events-none select-none"
                  : "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 cursor-pointer active:scale-95"
              }`}
            >
              <RefreshCw
                size={13}
                className={resending ? "animate-spin" : cooldown > 0 ? "opacity-50" : ""}
              />
              {resending ? (
                "Sending New Code..."
              ) : cooldown > 0 ? (
                <span>Resend Code in <span className="font-mono font-bold text-foreground/80">{cooldown}s</span></span>
              ) : (
                "Resend Verification Code"
              )}
            </button>

            {cooldown > 0 && (
              <span className="text-[11px] text-muted">
                Please wait for the timer before requesting another token.
              </span>
            )}
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
      </div>
    </div>
  );
};
var stdin_default = VerifyEmailPage;
export { VerifyEmailPage, stdin_default as default };
