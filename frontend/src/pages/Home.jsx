import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import {
  FiLink, FiBarChart2, FiZap, FiShield, FiArrowRight,
  FiCheck, FiGlobe, FiCopy,
} from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { BACKEND_URL } from '../api';

const FEATURES = [
  {
    icon: <FiZap size={20} />,
    gradient: 'from-violet-600 to-indigo-500',
    glow: 'shadow-violet-500/20',
    title: 'Instant Shortening',
    desc: 'Generate compact, shareable links in milliseconds — with unique codes or custom aliases of your choice.',
  },
  {
    icon: <FiBarChart2 size={20} />,
    gradient: 'from-pink-600 to-rose-500',
    glow: 'shadow-pink-500/20',
    title: 'Deep Analytics',
    desc: 'Track every click with timestamps, device info, browser breakdowns, geo-location, and 7-day trend charts.',
  },
  {
    icon: <FiShield size={20} />,
    gradient: 'from-emerald-600 to-teal-500',
    glow: 'shadow-emerald-500/20',
    title: 'Secure & Private',
    desc: 'JWT-authenticated endpoints ensure only you can manage and view your links. Your data stays yours.',
  },
  {
    icon: <FiGlobe size={20} />,
    gradient: 'from-cyan-600 to-sky-500',
    glow: 'shadow-cyan-500/20',
    title: 'QR Codes Included',
    desc: 'Every link comes with a high-resolution QR code ready to embed anywhere — no extra setup required.',
  },
];

const CHECKLIST = [
  'Custom short aliases', 'Expiry date support', 'Bulk CSV shortening',
  'Click trend charts',  'Public stats pages',  'Link editing',
];

const useCounter = (end, duration = 1600, active = false) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let val = 0;
    const step = end / (duration / 16);
    const t = setInterval(() => {
      val += step;
      if (val >= end) { setCount(end); clearInterval(t); }
      else setCount(Math.floor(val));
    }, 16);
    return () => clearInterval(t);
  }, [end, duration, active]);
  return count;
};

const StatCounter = ({ value, label, suffix = '' }) => {
  const [active, setActive] = useState(false);
  const [ref, setRef] = useState(null);
  const count = useCounter(value, 1600, active);

  useEffect(() => {
    if (!ref) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setActive(true); }, { threshold: 0.4 });
    obs.observe(ref);
    return () => obs.disconnect();
  }, [ref]);

  return (
    <div ref={setRef} className="text-center pt-8 first:pt-0 md:pt-0">
      <div className="text-3xl sm:text-4xl font-black text-white tabular-nums tracking-tight">
        {count.toLocaleString()}<span className="text-violet-400">{suffix}</span>
      </div>
      <div className="text-sm text-slate-500 font-medium mt-1">{label}</div>
    </div>
  );
};

const Home = () => {
  const { user } = useAuth();
  const [heroUrl, setHeroUrl] = useState('');
  const [heroResult, setHeroResult] = useState(null);
  const [heroLoading, setHeroLoading] = useState(false);
  const [publicStats, setPublicStats] = useState({ totalUrls: 0, totalClicks: 0 });

  useEffect(() => {
    const fetchTotals = async () => {
      try {
        const resp = await fetch(`${BACKEND_URL}/api/urls/public-stats-totals`);
        if (resp.ok) {
          const data = await resp.json();
          setPublicStats({
            totalUrls: data.totalUrls || 0,
            totalClicks: data.totalClicks || 0
          });
        }
      } catch (err) {
        console.error('Failed to load total counts:', err);
      }
    };
    fetchTotals();
  }, []);

  const handleHeroShorten = async (e) => {
    e.preventDefault();
    if (!heroUrl.trim()) return;
    if (!user) { window.location.href = '/signup'; return; }
    setHeroLoading(true);
    try {
      const token = localStorage.getItem('token');
      const resp = await fetch(`${BACKEND_URL}/api/urls/shorten`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ originalUrl: heroUrl }),
      });
      const data = await resp.json();
      if (resp.ok) setHeroResult(`${BACKEND_URL}/${data.shortCode}`);
      else toast.error(data.message || 'Failed to shorten URL');
    } catch { toast.error('Something went wrong'); }
    setHeroLoading(false);
  };

  const copyHeroResult = async () => {
    try {
      await navigator.clipboard.writeText(heroResult);
      toast.success('Copied to clipboard!');
    } catch { toast.error('Could not copy — please copy manually'); }
  };

  return (
    <div className="min-h-screen">

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden dot-grid py-28 sm:py-26">
        {/* Glow orbs */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-violet-600/[0.07] blur-[100px] pointer-events-none animate-pulse-glow" />
        <div className="absolute top-1/2 -right-40 w-[400px] h-[400px] rounded-full bg-pink-600/[0.05] blur-[80px] pointer-events-none animate-pulse-glow" style={{ animationDelay: '2s' }} />

        <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-6 text-center">

          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/[0.10] border border-violet-500/[0.20] text-violet-300 text-xs font-semibold tracking-wide mb-7 animate-fade-up">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
            Next-Gen Digital Link Infrastructure
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter leading-[1.05] mb-6 animate-fade-up delay-1">
            Simplify. Manage.{' '}
            <span className="gradient-text drop-shadow-[0_0_25px_rgba(167,139,250,0.5)]">Grow.</span>
          </h1>

          {/* Sub-headline */}
          <p className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto leading-relaxed mb-10 animate-fade-up delay-2">
            Transform long URLs into powerful, trackable short links with real-time analytics,
            QR codes, and custom aliases — all in one sleek dashboard.
          </p>

          {/* URL widget */}
          <div className="animate-fade-up delay-3 animate-float">
            {heroResult ? (
              <div className="flex items-center gap-3 max-w-lg mx-auto px-5 py-3.5 rounded-2xl glass-panel hover-glow transition-all duration-300">
                <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                <span className="flex-1 text-emerald-300 text-sm font-medium truncate">{heroResult}</span>
                <button
                  onClick={copyHeroResult}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-all flex-shrink-0"
                >
                  <FiCopy size={12} /> Copy
                </button>
                <button
                  onClick={() => { setHeroResult(null); setHeroUrl(''); }}
                  className="text-slate-500 hover:text-slate-300 text-xs ml-1 flex-shrink-0"
                >
                  New
                </button>
              </div>
            ) : (
              <form onSubmit={handleHeroShorten} className="flex items-center gap-2 max-w-lg mx-auto p-1.5 rounded-2xl glass-panel hover-glow transition-all duration-300">
                <FiLink size={16} className="text-violet-400 ml-3 flex-shrink-0" />
                <input
                  type="url"
                  value={heroUrl}
                  onChange={(e) => setHeroUrl(e.target.value)}
                  placeholder="Paste your long URL here…"
                  className="flex-1 min-w-0 bg-transparent outline-none text-slate-200 text-sm placeholder:text-slate-600 py-2"
                />
                <button
                  type="submit"
                  disabled={!heroUrl.trim() || heroLoading}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-linear-to-r from-violet-600 to-indigo-500 text-white text-sm font-semibold hover:opacity-90 hover:-translate-y-px transition-all duration-200 shadow-lg shadow-violet-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 flex-shrink-0"
                >
                  {heroLoading ? <span className="spinner" /> : <><FiZap size={13} /> Shorten</>}
                </button>
              </form>
            )}
          </div>

          {/* CTAs */}
          <div className="flex items-center justify-center gap-3 mt-7 flex-wrap animate-fade-up delay-4">
            {user ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-violet-600 to-indigo-500 text-white font-semibold hover:opacity-90 hover:-translate-y-px transition-all duration-200 shadow-xl shadow-violet-500/25"
              >
                <FiBarChart2 size={16} /> Open Dashboard <FiArrowRight size={14} />
              </Link>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-violet-600 to-indigo-500 text-white font-semibold hover:opacity-90 hover:-translate-y-px transition-all duration-200 shadow-xl shadow-violet-500/25"
                >
                  Start For Free <FiArrowRight size={14} />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.05] border border-white/[0.09] text-slate-300 font-medium hover:bg-white/[0.08] hover:border-white/[0.14] transition-all duration-200"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Stats Strip ───────────────────────────────────────── */}
      {user && (
        <section className="border-y border-white/[0.06] bg-[#0c0e16]/60">
          <div className="max-w-4xl mx-auto px-5 py-12 grid gap-8 grid-cols-1 divide-y md:divide-y-0 md:divide-x divide-white/[0.06] md:grid-cols-3">
            <StatCounter value={publicStats.totalClicks} label="Total clicks tracked" suffix="+" />
            <StatCounter value={publicStats.totalUrls}  label="Links shortened" suffix="+" />
            <StatCounter value={99} label="Uptime guarantee" suffix="%" />
          </div>
        </section>
      )}

      {/* ── About Section ────────────────────────────────────────── */}
      <section id="about-section" className="py-24 border-t border-white/[0.06] bg-[#0c0e16]/20">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-left animate-fade-up">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/[0.10] border border-violet-500/[0.20] text-violet-300 text-xs font-semibold mb-5">
                What is LinkPulse?
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tighter mb-6 leading-tight">
                Simplify your links, secure your contents, and <span className="gradient-text drop-shadow-[0_0_20px_rgba(167,139,250,0.4)]">track your audience.</span>
              </h2>
              <p className="desc-text text-sm leading-relaxed mb-5 text-justify">
                In today's digital landscape, how you share information defines your brand's authority. LinkPulse elevates your digital presence by transforming complex, query-heavy URLs into elegant, high-converting short links.
              </p>
              <p className="desc-text text-sm leading-relaxed mb-5 text-justify">
                Our sophisticated engine does more than compress web addresses; it acts as a gateway to your audience. Secure confidential content with encrypted password gates, define campaign lifespans with automated link expiration redirects, and gain deep business intelligence through advanced, real-time analytics dashboards. Whether you are scaling client communications, orchestrating multi-channel marketing campaigns, or safeguarding exclusive portals, LinkPulse delivers enterprise-grade utility with seamless execution.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl glass-panel hover-glow transition-all duration-300 text-left flex flex-col justify-center">
                <h4 className="font-extrabold text-violet-400 text-lg mb-2 tracking-tight">Make Clean Links</h4>
                <p className="desc-text text-[13px] sm:text-sm leading-relaxed">Turn ugly, long URLs into elegant, branded, and clickable short links in just one click.</p>
              </div>
              <div className="p-6 rounded-2xl glass-panel hover-glow transition-all duration-300 text-left flex flex-col justify-center">
                <h4 className="font-extrabold text-pink-400 text-lg mb-2 tracking-tight">Instant Analytics</h4>
                <p className="desc-text text-[13px] sm:text-sm leading-relaxed">See where your visitors are coming from, what devices they use, and when they clicked.</p>
              </div>
              <div className="p-6 rounded-2xl glass-panel hover-glow transition-all duration-300 text-left col-span-2 flex flex-col justify-center">
                <h4 className="font-extrabold text-emerald-400 text-lg mb-2 tracking-tight">Control Redirections</h4>
                <p className="desc-text text-[13px] sm:text-sm leading-relaxed">Secure links with passwords, set them to expire automatically after a set date, or redirect users to a custom page after expiration.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Services & Features ─────────────────────────────────── */}
      <section id="services-section" className="py-24 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/[0.10] border border-violet-500/[0.20] text-violet-300 text-xs font-semibold mb-5">
              Features List
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tighter mb-4">
              Services & Premium <span className="gradient-text drop-shadow-[0_0_20px_rgba(167,139,250,0.4)]">Features</span>
            </h2>
            <p className="desc-text text-base max-w-md mx-auto">
              Everything you need to successfully manage, shorten, secure, and grow your digital reach.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="group p-6 rounded-2xl glass-panel hover-glow transition-all duration-300 animate-fade-up hover:-translate-y-1"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className={`w-11 h-11 rounded-xl bg-linear-to-br ${f.gradient} flex items-center justify-center text-white mb-5 shadow-lg ${f.glow} group-hover:scale-105 transition-transform duration-200`}>
                  {f.icon}
                </div>
                <h3 className="text-slate-200 font-extrabold text-lg mb-2">{f.title}</h3>
                <p className="desc-text text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How to Use Section ────────────────────────────────────── */}
      <section id="how-to-use-section" className="py-24 border-t border-white/[0.06] bg-[#0c0e16]/20">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 text-center">
          <div className="mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/[0.10] border border-violet-500/[0.20] text-violet-300 text-xs font-semibold mb-5">
              Getting Started
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tighter mb-4">
              How to Use <span className="gradient-text drop-shadow-[0_0_20px_rgba(167,139,250,0.4)]">LinkPulse</span>
            </h2>
            <p className="desc-text text-sm max-w-md mx-auto">
              Follow these simple step-by-step instructions to get the most out of your shortened links.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-10">
            {/* Step 1 */}
            <div className="flex flex-col items-center p-6 rounded-2xl glass-panel hover-glow transition-all duration-300 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-linear-to-br from-violet-600 to-indigo-500 flex items-center justify-center text-white text-xs font-black shadow-[0_0_20px_rgba(124,58,237,0.5)]">
                1
              </div>
              <h3 className="font-extrabold text-slate-100 text-lg mt-4 mb-2">Create an Account</h3>
              <p className="desc-text text-[13px] sm:text-sm leading-relaxed text-center">
                Sign up free in seconds. Enter your username, email, and choose a secure password to unlock your customized dashboards.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center p-6 rounded-2xl glass-panel hover-glow transition-all duration-300 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-linear-to-br from-pink-600 to-rose-500 flex items-center justify-center text-white text-xs font-black shadow-[0_0_20px_rgba(236,72,153,0.5)]">
                2
              </div>
              <h3 className="font-extrabold text-slate-100 text-lg mt-4 mb-2">Shorten Your Links</h3>
              <p className="desc-text text-[13px] sm:text-sm leading-relaxed text-center">
                Paste your long Destination URL. Customize the link with your choice of Custom Aliases, Expiry Dates, and Access Passwords.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center p-6 rounded-2xl glass-panel hover-glow transition-all duration-300 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-linear-to-br from-emerald-600 to-teal-500 flex items-center justify-center text-white text-xs font-black shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                3
              </div>
              <h3 className="font-extrabold text-slate-100 text-lg mt-4 mb-2">Manage & Grow</h3>
              <p className="desc-text text-[13px] sm:text-sm leading-relaxed text-center">
                Share your short code. Access the analytics dashboard in real time to analyze click totals, device operating systems, and geolocations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA / Feature checklist ───────────────────────────── */}
      <section className="py-16 pb-28 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <div className="relative rounded-3xl glass-panel overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-violet-600/[0.15] blur-[80px] animate-pulse-glow" />
              <div className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full bg-pink-600/[0.1] blur-[60px] animate-pulse-glow" style={{ animationDelay: '1s' }} />
            </div>

            <div className="relative grid lg:grid-cols-2 gap-10 p-8 sm:p-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/[0.10] border border-violet-500/[0.20] text-violet-300 text-xs font-semibold mb-5">
                  All features included
                </div>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tighter mb-4 leading-tight">
                  All features included.{' '}
                  <span className="gradient-text drop-shadow-[0_0_20px_rgba(167,139,250,0.4)]">No limits.</span>
                </h2>
                <p className="desc-text text-sm leading-relaxed mb-7 max-w-sm">
                  LinkPulse comes fully loaded with every feature you need. Sign up for free and start creating powerful links today.
                </p>
                {user ? (
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-violet-600 to-indigo-500 text-white font-semibold hover:opacity-90 hover:-translate-y-px transition-all duration-250 shadow-lg shadow-violet-500/25"
                  >
                    Open Dashboard <FiArrowRight size={14} />
                  </Link>
                ) : (
                  <Link
                    to="/signup"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-violet-600 to-indigo-500 text-white font-semibold hover:opacity-90 hover:-translate-y-px transition-all duration-250 shadow-lg shadow-violet-500/25"
                  >
                    Create Free Account <FiArrowRight size={14} />
                  </Link>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {CHECKLIST.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.07] text-slate-300 text-sm font-medium"
                  >
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <FiCheck size={11} className="text-emerald-400" />
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] bg-[#0c0e16]/30 pt-14 pb-10">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">

          {/* Top grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">

            {/* Brand column */}
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="inline-flex items-center gap-2.5 no-underline group mb-4">
                <div className="w-8 h-8 rounded-xl bg-linear-to-br from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
                  <FiLink size={14} className="text-white" />
                </div>
                <span className="font-extrabold text-md tracking-tight text-slate-100">
                  Link<span className="gradient-text">Pulse</span>
                </span>
              </Link>
              <p className="desc-text text-xs leading-relaxed max-w-[200px]">
                Shorten, protect, and track your links with deep analytics and QR codes.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="desc-text text-xs font-black uppercase tracking-widest mb-4">Quick Links</h4>
              <ul className="flex flex-col gap-2.5">
                {[
                  { label: 'Sign In',   to: '/login' },
                  { label: 'Sign Up',   to: '/signup' },
                  { label: 'Dashboard', to: '/dashboard' },
                 
                ].map(l => (
                  <li key={l.to}>
                    <Link to={l.to} className="text-sm desc-text hover:text-slate-100 font-medium transition-colors no-underline">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Features */}
            <div>
              <h4 className="desc-text text-xs font-black uppercase tracking-widest mb-4">Features</h4>
              <ul className="flex flex-col gap-2.5">
                {[
                  { label: 'Instant Shortening', id: 'services-section' },
                  { label: 'Deep Analytics',      id: 'services-section' },
                  { label: 'QR Code Download',    id: 'services-section' },
                  { label: 'Bulk Shortening',     id: 'services-section' },
                  { label: 'Password Protected',  id: 'services-section' },
                  { label: 'AI Integration',      id: 'services-section' },
                ].map(f => (
                  <li key={f.label}>
                    <button
                      onClick={() => { const el = document.getElementById(f.id); if(el) el.scrollIntoView({ behavior: 'smooth' }); }}
                      className="text-sm desc-text hover:text-slate-100 font-medium transition-colors bg-transparent border-none cursor-pointer text-left p-0"
                    >
                      {f.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Learn */}
            <div>
              <h4 className="desc-text text-xs font-black uppercase tracking-widest mb-4">Learn</h4>
              <ul className="flex flex-col gap-2.5">
                {[
                  { label: 'About LinkPulse',    id: 'about-section' },
                  { label: 'How to Use',          id: 'how-to-use-section' },
                  { label: 'Services',            id: 'services-section' },
                  { label: 'Get Started',         to: '/signup' },
                ].map(l => (
                  <li key={l.label}>
                    {l.to ? (
                      <Link to={l.to} className="text-sm desc-text hover:text-slate-100 font-medium transition-colors no-underline">{l.label}</Link>
                    ) : (
                      <button
                        onClick={() => { const el = document.getElementById(l.id); if(el) el.scrollIntoView({ behavior: 'smooth' }); }}
                        className="text-sm desc-text hover:text-slate-100 font-medium transition-colors bg-transparent border-none cursor-pointer text-left p-0"
                      >
                        {l.label}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/[0.06] pt-8 flex flex-col items-center justify-center gap-3.5">
            <div className="w-[34px] h-[34px] rounded-xl bg-linear-to-br from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <FiLink size={15} className="text-white" />
            </div>
            <p className="desc-text text-xs text-center">© 2026 LinkPulse. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5 text-xs desc-text">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Service Online
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
