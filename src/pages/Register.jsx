import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../services/api";
import AuthLayout from "../components/auth/AuthLayout";

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    fullName: "", email: "", password: "", confirmPassword: "",
    role: "trekker", phone: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateStep1 = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required";
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = "Enter a valid email";
    if (form.password.length < 8) e.password = "Password must be at least 8 characters";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (validateStep1()) setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authService.register(form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch (err) {
      setErrors({ server: err.response?.data?.message || "Registration failed. Try again." });
    } finally {
      setLoading(false);
    }
  };

  const strength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "#e05040", "#d4913a", "#7aab50", "#4caf70"][strength];

  const side = (
    <div className="max-w-md animate-auth-float">
      <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#e0b874] font-medium mb-5">
        <span className="w-8 h-px bg-[#e0b874]" />
        Join TrekDirect Nepal
      </span>
      <h2 className="font-serif text-[2.6rem] leading-[1.1] font-bold text-[#f5ead0] mb-5">
        Your trail begins<br />
        <span className="italic text-[#e0b874]">at hello.</span>
      </h2>
      <p className="text-[15px] leading-relaxed text-[#c8d0c0]/85 font-light mb-8">
        Create an account to save routes, message verified guides, and carry your itinerary across every peak you plan to climb.
      </p>
      <ul className="space-y-3 text-[14px] text-[#c8d0c0]/90">
        {[
          "Vetted guides, transparent pricing",
          "Built-in permit & insurance checklists",
          "Offline itinerary, even above base camp",
        ].map((t) => (
          <li key={t} className="flex items-start gap-3">
            <span className="mt-[6px] w-1.5 h-1.5 rounded-full bg-[#e0b874] shadow-[0_0_10px_#e0b874]" />
            {t}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <AuthLayout side={side}>
      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-7">
        <div className={`flex items-center gap-2 text-[13px] font-normal transition-colors ${step >= 1 ? "text-[#e0b874]" : "text-[#4a6050]"}`}>
          <div className={`w-[28px] h-[28px] rounded-full flex items-center justify-center text-[12.5px] font-medium transition-all border ${step >= 1 ? "bg-[#e0b874]/15 border-[#e0b874]/45 text-[#e0b874]" : "bg-white/5 border-white/10 text-[#5a7060]"}`}>
            {step > 1 ? (
              <svg width="12" height="12" viewBox="0 0 12 12">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            ) : "1"}
          </div>
          <span>Account</span>
        </div>
        <div className="flex-1 h-px bg-white/10 mx-3" />
        <div className={`flex items-center gap-2 text-[13px] font-normal transition-colors ${step >= 2 ? "text-[#e0b874]" : "text-[#4a6050]"}`}>
          <div className={`w-[28px] h-[28px] rounded-full flex items-center justify-center text-[12.5px] font-medium transition-all border ${step >= 2 ? "bg-[#e0b874]/15 border-[#e0b874]/45 text-[#e0b874]" : "bg-white/5 border-white/10 text-[#5a7060]"}`}>
            2
          </div>
          <span>Profile</span>
        </div>
      </div>

      <div className="mb-7">
        <h1 className="font-serif text-[2rem] max-sm:text-[1.7rem] font-bold text-[#f5ead0] tracking-tight leading-snug mb-1.5">
          {step === 1 ? "Create account" : "Almost there"}
        </h1>
        <p className="text-sm text-[#9ab0a0] font-light">
          {step === 1 ? "Start your Himalayan adventure today" : "A few more details to personalise your experience"}
        </p>
      </div>

      {errors.server && (
        <div className="flex items-center gap-2 bg-[#c8503c]/10 border border-[#c8503c]/25 text-[#f08070] rounded-lg p-3 text-[13.5px] mb-5" role="alert">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4" />
            <path d="M8 5v3M8 11v.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          {errors.server}
        </div>
      )}

      {step === 1 && (
        <form onSubmit={handleNext} noValidate>
          <div className="mb-5">
            <label htmlFor="fullName" className="flex items-center justify-between text-[12px] font-medium text-[#9ab0a0] tracking-[0.12em] uppercase mb-2">Full name</label>
            <div className="relative flex items-center">
              <svg className="absolute left-3.5 text-[#5a7060] pointer-events-none" width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="6" r="3" stroke="currentColor" strokeWidth="1.4" />
                <path d="M2 15c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <input
                id="fullName"
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Full Name"
                autoComplete="name"
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl py-[13px] pl-11 pr-4 font-sans text-[15px] font-light text-[#f0e4c8] outline-none transition-all placeholder:text-[#4a6050] focus:border-[#e0b874]/50 focus:bg-white/[0.08] focus:ring-[3px] focus:ring-[#e0b874]/10"
              />
            </div>
            {errors.fullName && <span className="block text-[12.5px] text-[#f08070] mt-1.5">{errors.fullName}</span>}
          </div>

          <div className="mb-5">
            <label htmlFor="email" className="flex items-center justify-between text-[12px] font-medium text-[#9ab0a0] tracking-[0.12em] uppercase mb-2">Email address</label>
            <div className="relative flex items-center">
              <svg className="absolute left-3.5 text-[#5a7060] pointer-events-none" width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="1.5" y="4" width="15" height="10.5" rx="2" stroke="currentColor" strokeWidth="1.4" />
                <path d="M1.5 6.5L9 11L16.5 6.5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
              </svg>
              <input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Your Email"
                autoComplete="email"
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl py-[13px] pl-11 pr-4 font-sans text-[15px] font-light text-[#f0e4c8] outline-none transition-all placeholder:text-[#4a6050] focus:border-[#e0b874]/50 focus:bg-white/[0.08] focus:ring-[3px] focus:ring-[#e0b874]/10"
              />
            </div>
            {errors.email && <span className="block text-[12.5px] text-[#f08070] mt-1.5">{errors.email}</span>}
          </div>

          <div className="mb-5">
            <label htmlFor="password" className="flex items-center justify-between text-[12px] font-medium text-[#9ab0a0] tracking-[0.12em] uppercase mb-2">Password</label>
            <div className="relative flex items-center">
              <svg className="absolute left-3.5 text-[#5a7060] pointer-events-none" width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="4" y="8" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                <path d="M6 8V6a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <input
                id="password"
                type={showPass ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 8 characters"
                autoComplete="new-password"
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl py-[13px] pl-11 pr-11 font-sans text-[15px] font-light text-[#f0e4c8] outline-none transition-all placeholder:text-[#4a6050] focus:border-[#e0b874]/50 focus:bg-white/[0.08] focus:ring-[3px] focus:ring-[#e0b874]/10"
              />
              <button
                type="button"
                className="absolute right-3.5 text-[#5a7060] hover:text-[#e0b874] transition-colors bg-transparent border-none flex items-center cursor-pointer p-1"
                onClick={() => setShowPass(!showPass)}
                aria-label="Toggle password"
              >
                {showPass ? (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M2 9s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.4" />
                    <circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M3 3l12 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M2 9s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.4" />
                    <circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="1.4" />
                  </svg>
                )}
              </button>
            </div>
            {form.password && (
              <div className="flex items-center gap-2.5 mt-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-7 h-[3px] rounded-sm transition-colors"
                      style={{ background: i <= strength ? strengthColor : "rgba(255,255,255,.08)" }}
                    />
                  ))}
                </div>
                <span className="text-xs font-medium" style={{ color: strengthColor }}>{strengthLabel}</span>
              </div>
            )}
            {errors.password && <span className="block text-[12.5px] text-[#f08070] mt-1.5">{errors.password}</span>}
          </div>

          <div className="mb-5">
            <label htmlFor="confirmPassword" className="flex items-center justify-between text-[12px] font-medium text-[#9ab0a0] tracking-[0.12em] uppercase mb-2">Confirm password</label>
            <div className="relative flex items-center">
              <svg className="absolute left-3.5 text-[#5a7060] pointer-events-none" width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="4" y="8" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                <path d="M6 8V6a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat password"
                autoComplete="new-password"
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl py-[13px] pl-11 pr-4 font-sans text-[15px] font-light text-[#f0e4c8] outline-none transition-all placeholder:text-[#4a6050] focus:border-[#e0b874]/50 focus:bg-white/[0.08] focus:ring-[3px] focus:ring-[#e0b874]/10"
              />
            </div>
            {errors.confirmPassword && <span className="block text-[12.5px] text-[#f08070] mt-1.5">{errors.confirmPassword}</span>}
          </div>

          <button
            type="submit"
            className="w-full mt-1.5 bg-gradient-to-br from-[#e8c07c] via-[#d0a45a] to-[#a8853a] text-[#0e1a14] rounded-xl p-[14px] font-sans text-[15px] font-semibold tracking-wide flex items-center justify-center gap-2 cursor-pointer transition-all shadow-[0_10px_30px_-8px_rgba(224,184,116,0.5)] hover:-translate-y-[1px] hover:shadow-[0_14px_36px_-8px_rgba(224,184,116,0.6)] active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            Continue
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-5">
            <label className="flex items-center text-[12px] font-medium text-[#9ab0a0] tracking-[0.12em] uppercase mb-2">I am a</label>
            <div className="flex max-sm:flex-col gap-3">
              {[
                { value: "trekker", label: "Trekker", desc: "I want to book guides", icon: "🥾" },
                { value: "guide", label: "Guide", desc: "I offer trek services", icon: "🧗" },
              ].map((r) => (
                <label
                  key={r.value}
                  className={`flex-1 flex flex-col items-center gap-1 p-[14px] rounded-xl cursor-pointer transition-all ${
                    form.role === r.value
                      ? "bg-[#e0b874]/10 border border-[#e0b874]/40 ring-1 ring-[#e0b874]/25"
                      : "bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]"
                  }`}
                >
                  <input type="radio" name="role" value={r.value} checked={form.role === r.value} onChange={handleChange} className="hidden" />
                  <span className="text-2xl leading-none">{r.icon}</span>
                  <span className={`text-[14px] font-medium ${form.role === r.value ? "text-[#e0b874]" : "text-[#d0c0a0]"}`}>{r.label}</span>
                  <span className="text-xs text-[#5a7060] text-center">{r.desc}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-5">
            <label htmlFor="phone" className="flex items-center text-[12px] font-medium text-[#9ab0a0] tracking-[0.12em] uppercase mb-2">
              Phone number <span className="text-[#4a6050] font-light normal-case tracking-normal ml-1">(optional)</span>
            </label>
            <div className="relative flex items-center">
              <svg className="absolute left-3.5 text-[#5a7060] pointer-events-none" width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="5" y="1.5" width="8" height="15" rx="2" stroke="currentColor" strokeWidth="1.4" />
                <circle cx="9" cy="13.5" r=".75" fill="currentColor" />
              </svg>
              <input
                id="phone"
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+977 98XXXXXXXX"
                autoComplete="tel"
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl py-[13px] pl-11 pr-4 font-sans text-[15px] font-light text-[#f0e4c8] outline-none transition-all placeholder:text-[#4a6050] focus:border-[#e0b874]/50 focus:bg-white/[0.08] focus:ring-[3px] focus:ring-[#e0b874]/10"
              />
            </div>
          </div>

          <div className="flex items-start gap-2.5 mb-5 text-[13.5px] text-[#7a9080] leading-relaxed">
            <input type="checkbox" id="terms" required className="w-4 h-4 mt-[2px] shrink-0 accent-[#e0b874] cursor-pointer bg-white/5 border-white/10" />
            <label htmlFor="terms">
              I agree to the <a href="/terms" className="text-[#e0b874] hover:text-[#f0cc88]">Terms of Service</a> and{" "}
              <a href="/privacy" className="text-[#e0b874] hover:text-[#f0cc88]">Privacy Policy</a>
            </label>
          </div>

          <div className="flex max-sm:flex-col-reverse gap-3 mt-1.5">
            <button
              type="button"
              className="flex-1 bg-white/[0.06] border border-white/10 text-[#9ab0a0] rounded-xl p-[14px] font-sans text-[15px] font-medium tracking-wide flex items-center justify-center cursor-pointer transition-all hover:bg-white/[0.1]"
              onClick={() => setStep(1)}
            >
              &larr; Back
            </button>
            <button
              type="submit"
              className="flex-[2] bg-gradient-to-br from-[#e8c07c] via-[#d0a45a] to-[#a8853a] text-[#0e1a14] rounded-xl p-[14px] font-sans text-[15px] font-semibold tracking-wide flex items-center justify-center gap-2 cursor-pointer transition-all shadow-[0_10px_30px_-8px_rgba(224,184,116,0.5)] hover:-translate-y-[1px] hover:shadow-[0_14px_36px_-8px_rgba(224,184,116,0.6)] active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <span className="w-[18px] h-[18px] border-2 border-black/20 border-t-[#0e1a14] rounded-full animate-spin" />
              ) : (
                "Create account"
              )}
            </button>
          </div>
        </form>
      )}

      <div className="flex items-center gap-3 my-6 text-[12px] text-[#4a6050] tracking-wide before:content-[''] before:flex-1 before:h-px before:bg-white/10 after:content-[''] after:flex-1 after:h-px after:bg-white/10">
        <span>OR SIGN UP WITH</span>
      </div>

      <div className="flex max-sm:flex-col gap-3 mb-6">
        <button className="flex-1 flex items-center justify-center gap-2 bg-white/[0.04] border border-white/10 rounded-xl p-3 font-sans text-[14px] text-[#b8c0b0] cursor-pointer transition-all hover:bg-white/[0.09] hover:border-white/20 hover:text-[#f0e4c8]">
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
            <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335" />
          </svg>
          Google
        </button>
      </div>

      <p className="text-center text-[14px] text-[#7a9080]">
        Already have an account?{" "}
        <Link to="/login" className="text-[#e0b874] font-medium hover:text-[#f0cc88] hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
