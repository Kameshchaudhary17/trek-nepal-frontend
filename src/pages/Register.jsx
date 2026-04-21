import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import authService from "../services/api";
import AuthLayout from "../components/auth/AuthLayout";

const SPECIALIZATIONS = [
  "Swayambhunath (Monkey Temple)", "Boudhanath Stupa", "Pashupatinath Temple",
  "Durbar Square (Kathmandu)", "Changunarayan Temple", "Phewa Lake", "Sarangkot",
  "World Peace Pagoda", "Davis Falls", "Gupteshwor Cave", "Begnas Lake",
  "Mahendra Cave", "Lukla", "Namche Bazaar", "Tengboche Monastery", "Kala Patthar",
  "Gokyo Lakes", "Annapurna Circuit", "Ghorepani Poon Hill", "Mardi Himal",
  "Jomsom", "Tatopani", "Manang", "Thorong La Pass", "Kyanjin Gompa",
  "Helambu Valley", "Chitwan National Park", "Bardia National Park",
  "Tharu Cultural Village", "Elephant Breeding Center", "Rara Lake",
  "Rara National Park", "Khaptad National Park", "Dhorpatan Hunting Reserve",
  "Api Himal Base Camp", "Saipal Himal Region", "Badimalika Temple",
  "Muktinath Temple", "Janaki Temple (Janakpur)", "Pathivara Temple",
  "Manakamana Temple", "Upper Mustang", "Lower Mustang", "Dolpo Region",
  "Tilicho Lake", "Kanchenjunga Base Camp",
];

const INPUT_CLS = "w-full bg-stone-50 border border-stone-200 rounded-xl py-[13px] pl-11 pr-4 text-[15px] text-stone-800 outline-none transition-all placeholder:text-stone-400 focus:border-forest-400 focus:bg-white focus:ring-2 focus:ring-forest-100";
const INPUT_SM  = "w-full bg-stone-50 border border-stone-200 rounded-xl py-[11px] pl-11 pr-4 text-[14px] text-stone-800 outline-none transition-all placeholder:text-stone-400 focus:border-forest-400 focus:bg-white focus:ring-2 focus:ring-forest-100";
const SELECT_CLS = "w-full bg-stone-50 border border-stone-200 rounded-xl py-[11px] px-3 text-[14px] text-stone-800 outline-none transition-all focus:border-forest-400 focus:bg-white focus:ring-2 focus:ring-forest-100 appearance-none cursor-pointer";
const LABEL_CLS = "flex items-center text-[12px] font-semibold text-stone-500 tracking-[0.12em] uppercase mb-2";
const ERR_CLS = "block text-[12.5px] text-red-500 mt-1.5";

function OtpInput({ value, onChange }) {
  const inputs = useRef([]);
  const digits = value.padEnd(6, " ").split("").slice(0, 6);

  function handleChange(i, e) {
    const v = e.target.value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = v || " ";
    const joined = next.join("").trimEnd();
    onChange(joined);
    if (v && i < 5) inputs.current[i + 1]?.focus();
  }

  function handleKeyDown(i, e) {
    if (e.key === "Backspace" && !digits[i]?.trim() && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  }

  function handlePaste(e) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted) { onChange(pasted); inputs.current[Math.min(pasted.length, 5)]?.focus(); }
    e.preventDefault();
  }

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i]?.trim() || ""}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="w-11 h-14 text-center text-[1.3rem] font-semibold text-stone-800 bg-stone-50 border border-stone-200 rounded-xl outline-none transition-all focus:border-forest-400 focus:bg-white focus:ring-2 focus:ring-forest-100 caret-transparent"
        />
      ))}
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    fullName: "", email: "", password: "", confirmPassword: "",
    role: "trekker", phone: "",
    licenseNumber: "", yearsExperience: "", specialization: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [otp, setOtp] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [registeredRole, setRegisteredRole] = useState("trekker");
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (step !== 3) return;
    if (resendTimer <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setResendTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer, step]);

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

  const validateStep2Guide = () => {
    const e = {};
    if (!form.licenseNumber.trim()) e.licenseNumber = "Nepal Tourism Board license number required";
    if (!form.yearsExperience) e.yearsExperience = "Years of experience required";
    if (!form.specialization) e.specialization = "Select primary specialization";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = (e) => { e.preventDefault(); if (validateStep1()) setStep(2); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.role === "guide" && !validateStep2Guide()) return;
    setLoading(true);
    try {
      await authService.register(form);
      setRegisteredEmail(form.email);
      setRegisteredRole(form.role);
      setResendTimer(60);
      setCanResend(false);
      setOtp("");
      setStep(3);
    } catch (err) {
      setErrors({ server: err.response?.data?.message || "Registration failed. Try again." });
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.replace(/\s/g, "").length < 6) { setErrors({ otp: "Enter the full 6-digit code" }); return; }
    setLoading(true);
    setErrors({});
    try {
      const data = await authService.verifyOtp(registeredEmail, otp.replace(/\s/g, ""));
      if (registeredRole === "guide") { setSubmitted(true); }
      else {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/dashboard");
      }
    } catch (err) {
      setErrors({ otp: err.response?.data?.message || "Verification failed. Try again." });
    } finally { setLoading(false); }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    setLoading(true);
    setErrors({});
    try {
      await authService.resendOtp(registeredEmail);
      setResendTimer(60);
      setCanResend(false);
      setOtp("");
    } catch (err) {
      setErrors({ otp: err.response?.data?.message || "Failed to resend OTP." });
    } finally { setLoading(false); }
  };

  const handleGoogleRegister = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const data = await authService.googleAuth(tokenResponse.access_token);
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/dashboard");
      } catch (err) {
        setErrors({ server: err.response?.data?.message || "Google sign-up failed." });
      } finally { setLoading(false); }
    },
    onError: () => setErrors({ server: "Google sign-up failed." }),
  });

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
  const strengthColor = ["", "#e05040", "#d4913a", "#2D6A4F", "#1E4D38"][strength];

  const maskedEmail = registeredEmail.replace(/^(.{2})(.*)(@.*)$/, (_, a, b, c) => a + "*".repeat(b.length) + c);

  const side = (
    <div className="max-w-md">
      <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-forest-600 font-semibold mb-5">
        <span className="w-8 h-px bg-forest-500" />
        Join TrekDirect Nepal
      </span>
      <h2 className="font-serif text-[2.6rem] leading-[1.1] font-bold text-stone-900 mb-5">
        Your trail begins<br />
        <span className="italic text-forest-600">at hello.</span>
      </h2>
      <p className="text-[15px] leading-relaxed text-stone-600 mb-8">
        Create an account to save routes, message verified guides, and carry your itinerary across every peak you plan to climb.
      </p>
      <ul className="space-y-3 text-[14px] text-stone-600">
        {[
          "Only Nepal Tourism Board licensed guides",
          "Built-in permit & insurance checklists",
          "Offline itinerary, even above base camp",
        ].map((t) => (
          <li key={t} className="flex items-start gap-3">
            <span className="mt-[6px] w-1.5 h-1.5 rounded-full bg-forest-500 shrink-0" />
            {t}
          </li>
        ))}
      </ul>
    </div>
  );

  if (submitted) {
    return <AuthLayout side={side}><PendingApproval name={form.fullName} email={registeredEmail} /></AuthLayout>;
  }

  const STEPS = [
    { n: 1, label: "Account" },
    { n: 2, label: "Profile" },
    { n: 3, label: "Verify" },
  ];

  return (
    <AuthLayout side={side}>
      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-7">
        {STEPS.map((s, i) => (
          <div key={s.n} className="flex items-center flex-1 last:flex-none">
            <div className={`flex items-center gap-2 text-[13px] font-normal transition-colors ${step >= s.n ? "text-forest-600" : "text-stone-400"}`}>
              <div className={`w-[28px] h-[28px] rounded-full flex items-center justify-center text-[12.5px] font-semibold transition-all border ${step >= s.n ? "bg-forest-100 border-forest-400 text-forest-700" : "bg-stone-100 border-stone-200 text-stone-400"}`}>
                {step > s.n ? (
                  <svg width="12" height="12" viewBox="0 0 12 12">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                ) : s.n}
              </div>
              <span className={step >= s.n ? "text-stone-700 font-medium" : "text-stone-400"}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && <div className="flex-1 h-px bg-stone-200 mx-3" />}
          </div>
        ))}
      </div>

      <div className="mb-7">
        <h1 className="font-serif text-[2rem] max-sm:text-[1.7rem] font-bold text-stone-900 tracking-tight leading-snug mb-1.5">
          {step === 1 ? "Create account" : step === 2 ? "Almost there" : "Check your email"}
        </h1>
        <p className="text-sm text-stone-500 font-light">
          {step === 1 && "Start your Himalayan adventure today"}
          {step === 2 && "A few more details to personalise your experience"}
          {step === 3 && `We sent a 6-digit code to ${maskedEmail}`}
        </p>
      </div>

      {errors.server && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-[13.5px] mb-5" role="alert">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4" />
            <path d="M8 5v3M8 11v.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          {errors.server}
        </div>
      )}

      {/* ── Step 1 ── */}
      {step === 1 && (
        <form onSubmit={handleNext} noValidate>
          <div className="mb-5">
            <label htmlFor="fullName" className={LABEL_CLS}>Full name</label>
            <div className="relative flex items-center">
              <svg className="absolute left-3.5 text-stone-400 pointer-events-none" width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="6" r="3" stroke="currentColor" strokeWidth="1.4" />
                <path d="M2 15c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <input id="fullName" type="text" name="fullName" value={form.fullName} onChange={handleChange} placeholder="Full Name" autoComplete="name" className={INPUT_CLS} />
            </div>
            {errors.fullName && <span className={ERR_CLS}>{errors.fullName}</span>}
          </div>

          <div className="mb-5">
            <label htmlFor="email" className={LABEL_CLS}>Email address</label>
            <div className="relative flex items-center">
              <svg className="absolute left-3.5 text-stone-400 pointer-events-none" width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="1.5" y="4" width="15" height="10.5" rx="2" stroke="currentColor" strokeWidth="1.4" />
                <path d="M1.5 6.5L9 11L16.5 6.5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
              </svg>
              <input id="email" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" autoComplete="email" className={INPUT_CLS} />
            </div>
            {errors.email && <span className={ERR_CLS}>{errors.email}</span>}
          </div>

          <div className="mb-5">
            <label htmlFor="password" className={LABEL_CLS}>Password</label>
            <div className="relative flex items-center">
              <svg className="absolute left-3.5 text-stone-400 pointer-events-none" width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="4" y="8" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                <path d="M6 8V6a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <input id="password" type={showPass ? "text" : "password"} name="password" value={form.password} onChange={handleChange} placeholder="Min. 8 characters" autoComplete="new-password"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl py-[13px] pl-11 pr-11 text-[15px] text-stone-800 outline-none transition-all placeholder:text-stone-400 focus:border-forest-400 focus:bg-white focus:ring-2 focus:ring-forest-100" />
              <button type="button" className="absolute right-3.5 text-stone-400 hover:text-forest-600 transition-colors bg-transparent border-none flex items-center cursor-pointer p-1" onClick={() => setShowPass(!showPass)} aria-label="Toggle password">
                {showPass ? (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 9s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.4" /><circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="1.4" /><path d="M3 3l12 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 9s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.4" /><circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="1.4" /></svg>
                )}
              </button>
            </div>
            {form.password && (
              <div className="flex items-center gap-2.5 mt-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-7 h-[3px] rounded-sm transition-colors" style={{ background: i <= strength ? strengthColor : "#E7E5E4" }} />
                  ))}
                </div>
                <span className="text-xs font-medium" style={{ color: strengthColor }}>{strengthLabel}</span>
              </div>
            )}
            {errors.password && <span className={ERR_CLS}>{errors.password}</span>}
          </div>

          <div className="mb-5">
            <label htmlFor="confirmPassword" className={LABEL_CLS}>Confirm password</label>
            <div className="relative flex items-center">
              <svg className="absolute left-3.5 text-stone-400 pointer-events-none" width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="4" y="8" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                <path d="M6 8V6a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <input id="confirmPassword" type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Repeat password" autoComplete="new-password" className={INPUT_CLS} />
            </div>
            {errors.confirmPassword && <span className={ERR_CLS}>{errors.confirmPassword}</span>}
          </div>

          <button type="submit" className="w-full mt-1.5 bg-forest-500 text-white rounded-xl p-[14px] text-[15px] font-semibold tracking-wide flex items-center justify-center gap-2 cursor-pointer transition-all hover:bg-forest-600 hover:-translate-y-[1px] hover:shadow-lg active:translate-y-0">
            Continue
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </form>
      )}

      {/* ── Step 2 ── */}
      {step === 2 && (
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-5">
            <label className={LABEL_CLS}>I am a</label>
            <div className="flex max-sm:flex-col gap-3">
              {[
                { value: "trekker", label: "Trekker", desc: "Book verified guides", icon: "🥾", badge: null },
                { value: "guide", label: "Guide", desc: "Offer trek services", icon: "🧗", badge: "Verification required" },
              ].map((r) => (
                <label key={r.value} className={`flex-1 flex flex-col items-center gap-1 p-[14px] rounded-xl cursor-pointer transition-all relative ${form.role === r.value ? "bg-forest-50 border border-forest-300 ring-1 ring-forest-200" : "bg-stone-50 border border-stone-200 hover:bg-stone-100"}`}>
                  <input type="radio" name="role" value={r.value} checked={form.role === r.value} onChange={handleChange} className="hidden" />
                  {r.badge && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] bg-blue-100 text-blue-700 border border-blue-200 px-2 py-[2px] rounded-full font-medium tracking-wide whitespace-nowrap">{r.badge}</span>
                  )}
                  <span className="text-2xl leading-none mt-1">{r.icon}</span>
                  <span className={`text-[14px] font-medium ${form.role === r.value ? "text-forest-700" : "text-stone-700"}`}>{r.label}</span>
                  <span className="text-xs text-stone-500 text-center">{r.desc}</span>
                </label>
              ))}
            </div>
          </div>

          {form.role === "guide" && (
            <div className="mb-2 p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-4">
              <p className="text-[12.5px] text-blue-700 leading-relaxed">
                Guide accounts require manual review. Submit your Nepal Tourism Board credentials — our team verifies within 2–3 business days.
              </p>
              <div>
                <label htmlFor="licenseNumber" className="flex items-center text-[12px] font-semibold text-stone-500 tracking-[0.12em] uppercase mb-2">NTB License number <span className="text-red-500 ml-1">*</span></label>
                <div className="relative flex items-center">
                  <svg className="absolute left-3.5 text-stone-400 pointer-events-none" width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <rect x="2" y="3" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M5 7h8M5 10h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                  <input id="licenseNumber" type="text" name="licenseNumber" value={form.licenseNumber} onChange={handleChange} placeholder="e.g. NTB-G-2024-XXXXX" className={INPUT_SM} />
                </div>
                {errors.licenseNumber && <span className={ERR_CLS}>{errors.licenseNumber}</span>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="yearsExperience" className="flex items-center text-[12px] font-semibold text-stone-500 tracking-[0.12em] uppercase mb-2">Experience <span className="text-red-500 ml-1">*</span></label>
                  <select id="yearsExperience" name="yearsExperience" value={form.yearsExperience} onChange={handleChange} className={SELECT_CLS}>
                    <option value="">Years</option>
                    {["1–2", "3–5", "6–10", "10+"].map((y) => <option key={y} value={y}>{y} yrs</option>)}
                  </select>
                  {errors.yearsExperience && <span className={ERR_CLS}>{errors.yearsExperience}</span>}
                </div>
                <div>
                  <label htmlFor="specialization" className="flex items-center text-[12px] font-semibold text-stone-500 tracking-[0.12em] uppercase mb-2">Specialization <span className="text-red-500 ml-1">*</span></label>
                  <select id="specialization" name="specialization" value={form.specialization} onChange={handleChange} className={SELECT_CLS}>
                    <option value="">Route</option>
                    {SPECIALIZATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.specialization && <span className={ERR_CLS}>{errors.specialization}</span>}
                </div>
              </div>
            </div>
          )}

          <div className="mb-5 mt-4">
            <label htmlFor="phone" className="flex items-center text-[12px] font-semibold text-stone-500 tracking-[0.12em] uppercase mb-2">
              Phone number
              {form.role === "trekker" && <span className="text-stone-400 font-light normal-case tracking-normal ml-1">(optional)</span>}
              {form.role === "guide" && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="relative flex items-center">
              <svg className="absolute left-3.5 text-stone-400 pointer-events-none" width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="5" y="1.5" width="8" height="15" rx="2" stroke="currentColor" strokeWidth="1.4" />
                <circle cx="9" cy="13.5" r=".75" fill="currentColor" />
              </svg>
              <input id="phone" type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+977 98XXXXXXXX" autoComplete="tel" className={INPUT_CLS} />
            </div>
          </div>

          <div className="flex items-start gap-2.5 mb-5 text-[13.5px] text-stone-600 leading-relaxed">
            <input type="checkbox" id="terms" required className="w-4 h-4 mt-[2px] shrink-0 accent-forest-500 cursor-pointer" />
            <label htmlFor="terms">
              I agree to the <a href="/terms" className="text-forest-600 hover:text-forest-700">Terms of Service</a> and{" "}
              <a href="/privacy" className="text-forest-600 hover:text-forest-700">Privacy Policy</a>
            </label>
          </div>

          <div className="flex max-sm:flex-col-reverse gap-3 mt-1.5">
            <button type="button" className="flex-1 bg-stone-100 border border-stone-200 text-stone-600 rounded-xl p-[14px] text-[15px] font-medium tracking-wide flex items-center justify-center cursor-pointer transition-all hover:bg-stone-200" onClick={() => setStep(1)}>
              &larr; Back
            </button>
            <button type="submit" disabled={loading} className="flex-[2] bg-forest-500 text-white rounded-xl p-[14px] text-[15px] font-semibold tracking-wide flex items-center justify-center gap-2 cursor-pointer transition-all hover:bg-forest-600 hover:-translate-y-[1px] hover:shadow-lg active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed">
              {loading ? <span className="w-[18px] h-[18px] border-2 border-white/30 border-t-white rounded-full animate-spin" /> : form.role === "guide" ? "Submit for review" : "Create account"}
            </button>
          </div>
        </form>
      )}

      {/* ── Step 3 — OTP ── */}
      {step === 3 && (
        <form onSubmit={handleVerifyOtp} noValidate>
          <div className="flex items-center justify-center mb-7">
            <div className="w-16 h-16 rounded-2xl bg-forest-100 border border-forest-200 flex items-center justify-center">
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                <rect x="2.5" y="7" width="25" height="17" rx="3" stroke="#2D6A4F" strokeWidth="1.6" />
                <path d="M2.5 11L15 18.5L27.5 11" stroke="#2D6A4F" strokeWidth="1.6" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          <div className="mb-2">
            <OtpInput value={otp} onChange={setOtp} />
          </div>

          {errors.otp && <p className="text-center text-[13px] text-red-500 mt-3 mb-1">{errors.otp}</p>}

          <p className="text-center text-[12px] text-stone-400 mt-3 mb-6">Code expires in 10 minutes</p>

          <button type="submit" disabled={loading || otp.replace(/\s/g, "").length < 6}
            className="w-full bg-forest-500 text-white rounded-xl p-[14px] text-[15px] font-semibold tracking-wide flex items-center justify-center gap-2 cursor-pointer transition-all hover:bg-forest-600 hover:-translate-y-[1px] hover:shadow-lg active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0">
            {loading ? <span className="w-[18px] h-[18px] border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Verify & continue"}
          </button>

          <div className="flex items-center justify-center gap-1 mt-5 text-[13.5px] text-stone-500">
            <span>Didn't receive it?</span>
            {canResend ? (
              <button type="button" onClick={handleResendOtp} disabled={loading}
                className="text-forest-600 font-medium hover:text-forest-700 disabled:opacity-60 cursor-pointer bg-transparent border-none">
                Resend code
              </button>
            ) : (
              <span className="text-stone-400">Resend in {resendTimer}s</span>
            )}
          </div>

          <button type="button" onClick={() => setStep(2)} className="w-full mt-4 text-[13px] text-stone-400 hover:text-stone-600 transition-colors text-center">
            ← Use a different email
          </button>
        </form>
      )}

      {step < 3 && (
        <>
          <div className="flex items-center gap-3 my-6 text-[12px] text-stone-400 tracking-wide before:content-[''] before:flex-1 before:h-px before:bg-stone-200 after:content-[''] after:flex-1 after:h-px after:bg-stone-200">
            <span>OR SIGN UP WITH</span>
          </div>
          <div className="flex max-sm:flex-col gap-3 mb-6">
            <button type="button" onClick={() => handleGoogleRegister()} disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-white border border-stone-200 rounded-xl p-3 text-[14px] text-stone-600 cursor-pointer transition-all hover:bg-stone-50 hover:border-stone-300 hover:text-stone-900 disabled:opacity-60 disabled:cursor-not-allowed">
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
                <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335" />
              </svg>
              Google
            </button>
          </div>
          <p className="text-center text-[14px] text-stone-500">
            Already have an account?{" "}
            <Link to="/login" className="text-forest-600 font-medium hover:text-forest-700 hover:underline">Sign in</Link>
          </p>
        </>
      )}
    </AuthLayout>
  );
}

function PendingApproval({ name, email }) {
  return (
    <div className="text-center py-4">
      <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-2xl bg-blue-50 border border-blue-200">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d="M16 3L6 7v8c0 6.627 4.477 12.822 10 14 5.523-1.178 10-7.373 10-14V7L16 3z" stroke="#3B82F6" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M11 16l3.5 3.5L21 13" stroke="#3B82F6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h2 className="font-serif text-[1.7rem] font-bold text-stone-900 mb-2">Application submitted</h2>
      <p className="text-sm text-stone-500 mb-6 leading-relaxed">
        Thank you, <span className="text-stone-800 font-medium">{name}</span>. Your guide application is under review.<br />
        We'll send a decision to <span className="text-forest-600">{email}</span> within 2–3 business days.
      </p>
      <div className="space-y-3 text-left mb-8">
        {[
          { icon: "1", text: "License verified against Nepal Tourism Board records" },
          { icon: "2", text: "Background & safety record check" },
          { icon: "3", text: "Account activated — you'll receive an email" },
        ].map((s) => (
          <div key={s.icon} className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-forest-100 text-forest-700 text-[11px] font-semibold flex items-center justify-center">{s.icon}</span>
            <span className="text-[13.5px] text-stone-600 leading-snug">{s.text}</span>
          </div>
        ))}
      </div>
      <Link to="/" className="inline-flex items-center justify-center gap-2 w-full bg-stone-100 border border-stone-200 text-stone-700 rounded-xl p-[13px] text-[14px] font-medium cursor-pointer transition-all hover:bg-stone-200 hover:text-stone-900">
        Back to home
      </Link>
    </div>
  );
}
