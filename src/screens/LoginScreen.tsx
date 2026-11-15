import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ShieldCheck, UserCheck, Wrench, Lock, Info } from 'lucide-react';
import { useAuthStore } from '../state/useAuthStore';
import { UserRole } from '../types';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';

export const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const { login, quickDemoLogin, isAuthenticated, lockoutUntil, clearLockout } = useAuthStore();

  const [username, setUsername] = useState('owner');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!lockoutUntil) {
      setLockoutRemaining(0);
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      if (lockoutUntil <= now) {
        clearLockout();
        setLockoutRemaining(0);
        setErrorMsg('');
      } else {
        setLockoutRemaining(Math.ceil((lockoutUntil - now) / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockoutUntil, clearLockout]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Please enter both Staff ID and Password.');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    const res = await login(username, password);
    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setErrorMsg(res.error || 'Authentication failed.');
    }
  };

  const handleQuickDemo = async (role: UserRole) => {
    setLoading(true);
    await quickDemoLogin(role);
    setLoading(false);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      {/* Wordmark above card: Text-only with small orange square (Section 1) */}
      <div className="text-center mb-6 space-y-1">
        <div className="flex items-center justify-center gap-2">
          <div className="w-3.5 h-3.5 bg-orange rounded-[2px]" />
          <h1 className="font-bold text-2xl text-navy tracking-tight">
            StockSense
          </h1>
        </div>
        <p className="text-xs text-dim">Spare Part Inventory &amp; Stock Management</p>
      </div>

      {/* Centered 400-wide card (Section 7, Feature 19) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[400px] bg-white border border-grey rounded-[8px] p-6 space-y-5"
      >
        <div className="border-b border-grey pb-3">
          <h2 className="text-base font-semibold text-navy">Staff Sign In</h2>
          <span className="text-xs text-dim">Role-Based Access Control</span>
        </div>

        {/* Lockout Warning */}
        {lockoutRemaining > 0 && (
          <div className="p-3 bg-grey-header border-l-4 border-l-black text-xs font-medium text-navy flex items-center gap-2">
            <Lock size={16} className="text-black shrink-0" />
            <span>Security Lockout: {lockoutRemaining}s cooldown active.</span>
          </div>
        )}

        {/* Error message */}
        {errorMsg && lockoutRemaining === 0 && (
          <div className="p-3 bg-grey-header border-l-4 border-l-orange text-xs font-medium text-navy">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Staff ID / Username"
            placeholder="e.g. owner, store1, mech1, buyer1"
            value={username}
            onChange={e => setUsername(e.target.value)}
            disabled={lockoutRemaining > 0 || loading}
            required
          />

          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter password..."
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={lockoutRemaining > 0 || loading}
            required
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-dim hover:text-navy transition-colors focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2"
            disabled={lockoutRemaining > 0 || loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </Button>
        </form>

        {/* Quick Demo Role Selector */}
        <div className="pt-3 border-t border-grey space-y-2">
          <span className="text-[11px] font-medium text-dim uppercase tracking-wider block text-center">
            One-Click Demo Roles
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('owner')}
              className="h-9 px-2 bg-white border border-grey rounded-[8px] text-xs font-medium text-navy hover:bg-grey flex items-center justify-center gap-1.5 transition-colors"
            >
              <ShieldCheck size={14} className="text-orange" />
              <span>Owner</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('storekeeper')}
              className="h-9 px-2 bg-white border border-grey rounded-[8px] text-xs font-medium text-navy hover:bg-grey flex items-center justify-center gap-1.5 transition-colors"
            >
              <UserCheck size={14} className="text-orange" />
              <span>Shopkeeper</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('mechanic')}
              className="h-9 px-2 bg-white border border-grey rounded-[8px] text-xs font-medium text-navy hover:bg-grey flex items-center justify-center gap-1.5 transition-colors"
            >
              <Wrench size={14} className="text-orange" />
              <span>Mechanic</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('purchasing')}
              className="h-9 px-2 bg-white border border-grey rounded-[8px] text-xs font-medium text-navy hover:bg-grey flex items-center justify-center gap-1.5 transition-colors"
            >
              <ShieldCheck size={14} className="text-orange" />
              <span>Supplier</span>
            </button>
          </div>
          <p className="text-[10px] text-center text-dim code-num">
            Default credentials: <strong className="text-navy">owner</strong> / <strong className="text-navy">123456</strong>
          </p>
        </div>

        {/* About System Link */}
        <div className="text-center pt-1 border-t border-grey">
          <Link
            to="/about"
            className="inline-flex items-center gap-1 text-xs text-dim hover:text-navy transition-colors font-medium"
          >
            <Info size={14} />
            <span>About System &amp; Project Credits</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
