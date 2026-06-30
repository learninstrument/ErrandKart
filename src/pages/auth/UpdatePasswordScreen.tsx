import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';

export const UpdatePasswordScreen: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract the token_hash sent by Supabase from the URL
  const searchParams = new URLSearchParams(location.search);
  const tokenHash = searchParams.get('token_hash');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  useEffect(() => {
    if (!tokenHash) {
      setErrorMessage('Invalid or missing password reset link. Please request a new one.');
    } else {
      // Security: Remove the token hash from the URL immediately so it isn't saved in browser history
      window.history.replaceState({}, document.title, '/update-password');
    }
  }, [tokenHash]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!tokenHash) {
      setErrorMessage('Invalid or missing password reset link. Please request a new one.');
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).{8,}$/.test(password)) {
      setErrorMessage('Password must be at least 8 characters long, including uppercase, lowercase, numbers, and special characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token_hash: tokenHash, password }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message ?? 'Failed to update password');
      }

      // Redirect to login page with a success flag!
      navigate('/login?reset=1', { replace: true });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred while updating the password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#0c0f14] px-6 py-10">
      <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-[#111822] p-8 shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
        <button
          onClick={() => navigate('/login')}
          className="mb-8 flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to Login
        </button>

        <div className="mb-8 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-kart-orange/15 text-kart-orange">
            <Lock size={32} />
          </div>
          <h2 className="mb-2 text-3xl font-black text-white">New Password</h2>
          <p className="font-medium text-slate-400">Please enter a strong password for your account.</p>
        </div>

        <form onSubmit={handleUpdatePassword}>
          <div className="relative">
            <Input
              label="New Password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              theme="orange"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-[38px] text-slate-400 transition-colors hover:text-white focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <div className="relative">
            <Input
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              theme="orange"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-[38px] text-slate-400 transition-colors hover:text-white focus:outline-none"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {errorMessage && <div className="mb-4 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{errorMessage}</div>}

          <div className="mt-6">
            <Button 
              fullWidth 
              type="submit" 
              theme="orange" 
              disabled={isSubmitting || !password || !confirmPassword || !tokenHash}
            >
              {isSubmitting ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};