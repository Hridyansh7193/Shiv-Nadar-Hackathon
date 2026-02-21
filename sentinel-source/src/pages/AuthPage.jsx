import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Mail,
  Lock,
  User,
  ArrowLeft,
  Eye,
  EyeOff,
  Github,
  Chrome,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { signUp, signIn } from "@/services/api";

function InputField({ icon: Icon, type: initialType, placeholder, value, onChange, canToggle }) {
  const [showPassword, setShowPassword] = useState(false);
  const type = canToggle ? (showPassword ? "text" : "password") : initialType;

  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
        <Icon className="w-4 h-4" />
      </div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full h-11 pl-10 pr-10 rounded-lg border border-border/50 bg-secondary/50 text-foreground text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-cyber-blue/40 focus:border-cyber-blue/40 transition-all"
      />
      {canToggle && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      )}
    </div>
  );
}

export default function AuthPage({ onBack, onAuthSuccess }) {
  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const isSignUp = mode === "signup";

  const updateField = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (isSignUp && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      let result;
      if (isSignUp) {
        result = await signUp({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });
      } else {
        result = await signIn({
          email: formData.email,
          password: formData.password,
        });
      }
      // Store token for later API calls
      localStorage.setItem("sentinel_token", result.token);
      localStorage.setItem("sentinel_user", JSON.stringify(result.user));

      if (onAuthSuccess) {
        onAuthSuccess(result.user);
      }
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        err.message ||
        "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-grid">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-cyber-blue/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-[500px] h-[500px] bg-cyber-purple/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Back button */}
        {onBack && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground gap-2"
              onClick={onBack}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </motion.div>
        )}

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <Shield className="w-8 h-8 text-cyber-blue" />
            <span className="text-2xl font-bold bg-gradient-to-r from-cyber-blue to-cyber-green bg-clip-text text-transparent">
              Sentinel Source
            </span>
          </div>
          <p className="text-muted-foreground text-sm">
            {isSignUp
              ? "Create your account to get started"
              : "Welcome back, sign in to continue"}
          </p>
        </motion.div>

        {/* Auth Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-6">
              {/* Mode Toggle */}
              <div className="flex bg-secondary/50 rounded-lg p-1 mb-6">
                <button
                  onClick={() => setMode("signin")}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                    !isSignUp
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setMode("signup")}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                    isSignUp
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 text-cyber-red bg-cyber-red/10 border border-cyber-red/20 rounded-lg px-3 py-2 mb-4">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <AnimatePresence mode="wait">
                  {isSignUp && (
                    <motion.div
                      key="name"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <InputField
                        icon={User}
                        type="text"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={updateField("name")}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <InputField
                  icon={Mail}
                  type="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={updateField("email")}
                />

                <InputField
                  icon={Lock}
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={updateField("password")}
                  canToggle
                />

                <AnimatePresence mode="wait">
                  {isSignUp && (
                    <motion.div
                      key="confirm"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <InputField
                        icon={Lock}
                        type="password"
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={updateField("confirmPassword")}
                        canToggle
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {!isSignUp && (
                  <div className="text-right">
                    <button
                      type="button"
                      className="text-xs text-cyber-blue hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-cyber-blue to-cyber-green text-black font-semibold hover:opacity-90 transition-opacity h-11"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      {isSignUp ? "Creating Account..." : "Signing In..."}
                    </div>
                  ) : isSignUp ? (
                    "Create Account"
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-border/50" />
                <span className="text-xs text-muted-foreground">
                  or continue with
                </span>
                <div className="flex-1 h-px bg-border/50" />
              </div>

              {/* Social auth */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="border-border/50 hover:bg-muted/50 h-11"
                  type="button"
                >
                  <Github className="w-4 h-4 mr-2" />
                  GitHub
                </Button>
                <Button
                  variant="outline"
                  className="border-border/50 hover:bg-muted/50 h-11"
                  type="button"
                >
                  <Chrome className="w-4 h-4 mr-2" />
                  Google
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-xs text-muted-foreground/50 mt-6"
        >
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </motion.p>
      </div>
    </div>
  );
}
