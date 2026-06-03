import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiLock, FiArrowRight, FiLink, FiEye, FiEyeOff } from 'react-icons/fi';

const getPasswordStrength = (pw) => {
  if (!pw) return { level: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 8)        score++;
  if (/[A-Z]/.test(pw))     score++;
  if (/[0-9]/.test(pw))     score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return [
    { level: 0, label: '',       color: '' },
    { level: 1, label: 'Weak',   color: 'bg-red-500' },
    { level: 2, label: 'Fair',   color: 'bg-amber-500' },
    { level: 3, label: 'Good',   color: 'bg-cyan-500' },
    { level: 4, label: 'Strong', color: 'bg-emerald-500' },
  ][score];
};

const Signup = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading]  = useState(false);
  const [showPw, setShowPw]    = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const pwStrength = getPasswordStrength(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res = await api.post('/auth/signup', formData);
      login(res.data.user, res.data.token);
      toast.success(`Account created! Welcome to LinkPulse.`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  const set = (k) => (e) => setFormData(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-16 relative">
      {/* Glow orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-96 h-96 rounded-full bg-violet-600/7 blur-[90px] -top-20 -right-20" />
        <div className="absolute w-72 h-72 rounded-full bg-pink-600/5 blur-[70px] bottom-10 -left-10" />
      </div>

      <div className="relative w-full max-w-md animate-fade-up">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center gap-2.5 no-underline mb-5 group">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:shadow-violet-500/50 transition-shadow duration-300">
              <FiLink className="text-white" size={16} />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-slate-100">
              Link<span className="gradient-text">Pulse</span>
            </span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-1.5">
            Create your account
          </h1>
          <p className="text-slate-500 text-sm">Free forever. No credit card required.</p>
        </div>

        {/* Card */}
        <div className="bg-surface border border-white/9 rounded-2xl p-7 shadow-2xl shadow-black/40 animate-fade-up delay-1">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Username */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Username</label>
              <div className="relative">
                <FiUser size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                <input
                  type="text"
                  placeholder="yourname"
                  value={formData.username}
                  onChange={set('username')}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/4 border border-white/9 text-slate-100 text-sm placeholder:text-slate-600 outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20 transition-all duration-200"
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email address</label>
              <div className="relative">
                <FiMail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={set('email')}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/4 border border-white/9 text-slate-100 text-sm placeholder:text-slate-600 outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20 transition-all duration-200"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                <FiLock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={formData.password}
                  onChange={set('password')}
                  required minLength={6}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/4 border border-white/9 text-slate-100 text-sm placeholder:text-slate-600 outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                >
                  {showPw ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                </button>
              </div>
              {/* Strength meter */}
              {formData.password && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1,2,3,4].map(i => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i <= pwStrength.level ? pwStrength.color : 'bg-white/10'
                        }`}
                      />
                    ))}
                  </div>
                  {pwStrength.label && (
                    <span className={`text-xs font-semibold ${
                      pwStrength.level === 1 ? 'text-red-400' :
                      pwStrength.level === 2 ? 'text-amber-400' :
                      pwStrength.level === 3 ? 'text-cyan-400' : 'text-emerald-400'
                    }`}>{pwStrength.label}</span>
                  )}
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-1 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-linear-to-r from-violet-600 to-indigo-500 text-white font-semibold text-sm hover:opacity-90 hover:-translate-y-px active:translate-y-0 transition-all duration-200 shadow-lg shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
            >
              {loading
                ? <><span className="spinner" /> Creating account…</>
                : <>Create Account <FiArrowRight size={15} /></>
              }
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-white/6 text-center">
            <p className="text-slate-500 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-violet-400 font-semibold hover:text-violet-300 transition-colors no-underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
