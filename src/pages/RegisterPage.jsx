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
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useToast } from "../components/ui/Toast";
const nigerianPhoneRegex = /^(?:\+?234[789][01]\d{8}|0[789][01]\d{8})$/;
const registerSchema = yup.object({
  fullName: yup
    .string()
    .required("Full legal name is required")
    .min(3, "Name must be at least 3 characters"),
  email: yup
    .string()
    .required("Email address is required")
    .email("Please enter a valid email address"),
  phone: yup
    .string()
    .required("Nigerian phone number is required")
    .matches(
      nigerianPhoneRegex,
      "Invalid Nigerian phone number format (e.g. +234 803 123 4567 or 08031234567)",
    ),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Must contain at least one uppercase letter")
    .matches(/[a-z]/, "Must contain at least one lowercase letter")
    .matches(/[0-9]/, "Must contain at least one number")
    .matches(
      /[^A-Za-z0-9]/,
      "Must contain at least one special character (e.g. !@#$%^&*)",
    ),
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords do not match"),
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
    "bg-primary/100",
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
      const res = await authService.register({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        password: data.password,
      });
      toast.success("Registration successful! Please verify your email.");
      await authService.requestEmailVerification(res.data.user.email);
      navigate("/verify-email", { state: { email: res.data.user.email } });
    } catch (err) {
      setServerError(err.message || "Registration failed. Please try again.");
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
            className="p-3.5 bg-primary/10 border border-primary/25 text-red-800 rounded-xl text-xs flex items-start gap-2.5 animate-in fade-in duration-200"
          >
            <AlertCircle size={16} className="text-primary shrink-0 mt-0.5" />
            <span>{serverError}</span>
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
    </div>
  );
};
var stdin_default = RegisterPage;
export { RegisterPage, stdin_default as default };
