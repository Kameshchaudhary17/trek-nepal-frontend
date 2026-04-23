import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../services/api";
import AuthLayout from "../components/auth/AuthLayout";

const INPUT_CLS =
  "w-full bg-stone-50 border border-stone-200 rounded-xl py-[13px] px-4 text-[15px] text-stone-800 outline-none transition-all placeholder:text-stone-400 focus:border-forest-400 focus:bg-white focus:ring-2 focus:ring-forest-100";
const LABEL_CLS = "flex items-center text-[12px] font-semibold text-stone-500 tracking-[0.12em] uppercase mb-2";
const ERR_CLS = "block text-[12.5px] text-red-500 mt-1.5";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [cooldown, setCooldown] = useState(60);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (step !== 2) return;
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timer, step]);

  async function handleRequestOtp(e) {
    e.preventDefault();
    setErrors({});
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setErrors({ email: "Enter a valid email" });
      return;
    }
    setLoading(true);
    try {
      const res = await authService.forgotPassword(email);
      const secs = res?.resendAfterSeconds ?? 60;
      setCooldown(secs);
      setTimer(secs);
      setSuccess(res?.message || "Code sent. Check your inbox.");
      setStep(2);
    } catch (err) {
      setErrors({ server: err.response?.data?.message || "Couldn't send code. Try again." });
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (timer > 0) return;
    setErrors({});
    try {
      const res = await authService.forgotPassword(email);
      const secs = res?.resendAfterSeconds ?? cooldown;
      setTimer(secs);
    } catch (err) {
      setErrors({ server: err.response?.data?.message || "Couldn't resend." });
    }
  }

  async function handleReset(e) {
    e.preventDefault();
    const next = {};
    if (otp.trim().length < 6) next.otp = "Enter the 6-digit code";
    if (newPassword.length < 8) next.newPassword = "Minimum 8 characters";
    if (newPassword !== confirmPassword) next.confirmPassword = "Passwords don't match";
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      await authService.resetPassword(email, otp.trim(), newPassword);
      navigate("/login", { replace: true, state: { toast: "Password updated. Please sign in." } });
    } catch (err) {
      setErrors({ server: err.response?.data?.message || "Couldn't reset password." });
    } finally {
      setLoading(false);
    }
  }

  const side = (
    <div className="max-w-md">
      <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-forest-600 font-semibold mb-5">
        <span className="w-8 h-px bg-forest-500" />
        Recover account
      </span>
      <h2 className="font-serif text-[2.6rem] leading-[1.1] font-bold text-stone-900 mb-5">
        Forgotten your<br />
        <span className="italic text-forest-600">next step?</span>
      </h2>
      <p className="text-[15px] leading-relaxed text-stone-600">
        Enter the email on your account and we'll send a verification code to reset your password. Codes expire after 10 minutes.
      </p>
    </div>
  );

  return (
    <AuthLayout side={side}>
      <div className="mb-6">
        <h1 className="font-serif text-[2rem] font-bold text-stone-900 leading-snug mb-1.5">
          {step === 1 ? "Reset password" : "Enter reset code"}
        </h1>
        <p className="text-sm text-stone-500">
          {step === 1 ? "We'll email you a 6-digit code." : `Sent to ${email}. Code expires in 10 minutes.`}
        </p>
      </div>

      {errors.server && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-[13.5px] mb-5">
          {errors.server}
        </div>
      )}
      {success && step === 2 && (
        <div className="flex items-center gap-2 bg-forest-50 border border-forest-200 text-forest-700 rounded-lg p-3 text-[13.5px] mb-5">
          {success}
        </div>
      )}

      {step === 1 && (
        <form onSubmit={handleRequestOtp} noValidate>
          <div className="mb-5">
            <label htmlFor="fp-email" className={LABEL_CLS}>Email address</label>
            <input
              id="fp-email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors({}); }}
              placeholder="you@example.com"
              autoComplete="email"
              className={INPUT_CLS}
            />
            {errors.email && <span className={ERR_CLS}>{errors.email}</span>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-forest-500 text-white rounded-xl p-[14px] text-[15px] font-semibold tracking-wide flex items-center justify-center gap-2 transition-all hover:bg-forest-600 hover:-translate-y-[1px] hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Sending…" : "Send reset code"}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleReset} noValidate className="space-y-5">
          <div>
            <label htmlFor="fp-otp" className={LABEL_CLS}>Verification code</label>
            <input
              id="fp-otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="6-digit code"
              className={`${INPUT_CLS} tracking-[0.3em] text-center font-semibold`}
            />
            {errors.otp && <span className={ERR_CLS}>{errors.otp}</span>}
          </div>

          <div>
            <label htmlFor="fp-new" className={LABEL_CLS}>New password</label>
            <input
              id="fp-new"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              className={INPUT_CLS}
            />
            {errors.newPassword && <span className={ERR_CLS}>{errors.newPassword}</span>}
          </div>

          <div>
            <label htmlFor="fp-confirm" className={LABEL_CLS}>Confirm password</label>
            <input
              id="fp-confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat password"
              autoComplete="new-password"
              className={INPUT_CLS}
            />
            {errors.confirmPassword && <span className={ERR_CLS}>{errors.confirmPassword}</span>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-forest-500 text-white rounded-xl p-[14px] text-[15px] font-semibold tracking-wide flex items-center justify-center gap-2 transition-all hover:bg-forest-600 hover:-translate-y-[1px] hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Saving…" : "Reset password"}
          </button>

          <div className="flex items-center justify-center gap-1 text-[13px] text-stone-500">
            <span>Didn't get it?</span>
            {timer > 0 ? (
              <span className="text-stone-400">Resend in {timer}s</span>
            ) : (
              <button type="button" onClick={handleResend} className="text-forest-600 font-medium hover:text-forest-700 bg-transparent border-none cursor-pointer">
                Resend code
              </button>
            )}
          </div>
        </form>
      )}

      <p className="text-center text-[14px] text-stone-500 mt-7">
        Remembered it?{" "}
        <Link to="/login" className="text-forest-600 font-medium hover:text-forest-700 hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
