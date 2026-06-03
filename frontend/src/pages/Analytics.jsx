import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api, { BACKEND_URL } from '../api';
import {
  FiArrowLeft, FiCopy, FiExternalLink, FiShare2,
  FiMonitor, FiSmartphone, FiTablet, FiCheck,
  FiClock, FiCalendar, FiGlobe, FiMapPin, FiActivity
} from 'react-icons/fi';
import { format, formatDistanceToNow } from 'date-fns';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { QRCodeCanvas } from 'qrcode.react';

/* ── helpers ──────────────────────────────────────────────────── */
const parseBrowser = (ua = '') => {
  if (ua.includes('Edg/'))    return 'Edge';
  if (ua.includes('Chrome'))  return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari'))  return 'Safari';
  if (ua.includes('OPR') || ua.includes('Opera')) return 'Opera';
  return 'Other';
};
const parseDevice = (ua = '') => {
  if (/mobile/i.test(ua))      return 'Mobile';
  if (/tablet|ipad/i.test(ua)) return 'Tablet';
  return 'Desktop';
};

const DEVICE_ICONS = { Mobile: <FiSmartphone size={12} />, Tablet: <FiTablet size={12} />, Desktop: <FiMonitor size={12} /> };
const BROWSER_COLORS = { Chrome: '#4285F4', Firefox: '#FF7139', Safari: '#006CFF', Edge: '#0078D4', Opera: '#FF1B2D', Other: '#64748b' };
const PIE_COLORS = ['#7c3aed', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#6366f1'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-elevated px-3 py-2 text-xs" style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
      <p className="text-slate-500 mb-1">{label}</p>
      <p className="font-bold text-violet-400">{payload[0].value} click{payload[0].value !== 1 ? 's' : ''}</p>
    </div>
  );
};

const BreakdownBar = ({ label, count, total, color, icon }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1.5">
        <span className="flex items-center gap-1.5 text-slate-400">{icon}{label}</span>
        <span className="font-semibold text-slate-200">{count} <span className="text-slate-600">({pct}%)</span></span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden bg-white/5">
        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
};

/* ── ANALYTICS ────────────────────────────────────────────────── */
const Analytics = () => {
  const { id } = useParams();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied]   = useState(false);

  useEffect(() => {
    const fetchAnalytics = () => {
      api.get(`/analytics/${id}`)
        .then(res => setData(res.data))
        .catch(() => setData(null))
        .finally(() => setLoading(false));
    };

    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 5000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2.5rem 1.5rem 4rem' }}>
      <div className="flex flex-col gap-4">
        {[120, 260, 200].map((h, i) => (
          <div key={i} className="shimmer" style={{ height: h }} />
        ))}
      </div>
    </div>
  );

  if (!data) return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '6rem 1.5rem 4rem' }} className="flex flex-col items-center justify-center text-center">
      <div className="text-5xl mb-4">🔗</div>
      <h2 className="text-xl font-black text-white mb-2">URL not found</h2>
      <p className="text-slate-500 text-sm mb-6">This analytics page doesn't exist or was removed.</p>
      <Link to="/dashboard" className="inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-linear-to-r from-violet-600 to-indigo-500 text-white text-sm font-semibold">
        Back to Dashboard
      </Link>
    </div>
  );

  const { url, recentClicks, chartData } = data;
  const shortUrl       = `${BACKEND_URL}/${url.shortCode}`;
  const publicStatsUrl = `${window.location.origin}/stats/${url.shortCode}`;

  /* compute breakdowns */
  const browserMap = {};
  const deviceMap  = {};
  const countryMap = {};
  recentClicks.forEach(c => {
    const b = parseBrowser(c.userAgent); browserMap[b] = (browserMap[b] || 0) + 1;
    const d = parseDevice(c.userAgent);  deviceMap[d]  = (deviceMap[d]  || 0) + 1;
    if (c.country && c.country !== 'Unknown' && c.country !== 'Local')
      countryMap[c.country] = (countryMap[c.country] || 0) + 1;
  });
  const total = recentClicks.length || 1;
  const devicePie = Object.entries(deviceMap).map(([name, value], i) => ({ name, value, color: PIE_COLORS[i] }));
  const browserBars = Object.entries(browserMap).sort((a,b) => b[1]-a[1]);

  const safeCopy = async (text) => {
    try { if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(text); return true; } } catch {}
    try {
      const ta = Object.assign(document.createElement('textarea'), { value: text });
      ta.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(ta); ta.select();
      const ok = document.execCommand('copy'); document.body.removeChild(ta); return ok;
    } catch { return false; }
  };

  const copyLink = async () => {
    if (await safeCopy(shortUrl)) { setCopied(true); toast.success('Copied!'); setTimeout(() => setCopied(false), 2000); }
    else toast.error('Unable to copy.');
  };
  const copyStats = async () => {
    if (await safeCopy(publicStatsUrl)) toast.success('Public stats link copied!');
    else toast.error('Unable to copy.');
  };

  const downloadQRCode = () => {
    const canvas = document.getElementById('qr-canvas');
    if (!canvas) return;
    const pngUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = pngUrl;
    link.download = `qr-code-${url.shortCode}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR Code downloaded!');
  };

  return (
    <div style={{ paddingBottom: '5rem' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Back */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-violet-400 no-underline transition-colors mb-6"
        >
          <FiArrowLeft size={14} /> Back to Dashboard
        </Link>

        {/* Header */}
        <div
          className="animate-fade-up rounded-2xl border border-violet-500/20 p-6 mb-5 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.10) 0%, rgba(99,102,241,0.05) 100%)', boxShadow: '0 4px 24px rgba(124,58,237,0.08)' }}
        >
          <div style={{ position: 'absolute', top: -40, right: -20, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div className="relative flex justify-between flex-wrap gap-5">
            <div className="min-w-0">
              <h1 className="font-black tracking-tight mb-2" style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', letterSpacing: '-0.03em' }}>
                <span className="gradient-text">/{url.shortCode}</span>
              </h1>
              <p className="text-slate-500 text-sm mb-4 break-all max-w-lg">{url.originalUrl}</p>
              <div className="flex gap-2 flex-wrap">
                <button onClick={copyLink} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl bg-white/5 border border-white/9 text-slate-300 text-xs font-semibold hover:bg-white/8 transition-all">
                  {copied ? <><FiCheck size={11} className="text-emerald-400" /> Copied!</> : <><FiCopy size={11} /> Copy Link</>}
                </button>
                <a href={shortUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl bg-white/5 border border-white/9 text-slate-300 text-xs font-semibold hover:bg-white/8 transition-all no-underline">
                  <FiExternalLink size={11} /> Visit Link
                </a>
                <button onClick={copyStats} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl bg-white/5 border border-white/9 text-slate-300 text-xs font-semibold hover:bg-white/8 transition-all">
                  <FiShare2 size={11} /> Share Stats
                </button>
              </div>
            </div>

            {/* Summary stats */}
            <div className="flex gap-6 flex-wrap">
              {[
                { label: 'Total Clicks', value: url.clickCount.toLocaleString(), color: '#a78bfa' },
                { label: 'Last Visited', value: url.lastVisited ? formatDistanceToNow(new Date(url.lastVisited), { addSuffix: true }) : 'Never', color: '#f472b6', small: true },
                { label: 'Created', value: format(new Date(url.createdAt), 'MMM d, yyyy'), color: '#34d399', small: true },
              ].map(s => (
                <div key={s.label}>
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-1">{s.label}</div>
                  <div className={`font-black leading-tight`} style={{ color: s.color, fontSize: s.small ? '1rem' : '1.75rem', letterSpacing: '-0.02em' }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)', gap: '1.25rem', minWidth: 0 }} className="analytics-main-grid">

          {/* LEFT */}
          <div className="flex flex-col gap-5">

            {/* Area chart */}
            <div className="animate-fade-up delay-1 rounded-2xl border border-white/7 bg-elevated p-5" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.35)' }}>
              <h3 className="font-bold text-sm text-white mb-0.5">Click Activity</h3>
              <p className="text-xs text-slate-500 mb-4">Last 7 days</p>
              {chartData.length === 0 ? (
                <div className="h-44 flex items-center justify-center text-slate-500 text-sm">No clicks in the last 7 days</div>
              ) : (
                <div style={{ width: '100%', minWidth: 0 }}>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={chartData} margin={{ top: 20, right: 5, bottom: 0, left: -20 }}>
                      <defs>
                        <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="_id" stroke="#1e2438" tick={{ fontSize: 11, fill: '#475569' }} />
                      <YAxis stroke="#1e2438" tick={{ fontSize: 11, fill: '#475569' }} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="clicks" stroke="#7c3aed" strokeWidth={2.5} fill="url(#aGrad)"
                        dot={{ fill: '#7c3aed', r: 4, strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: '#a78bfa', stroke: 'rgba(167,139,250,0.3)', strokeWidth: 6 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Device + Browser */}
            {recentClicks.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

                {/* Devices */}
                <div className="animate-fade-up delay-2 rounded-2xl border border-white/7 bg-elevated p-5" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.35)' }}>
                  <h3 className="font-bold text-sm text-white mb-4">Devices</h3>
                  {devicePie.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={140}>
                        <PieChart>
                          <Pie data={devicePie} cx="50%" cy="50%" innerRadius={38} outerRadius={60} paddingAngle={3} dataKey="value">
                            {devicePie.map((entry, i) => <Cell key={i} fill={entry.color} stroke="none" />)}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="mt-3">
                        {Object.entries(deviceMap).sort((a,b) => b[1]-a[1]).map(([dev, cnt], i) => (
                          <BreakdownBar key={dev} label={dev} count={cnt} total={total}
                            color={PIE_COLORS[i % PIE_COLORS.length]}
                            icon={DEVICE_ICONS[dev] || <FiMonitor size={12} />} />
                        ))}
                      </div>
                    </>
                  ) : <p className="text-slate-500 text-sm">No data yet.</p>}
                </div>

                {/* Browsers */}
                <div className="animate-fade-up delay-3 rounded-2xl border border-white/7 bg-elevated p-5" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.35)' }}>
                  <h3 className="font-bold text-sm text-white mb-4">Browsers</h3>
                  {browserBars.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={140}>
                        <BarChart data={browserBars.map(([name, value]) => ({ name, value }))} margin={{ top: 0, right: 0, bottom: 0, left: -28 }} barSize={12}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal vertical={false} />
                          <XAxis dataKey="name" stroke="#1e2438" tick={{ fontSize: 10, fill: '#475569' }} />
                          <YAxis stroke="#1e2438" tick={{ fontSize: 10, fill: '#475569' }} allowDecimals={false} />
                          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                          <Bar dataKey="value" radius={[4,4,0,0]}>
                            {browserBars.map(([name], i) => <Cell key={i} fill={BROWSER_COLORS[name] || '#64748b'} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                      <div className="mt-3">
                        {browserBars.map(([browser, cnt]) => (
                          <BreakdownBar key={browser} label={browser} count={cnt} total={total} color={BROWSER_COLORS[browser] || '#64748b'} />
                        ))}
                      </div>
                    </>
                  ) : <p className="text-slate-500 text-sm">No data yet.</p>}
                </div>
              </div>
            )}

            {/* Top Countries */}
            {Object.keys(countryMap).length > 0 && (
              <div className="animate-fade-up rounded-2xl border border-white/7 bg-elevated p-5" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.35)' }}>
                <h3 className="font-bold text-sm text-white mb-4">Top Countries</h3>
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={Object.entries(countryMap).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([name, value]) => ({ name, value }))} margin={{ top: 0, right: 0, bottom: 0, left: -28 }} barSize={12}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal vertical={false} />
                    <XAxis dataKey="name" stroke="#1e2438" tick={{ fontSize: 10, fill: '#475569' }} />
                    <YAxis stroke="#1e2438" tick={{ fontSize: 10, fill: '#475569' }} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                    <Bar dataKey="value" radius={[4,4,0,0]}>
                      {Object.entries(countryMap).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([name], i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4">
                  {Object.entries(countryMap).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([country, cnt]) => (
                    <BreakdownBar key={country} label={country} count={cnt} total={total} color="#ec4899" icon={<FiMapPin size={11} />} />
                  ))}
                </div>
              </div>
            )}

            {/* Recent Visits */}
            <div className="animate-fade-up rounded-2xl border border-white/7 bg-elevated p-5" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.35)' }}>
              <h3 className="font-bold text-sm text-white mb-4">Recent Visits</h3>
              {recentClicks.length === 0 ? (
                <p className="text-slate-500 text-sm">No visits recorded yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr>
                        {['Time', 'Location', 'Device', 'Browser'].map(h => (
                          <th key={h} className="text-left text-xs font-bold uppercase tracking-wider text-slate-600 pb-2 border-b border-white/5 pr-4">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {recentClicks.map(c => (
                        <tr key={c._id} className="border-b border-white/3 hover:bg-white/2 transition-colors">
                          <td className="py-2.5 pr-4 whitespace-nowrap">
                            <div className="text-xs font-semibold text-slate-200">{format(new Date(c.timestamp), 'MMM d, h:mm a')}</div>
                            <div className="text-xs text-slate-600">{formatDistanceToNow(new Date(c.timestamp), { addSuffix: true })}</div>
                          </td>
                          <td className="py-2.5 pr-4 text-xs text-slate-400">
                            {c.country && c.country !== 'Unknown' ? (
                              <span className="flex items-center gap-1.5">
                                {c.country}
                                {c.latitude && c.longitude && (
                                  <a
                                    href={`https://www.google.com/maps?q=${c.latitude},${c.longitude}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-violet-400 hover:text-violet-300 ml-1 inline-flex items-center"
                                    title={`Exact coordinates: ${c.latitude}, ${c.longitude}`}
                                  >
                                    <FiMapPin size={11} />
                                  </a>
                                )}
                              </span>
                            ) : (
                              <span className="text-slate-600">—</span>
                            )}
                          </td>
                          <td className="py-2.5 pr-4">
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-violet-400 bg-violet-500/10 border border-violet-500/20 rounded-full px-2 py-0.5">
                              {DEVICE_ICONS[parseDevice(c.userAgent)]} {parseDevice(c.userAgent)}
                            </span>
                          </td>
                          <td className="py-2.5 text-xs font-bold" style={{ color: BROWSER_COLORS[parseBrowser(c.userAgent)] || '#64748b' }}>
                            {parseBrowser(c.userAgent)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col gap-5">

            {/* QR Code */}
            <div className="animate-fade-up delay-1 rounded-2xl border border-white/7 bg-elevated p-5 flex flex-col items-center text-center gap-3" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.35)' }}>
              <h3 className="font-bold text-sm text-white self-start">QR Code</h3>
              <div className="bg-white p-3 rounded-xl" style={{ boxShadow: '0 0 0 1px rgba(124,58,237,0.2), 0 4px 16px rgba(0,0,0,0.4)' }}>
                <QRCodeCanvas id="qr-canvas" value={shortUrl} size={140} level="H" />
              </div>
              <button
                onClick={downloadQRCode}
                className="mt-1 flex items-center justify-center gap-1.5 h-8 px-4 rounded-xl bg-white/5 border border-white/9 text-slate-300 text-xs font-semibold hover:bg-white/8 hover:text-violet-400 hover:border-violet-500/30 transition-all cursor-pointer"
              >
                Download QR Code
              </button>
              <p className="text-xs text-slate-600">Scan to visit link</p>
            </div>

            {/* Share Public Stats */}
            <div
              className="animate-fade-up delay-2 rounded-2xl border border-violet-500/20 p-5 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.09) 0%, rgba(236,72,153,0.05) 100%)' }}
            >
              <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
              <h3 className="font-bold text-sm text-white mb-2 flex items-center gap-2 relative">
                <FiShare2 size={14} className="text-violet-400" /> Share Public Stats
              </h3>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed relative">
                Share live stats with anyone — no login required.
              </p>
              <button
                onClick={copyStats}
                className="w-full flex items-center justify-center gap-2 h-9 rounded-xl bg-linear-to-r from-violet-600 to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-violet-500/25 hover:opacity-90 transition-all relative"
              >
                <FiShare2 size={12} /> Copy Public Stats Link
              </button>
              <p className="text-xs text-slate-600 text-center mt-2 relative">No login required · Anyone can view</p>
            </div>

            {/* Link Details */}
            <div className="animate-fade-up delay-3 rounded-2xl border border-white/7 bg-elevated p-5" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.35)' }}>
              <h3 className="font-bold text-sm text-white mb-4">Link Details</h3>
              <div className="flex flex-col gap-3">
                {[
                  { label: 'Short Code',    value: url.shortCode,                                                         hi: true  },
                  { label: 'Total Clicks',  value: url.clickCount.toLocaleString(),                                       hi: true  },
                  { label: 'Last Visited',  value: url.lastVisited ? formatDistanceToNow(new Date(url.lastVisited), { addSuffix: true }) : 'Never' },
                  { label: 'Created',       value: format(new Date(url.createdAt), 'MMM d, yyyy, h:mm a')                            },
                  { label: 'Expires',       value: url.expiresAt ? format(new Date(url.expiresAt), 'MMM d, yyyy') : 'Never'         },
                ].map(({ label, value, hi }) => (
                  <div key={label} className="flex justify-between gap-4 items-start">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex-shrink-0 pt-px">{label}</span>
                    <span className={`text-sm text-right break-all ${hi ? 'font-bold text-violet-400' : 'text-slate-400'}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
