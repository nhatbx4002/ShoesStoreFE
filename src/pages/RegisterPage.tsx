import { useState, useEffect, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api/auth";
import { useAuthStore } from "../stores/useAuthStore";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const ACCENT = "#CCFF00"; // Electric lime — the "sole" of the shoe
const ACCENT_DIM = "#9DC400";
const DARK = "#0C0C0E";
const DARK_SURFACE = "#141416";
const DARK_CARD = "#1A1A1D";
const BORDER = "#2A2A2E";
const TEXT_PRI = "#F0F0F0";
const TEXT_MUTED = "#888890";
const TEXT_DIM = "#55555C";
const ERROR = "#FF5252";
const SUCCESS = "#4ADE80";

// ─── Animations (injected once) ───────────────────────────────────────────────
const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

  @keyframes float-slow {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-18px) rotate(3deg); }
  }
  @keyframes float-med {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-12px) rotate(-2deg); }
  }
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes slide-up {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(204,255,0,0.0); }
    50%       { box-shadow: 0 0 28px 4px rgba(204,255,0,0.15); }
  }
  @keyframes dash {
    to { stroke-dashoffset: 0; }
  }

  .reg-float-slow  { animation: float-slow  7s ease-in-out infinite; }
  .reg-float-med   { animation: float-med   5s ease-in-out infinite; }
  .reg-spin-slow   { animation: spin-slow  18s linear    infinite; }
  .reg-slide-up-1  { animation: slide-up 0.6s cubic-bezier(.22,.68,0,1.2) 0.05s both; }
  .reg-slide-up-2  { animation: slide-up 0.6s cubic-bezier(.22,.68,0,1.2) 0.15s both; }
  .reg-slide-up-3  { animation: slide-up 0.6s cubic-bezier(.22,.68,0,1.2) 0.25s both; }
  .reg-slide-up-4  { animation: slide-up 0.6s cubic-bezier(.22,.68,0,1.2) 0.35s both; }
  .reg-slide-up-5  { animation: slide-up 0.6s cubic-bezier(.22,.68,0,1.2) 0.45s both; }
  .reg-slide-up-6  { animation: slide-up 0.6s cubic-bezier(.22,.68,0,1.2) 0.55s both; }
  .reg-fade-in     { animation: fade-in 0.8s ease-out 0.7s both; }
  .reg-shimmer     {
    background: linear-gradient(90deg, ${TEXT_DIM} 25%, ${TEXT_MUTED} 50%, ${TEXT_DIM} 75%);
    background-size: 200% auto;
    animation: shimmer 3s linear infinite;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .reg-glow-btn    { animation: pulse-glow 2.5s ease-in-out infinite; }

  .reg-input-field {
    background: ${DARK_SURFACE};
    border: 1px solid ${BORDER};
    color: ${TEXT_PRI};
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    outline: none;
    width: 100%;
    font-family: 'DM Sans', sans-serif;
  }
  .reg-input-field:focus {
    border-color: ${ACCENT};
    box-shadow: 0 0 0 3px rgba(204,255,0,0.10);
  }
  .reg-input-field.error {
    border-color: ${ERROR};
    box-shadow: 0 0 0 3px rgba(255,82,82,0.10);
  }
  .reg-input-field::placeholder { color: ${TEXT_DIM}; }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: ${DARK}; }
  ::-webkit-scrollbar-thumb { background: ${BORDER}; border-radius: 3px; }
  ::selection { background: ${ACCENT}; color: ${DARK}; }
`;

// ─── Decorative SVG Icons ─────────────────────────────────────────────────────
function ShoeSilhouette() {
  return (
    <svg viewBox="0 0 280 160" className="w-full h-auto" aria-hidden="true">
      <defs>
        <linearGradient id="sg1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={ACCENT} stopOpacity="0.9" />
          <stop offset="100%" stopColor={ACCENT_DIM} stopOpacity="0.4" />
        </linearGradient>
      </defs>
      {/* Outsole tread pattern */}
      <rect x="22" y="130" width="236" height="10" rx="5" fill={BORDER} />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <rect
          key={i}
          x={30 + i * 29}
          y="133"
          width="20"
          height="4"
          rx="2"
          fill={DARK_SURFACE}
        />
      ))}
      {/* Main shoe body */}
      <path
        d="M22,128 C22,110 55,88 110,82 C155,76 190,86 215,96 L248,106 L248,128 Z"
        fill={`url(#sg1)`}
      />
      {/* Heel counter */}
      <path
        d="M22,128 C22,108 42,90 62,84 L62,128 Z"
        fill={ACCENT}
        opacity="0.6"
      />
      {/* Midsole stripe */}
      <path
        d="M22,122 C22,108 48,90 80,86 C130,80 175,90 215,100 L248,108 L248,118 L22,118 Z"
        fill={DARK_CARD}
        opacity="0.7"
      />
      {/* Lace zone */}
      <path
        d="M80,84 C100,70 135,68 160,76 C140,68 105,67 88,78 Z"
        fill={ACCENT}
        opacity="0.3"
      />
      {/* Laces */}
      {[0, 1, 2, 3].map((i) => (
        <line
          key={i}
          x1={95 + i * 20}
          y1={76 + i * 2}
          x2={108 + i * 20}
          y2={80 + i * 2}
          stroke={TEXT_PRI}
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.6"
        />
      ))}
      {/* Collar / ankle opening */}
      <path
        d="M62,84 C75,64 108,60 128,66 C110,58 80,60 68,78 Z"
        fill={DARK_CARD}
      />
      {/* Toe box highlight */}
      <ellipse cx="42" cy="112" rx="16" ry="8" fill={ACCENT} opacity="0.12" />
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

// ─── Sub-components ───────────────────────────────────────────────────────────
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

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", ok: password.length >= 8 },
    { label: "Uppercase letter", ok: /[A-Z]/.test(password) },
    { label: "Number", ok: /\d/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const colors = ["transparent", ERROR, "#FFA500", SUCCESS];

  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-0.5 flex-1 rounded-full transition-all duration-300"
            style={{ background: i < score ? colors[score] : BORDER }}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
        {checks.map((c) => (
          <span
            key={c.label}
            className="text-xs flex items-center gap-1"
            style={{
              color: c.ok ? SUCCESS : TEXT_DIM,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <span style={{ fontSize: "8px" }}>{c.ok ? "●" : "○"}</span>
            {c.label}
          </span>
        ))}
      </div>
    </div>
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

// ─── Main Component ────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => navigate("/login"), 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, navigate]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Full name is required";
    else if (form.name.trim().length < 2)
      e.name = "Name must be at least 2 characters";

    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email address";

    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 8)
      e.password = "Password must be at least 8 characters";

    if (!form.confirmPassword)
      e.confirmPassword = "Please confirm your password";
    else if (form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    setIsLoading(true);
    try {
      const res = await authApi.register({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      setUser(res.user, res.accessToken, res.refreshToken);
      setIsSuccess(true);
    } catch {
      setServerError("Registration failed. This email may already be in use.");
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
    className: `reg-input-field reg-slide-up-${(["1", "2", "3", "4"] as string[])[["name", "email", "password", "confirmPassword"].indexOf(key)]} px-4 py-3.5 rounded-xl text-sm placeholder:text-right pr-12`,
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

        {/* Radial glow — top right */}
        <div
          className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, rgba(204,255,0,0.05) 0%, transparent 70%)`,
          }}
        />
        {/* Radial glow — bottom left */}
        <div
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full pointer-events-none"
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
        <div className="absolute top-16 left-[8%] reg-float-slow pointer-events-none">
          <GeometricRing className="w-28 h-28" />
        </div>
        <div className="absolute bottom-24 right-[10%] reg-float-med reg-spin-slow pointer-events-none">
          <GeometricRing className="w-20 h-20" />
        </div>
        <div
          className="absolute top-[35%] right-[6%] reg-float-slow pointer-events-none"
          style={{ animationDelay: "1.5s" }}
        >
          <TreadPattern />
        </div>
        <div
          className="absolute top-[60%] left-[3%] reg-float-med pointer-events-none"
          style={{ animationDelay: "0.8s" }}
        >
          <TreadPattern />
        </div>

        {/* ── Main layout ───────────────────────────────────────────────── */}
        <div className="relative z-10 min-h-screen flex">
          {/* ── LEFT — Visual panel ─────────────────────────────────────── */}
          <div className="hidden lg:flex flex-col justify-between w-[45%] p-12 relative">
            {/* Logo mark */}
            <div className="reg-slide-up-1">
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

            {/* Center — shoe illustration */}
            <div className="flex-1 flex flex-col items-center justify-center reg-slide-up-2">
              <div className="relative">
                {/* Glow behind shoe */}
                <div
                  className="absolute inset-0 rounded-full blur-3xl pointer-events-none"
                  style={{
                    background: `radial-gradient(circle, rgba(204,255,0,0.12) 0%, transparent 70%)`,
                    transform: "scale(1.5)",
                  }}
                />
                <div className="relative reg-float-slow">
                  <ShoeSilhouette />
                </div>
              </div>

              <div className="mt-10 text-center reg-slide-up-3">
                <h2
                  className="text-4xl font-light leading-tight mb-3"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    color: TEXT_PRI,
                  }}
                >
                  Step into
                  <br />
                  <em className="not-italic" style={{ color: ACCENT }}>
                    your stride
                  </em>
                </h2>
                <p
                  className="text-sm leading-relaxed max-w-xs mx-auto"
                  style={{ color: TEXT_MUTED }}
                >
                  Join thousands of sneakerheads who trust us to deliver
                  authenticity, style, and speed.
                </p>
              </div>
            </div>

            {/* Bottom stats */}
            <div className="grid grid-cols-3 gap-4 reg-slide-up-4">
              {[
                { value: "12K+", label: "Products" },
                { value: "50K+", label: "Members" },
                { value: "4.9★", label: "Rating" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="text-center p-3 rounded-xl"
                  style={{
                    background: DARK_SURFACE,
                    border: `1px solid ${BORDER}`,
                  }}
                >
                  <div
                    className="text-lg font-semibold"
                    style={{ color: ACCENT }}
                  >
                    {s.value}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: TEXT_MUTED }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT — Form panel ──────────────────────────────────────── */}
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-14 lg:px-16">
            {/* Mobile logo */}
            <div className="lg:hidden mb-8 reg-slide-up-1">
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
              className="w-full max-w-md rounded-2xl p-8 reg-slide-up-2"
              style={{ background: DARK_CARD, border: `1px solid ${BORDER}` }}
            >
              {/* Header */}
              <div className="mb-8">
                <h1
                  className="text-3xl font-light mb-1 reg-slide-up-1"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    color: TEXT_PRI,
                  }}
                >
                  Create account
                </h1>
                <p
                  className="reg-slide-up-2"
                  style={{ color: TEXT_MUTED, fontSize: "0.875rem" }}
                >
                  Already a member?{" "}
                  <Link
                    to="/login"
                    className="transition-colors duration-200 hover:underline"
                    style={{ color: ACCENT }}
                  >
                    Sign in
                  </Link>
                </p>
              </div>

              {/* Server error */}
              {serverError && (
                <div
                  className="mb-5 px-4 py-3 rounded-xl text-sm reg-slide-up-1"
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
                <div className="flex flex-col items-center text-center py-8 reg-slide-up-1">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
                    style={{ background: "rgba(74,222,128,0.12)", border: `2px solid rgba(74,222,128,0.3)` }}
                  >
                    <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke={SUCCESS} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                  <h2
                    className="text-2xl font-light mb-2"
                    style={{ fontFamily: "'Cormorant Garamond', serif", color: TEXT_PRI }}
                  >
                    Account created!
                  </h2>
                  <p className="text-sm mb-6" style={{ color: TEXT_MUTED }}>
                    Welcome aboard. Redirecting you to sign in…
                  </p>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:brightness-110"
                    style={{ background: ACCENT, color: DARK }}
                  >
                    Go to Sign In
                    <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 10h12M12 6l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {/* Name */}
                <div className="reg-slide-up-2">
                  <label
                    htmlFor="name"
                    className="block text-xs font-medium mb-2 tracking-wide uppercase"
                    style={{ color: TEXT_MUTED, letterSpacing: "0.08em" }}
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      {...field("name")}
                      type="text"
                      placeholder="Alex Johnson"
                      autoComplete="name"
                      className={`${field("name").className} ${errors.name ? "error" : ""}`}
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
                        <circle cx="10" cy="6" r="3" />
                        <path
                          d="M4 17c0-3.314 2.686-6 6-6s6 2.686 6 6"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </div>
                  <FieldError message={errors.name} />
                </div>

                {/* Email */}
                <div className="reg-slide-up-3">
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
                <div className="reg-slide-up-4">
                  <label
                    htmlFor="password"
                    className="block text-xs font-medium mb-2 tracking-wide uppercase"
                    style={{ color: TEXT_MUTED, letterSpacing: "0.08em" }}
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      {...field("password")}
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 8 characters"
                      autoComplete="new-password"
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
                  {form.password && (
                    <PasswordStrength password={form.password} />
                  )}
                </div>

                {/* Confirm Password */}
                <div className="reg-slide-up-5">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-xs font-medium mb-2 tracking-wide uppercase"
                    style={{ color: TEXT_MUTED, letterSpacing: "0.08em" }}
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      {...field("confirmPassword")}
                      type={showPassword ? "text" : "password"}
                      placeholder="Repeat password"
                      autoComplete="new-password"
                      className={`${field("confirmPassword").className} ${errors.confirmPassword ? "error" : ""}`}
                    />
                    <div
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                      style={{
                        color:
                          form.confirmPassword &&
                          form.password === form.confirmPassword
                            ? SUCCESS
                            : TEXT_DIM,
                      }}
                    >
                      {form.confirmPassword &&
                        (form.password === form.confirmPassword ? (
                          <svg
                            viewBox="0 0 20 20"
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              d="M4 10l4 4 8-8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        ) : (
                          <svg
                            viewBox="0 0 20 20"
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              d="M5 5l10 10M15 5L5 15"
                              strokeLinecap="round"
                            />
                          </svg>
                        ))}
                    </div>
                  </div>
                  <FieldError message={errors.confirmPassword} />
                </div>

                {/* Submit */}
                <div className="pt-2 reg-slide-up-6">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 rounded-xl font-semibold text-sm tracking-wide transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed reg-glow-btn"
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
                        Creating account…
                      </span>
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </div>
              </form>

              {/* Divider */}
              <div className="mt-6 reg-slide-up-6">
                <Divider label="or continue with" />
              </div>

              {/* Social login */}
              <div className="mt-4 grid grid-cols-2 gap-3 reg-slide-up-6">
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
              className="mt-6 text-xs text-center reg-fade-in"
              style={{
                color: TEXT_DIM,
                fontFamily: "'DM Sans', sans-serif",
                maxWidth: "360px",
                lineHeight: "1.6",
              }}
            >
              By creating an account, you agree to our{" "}
              <button
                className="transition-colors duration-200 hover:underline"
                style={{ color: TEXT_MUTED }}
              >
                Terms of Service
              </button>{" "}
              and{" "}
              <button
                className="transition-colors duration-200 hover:underline"
                style={{ color: TEXT_MUTED }}
              >
                Privacy Policy
              </button>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
