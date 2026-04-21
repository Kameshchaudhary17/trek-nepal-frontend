import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import authService from "../services/api";
import AuthLayout from "../components/auth/AuthLayout";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(""); };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const data = await authService.googleAuth(tokenResponse.access_token);
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate(data.user.role === "guide" ? "/guide/dashboard" : "/dashboard");
      } catch (err) {
        setError(err.response?.data?.message || "Google sign-in failed.");
      } finally { setLoading(false); }
    },
    onError: () => setError("Google sign-in failed."),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authService.login(form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate(data.user.role === "guide" ? "/guide/dashboard" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout>
      <div className="mb-7">
        <h1 className="font-serif text-[2rem] max-sm:text-[1.7rem] font-bold text-stone-900 tracking-tight leading-snug mb-1.5">
          Welcome back
        </h1>
        <p className="text-sm text-stone-500 font-light">Sign in to continue your Himalayan journey</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-[13.5px] mb-5" role="alert">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4" />
            <path d="M8 5v3M8 11v.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-5">
          <label htmlFor="email" className="block text-[12px] font-semibold text-stone-500 tracking-[0.12em] uppercase mb-2">
            Email address
          </label>
          <div className="relative flex items-center">
            <svg className="absolute left-3.5 text-stone-400 pointer-events-none" width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="1.5" y="4" width="15" height="10.5" rx="2" stroke="currentColor" strokeWidth="1.4" />
              <path d="M1.5 6.5L9 11L16.5 6.5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
            </svg>
            <input
              id="email" type="email" name="email" value={form.email} onChange={handleChange}
              placeholder="Email" autoComplete="email" required
              className="w-full bg-stone-50 border border-stone-200 rounded-xl py-[13px] pl-11 pr-4 text-[15px] text-stone-800 outline-none transition-all placeholder:text-stone-400 focus:border-forest-400 focus:bg-white focus:ring-2 focus:ring-forest-100"
            />
          </div>
        </div>

        <div className="mb-5">
          <label htmlFor="password" className="flex items-center justify-between text-[12px] font-semibold text-stone-500 tracking-[0.12em] uppercase mb-2">
            Password
            <Link to="/forgot-password" className="text-forest-600 hover:text-forest-700 text-[12.5px] font-normal normal-case tracking-normal hover:underline">
              Forgot password?
            </Link>
          </label>
          <div className="relative flex items-center">
            <svg className="absolute left-3.5 text-stone-400 pointer-events-none" width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="4" y="8" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
              <path d="M6 8V6a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <input
              id="password" type={showPass ? "text" : "password"} name="password" value={form.password} onChange={handleChange}
              placeholder="Password" autoComplete="current-password" required
              className="w-full bg-stone-50 border border-stone-200 rounded-xl py-[13px] pl-11 pr-11 text-[15px] text-stone-800 outline-none transition-all placeholder:text-stone-400 focus:border-forest-400 focus:bg-white focus:ring-2 focus:ring-forest-100"
            />
            <button type="button" className="absolute right-3 text-stone-400 hover:text-forest-600 transition-colors bg-transparent border-none flex items-center cursor-pointer p-1" onClick={() => setShowPass(!showPass)} aria-label="Toggle password">
              {showPass ? (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 9s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.4" /><circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="1.4" /><path d="M3 3l12 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 9s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.4" /><circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="1.4" /></svg>
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full mt-2 bg-forest-500 text-white rounded-xl p-[14px] text-[15px] font-semibold tracking-wide flex items-center justify-center gap-2 cursor-pointer transition-all hover:bg-forest-600 hover:-translate-y-[1px] hover:shadow-lg active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? (
            <span className="w-[18px] h-[18px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Sign in
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </>
          )}
        </button>
      </form>

      <div className="flex items-center gap-3 my-6 text-[12px] text-stone-400 tracking-wide before:content-[''] before:flex-1 before:h-px before:bg-stone-200 after:content-[''] after:flex-1 after:h-px after:bg-stone-200">
        <span>OR CONTINUE WITH</span>
      </div>

      <div className="flex max-sm:flex-col gap-3 mb-6">
        <button
          type="button"
          onClick={() => handleGoogleLogin()}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 bg-white border border-stone-200 rounded-xl p-3 text-[14px] text-stone-600 cursor-pointer transition-all hover:bg-stone-50 hover:border-stone-300 hover:text-stone-900 disabled:opacity-60 disabled:cursor-not-allowed"
        >
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
        Don't have an account?{" "}
        <Link to="/register" className="text-forest-600 font-medium hover:text-forest-700 hover:underline">
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}
