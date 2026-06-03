import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import api from '../api';
import {
  FiLink, FiBarChart2, FiLogOut, FiUser, FiMenu, FiX,
  FiSun, FiMoon, FiLock, FiMail, FiKey, FiEye, FiEyeOff,
  FiChevronDown, FiSettings, FiStar, FiInfo, FiGrid, FiHelpCircle
} from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  // Profile dropdown
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Change password modal
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwdLoading, setPwdLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); setProfileOpen(false); }, [location.pathname]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };
  const isActive = (p) => location.pathname === p;

  const handleScroll = (id) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(id.replace('#', ''));
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      const el = document.getElementById(id.replace('#', ''));
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleChangePwd = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (pwdForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    setPwdLoading(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword,
      });
      toast.success('Password changed successfully!');
      setShowChangePwd(false);
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPwdLoading(false);
    }
  };

  const isLight = theme === 'light';

  return (
    <>
      <nav className={`sticky top-0 z-50 transition-all duration-300 backdrop-blur-[30px] ${
        scrolled
          ? 'nav-scrolled border-b shadow-[0_10px_30px_rgba(0,0,0,0.2)] bg-black/40'
          : 'bg-transparent border-b border-white/4'
      }`}>
        <div className="max-w-7xl mx-auto px-5 sm:px-6 h-[62px] flex items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 no-underline group flex-shrink-0">
            <div className="w-[34px] h-[34px] rounded-xl bg-linear-to-br from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:shadow-violet-500/50 transition-shadow duration-300">
              <FiLink className="text-white" size={15} />
            </div>
            <span className="font-extrabold text-[1.15rem] tracking-tight leading-none nav-logo-text">
              Link<span className="gradient-text">Pulse</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-4 mr-2">
              <button onClick={() => handleScroll('#about-section')} className="nav-link-btn flex items-center gap-1.5 text-sm font-bold desc-text hover:text-slate-100 transition-colors bg-transparent border-none cursor-pointer"><FiInfo size={14} /> About</button>
              <button onClick={() => handleScroll('#services-section')} className="nav-link-btn flex items-center gap-1.5 text-sm font-bold desc-text hover:text-slate-100 transition-colors bg-transparent border-none cursor-pointer"><FiGrid size={14} /> Services</button>
              <button onClick={() => handleScroll('#how-to-use-section')} className="nav-link-btn flex items-center gap-1.5 text-sm font-bold desc-text hover:text-slate-100 transition-colors bg-transparent border-none cursor-pointer"><FiHelpCircle size={14} /> How to Use</button>
            </div>
            <div className="w-px h-4 bg-white/8" />
            <div className="flex items-center gap-1">
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg nav-icon-btn desc-text hover:text-slate-100 transition-all duration-200 mr-1"
                title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              >
                {isLight ? <FiMoon size={15} /> : <FiSun size={15} />}
              </button>

              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      isActive('/dashboard')
                        ? 'bg-violet-500/12 text-violet-300 border border-violet-500/22'
                        : 'nav-link desc-text hover:text-slate-100'
                    }`}
                  >
                    <FiBarChart2 size={14} /> Dashboard
                  </Link>
                  <div className="w-px h-4 bg-white/8 mx-1" />

                  {/* Profile dropdown trigger */}
                  <div className="relative" ref={profileRef}>
                    <button
                      onClick={() => setProfileOpen(o => !o)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg nav-profile-btn border text-sm transition-all duration-200"
                    >
                      <div className="w-6 h-6 rounded-full bg-linear-to-br from-violet-600 to-indigo-500 flex items-center justify-center flex-shrink-0">
                        <FiUser size={11} className="text-white" />
                      </div>
                      <span className="font-medium max-w-[100px] truncate nav-username">{user.username}</span>
                      <FiChevronDown size={12} className={`nav-muted transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Profile dropdown */}
                    {profileOpen && (
                      <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border glass-panel shadow-2xl animate-scale-in z-50 overflow-hidden">
                        {/* User info */}
                        <div className="profile-dropdown-header px-4 py-4 border-b">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-linear-to-br from-violet-600 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/30">
                              <FiUser size={16} className="text-white" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-sm profile-name truncate">{user.username}</p>
                              <p className="text-xs profile-email truncate flex items-center gap-1 mt-0.5">
                                <FiMail size={10} /> {user.email || 'No email on file'}
                              </p>
                            </div>
                          </div>
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Active Account
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="px-2 py-2 flex flex-col gap-0.5">
                          <Link
                            to="/dashboard"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm profile-menu-item transition-all font-medium"
                          >
                            <FiBarChart2 size={14} className="text-violet-400 flex-shrink-0" />
                            My Dashboard
                          </Link>
                          <Link
                            to="/dashboard"
                            state={{ filter: 'favorites' }}
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm profile-menu-item transition-all font-medium"
                          >
                            <FiStar size={14} className="text-pink-400 flex-shrink-0" />
                            My Favorites
                          </Link>
                          <button
                            onClick={() => { setProfileOpen(false); setShowChangePwd(true); }}
                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm profile-menu-item transition-all font-medium text-left w-full"
                          >
                            <FiKey size={14} className="text-amber-400 flex-shrink-0" />
                            Change Password
                          </button>
                        </div>

                        <div className="px-2 pb-2 border-t profile-dropdown-footer">
                          <button
                            onClick={() => { setProfileOpen(false); handleLogout(); }}
                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all font-medium text-left w-full mt-2"
                          >
                            <FiLogOut size={14} className="flex-shrink-0" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login" className="px-4 py-2 rounded-lg text-sm font-medium nav-link transition-all duration-200">
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 rounded-lg text-sm font-semibold bg-linear-to-r from-violet-600 to-indigo-500 text-white hover:opacity-90 hover:-translate-y-px active:translate-y-0 transition-all duration-300 shadow-[0_0_20px_rgba(124,58,237,0.4)] hover:shadow-[0_0_25px_rgba(124,58,237,0.6)] relative overflow-hidden"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(o => !o)}
            className="md:hidden p-2 rounded-lg nav-icon-btn transition-all"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t mobile-menu glass-panel px-4 py-3 flex flex-col gap-1 animate-slide-down">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium mobile-menu-item w-full text-left"
            >
              {isLight ? <><FiMoon size={14} /> Dark Theme</> : <><FiSun size={14} /> Light Theme</>}
            </button>
            <div className="h-px mobile-divider my-1" />
            <button onClick={() => { setMobileOpen(false); handleScroll('#about-section'); }} className="text-sm font-semibold mobile-menu-item px-3 py-2.5 rounded-xl text-left w-full">About</button>
            <button onClick={() => { setMobileOpen(false); handleScroll('#services-section'); }} className="text-sm font-semibold mobile-menu-item px-3 py-2.5 rounded-xl text-left w-full">Services</button>
            <button onClick={() => { setMobileOpen(false); handleScroll('#how-to-use-section'); }} className="text-sm font-semibold mobile-menu-item px-3 py-2.5 rounded-xl text-left w-full">How to Use</button>
            <div className="h-px mobile-divider my-1" />
            {user ? (
              <>
                <div className="flex items-center gap-3 px-3 py-3 mobile-user-info rounded-xl mb-1">
                  <div className="w-8 h-8 rounded-full bg-linear-to-br from-violet-600 to-indigo-500 flex items-center justify-center">
                    <FiUser size={13} className="text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-sm mobile-name">{user.username}</p>
                    <p className="text-[11px] mobile-email">{user.email}</p>
                  </div>
                </div>
                <Link to="/dashboard" className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive('/dashboard') ? 'bg-violet-500/10 text-violet-300' : 'mobile-menu-item'}`}>
                  <FiBarChart2 size={14} /> Dashboard
                </Link>
                <button
                  onClick={() => { setMobileOpen(false); setShowChangePwd(true); }}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium mobile-menu-item text-left w-full"
                >
                  <FiKey size={14} /> Change Password
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/8 rounded-xl transition-all text-left w-full"
                >
                  <FiLogOut size={13} /> Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-3 py-2.5 text-sm mobile-menu-item hover:bg-white/6 rounded-xl transition-all">
                  Sign In
                </Link>
                <Link to="/signup" className="px-3 py-2.5 text-sm font-semibold text-white bg-violet-600/20 border border-violet-500/30 rounded-xl text-center">
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        )}
      </nav>

      {/* ── Change Password Modal ── */}
      {showChangePwd && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: 'rgba(4,5,12,0.88)', backdropFilter: 'blur(14px)' }}
          onClick={e => e.target === e.currentTarget && setShowChangePwd(false)}
        >
          <div
            className="animate-scale-in w-full max-w-md rounded-2xl border glass-panel p-7"
            style={{ boxShadow: '0 32px 72px rgba(0,0,0,0.8)' }}
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-violet-600 to-indigo-500 flex items-center justify-center mb-3 shadow-lg shadow-violet-500/30">
                  <FiKey size={18} className="text-white" />
                </div>
                <h2 className="font-black text-lg tracking-tight modal-title">Change Password</h2>
                <p className="text-xs modal-subtitle mt-1">Update your account password securely.</p>
              </div>
              <button
                onClick={() => setShowChangePwd(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center modal-close-btn transition-all"
              >
                <FiX size={15} />
              </button>
            </div>

            <form onSubmit={handleChangePwd} className="flex flex-col gap-4">
              {/* Current password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider modal-label">Current Password</label>
                <div className="relative">
                  <FiLock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 modal-input-icon pointer-events-none" />
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl modal-input text-sm outline-none transition-all"
                    placeholder="Enter current password"
                    required
                    value={pwdForm.currentPassword}
                    onChange={e => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 modal-eye-btn transition-colors"
                  >
                    {showCurrent ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                  </button>
                </div>
              </div>

              {/* New password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider modal-label">New Password</label>
                <div className="relative">
                  <FiKey size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 modal-input-icon pointer-events-none" />
                  <input
                    type={showNew ? 'text' : 'password'}
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl modal-input text-sm outline-none transition-all"
                    placeholder="Min. 6 characters"
                    required
                    minLength={6}
                    value={pwdForm.newPassword}
                    onChange={e => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 modal-eye-btn transition-colors"
                  >
                    {showNew ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                  </button>
                </div>
              </div>

              {/* Confirm new password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider modal-label">Confirm New Password</label>
                <div className="relative">
                  <FiKey size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 modal-input-icon pointer-events-none" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl modal-input text-sm outline-none transition-all"
                    placeholder="Repeat new password"
                    required
                    value={pwdForm.confirmPassword}
                    onChange={e => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 modal-eye-btn transition-colors"
                  >
                    {showConfirm ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                  </button>
                </div>
                {pwdForm.confirmPassword && pwdForm.newPassword !== pwdForm.confirmPassword && (
                  <p className="text-xs text-red-400 mt-0.5">Passwords do not match</p>
                )}
              </div>

              <div className="flex gap-2 mt-1">
                <button
                  type="submit"
                  disabled={pwdLoading}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-linear-to-r from-violet-600 to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-violet-500/25 hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {pwdLoading ? <><span className="spinner" /> Updating…</> : <><FiKey size={13} /> Update Password</>}
                </button>
                <button
                  type="button"
                  onClick={() => setShowChangePwd(false)}
                  className="px-4 py-2.5 rounded-xl modal-cancel-btn text-sm font-semibold transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
