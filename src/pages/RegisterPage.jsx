import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Plane,
  Check,
  Circle,
} from "lucide-react";
import authService from "../services/authService";
import { getApiErrorMessage } from "../services/apiClient";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useToast } from "../components/ui/Toast";
import AuthShell from "../components/layout/AuthShell";

const nigerianPhoneRegex = /^(?:\+?234|0)[789][01]\d{8}$/;

const registerSchema = yup.object({
  fullName: yup
    .string()
    .trim()
    .required("Please enter your full legal name")
    .min(3, "Full name must be at least 3 characters long")
    .test(
      "has-last-name",
      "Please enter both your first and last name (e.g. Jane Doe)",
      (value) => {
        if (!value) return false;
        const parts = value.trim().split(/\s+/);
        return parts.length >= 2 && parts[1].length > 0;
      }
    ),
  email: yup
    .string()
    .trim()
    .required("Email address is required")
    .email("Please enter a valid email address (e.g. name@example.com)"),
  phone: yup
    .string()
    .required("Phone number is required")
    .test(
      "is-valid-nigerian-phone",
      "Please enter a valid Nigerian phone number (e.g. +234 803 123 4567 or 08031234567)",
      (value) => {
        if (!value) return false;
        const sanitized = value.replace(/[\s\-()]/g, "");
        return nigerianPhoneRegex.test(sanitized);
      }
    ),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters long")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character (e.g. !@#$%^&*)",
    ),
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords do not match. Please re-enter identical passwords."),
});

const RegisterPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(registerSchema),
    mode: "onChange",
  });

  const currentPassword = watch("password") || "";

  const passwordRequirements = [
    { label: "At least 8 characters", met: currentPassword.length >= 8 },
    { label: "An uppercase letter", met: /[A-Z]/.test(currentPassword) },
    { label: "A lowercase letter", met: /[a-z]/.test(currentPassword) },
    { label: "A number", met: /[0-9]/.test(currentPassword) },
    { label: "A special character", met: /[^A-Za-z0-9]/.test(currentPassword) },
  ];

  const getPasswordStrength = (pass) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strengthScore = getPasswordStrength(currentPassword);
  const strengthLabels = ["Too Weak", "Weak", "Fair", "Strong", "Excellent"];
  const strengthColors = [
    "bg-surface-muted",
    "bg-red-500",
    "bg-amber-500",
    "bg-blue-500",
    "bg-emerald-500",
  ];

  useGSAP(
    () => {
      gsap.from(".auth-card", {
        opacity: 0,
        y: 24,
        duration: 0.5,
        ease: "power3.out",
      });
      gsap.from(".auth-field", {
        opacity: 0,
        y: 12,
        duration: 0.4,
        stagger: 0.06,
        delay: 0.15,
        ease: "power2.out",
      });
    },
    { scope: containerRef },
  );

  const onSubmit = async (data) => {
    setServerError(null);
    setLoading(true);
    try {
      const sanitizedPhone = data.phone.replace(/[\s\-()]/g, "");
      const res = await authService.register({
        fullName: data.fullName.trim(),
        email: data.email.trim(),
        phone: sanitizedPhone,
        password: data.password,
      });

      toast.success("Account created successfully! Please verify your email.");

      const targetEmail = res?.data?.user?.email || data.email.trim();

      // Trigger verification code request; don't block navigation if already sent
      try {
        await authService.requestEmailVerification(targetEmail);
      } catch (verifErr) {
        console.warn("Verification code email request notice:", verifErr);
      }

      navigate("/verify-email", { state: { email: targetEmail } });
    } catch (err) {
      const message = getApiErrorMessage(
        err,
        "Registration failed. Please check your information and try again.",
      );
      setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="auth-page">
      <AuthShell>
        <div className="max-w-md w-full space-y-8 auth-card bg-surface p-6 sm:p-8 md:p-10 rounded-2xl shadow-sm border border-border">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-12 h-12 rounded-xl text-white flex items-center justify-center shadow-md group-hover:scale-105 transition">
              <img src="/logo.svg" alt="" />
            </div>
            <span className="text-2xl font-black text-primary tracking-tight">
              Tiger<span className="font-normal">Airlines</span>
            </span>
          </Link>
          <h1 className="text-2xl font-black text-foreground tracking-tight pt-2">
            Create Your Account
          </h1>
          <p className="text-xs text-muted">
            Join TigerMiles to manage reservations, check-in, and earn rewards
            across Nigeria.
          </p>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div
            role="alert"
            className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 rounded-xl text-xs flex items-start gap-2.5 animate-in fade-in duration-200"
          >
            <AlertCircle size={16} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">
              <span className="font-semibold block mb-0.5">Registration Issue</span>
              <span>{serverError}</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="auth-field">
            <Input
              label="Full Name *"
              placeholder="e.g. Jane Doe"
              icon={<User size={16} />}
              {...register("fullName")}
              error={errors.fullName?.message}
            />
          </div>

          <div className="auth-field">
            <Input
              label="Email Address *"
              type="email"
              placeholder="name@example.com"
              icon={<Mail size={16} />}
              {...register("email")}
              error={errors.email?.message}
            />
          </div>

          <div className="auth-field">
            <Input
              label="Phone Number *"
              placeholder="+234 803 123 4567"
              icon={<Phone size={16} />}
              {...register("phone")}
              error={errors.phone?.message}
            />
          </div>

          <div className="auth-field space-y-1.5">
            <div className="relative">
              <Input
                label="Password *"
                type={showPassword ? "text" : "password"}
                placeholder="Enter a strong password"
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
            <p className="text-[11px] text-muted">
              Your password must meet all of these requirements:
            </p>
            <ul
              aria-live="polite"
              className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 text-[11px]"
            >
              {passwordRequirements.map(({ label, met }, index) => (
                <li
                  key={label}
                  className={`flex items-center gap-1.5 transition-colors duration-200 ${met ? "text-emerald-600" : "text-muted"}`}
                  style={{ animationDelay: `${index * 45}ms` }}
                >
                  {met ? (
                    <Check
                      size={13}
                      className="shrink-0 password-rule-check"
                      aria-hidden="true"
                    />
                  ) : (
                    <Circle
                      size={13}
                      className="shrink-0 opacity-50"
                      aria-hidden="true"
                    />
                  )}
                  <span>{label}</span>
                </li>
              ))}
            </ul>

            {/* Password strength meter */}
            {currentPassword.length > 0 && (
              <div className="pt-1 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted">Password Strength:</span>
                  <span className="font-bold text-foreground">
                    {strengthLabels[strengthScore]}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1 h-1.5 rounded-full overflow-hidden bg-surface-muted">
                  <div
                    className={`h-full transition-all duration-300 ${strengthScore >= 1 ? strengthColors[strengthScore] : "bg-transparent"}`}
                  />
                  <div
                    className={`h-full transition-all duration-300 ${strengthScore >= 2 ? strengthColors[strengthScore] : "bg-transparent"}`}
                  />
                  <div
                    className={`h-full transition-all duration-300 ${strengthScore >= 3 ? strengthColors[strengthScore] : "bg-transparent"}`}
                  />
                  <div
                    className={`h-full transition-all duration-300 ${strengthScore >= 4 ? strengthColors[strengthScore] : "bg-transparent"}`}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="auth-field">
            <div className="relative">
              <Input
                label="Confirm Password *"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter your password"
                icon={<ShieldCheck size={16} />}
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
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="auth-field pt-2">
            <Button
              type="submit"
              variant="primary"
              isLoading={loading}
              className="w-full h-11 font-bold shadow-md gap-2"
            >
              <span>Create Account</span>
              <ArrowRight size={16} />
            </Button>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center pt-2 border-t border-border text-xs text-muted">
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-primary hover:underline">
            Log in here
          </Link>
        </div>
        </div>
      </AuthShell>
    </div>
  );
};
var stdin_default = RegisterPage;
export { RegisterPage, stdin_default as default };
