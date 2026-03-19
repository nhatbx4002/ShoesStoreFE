import { useState, useEffect, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api/auth";
import { useAuthStore } from "../stores/useAuthStore";

// ─── Design Tokens (mirrors RegisterPage) ─────────────────────────────────────
const ACCENT = "#CCFF00";
const ACCENT_DIM = "#9DC400";
const DARK = "#0C0C0E";
const DARK_SURFACE = "#141416";
const DARK_CARD = "#1A1A1D";
const BORDER = "#2A2A2E";
const TEXT_PRI = "#F0F0F0";
const TEXT_MUTED = "#888890";
const TEXT_DIM = "#55555C";
const ERROR = "#FF5252";

// ─── Animations ────────────────────────────────────────────────────────────────
const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

  @keyframes float-slow {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-18px) rotate(-3deg); }
  }
  @keyframes float-med {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-12px) rotate(2deg); }
  }
  @keyframes slide-up {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(204,255,0,0.0); }
    50%       { box-shadow: 0 0 28px 4px rgba(204,255,0,0.15); }
  }
  @keyframes track-march {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes dash-draw {
    from { stroke-dashoffset: 200; }
    to   { stroke-dashoffset: 0; }
  }
  @keyframes blink-cursor {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0; }
  }

  .log-float-slow  { animation: float-slow  7s ease-in-out infinite; }
  .log-float-med   { animation: float-med   5s ease-in-out infinite; }
  .log-slide-up-1  { animation: slide-up 0.6s cubic-bezier(.22,.68,0,1.2) 0.05s both; }
  .log-slide-up-2  { animation: slide-up 0.6s cubic-bezier(.22,.68,0,1.2) 0.15s both; }
  .log-slide-up-3  { animation: slide-up 0.6s cubic-bezier(.22,.68,0,1.2) 0.25s both; }
  .log-slide-up-4  { animation: slide-up 0.6s cubic-bezier(.22,.68,0,1.2) 0.35s both; }
  .log-slide-up-5  { animation: slide-up 0.6s cubic-bezier(.22,.68,0,1.2) 0.45s both; }
  .log-fade-in     { animation: fade-in 0.8s ease-out 0.6s both; }
  .log-glow-btn    { animation: pulse-glow 2.5s ease-in-out infinite; }
  .log-track-march { animation: track-march 1.8s linear infinite; }
  .log-cursor-blink{ animation: blink-cursor 1.1s ease-in-out infinite; }

  .log-input-field {
    background: ${DARK_SURFACE};
    border: 1px solid ${BORDER};
    color: ${TEXT_PRI};
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    outline: none;
    width: 100%;
    font-family: 'DM Sans', sans-serif;
  }
  .log-input-field:focus {
    border-color: ${ACCENT};
    box-shadow: 0 0 0 3px rgba(204,255,0,0.10);
  }
  .log-input-field.error {
    border-color: ${ERROR};
    box-shadow: 0 0 0 3px rgba(255,82,82,0.10);
  }
  .log-input-field::placeholder { color: ${TEXT_DIM}; }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: ${DARK}; }
  ::-webkit-scrollbar-thumb { background: ${BORDER}; border-radius: 3px; }
  ::selection { background: ${ACCENT}; color: ${DARK}; }
`;

// ─── Decorative SVG Icons ─────────────────────────────────────────────────────

/** Sneaker side profile — slight variation from register's view */
function SneakerProfile() {
  return (
    <svg viewBox="0 0 320 200" className="w-full h-auto" aria-hidden="true">
      <defs>
        <linearGradient id="spg" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={ACCENT} stopOpacity="0.8" />
          <stop offset="100%" stopColor={ACCENT_DIM} stopOpacity="0.3" />
        </linearGradient>
      </defs>
      {/* Midsole */}
      <path
        d="M20,168 C20,155 55,145 100,142 C155,138 200,144 240,150 L290,156 L290,172 L20,172 Z"
        fill={DARK_SURFACE}
      />
      {/* Outsole */}
      <path
        d="M20,172 L290,172 L290,182 C290,187 270,190 250,190 C220,190 190,188 160,188 C130,188 100,190 70,190 C40,190 20,187 20,182 Z"
        fill={BORDER}
      />
      {/* Upper body */}
      <path
        d="M20,168 C20,148 48,130 88,124 C128,118 168,126 208,134 L260,144 L290,150 L290,168 Z"
        fill={`url(#spg)`}
      />
      {/* Collar */}
      <path
        d="M88,124 C105,100 148,95 178,100 C155,92 120,93 100,108 Z"
        fill={DARK_CARD}
      />
      {/* Laces */}
      {[0, 1, 2, 3].map((i) => (
        <line
          key={i}
          x1={112 + i * 22}
          y1={112 + i * 2}
          x2={126 + i * 22}
          y2={116 + i * 2}
          stroke={TEXT_PRI}
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.5"
        />
      ))}
      {/* Heel tab */}
      <path
        d="M20,160 C20,144 35,130 50,126 L50,158 Z"
        fill={ACCENT}
        opacity="0.7"
      />
      {/* Toe box highlight */}
      <ellipse cx="42" cy="150" rx="18" ry="9" fill={ACCENT} opacity="0.1" />
    </svg>
  );
}

function GeometricRing({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <circle
        cx="50"
        cy="50"
        r="44"
        fill="none"
        stroke={ACCENT}
        strokeWidth="1.5"
        strokeDasharray="8 6"
      />
      <circle
        cx="50"
        cy="50"
        r="30"
        fill="none"
        stroke={ACCENT}
        strokeWidth="0.5"
        opacity="0.4"
      />
    </svg>
  );
}

function TreadPattern() {
  return (
    <svg
      viewBox="0 0 80 40"
      className="w-20 h-10 opacity-20"
      aria-hidden="true"
    >
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x={i * 20 + 2}
          y="2"
          width="16"
          height="36"
          rx="4"
          fill={ACCENT}
        />
      ))}
    </svg>
  );
}

function FloatingDots() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="absolute inset-0 w-full h-full opacity-10"
      aria-hidden="true"
    >
      {[...Array(20)].map((_, i) => (
        <circle
          key={i}
          cx={(i * 47 + 13) % 200}
          cy={(i * 31 + 7) % 200}
          r={i % 3 === 0 ? 2.5 : 1.5}
          fill={ACCENT}
        />
      ))}
    </svg>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────
function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      className="mt-1.5 text-xs"
      style={{ color: ERROR, fontFamily: "'DM Sans', sans-serif" }}
    >
      {message}
    </p>
  );
}

function Divider({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px" style={{ background: BORDER }} />
      {label && (
        <span
          className="text-xs"
          style={{ color: TEXT_DIM, fontFamily: "'DM Sans', sans-serif" }}
        >
          {label}
        </span>
      )}
      <div className="flex-1 h-px" style={{ background: BORDER }} />
    </div>
  );
}

function RememberRow() {
  const [checked, setChecked] = useState(false);
  return (
    <label className="flex items-center gap-2.5 cursor-pointer select-none group">
      <div
        className="w-4 h-4 rounded flex items-center justify-center transition-all duration-200"
        style={{
          background: checked ? ACCENT : "transparent",
          border: `1.5px solid ${checked ? ACCENT : BORDER}`,
        }}
        onClick={() => setChecked((v) => !v)}
      >
        {checked && (
          <svg viewBox="0 0 10 10" className="w-2.5 h-2.5" fill="none">
            <path
              d="M1.5 5l2.5 2.5 4.5-5"
              stroke={DARK}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={() => setChecked((v) => !v)}
      />
      <span
        className="text-xs transition-colors duration-150"
        style={{
          color: checked ? TEXT_MUTED : TEXT_DIM,
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        Keep me signed in
      </span>
    </label>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function LoginPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => navigate("/"), 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, navigate]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email address";
    if (!form.password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    setIsLoading(true);
    try {
      const res = await authApi.login({
        email: form.email,
        password: form.password,
      });
      setUser(res.user, res.accessToken, res.refreshToken);
      setIsSuccess(true);
    } catch {
      setServerError("Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const field = (key: keyof typeof form) => ({
    id: key,
    name: key,
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
      if (errors[key])
        setErrors((er) => {
          const n = { ...er };
          delete n[key];
          return n;
        });
    },
    className: `log-input-field log-slide-up-${(["2", "3"] as string[])[["email", "password"].indexOf(key)]} px-4 py-3.5 rounded-xl text-sm pr-12`,
  });

  return (
    <>
      <style>{STYLE}</style>
      <div
        className="min-h-screen relative overflow-hidden"
        style={{ background: DARK, fontFamily: "'DM Sans', sans-serif" }}
      >
        {/* ── Background atmosphere ─────────────────────────────────────── */}
        <FloatingDots />

        <div
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, rgba(204,255,0,0.05) 0%, transparent 70%)`,
          }}
        />
        <div
          className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, rgba(204,255,0,0.03) 0%, transparent 70%)`,
          }}
        />

        {/* ── Grid overlay ─────────────────────────────────────────────── */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(${BORDER} 1px, transparent 1px),
              linear-gradient(90deg, ${BORDER} 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
          }}
        />

        {/* ── Floating decorative elements ──────────────────────────────── */}
        <div
          className="absolute top-20 right-[8%] log-float-med pointer-events-none"
          style={{ animationDelay: "0.5s" }}
        >
          <GeometricRing className="w-28 h-28" />
        </div>
        <div className="absolute bottom-20 left-[7%] log-float-slow log-track-march pointer-events-none">
          <TreadPattern />
        </div>
        <div
          className="absolute top-[40%] left-[5%] log-float-med pointer-events-none"
          style={{ animationDelay: "1.2s" }}
        >
          <TreadPattern />
        </div>

        {/* ── Main layout — FORM LEFT, BRAND RIGHT (mirrors register) ──── */}
        <div className="relative z-10 min-h-screen flex">
          {/* ── LEFT — Form panel ─────────────────────────────────────────── */}
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-14 lg:px-16">
            {/* Mobile logo */}
            <div className="lg:hidden mb-8 log-slide-up-1">
              <div className="inline-flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: ACCENT }}
                >
                  <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none">
                    <path d="M3 15 L10 5 L17 15 Z" fill={DARK} />
                  </svg>
                </div>
                <span
                  className="text-sm font-semibold tracking-widest uppercase"
                  style={{ color: TEXT_PRI, letterSpacing: "0.2em" }}
                >
                  stride
                </span>
              </div>
            </div>

            {/* Card */}
            <div
              className="w-full max-w-md rounded-2xl p-8 log-slide-up-2"
              style={{ background: DARK_CARD, border: `1px solid ${BORDER}` }}
            >
              {/* Header */}
              <div className="mb-7">
                <div className="log-slide-up-1 flex items-center gap-2 mb-4">
                  <div
                    className="w-5 h-5 rounded flex items-center justify-center"
                    style={{ background: ACCENT }}
                  >
                    <svg viewBox="0 0 20 20" className="w-3 h-3" fill="none">
                      <path d="M3 15 L10 5 L17 15 Z" fill={DARK} />
                    </svg>
                  </div>
                  <span
                    className="text-xs font-semibold tracking-widest uppercase"
                    style={{ color: TEXT_DIM, letterSpacing: "0.2em" }}
                  >
                    stride
                  </span>
                </div>
                <h1
                  className="text-3xl font-light mb-1 log-slide-up-1"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    color: TEXT_PRI,
                  }}
                >
                  Welcome back
                </h1>
                <p
                  className="log-slide-up-2"
                  style={{ color: TEXT_MUTED, fontSize: "0.875rem" }}
                >
                  New here?{" "}
                  <Link
                    to="/register"
                    className="transition-colors duration-200 hover:underline"
                    style={{ color: ACCENT }}
                  >
                    Create an account
                  </Link>
                </p>
              </div>

              {/* Server error */}
              {serverError && (
                <div
                  className="mb-5 px-4 py-3 rounded-xl text-sm log-slide-up-1"
                  style={{
                    background: "rgba(255,82,82,0.08)",
                    border: `1px solid rgba(255,82,82,0.3)`,
                    color: ERROR,
                  }}
                >
                  {serverError}
                </div>
              )}

              {/* Success screen */}
              {isSuccess && (
                <div className="flex flex-col items-center text-center py-8 log-slide-up-1">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
                    style={{
                      background: "rgba(74,222,128,0.12)",
                      border: `2px solid rgba(74,222,128,0.3)`,
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="w-8 h-8"
                      fill="none"
                      stroke="#4ADE80"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                  <h2
                    className="text-2xl font-light mb-2"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      color: TEXT_PRI,
                    }}
                  >
                    Welcome back!
                  </h2>
                  <p className="text-sm mb-6" style={{ color: TEXT_MUTED }}>
                    Redirecting you to home…
                  </p>
                  <Link
                    to="/"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:brightness-110"
                    style={{ background: ACCENT, color: DARK }}
                  >
                    Go to Home
                    <svg
                      viewBox="0 0 20 20"
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        d="M4 10h12M12 6l4 4-4 4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {/* Email */}
                <div className="log-slide-up-2">
                  <label
                    htmlFor="email"
                    className="block text-xs font-medium mb-2 tracking-wide uppercase"
                    style={{ color: TEXT_MUTED, letterSpacing: "0.08em" }}
                  >
                    Email
                  </label>
                  <div className="relative">
                    <input
                      {...field("email")}
                      type="email"
                      placeholder="alex@example.com"
                      autoComplete="email"
                      className={`${field("email").className} ${errors.email ? "error" : ""}`}
                    />
                    <div
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ color: TEXT_DIM }}
                    >
                      <svg
                        viewBox="0 0 20 20"
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <rect x="2" y="5" width="16" height="12" rx="2" />
                        <path d="M2 7l8 5 8-5" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>
                  <FieldError message={errors.email} />
                </div>

                {/* Password */}
                <div className="log-slide-up-3">
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor="password"
                      className="text-xs font-medium tracking-wide uppercase"
                      style={{ color: TEXT_MUTED, letterSpacing: "0.08em" }}
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      className="text-xs transition-colors duration-150 hover:underline"
                      style={{ color: ACCENT_DIM }}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      {...field("password")}
                      type={showPassword ? "text" : "password"}
                      placeholder="Your password"
                      autoComplete="current-password"
                      className={`${field("password").className} ${errors.password ? "error" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200"
                      style={{ color: TEXT_MUTED }}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <svg
                          viewBox="0 0 20 20"
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path
                            d="M3 3l14 14M8.5 8.5A3 3 0 0112 12"
                            strokeLinecap="round"
                          />
                          <path
                            d="M6.5 5.5C4.5 6.5 2.8 8.2 2 10c1.5 2.8 4 5 6.5 6 1.5.6 3.2.8 5 .5"
                            strokeLinecap="round"
                          />
                          <path
                            d="M10 4c1.5 1 3 2.5 3.5 4.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      ) : (
                        <svg
                          viewBox="0 0 20 20"
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <ellipse cx="10" cy="10" rx="7" ry="5" />
                          <circle cx="10" cy="10" r="2" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <FieldError message={errors.password} />
                </div>

                {/* Remember me */}
                <div className="log-slide-up-4">
                  <RememberRow />
                </div>

                {/* Submit */}
                <div className="pt-2 log-slide-up-5">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 rounded-xl font-semibold text-sm tracking-wide transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed log-glow-btn"
                    style={{
                      background: isLoading ? BORDER : ACCENT,
                      color: DARK,
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeDasharray="32"
                            strokeDashoffset="12"
                          />
                        </svg>
                        Signing in…
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Sign In
                        <svg
                          viewBox="0 0 20 20"
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            d="M4 10h12M12 6l4 4-4 4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    )}
                  </button>
                </div>
              </form>

              {/* Divider */}
              <div className="mt-6 log-slide-up-5">
                <Divider label="or continue with" />
              </div>

              {/* Social login */}
              <div className="mt-4 grid grid-cols-2 gap-3 log-slide-up-5">
                {[
                  {
                    label: "Google",
                    icon: (
                      <svg viewBox="0 0 24 24" className="w-4 h-4">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                    ),
                  },
                  {
                    label: "GitHub",
                    icon: (
                      <svg
                        viewBox="0 0 24 24"
                        className="w-4 h-4"
                        fill="currentColor"
                      >
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                      </svg>
                    ),
                  },
                ].map((social) => (
                  <button
                    key={social.label}
                    type="button"
                    className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm transition-all duration-200 hover:brightness-125"
                    style={{
                      background: DARK_SURFACE,
                      border: `1px solid ${BORDER}`,
                      color: TEXT_PRI,
                    }}
                  >
                    {social.icon}
                    <span style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      {social.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer note */}
            <p
              className="mt-6 text-xs text-center log-fade-in"
              style={{
                color: TEXT_DIM,
                fontFamily: "'DM Sans', sans-serif",
                maxWidth: "360px",
                lineHeight: "1.6",
              }}
            >
              Protected by reCAPTCHA. Google{" "}
              <button
                className="transition-colors duration-150 hover:underline"
                style={{ color: TEXT_MUTED }}
              >
                Privacy Policy
              </button>{" "}
              and{" "}
              <button
                className="transition-colors duration-150 hover:underline"
                style={{ color: TEXT_MUTED }}
              >
                Terms of Service
              </button>{" "}
              apply.
            </p>
          </div>

          {/* ── RIGHT — Brand panel (mirrors register but flipped) ──────── */}
          <div className="hidden lg:flex flex-col justify-between w-[45%] p-12 relative">
            {/* Logo mark */}
            <div className="log-slide-up-1">
              <div className="inline-flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: ACCENT }}
                >
                  <svg viewBox="0 0 20 20" className="w-5 h-5" fill="none">
                    <path d="M3 15 L10 5 L17 15 Z" fill={DARK} />
                  </svg>
                </div>
                <span
                  className="text-sm font-semibold tracking-widest uppercase"
                  style={{ color: TEXT_PRI, letterSpacing: "0.2em" }}
                >
                  stride
                </span>
              </div>
            </div>

            {/* Center — outsole + sneaker illustration */}
            <div className="flex-1 flex flex-col items-center justify-center log-slide-up-2">
              <div className="relative w-full max-w-[240px]">
                {/* Glow */}
                <div
                  className="absolute inset-0 rounded-full blur-3xl pointer-events-none"
                  style={{
                    background: `radial-gradient(circle, rgba(204,255,0,0.10) 0%, transparent 70%)`,
                    transform: "scale(1.6)",
                  }}
                />
                <div className="relative log-float-slow">
                  <SneakerProfile />
                </div>
              </div>

              <div className="mt-8 text-center log-slide-up-3">
                <h2
                  className="text-4xl font-light leading-tight mb-3"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    color: TEXT_PRI,
                  }}
                >
                  Every stride
                  <br />
                  <em className="not-italic" style={{ color: ACCENT }}>
                    starts here
                  </em>
                </h2>
                <p
                  className="text-sm leading-relaxed max-w-xs mx-auto"
                  style={{ color: TEXT_MUTED }}
                >
                  Sign in to access exclusive drops, track your orders, and get
                  personalized recommendations.
                </p>
              </div>

              {/* Animated outsole callout */}
              <div
                className="mt-6 p-4 rounded-xl log-slide-up-4"
                style={{
                  background: DARK_SURFACE,
                  border: `1px solid ${BORDER}`,
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: ACCENT, opacity: 0.15 }}
                  >
                    <svg viewBox="0 0 20 20" className="w-5 h-5" fill={ACCENT}>
                      <path d="M10 1L12.5 7.5H19L13.5 11.5L15.5 18L10 14L4.5 18L6.5 11.5L1 7.5H7.5Z" />
                    </svg>
                  </div>
                  <div>
                    <p
                      className="text-xs font-medium"
                      style={{ color: TEXT_PRI }}
                    >
                      Member-exclusive drops
                    </p>
                    <p className="text-xs" style={{ color: TEXT_DIM }}>
                      Get early access to limited releases
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom — brand strip with marching tread */}
            <div
              className="log-slide-up-4 overflow-hidden rounded-xl"
              style={{
                background: DARK_SURFACE,
                border: `1px solid ${BORDER}`,
              }}
            >
              <div className="flex items-center gap-0 px-4 py-3 overflow-hidden">
                <div className="flex items-center gap-2 mr-4 shrink-0">
                  <svg viewBox="0 0 20 20" className="w-4 h-4" fill={ACCENT}>
                    <path d="M10 1L12.5 7.5H19L13.5 11.5L15.5 18L10 14L4.5 18L6.5 11.5L1 7.5H7.5Z" />
                  </svg>
                  <span
                    className="text-xs font-medium whitespace-nowrap"
                    style={{ color: TEXT_PRI }}
                  >
                    Premium Selection
                  </span>
                </div>
                <div className="flex gap-1 log-track-march">
                  {[...Array(12)].map((_, i) => (
                    <span
                      key={i}
                      className="text-xs whitespace-nowrap"
                      style={{ color: TEXT_DIM }}
                    >
                      {i % 3 === 0
                        ? "● Authentic"
                        : i % 3 === 1
                          ? "● Fast Shipping"
                          : "● Easy Returns"}
                      {i < 11 ? "  ·  " : ""}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
