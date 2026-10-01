import { useState, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Plane,
  KeyRound,
} from "lucide-react";
import authService from "../services/authService";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useToast } from "../components/ui/Toast";
const resetSchema = yup.object({
  password: yup
    .string()
    .required("New password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Must contain at least one uppercase letter")
    .matches(/[a-z]/, "Must contain at least one lowercase letter")
    .matches(/[0-9]/, "Must contain at least one number")
    .matches(/[^A-Za-z0-9]/, "Must contain at least one special character"),
  confirmPassword: yup
    .string()
    .required("Please confirm your new password")
    .oneOf([yup.ref("password")], "Passwords do not match"),
});
const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const containerRef = useRef(null);
  const queryToken = searchParams.get("token");
  const [step, setStep] = useState(queryToken ? "reset" : "request");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(resetSchema),
    mode: "onChange",
  });
  useGSAP(
    () => {
      gsap.from(".auth-card", {
        opacity: 0,
        y: 20,
        duration: 0.5,
        ease: "power3.out",
      });
    },
    { scope: containerRef, dependencies: [step] },
  );
  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setServerError(null);
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setStep("sent");
      toast.info("Password reset instructions generated.");
    } catch (err) {
      setServerError(err.message || "Failed to process password reset.");
    } finally {
      setLoading(false);
    }
  };
  const handleResetSubmit = async (data) => {
    if (!queryToken) {
      setServerError(
        "This password reset link is missing a valid security token.",
      );
      return;
    }

    setServerError(null);
    setLoading(true);
    try {
      await authService.resetPassword({
        email,
        token: queryToken,
        newPassword: data.password,
      });
      toast.success(
        "Your password has been reset successfully! Please sign in.",
      );
      navigate("/login", { state: { email } });
    } catch (err) {
      setServerError(err.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div
      ref={containerRef}
      className="bg-background flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-md w-full space-y-8 auth-card bg-surface p-8 md:p-10 rounded-3xl shadow-xl border border-border">
        {/* Brand Logo */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-md group-hover:scale-105 transition">
              <Plane size={20} className="-rotate-45" />
            </div>
            <span className="text-2xl font-black text-primary tracking-tight">
              Tiger<span className="font-normal">Airlines</span>
            </span>
          </Link>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div
            role="alert"
            className="p-3.5 bg-primary/10 border border-primary/25 text-red-800 rounded-xl text-xs flex items-start gap-2.5 animate-in fade-in duration-200"
          >
            <AlertCircle size={16} className="text-primary shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        {/* STEP 1: Request Password Reset */}
        {step === "request" && (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full mx-auto flex items-center justify-center mb-2">
                <KeyRound size={22} />
              </div>
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Reset Password
              </h1>
              <p className="text-xs text-muted leading-relaxed">
                Enter your registered TigerMiles email address and we will
                dispatch a secure reset link.
              </p>
            </div>

            <form onSubmit={handleRequestSubmit} className="space-y-4">
              <Input
                label="Registered Email Address *"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setServerError(null);
                }}
                placeholder="name@domain.com"
                icon={<Mail size={16} />}
                required
              />

              <Button
                type="submit"
                variant="primary"
                isLoading={loading}
                className="w-full h-11 font-bold shadow-md gap-2"
              >
                <span>Send Reset Link</span>
                <ArrowRight size={16} />
              </Button>
            </form>

            <div className="text-center pt-2 border-t border-border">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-foreground font-medium transition"
              >
                <ArrowLeft size={13} />
                Back to Login
              </Link>
            </div>
          </div>
        )}

        {/* STEP 1.5: Confirmation State (Email Sent) */}
        {step === "sent" && (
          <div className="space-y-6 text-center">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full mx-auto flex items-center justify-center">
              <CheckCircle2 size={28} />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-foreground tracking-tight">
                Check Your Inbox
              </h2>
              <p className="text-xs text-muted leading-relaxed">
                We have dispatched a password reset link to{" "}
                <strong className="text-foreground font-semibold">
                  {email}
                </strong>
                .
              </p>
            </div>

            <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setStep("request")}
                className="text-muted hover:text-foreground font-medium cursor-pointer"
              >
                Use different email
              </button>
              <Link
                to="/login"
                className="font-bold text-primary hover:underline"
              >
                Return to Login
              </Link>
            </div>
          </div>
        )}

        {/* STEP 2: Enter New Password */}
        {step === "reset" && (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full mx-auto flex items-center justify-center mb-2">
                <Lock size={22} />
              </div>
              <h2 className="text-2xl font-black text-foreground tracking-tight">
                Set New Password
              </h2>
              <p className="text-xs text-muted">
                Choose a strong password to protect your TigerMiles account.
              </p>
            </div>

            <form
              onSubmit={handleSubmit(handleResetSubmit)}
              className="space-y-4"
            >
              <div className="relative">
                <Input
                  label="New Password *"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 8 chars, uppercase, number, symbol"
                  icon={<Lock size={16} />}
                  {...register("password")}
                  error={errors.password?.message}
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

              <div className="relative">
                <Input
                  label="Confirm New Password *"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your new password"
                  icon={<Lock size={16} />}
                  {...register("confirmPassword")}
                  error={errors.confirmPassword?.message}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-[34px] text-muted hover:text-muted cursor-pointer"
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>

              <Button
                type="submit"
                variant="primary"
                isLoading={loading}
                className="w-full h-11 font-bold shadow-md gap-2"
              >
                <span>Save New Password</span>
                <ArrowRight size={16} />
              </Button>
            </form>

            <div className="text-center pt-2 border-t border-border">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-foreground font-medium transition"
              >
                <ArrowLeft size={13} />
                Cancel & Return to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
var stdin_default = ForgotPasswordPage;
export { ForgotPasswordPage, stdin_default as default };
