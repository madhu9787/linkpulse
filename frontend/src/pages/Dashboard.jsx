import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { Link, useLocation } from 'react-router-dom';
import api, { BACKEND_URL } from '../api';
import { QRCodeSVG } from 'qrcode.react';
import {
  FiPlus, FiCopy, FiTrash2, FiExternalLink, FiBarChart2, FiCalendar,
  FiEdit2, FiUploadCloud, FiList, FiGlobe, FiCheck, FiLink,
  FiClock, FiAlertCircle, FiSearch, FiX, FiZap, FiDownload, FiShield, FiStar
} from 'react-icons/fi';
import {
  FaStar, FaCopy, FaChartBar, FaGlobe, FaPen, FaExternalLinkAlt, FaTrash, FaCheck
} from 'react-icons/fa';
import { format, formatDistanceToNow } from 'date-fns';

const Dashboard = () => {
  const location = useLocation();
  const [urls, setUrls] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('single');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [listFilter, setListFilter] = useState(location.state?.filter || 'all'); // 'all', 'favorites', 'featured'
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    if (location.state?.filter) {
      setListFilter(location.state.filter);
    }
  }, [location.state]);

  // Single form
  const [formData, setFormData] = useState({ originalUrl: '', customAlias: '', expiresAt: '', password: '', fallbackUrl: '' });
  const [creating, setCreating] = useState(false);
  const [createdUrlData, setCreatedUrlData] = useState(null);

  // Bulk
  const [bulkInput, setBulkInput] = useState('');
  const [bulkCreating, setBulkCreating] = useState(false);

  // Edit
  const [editingUrl, setEditingUrl] = useState(null);
  const [editFormData, setEditFormData] = useState({ originalUrl: '', expiresAt: '', password: '', fallbackUrl: '' });
  const [editing, setEditing] = useState(false);

  const toggleFavorite = async (id) => {
    try {
      const res = await api.post(`/urls/${id}/favorite`);
      toast.success(res.data.isFavorite ? 'Added to Favorites!' : 'Removed from Favorites!');
      setUrls(prev => prev.map(u => u._id === id ? { ...u, isFavorite: res.data.isFavorite } : u));
    } catch {
      toast.error('Failed to update favorite status');
    }
  };

  useEffect(() => {
    fetchUrls();
    const interval = setInterval(fetchUrls, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let result = urls;
    if (listFilter === 'favorites') {
      result = result.filter(u => u.isFavorite);
    } else if (listFilter === 'featured') {
      result = result.filter(u => u.clickCount >= 5);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(u =>
        String(u.shortCode || '').toLowerCase().includes(q) ||
        String(u.originalUrl || '').toLowerCase().includes(q)
      );
    }

    result = [...result].sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'clicks') return b.clickCount - a.clickCount;
      if (sortBy === 'clicks-asc') return a.clickCount - b.clickCount;
      return 0;
    });

    setFiltered(result);
  }, [search, urls, listFilter, sortBy]);

  const fetchUrls = async () => {
    try {
      const res = await api.get('/urls/my-urls');
      setUrls(res.data);
      setFiltered(res.data);
    } catch { toast.error('Failed to load your links'); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await api.post('/urls/shorten', formData);
      if (res.data.isDuplicate) {
        toast.success(res.data.message);
      } else {
        toast.success('Link shortened successfully!');
      }
      setCreatedUrlData(res.data);
      setFormData({ originalUrl: '', customAlias: '', expiresAt: '', password: '', fallbackUrl: '' });
      fetchUrls();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to shorten URL');
    } finally { setCreating(false); }
  };

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => { setBulkInput(evt.target.result); toast.success('CSV loaded!'); };
    reader.readAsText(file);
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    const lines = bulkInput.split('\n');
    const parsedUrls = lines.reduce((acc, line) => {
      line = line.trim();
      if (!line) return acc;
      const [originalUrl, customAlias = '', expiresAt = ''] = line.split(',').map(s => s.trim());
      if (originalUrl) acc.push({ originalUrl, customAlias, expiresAt });
      return acc;
    }, []);

    if (!parsedUrls.length) { toast.error('No valid URLs found'); return; }
    setBulkCreating(true);
    try {
      const res = await api.post('/urls/bulk', { urls: parsedUrls });
      const { results, errors, duplicates } = res.data;
      if (results.length) toast.success(`Created ${results.length} new URL${results.length > 1 ? 's' : ''}!`);
      if (duplicates && duplicates.length) toast(`${duplicates.length} URL${duplicates.length > 1 ? 's' : ''} already exist${duplicates.length > 1 ? '' : 's'}`, { icon: 'ℹ️' });
      if (errors.length) toast.error(`${errors.length} failed. ${errors[0].error}`);
      setShowModal(false); setBulkInput(''); fetchUrls();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bulk shortening failed');
    } finally { setBulkCreating(false); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setEditing(true);
    try {
      await api.put(`/urls/${editingUrl._id}`, editFormData);
      toast.success('Link updated!');
      setEditingUrl(null);
      fetchUrls();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setEditing(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this link permanently?')) return;
    try {
      await api.delete(`/urls/${id}`);
      toast.success('Link deleted');
      setUrls(u => u.filter(x => x._id !== id));
    } catch { toast.error('Delete failed'); }
  };

  const safeCopyToClipboard = async (text) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (err) {
      console.error('Clipboard API failed:', err);
    }
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    } catch (err) {
      console.error('Fallback copy failed:', err);
      return false;
    }
  };

  const copyLink = async (code) => {
    const copied = await safeCopyToClipboard(`${BACKEND_URL}/${code}`);
    if (copied) {
      setCopiedId(code);
      toast.success('Copied!');
      setTimeout(() => setCopiedId(null), 2000);
    } else {
      toast.error('Unable to copy link. Please copy manually.');
    }
  };

  const copyStats = async (code) => {
    const copied = await safeCopyToClipboard(`${window.location.origin}/stats/${code}`);
    if (copied) {
      toast.success('Public stats link copied!');
    } else {
      toast.error('Unable to copy stats link. Please copy manually.');
    }
  };

  const isExpired = (url) => url.expiresAt && new Date() > new Date(url.expiresAt);

  const exportAsCSV = () => {
    if (urls.length === 0) {
      toast.error('No links to export');
      return;
    }

    const headers = ['Short Code', 'Original URL', 'Short URL', 'Created Date', 'Clicks', 'Last Visited', 'Status'];
    const rows = urls.map(url => [
      url.shortCode,
      url.originalUrl,
      `${BACKEND_URL}/${url.shortCode}`,
      format(new Date(url.createdAt), 'MMM d, yyyy h:mm a'),
      url.clickCount,
      url.lastVisited ? format(new Date(url.lastVisited), 'MMM d, yyyy h:mm a') : 'Never',
      isExpired(url) ? 'Expired' : 'Active',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `url-shortener-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Links exported successfully!');
  };

  const totalClicks = urls.reduce((sum, u) => sum + u.clickCount, 0);
  const activeLinks = urls.filter(u => !isExpired(u)).length;
  const expiredLinks = urls.filter(u => isExpired(u)).length;
  const avgClicksPerLink = urls.length > 0 ? Math.round(totalClicks / urls.length) : 0;

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>

      {/* ── Header ── */}
      <div className="animate-fade-up" style={{ marginBottom: '2rem' }}>
        <h1 className="text-2xl font-black tracking-tight text-white mb-1">My Dashboard</h1>
        <p className="desc-text text-sm">Manage, track, and optimize all your shortened links.</p>
      </div>

      {/* ── Stats Bar ── */}
      <div
        className="animate-fade-up delay-1"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '2rem' }}
      >
        {[
          { label: 'Total Links',   value: urls.length,                                 color: '#a78bfa' },
          { label: 'Clicks (Used)', value: totalClicks.toLocaleString(),                 color: '#f472b6' },
          { label: 'Favorites',     value: urls.filter(u => u.isFavorite).length,       color: '#fbbf24' },
          { label: 'Featured',      value: urls.filter(u => u.clickCount >= 5).length,  color: '#60a5fa' },
          { label: 'Active Links',  value: activeLinks,                                 color: '#34d399' },
        ].map((s, i) => (
          <div
            key={i}
            className="rounded-2xl border border-white/7 glass-panel p-4 cursor-default transition-all duration-300 hover:-translate-y-1 hover:border-white/15 hover:shadow-2xl"
            style={{ boxShadow: `0 8px 30px -10px ${s.color}30` }}
          >
            <div className="text-2xl font-black leading-none mb-1" style={{ color: s.color, letterSpacing: '-0.03em' }}>{s.value}</div>
            <div className="text-xs font-semibold uppercase tracking-widest text-slate-600">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div
        className="animate-fade-up delay-2"
        style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}
      >
        {/* Search */}
        <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
          <FiSearch size={14} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#475569', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search links…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-4 rounded-xl bg-white/4 border border-white/9 text-slate-100 text-sm placeholder:text-slate-600 outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all duration-200"
          />
        </div>
        <button
          className="flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-linear-to-r from-violet-600 to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-violet-500/25 hover:opacity-90 hover:-translate-y-px active:translate-y-0 transition-all duration-150"
          onClick={() => { setActiveTab('single'); setCreatedUrlData(null); setShowModal(true); }}
        >
          <FiPlus size={14} /> New Link
        </button>
        <button
          className="flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-white/5 border border-white/9 text-slate-300 text-sm font-semibold hover:bg-white/8 hover:border-white/14 transition-all duration-150"
          onClick={() => { setActiveTab('bulk'); setShowModal(true); }}
        >
          <FiUploadCloud size={14} /> <span className="hidden sm:inline">Bulk</span>
        </button>
        <button
          className="flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-white/5 border border-white/9 text-slate-300 text-sm font-semibold hover:bg-white/8 hover:border-white/14 transition-all duration-150"
          onClick={exportAsCSV}
        >
          <FiDownload size={14} /> <span className="hidden sm:inline">Export</span>
        </button>
      </div>

      {/* ── List Filters & Sort ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5 animate-fade-up delay-2">
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'All Links', count: urls.length },
            { key: 'favorites', label: 'Favorites', count: urls.filter(u => u.isFavorite).length },
            { key: 'featured', label: 'Featured Links', count: urls.filter(u => u.clickCount >= 5).length },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setListFilter(tab.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                listFilter === tab.key
                  ? 'bg-violet-600/20 border-violet-500/30 text-violet-300'
                  : 'bg-white/4 border-white/7 text-slate-400 hover:bg-white/8 hover:text-slate-200'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          <span className="desc-text text-xs font-bold uppercase tracking-wider hidden sm:inline-block">Sort:</span>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-9 px-3 rounded-xl bg-white/4 border border-white/9 text-slate-200 text-sm outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all cursor-pointer"
          >
            <option value="newest" className="bg-slate-900">Newest First</option>
            <option value="oldest" className="bg-slate-900">Oldest First</option>
            <option value="clicks" className="bg-slate-900">Most Clicks</option>
            <option value="clicks-asc" className="bg-slate-900">Least Clicks</option>
          </select>
        </div>
      </div>

      {/* ── URL List ── */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="shimmer" style={{ height: '88px' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="animate-fade-in rounded-2xl border border-white/7 glass-panel p-16 flex flex-col items-center gap-3 text-center shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <FiLink size={24} />
          </div>
          <div>
            <p className="font-bold text-white mb-1">{search ? 'No links match your search' : 'No links yet'}</p>
            <p className="desc-text text-sm">
              {search ? 'Try a different search term.' : 'Create your first shortened link to get started.'}
            </p>
          </div>
          {!search && (
            <button
              className="flex items-center gap-1.5 h-9 px-4 mt-1 rounded-xl bg-linear-to-r from-violet-600 to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-violet-500/25 hover:opacity-90 transition-all duration-150"
              onClick={() => { setActiveTab('single'); setCreatedUrlData(null); setShowModal(true); }}
            >
              <FiPlus size={14} /> Create your first link
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {filtered.map((url, idx) => {
            const expired = isExpired(url);
            const shortUrl = `${BACKEND_URL}/${url.shortCode}`;
            return (
              <div
                key={url._id}
                className="url-card-accent animate-fade-up rounded-2xl border border-white/7 glass-panel px-5 py-4 transition-all duration-300 hover:border-violet-500/30 hover:bg-white/[0.05] hover:shadow-[0_0_25px_rgba(124,58,237,0.15)]"
                style={{ animationDelay: `${idx * 0.04}s` }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: '220px' }}>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <a
                        href={shortUrl} target="_blank" rel="noreferrer"
                        className="font-bold text-violet-400 hover:text-violet-300 no-underline transition-colors"
                        style={{ fontSize: '1rem', letterSpacing: '-0.01em' }}
                      >
                        {url.shortCode}
                      </a>
                      {expired ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20">
                          <FiAlertCircle size={9} /> Expired
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Active
                        </span>
                      )}
                      {url.password && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-violet-500/10 text-violet-400 border border-violet-500/20" title="Password Protected Link">
                          <FiShield size={9} /> Secured
                        </span>
                      )}
                      {url.clickCount >= 5 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20" title="Highly clicked link">
                          <FiZap size={9} /> Featured
                        </span>
                      )}
                      {url.expiresAt && !expired && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <FiClock size={9} /> {formatDistanceToNow(new Date(url.expiresAt), { addSuffix: true })}
                        </span>
                      )}
                    </div>

                    <p
                      className="desc-text text-sm mb-2 truncate"
                      style={{ maxWidth: 480 }}
                      title={url.originalUrl}
                    >
                      {url.originalUrl}
                    </p>

                    <div className="flex gap-4 text-xs text-slate-600 flex-wrap">
                      <span className="flex items-center gap-1.5">
                        <FiCalendar size={13} /> {format(new Date(url.createdAt), 'MMM d, yyyy')}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <FiBarChart2 size={13} />
                        <strong style={{ color: url.clickCount > 0 ? '#818cf8' : '#475569' }}>
                          {url.clickCount}
                        </strong> click{url.clickCount !== 1 ? 's' : ''}
                      </span>
                      {url.lastVisited && (
                        <span className="flex items-center gap-1.5">
                          <FiClock size={13} /> {formatDistanceToNow(new Date(url.lastVisited), { addSuffix: true })}
                        </span>
                      )}
                      {url.fallbackUrl && (
                        <span className="flex items-center gap-1.5 desc-text">
                          <FiExternalLink size={13} /> Expiry redirects to: <code className="text-violet-400 bg-white/2 px-1 rounded">{url.fallbackUrl}</code>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0 flex-wrap">
                    {[
                      {
                        onClick: () => toggleFavorite(url._id),
                        tip: url.isFavorite ? 'Remove from Favorites' : 'Add to Favorites',
                        icon: <FaStar size={14} />,
                        type: 'favorite',
                        active: url.isFavorite,
                      },
                      {
                        onClick: () => copyLink(url.shortCode),
                        tip: 'Copy link',
                        icon: copiedId === url.shortCode ? <FaCheck size={14} /> : <FaCopy size={14} />,
                        type: 'copy',
                        active: copiedId === url.shortCode,
                      },
                      { as: 'link', to: `/analytics/${url._id}`, tip: 'Analytics', icon: <FaChartBar size={14} />, type: 'analytics' },
                      { onClick: () => copyStats(url.shortCode), tip: 'Share stats', icon: <FaGlobe size={14} />, type: 'share' },
                      {
                        onClick: () => {
                          setEditingUrl(url);
                          setEditFormData({
                            originalUrl: url.originalUrl,
                            expiresAt: url.expiresAt ? new Date(url.expiresAt).toISOString().split('T')[0] : '',
                            password: url.password || '',
                            fallbackUrl: url.fallbackUrl || ''
                          });
                        },
                        tip: 'Edit',
                        icon: <FaPen size={13} />,
                        type: 'edit',
                      },
                      { as: 'a', href: shortUrl, tip: 'Open link', icon: <FaExternalLinkAlt size={14} />, type: 'open' },
                      { onClick: () => handleDelete(url._id), tip: 'Delete', icon: <FaTrash size={14} />, type: 'delete', danger: true },
                    ].map((btn, bi) => {
                      const base = `w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-200 cursor-pointer shadow-sm`;
                      let cls = base;
                      if (btn.danger) {
                        cls += ` bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 hover:shadow-lg hover:shadow-red-500/20`;
                      } else if (btn.type === 'favorite') {
                        cls += btn.active
                          ? ` bg-amber-500/20 border-amber-500/30 text-amber-400 hover:bg-amber-500 hover:text-white hover:border-amber-500 hover:shadow-lg hover:shadow-amber-500/20`
                          : ` bg-white/10 border-white/15 text-slate-300 hover:bg-amber-500/20 hover:border-amber-500/40 hover:text-amber-300`;
                      } else if (btn.type === 'copy') {
                        cls += btn.active
                          ? ` bg-emerald-500/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/20`
                          : ` bg-white/10 border-white/15 text-slate-300 hover:bg-cyan-500/20 hover:border-cyan-500/40 hover:text-cyan-300`;
                      } else if (btn.type === 'analytics') {
                        cls += ` bg-white/10 border-white/15 text-slate-300 hover:bg-violet-500/20 hover:border-violet-500/40 hover:text-violet-300 hover:shadow-lg hover:shadow-violet-500/10`;
                      } else if (btn.type === 'share') {
                        cls += ` bg-white/10 border-white/15 text-slate-300 hover:bg-pink-500/20 hover:border-pink-500/40 hover:text-pink-300 hover:shadow-lg hover:shadow-pink-500/10`;
                      } else if (btn.type === 'edit') {
                        cls += ` bg-white/10 border-white/15 text-slate-300 hover:bg-blue-500/20 hover:border-blue-500/40 hover:text-blue-300 hover:shadow-lg hover:shadow-blue-500/10`;
                      } else if (btn.type === 'open') {
                        cls += ` bg-white/10 border-white/15 text-slate-300 hover:bg-emerald-500/20 hover:border-emerald-500/40 hover:text-emerald-300 hover:shadow-lg hover:shadow-emerald-500/10`;
                      }

                      if (btn.as === 'link') return (
                        <Link key={bi} to={btn.to} className={cls} title={btn.tip}>{btn.icon}</Link>
                      );
                      if (btn.as === 'a') return (
                        <a key={bi} href={btn.href} target="_blank" rel="noreferrer" className={cls} title={btn.tip}>{btn.icon}</a>
                      );
                      return (
                        <button key={bi} onClick={btn.onClick} className={cls} title={btn.tip}>{btn.icon}</button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Create Modal ── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(4,5,12,0.85)', backdropFilter: 'blur(12px)' }}
          onClick={e => { if(e.target === e.currentTarget) { setShowModal(false); setCreatedUrlData(null); } }}
        >
          <div
            className="animate-scale-in w-full max-w-lg rounded-2xl border border-white/10 glass-panel p-7 overflow-y-auto"
            style={{ maxHeight: '90vh', boxShadow: '0 32px 64px rgba(0,0,0,0.8)' }}
          >
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="font-black text-lg tracking-tight text-white">
                  {activeTab === 'single' ? 'Shorten a Link' : 'Bulk Shorten'}
                </h2>
                <p className="desc-text text-xs mt-0.5">
                  {activeTab === 'single' ? 'Turn any long URL into a trackable short link.' : 'Shorten many URLs at once via CSV or text.'}
                </p>
              </div>
              <button
                onClick={() => { setShowModal(false); setCreatedUrlData(null); }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 bg-white/4 border border-white/7 hover:bg-white/8 hover:text-slate-300 transition-all"
              >
                <FiX size={15} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-black/30 border border-white/7 rounded-xl p-1 mb-5">
              {[
                { key: 'single', label: 'Single Link', icon: <FiList size={12} /> },
                { key: 'bulk',   label: 'Bulk / CSV',  icon: <FiUploadCloud size={12} /> },
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    activeTab === t.key
                      ? 'bg-linear-to-r from-violet-600 to-indigo-500 text-white shadow-lg shadow-violet-500/30'
                      : 'text-slate-500 hover:text-slate-400'
                  }`}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            {activeTab === 'single' ? (
              createdUrlData ? (
                <div className="flex flex-col items-center gap-6 py-4">
                  <div className="bg-white p-4 rounded-xl">
                    <QRCodeSVG value={`${BACKEND_URL}/${createdUrlData.shortCode}`} size={160} />
                  </div>
                  <div className="text-center w-full">
                    <h3 className="text-white font-bold text-lg mb-2">Your link is ready!</h3>
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-3 rounded-xl mb-4">
                      <span className="flex-1 text-emerald-400 font-medium truncate">
                        {BACKEND_URL}/{createdUrlData.shortCode}
                      </span>
                      <button
                        onClick={() => safeCopyToClipboard(`${BACKEND_URL}/${createdUrlData.shortCode}`).then(() => toast.success('Copied!'))}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold"
                      >
                        Copy
                      </button>
                    </div>
                    <button
                      onClick={() => { setCreatedUrlData(null); setShowModal(false); }}
                      className="w-full py-2.5 rounded-xl bg-white/5 border border-white/9 text-slate-300 text-sm font-semibold hover:bg-white/8 transition-all"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
              <form onSubmit={handleCreate} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="desc-text text-xs font-bold uppercase tracking-wider">Destination URL *</label>
                  <input
                    type="text"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/4 border border-white/9 text-slate-100 text-sm placeholder:text-slate-600 outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
                    placeholder="https://example.com/long-url"
                    required
                    value={formData.originalUrl}
                    onChange={e => setFormData({ ...formData, originalUrl: e.target.value })}
                  />
                </div>



                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="desc-text text-xs font-bold uppercase tracking-wider">Custom Alias</label>
                    <input
                      type="text"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/4 border border-white/9 text-slate-100 text-sm placeholder:text-slate-600 outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
                      placeholder="my-link"
                      value={formData.customAlias}
                      pattern="[A-Za-z0-9_-]+"
                      onChange={e => setFormData({ ...formData, customAlias: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="desc-text text-xs font-bold uppercase tracking-wider">Expiry Date</label>
                    <input
                      type="date"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/4 border border-white/9 text-slate-100 text-sm outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
                      value={formData.expiresAt}
                      onChange={e => setFormData({ ...formData, expiresAt: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="desc-text text-xs font-bold uppercase tracking-wider">Password Protection</label>
                  <input
                    type="password"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/4 border border-white/9 text-slate-100 text-sm placeholder:text-slate-600 outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
                    placeholder="Optional password"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
                <div className="flex gap-2 mt-1">
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-linear-to-r from-violet-600 to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-violet-500/25 hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    {creating ? <><span className="spinner" /> Shortening…</> : <><FiZap size={13} /> Shorten Link</>}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/9 text-slate-300 text-sm font-semibold hover:bg-white/8 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
              )
            ) : (
              <form onSubmit={handleBulkSubmit} className="flex flex-col gap-4">
                <div className="px-3.5 py-3 rounded-xl bg-violet-500/8 border border-violet-500/18 desc-text text-xs leading-relaxed">
                  <strong className="text-violet-400">Format:</strong> One URL per line. Optionally add <code className="text-slate-200">alias</code> and <code className="text-slate-200">YYYY-MM-DD</code> expiry after a comma.
                </div>
                <div className="flex justify-between items-center">
                  <label className="desc-text text-xs font-bold uppercase tracking-wider">URLs to Shorten</label>
                  <label className="flex items-center gap-1.5 h-7 px-3 rounded-lg bg-white/5 border border-white/9 desc-text text-xs font-semibold cursor-pointer hover:bg-white/8 transition-all">
                    <FiUploadCloud size={11} /> Upload CSV
                    <input type="file" accept=".csv,.txt" onChange={handleCSVUpload} className="hidden" />
                  </label>
                </div>
                <textarea
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/4 border border-white/9 text-slate-100 text-sm placeholder:text-slate-600 outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all resize-y"
                  rows={7}
                  style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}
                  placeholder={`https://github.com\nhttps://google.com, g-link\nhttps://youtube.com, yt, 2026-12-31`}
                  value={bulkInput}
                  onChange={e => setBulkInput(e.target.value)}
                  required
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={bulkCreating}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-linear-to-r from-violet-600 to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-violet-500/25 hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    {bulkCreating ? <><span className="spinner" /> Processing…</> : <><FiUploadCloud size={13} /> Bulk Shorten</>}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/9 text-slate-300 text-sm font-semibold hover:bg-white/8 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editingUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(4,5,12,0.85)', backdropFilter: 'blur(12px)' }}
          onClick={e => e.target === e.currentTarget && setEditingUrl(null)}
        >
          <div
            className="animate-scale-in w-full max-w-md rounded-2xl border border-white/10 glass-panel p-7"
            style={{ boxShadow: '0 32px 64px rgba(0,0,0,0.8)' }}
          >
            <div className="flex justify-between items-start mb-5">
              <div>
                <h2 className="font-black text-lg tracking-tight text-white mb-1.5">Edit Link</h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-violet-500/12 text-violet-400 border border-violet-500/22">
                  {editingUrl.shortCode}
                </span>
              </div>
              <button
                onClick={() => setEditingUrl(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 bg-white/4 border border-white/7 hover:bg-white/8 hover:text-slate-300 transition-all"
              >
                <FiX size={15} />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="desc-text text-xs font-bold uppercase tracking-wider">Destination URL *</label>
                <input
                  type="text"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/4 border border-white/9 text-slate-100 text-sm outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
                  required
                  value={editFormData.originalUrl}
                  onChange={e => setEditFormData({ ...editFormData, originalUrl: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="desc-text text-xs font-bold uppercase tracking-wider">Expiry Date</label>
                <input
                  type="date"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/4 border border-white/9 text-slate-100 text-sm outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
                  value={editFormData.expiresAt}
                  onChange={e => setEditFormData({ ...editFormData, expiresAt: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="desc-text text-xs font-bold uppercase tracking-wider">Password Protection</label>
                <input
                  type="password"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/4 border border-white/9 text-slate-100 text-sm placeholder:text-slate-600 outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
                  placeholder="Optional password"
                  value={editFormData.password}
                  onChange={e => setEditFormData({ ...editFormData, password: e.target.value })}
                />
              </div>
              <div className="flex gap-2 mt-1">
                <button
                  type="submit"
                  disabled={editing}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-linear-to-r from-violet-600 to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-violet-500/25 hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {editing ? <><span className="spinner" /> Saving…</> : <><FiCheck size={13} /> Save Changes</>}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingUrl(null)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/9 text-slate-300 text-sm font-semibold hover:bg-white/8 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Dashboard;
