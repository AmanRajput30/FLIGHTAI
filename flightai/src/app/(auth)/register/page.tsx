"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { CockpitButton } from "@/components/ui/CockpitButton";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://flightai-hxbd.onrender.com";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const getPasswordStrength = (pass: string) => {
    if (pass.length === 0) return 0;
    let score = 0;
    if (pass.length > 7) score += 1;
    if (pass.length > 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return Math.min(score, 4);
  };

  const strength = getPasswordStrength(formData.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }

    if (!formData.termsAccepted) {
      return setError("You must accept the Terms and Conditions");
    }

    if (formData.password.length < 8) {
      return setError("Password must be at least 8 characters");
    }

    setIsLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, {
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      setSuccess(res.data.message || "Registration successful! Please check your email.");
      setFormData({ name: "", username: "", email: "", password: "", confirmPassword: "", termsAccepted: false });
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Create Account</h1>
        <p className="text-sm text-gray-400">Join Averyn for advanced flight tracking</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex flex-col items-center justify-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h3 className="text-green-400 font-semibold mb-1">Check your inbox!</h3>
            <p className="text-sm text-green-400/80">{success}</p>
          </div>
          <Link href="/login" className="mt-2 text-sm text-white font-medium hover:text-green-300 transition-colors">
            Go to Login
          </Link>
        </div>
      )}

      {!success && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-[family-name:var(--font-labels)] text-[var(--color-instrument-grey)] mb-1.5 uppercase tracking-widest">Full Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-[var(--color-cockpit-black)] border border-[var(--color-instrument-grey)] rounded-[2px] px-4 py-2.5 text-[var(--color-instrument-white)] placeholder-[var(--color-instrument-grey)] focus:outline-none focus:border-[var(--color-horizon-blue)] transition-all font-[family-name:var(--font-labels)] text-sm"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-[10px] font-[family-name:var(--font-labels)] text-[var(--color-instrument-grey)] mb-1.5 uppercase tracking-widest">Username</label>
              <input
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                className="w-full bg-[var(--color-cockpit-black)] border border-[var(--color-instrument-grey)] rounded-[2px] px-4 py-2.5 text-[var(--color-instrument-white)] placeholder-[var(--color-instrument-grey)] focus:outline-none focus:border-[var(--color-horizon-blue)] transition-all font-[family-name:var(--font-labels)] text-sm"
                placeholder="johndoe123"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-[family-name:var(--font-labels)] text-[var(--color-instrument-grey)] mb-1.5 uppercase tracking-widest">Email Address</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-[var(--color-cockpit-black)] border border-[var(--color-instrument-grey)] rounded-[2px] px-4 py-2.5 text-[var(--color-instrument-white)] placeholder-[var(--color-instrument-grey)] focus:outline-none focus:border-[var(--color-horizon-blue)] transition-all font-[family-name:var(--font-labels)] text-sm"
              placeholder="pilot@example.com"
            />
          </div>

          <div>
            <label className="block text-[10px] font-[family-name:var(--font-labels)] text-[var(--color-instrument-grey)] mb-1.5 uppercase tracking-widest">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-[var(--color-cockpit-black)] border border-[var(--color-instrument-grey)] rounded-[2px] px-4 py-2.5 text-[var(--color-instrument-white)] placeholder-[var(--color-instrument-grey)] focus:outline-none focus:border-[var(--color-horizon-blue)] transition-all pr-12 font-[family-name:var(--font-labels)] text-sm"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-instrument-grey)] hover:text-[var(--color-instrument-white)] transition-colors p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            
            {/* Password Strength Meter */}
            {formData.password.length > 0 && (
              <div className="mt-2 flex gap-1 h-1.5">
                {[1, 2, 3, 4].map((i) => (
                  <div 
                    key={i} 
                    className={`flex-1 rounded-[2px] ${
                      i <= strength 
                        ? strength <= 1 ? 'bg-[var(--color-warning-red)]' : strength === 2 ? 'bg-[var(--color-caution-amber)]' : 'bg-[var(--color-horizon-blue)]'
                        : 'bg-[#111]'
                    }`}
                  ></div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-[family-name:var(--font-labels)] text-[var(--color-instrument-grey)] mb-1.5 uppercase tracking-widest">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full bg-[var(--color-cockpit-black)] border ${formData.confirmPassword && formData.password !== formData.confirmPassword ? 'border-[var(--color-warning-red)] focus:border-[var(--color-warning-red)]' : 'border-[var(--color-instrument-grey)] focus:border-[var(--color-horizon-blue)]'} rounded-[2px] px-4 py-2.5 text-[var(--color-instrument-white)] placeholder-[var(--color-instrument-grey)] focus:outline-none focus:ring-1 transition-all font-[family-name:var(--font-labels)] text-sm`}
              placeholder="••••••••"
            />
          </div>

          <div className="mt-2">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center w-5 h-5 shrink-0 mt-0.5">
                <input
                  type="checkbox"
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={handleChange}
                  className="peer appearance-none w-5 h-5 border border-[var(--color-instrument-grey)] rounded-[2px] cursor-pointer checked:bg-[var(--color-horizon-blue)] checked:border-[var(--color-horizon-blue)] transition-all"
                />
                <svg className="absolute w-3 h-3 text-[var(--color-cockpit-black)] opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 14 10" fill="none">
                  <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-[10px] font-[family-name:var(--font-labels)] text-[var(--color-instrument-grey)] leading-tight uppercase tracking-widest">
                I agree to the <Link href="/terms" className="text-[var(--color-horizon-blue)] hover:text-white transition-colors" target="_blank">Terms</Link> and <Link href="/privacy" className="text-[var(--color-horizon-blue)] hover:text-white transition-colors" target="_blank">Privacy Policy</Link>
              </span>
            </label>
          </div>

          <CockpitButton
            type="submit"
            variant="action"
            disabled={isLoading || (formData.password !== formData.confirmPassword && formData.confirmPassword.length > 0)}
            className="w-full mt-4 justify-center bg-[var(--color-horizon-blue)] text-white border-[var(--color-horizon-blue)]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                REGISTERING...
              </>
            ) : (
              "CREATE ACCOUNT"
            )}
          </CockpitButton>
        </form>
      )}

      <div className="mt-6 pt-6 border-t border-[var(--color-instrument-grey)] text-center">
        <p className="text-[10px] text-[var(--color-instrument-grey)] font-[family-name:var(--font-labels)] uppercase tracking-widest">
          Active clearance?{" "}
          <Link href="/login" className="text-[var(--color-instrument-white)] font-bold hover:text-[var(--color-horizon-blue)] transition-colors ml-1">
            SIGN IN
          </Link>
        </p>
      </div>
    </div>
  );
}
