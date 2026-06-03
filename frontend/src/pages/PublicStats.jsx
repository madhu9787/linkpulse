import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { BACKEND_URL } from '../api';
import {
  FiArrowLeft, FiCopy, FiExternalLink, FiGlobe, FiCheck, FiLink,
  FiBarChart2, FiCalendar,
} from 'react-icons/fi';
import { format } from 'date-fns';
import {
  AreaChart, Area, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { QRCodeSVG } from 'qrcode.react';

/* ── Custom chart tooltip ─────────────────────────────────────── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-elevated border border-white/10 rounded-xl px-4 py-2.5 text-sm shadow-2xl">
      <p className="text-slate-400 text-xs mb-1">{label}</p>
      <p className="font-bold text-pink-300">{payload[0].value} click{payload[0].value !== 1 ? 's' : ''}</p>
    </div>
  );
};

/* ── Card ─────────────────────────────────────────────────────── */
const Card = ({ className = '', children }) => (
  <div className={`rounded-2xl bg-surface border border-white/7 ${className}`}>{children}</div>
);

/* ── PublicStats ──────────────────────────────────────────────── */
const PublicStats = () => {
  const { shortCode } = useParams();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied]   = useState(false);

  useEffect(() => {
    const fetchPublicStats = () => {
      fetch(`${BACKEND_URL}/api/analytics/public/${shortCode}`)
        .then(r => { if (!r.ok) throw new Error(); return r.json(); })
        .then(setData)
        .catch(() => setData(null))
        .finally(() => setLoading(false));
    };

    fetchPublicStats();
    const interval = setInterval(fetchPublicStats, 5000);
    return () => clearInterval(interval);
  }, [shortCode]);

  const safeCopy = async (text) => {
    try { if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(text); return true; } }
    catch { /* fall through */ }
    try {
      const el = Object.assign(document.createElement('textarea'), {
        value: text, style: 'position:fixed;opacity:0',
      });
      document.body.appendChild(el); el.select();
      const ok = document.execCommand('copy'); document.body.removeChild(el); return ok;
    } catch { return false; }
  };

  const copyLink = async () => {
    const ok = await safeCopy(`${BACKEND_URL}/${shortCode}`);
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000); }
    else toast.error('Copy failed — please copy manually');
  };

  /* ── Loading ────────────────────────────────────────────── */
  if (loading) return (
    <div className="max-w-5xl mx-auto px-5 sm:px-6 py-10 flex flex-col gap-4">
      <div className="shimmer h-36" />
      <div className="grid grid-cols-3 gap-3"><div className="shimmer h-24"/><div className="shimmer h-24"/><div className="shimmer h-24"/></div>
      <div className="shimmer h-64" />
    </div>
  );

  /* ── Not found ──────────────────────────────────────────── */
  if (!data) return (
    <div className="max-w-5xl mx-auto px-5 sm:px-6 py-28 text-center">
      <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-5">
        <FiLink size={28} className="text-violet-400" />
      </div>
      <h2 className="text-2xl font-black text-white mb-2">Link Not Found</h2>
      <p className="text-slate-500 text-sm mb-7">This short link doesn't exist or has been removed.</p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-violet-600 to-indigo-500 text-white font-semibold text-sm hover:opacity-90 transition-all shadow-lg shadow-violet-500/20 no-underline"
      >
        Go to LinkPulse
      </Link>
    </div>
  );

  const { url, recentClicks, chartData } = data;
  const shortUrl = `${BACKEND_URL}/${url.shortCode}`;

  /* Location breakdown - country only (excluding Local and Unknown) */
  const locationCounts = recentClicks.reduce((acc, c) => {
    if (c.country && c.country !== 'Unknown' && c.country !== 'Local') {
      acc[c.country] = (acc[c.country] || 0) + 1;
    }
    return acc;
  }, {});
  const topLocations = Object.entries(locationCounts).sort((a,b) => b[1]-a[1]).slice(0, 6);
  const totalSample  = recentClicks.length || 1;

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-6 py-8 pb-16">

      {/* ── Public badge row ──────────────────────────────── */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <Link to="/" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm transition-colors no-underline">
          <FiArrowLeft size={14} /> LinkPulse
        </Link>
        <span className="text-slate-700">·</span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <FiGlobe size={11} /> Public Stats
        </span>
        <span className="text-slate-600 text-xs">Anyone with this link can view these statistics</span>
      </div>

      {/* ── Header card ───────────────────────────────────── */}
      <Card className="p-6 mb-4 relative overflow-hidden animate-fade-up">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-16 right-0 w-64 h-64 rounded-full bg-pink-600/6 blur-[60px]" />
        </div>
        <div className="relative">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
            <span className="gradient-text">/{url.shortCode}</span>
          </h1>
          <p className="text-slate-500 text-sm mb-4 break-all max-w-lg">{url.originalUrl}</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={copyLink}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/9 text-slate-300 text-sm font-medium hover:bg-white/8 hover:border-white/14 transition-all duration-200"
            >
              {copied ? <><FiCheck size={13} className="text-emerald-400" /> Copied!</> : <><FiCopy size={13} /> Copy Short Link</>}
            </button>
            <a
              href={shortUrl} target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-linear-to-r from-violet-600 to-indigo-500 text-white text-sm font-semibold hover:opacity-90 hover:-translate-y-px transition-all duration-200 shadow-lg shadow-violet-500/20 no-underline"
            >
              <FiExternalLink size={13} /> Visit Link
            </a>
          </div>
        </div>
      </Card>

      {/* ── Stats row ─────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 mb-4 animate-fade-up delay-1">
        {[
          { label: 'Total Clicks', value: url.clickCount,  color: 'text-violet-400',  icon: <FiBarChart2 size={14} /> },
          { label: 'Last Visited', value: url.lastVisited ? format(new Date(url.lastVisited), 'MMM d, yyyy') : 'Never', color: 'text-pink-400', icon: <FiCalendar size={14} /> },
          { label: 'Created',      value: format(new Date(url.createdAt), 'MMM d, yyyy'), color: 'text-emerald-400', icon: <FiCalendar size={14} /> },
        ].map((s, i) => (
          <Card key={i} className="p-4 sm:p-5">
            <div className={`flex items-center gap-1.5 text-xs font-semibold mb-2 ${s.color}`}>
              {s.icon} {s.label}
            </div>
            <div className={`text-xl sm:text-2xl font-black ${s.color} tabular-nums`}>{s.value}</div>
          </Card>
        ))}
      </div>

      {/* ── Content grid ──────────────────────────────────── */}
      <div className="grid lg:grid-cols-[1fr_260px] gap-4">

        {/* Left */}
        <div className="flex flex-col gap-4">

          {/* Click trend chart */}
          <Card className="p-6 animate-fade-up delay-2">
            <h3 className="font-bold text-slate-200 mb-0.5">Click Trends</h3>
            <p className="text-slate-500 text-xs mb-5">Last 7 days</p>
            {chartData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-slate-600 text-sm">No clicks in the last 7 days</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
                  <defs>
                    <linearGradient id="pubGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#ec4899" stopOpacity={0.28} />
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="_id" stroke="#475569" tick={{ fontSize: 11, fontFamily: 'Plus Jakarta Sans' }} />
                  <YAxis stroke="#475569" tick={{ fontSize: 11, fontFamily: 'Plus Jakarta Sans' }} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone" dataKey="clicks" stroke="#ec4899" strokeWidth={2.5}
                    fill="url(#pubGrad)" dot={{ fill: '#ec4899', r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: '#f472b6', strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* Visitor locations */}
          {topLocations.length > 0 && (
            <Card className="p-6 animate-fade-up delay-3">
              <h3 className="font-bold text-slate-200 text-sm mb-4">Visitor Locations</h3>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={topLocations.slice(0,5).map(([name, value]) => ({ name, value }))} margin={{ top: 0, right: 0, bottom: 0, left: -28 }} barSize={12}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal vertical={false} />
                  <XAxis dataKey="name" stroke="#475569" tick={{ fontSize: 10, fontFamily: 'Plus Jakarta Sans' }} />
                  <YAxis stroke="#475569" tick={{ fontSize: 10, fontFamily: 'Plus Jakarta Sans' }} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                  <Bar dataKey="value" radius={[4,4,0,0]}>
                    {topLocations.slice(0,5).map(([name], i) => <Cell key={i} fill={['#7c3aed', '#ec4899', '#06b6d4', '#10b981', '#f59e0b'][i % 5]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-3 mt-5">
                {topLocations.map(([location, count]) => {
                  const pct = Math.round((count / totalSample) * 100);
                  return (
                    <div key={location} className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">{location}</span>
                        <span className="font-semibold text-slate-200">{count} <span className="text-slate-600">({pct}%)</span></span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/6 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-linear-to-r from-pink-500 to-violet-500 transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>

        {/* Right */}
        <div className="flex flex-col gap-4">

          {/* QR Code */}
          <Card className="p-5 text-center animate-fade-up delay-2">
            <h3 className="font-bold text-slate-200 text-sm mb-4">QR Code</h3>
            <div className="inline-block p-4 rounded-2xl bg-white shadow-2xl shadow-black/40 mb-3">
              <QRCodeSVG value={shortUrl} size={128} level="H" />
            </div>
            <p className="text-xs text-slate-600">Scan to visit</p>
          </Card>

          {/* Branding / CTA */}
          <Card className="p-5 text-center animate-fade-up delay-3">
            <p className="text-slate-600 text-xs mb-3">Powered by</p>
            <Link to="/" className="no-underline">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-linear-to-br from-violet-600 to-indigo-500 flex items-center justify-center">
                  <FiLink size={12} className="text-white" />
                </div>
                <span className="font-extrabold text-base tracking-tight text-slate-100">
                  Link<span className="gradient-text">Pulse</span>
                </span>
              </div>
            </Link>
            <p className="text-slate-600 text-xs mb-4">Create your own short links — free forever.</p>
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-linear-to-r from-violet-600 to-indigo-500 text-white text-sm font-semibold hover:opacity-90 hover:-translate-y-px transition-all duration-200 shadow-lg shadow-violet-500/20 no-underline"
            >
              Get Started Free
            </Link>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default PublicStats;
