import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { BrandLogo } from '../components/BrandLogo';
import { XCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: err, user } = await signIn(email, password);
    setLoading(false);

    if (err) {
      setError(err);
    } else if (user) {
      // If redirected here from a protected page, return there
      const state = location.state;
      const from =
        state && typeof state === 'object' && 'from' in state &&
        state.from && typeof state.from === 'object' && 'pathname' in state.from &&
        typeof state.from.pathname === 'string'
          ? state.from.pathname
          : null;
      if (from && from !== '/login' && from !== '/signup') {
        navigate(from, { replace: true });
      } else {
        // Default role-based redirect
        const roleRedirects: Record<string, string> = {
          admin: '/dashboard',
          faculty: '/faculty',
          mentor: '/mentor',
          student: '/student',
        };
        navigate(roleRedirects[user.role] || '/dashboard', { replace: true });
      }
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  const handleFillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="flex flex-col items-center text-center mb-8">
          <Link
            to="/"
            className="inline-block transition-transform hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 rounded"
            aria-label="CAMPUSLAB Home"
          >
            <BrandLogo variant="full" size="lg" context="auth" />
          </Link>
          <p className="text-text-muted font-mono text-xs mt-3 uppercase tracking-wider">
            Sign in to your workspace
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-[#0D0D0D] border border-white/[0.07] rounded-2xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-xs text-red-400 font-mono flex items-start gap-2">
                <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@campuslab.dev"
              required
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={loading}
              disabled={loading}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/[0.07] text-center">
            <p className="text-xs text-text-muted font-mono">
              No account?{' '}
              <Link to="/signup" className="text-brand-teal-light hover:text-brand-teal transition-colors">
                Create one
              </Link>
            </p>
          </div>
        </div>

        {/* Demo credentials helper with 1-click fill */}
        <div className="mt-6 bg-[#0D0D0D]/80 border border-white/[0.06] rounded-xl p-4 text-xs font-mono text-text-muted space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-text-secondary font-medium uppercase tracking-wider text-[11px]">
              Demo Accounts (Click to Fill)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => handleFillDemo('admin@campuslab.dev', 'Admin@123')}
              className="p-2 rounded bg-black/40 border border-white/[0.04] hover:border-brand-teal/40 hover:text-white text-left transition-colors cursor-pointer"
            >
              <span className="block text-white/90 font-semibold">Admin</span>
              <span className="text-[10px] text-[#666666]">admin@campuslab.dev</span>
            </button>

            <button
              type="button"
              onClick={() => handleFillDemo('faculty@campuslab.dev', 'Faculty@123')}
              className="p-2 rounded bg-black/40 border border-white/[0.04] hover:border-brand-teal/40 hover:text-white text-left transition-colors cursor-pointer"
            >
              <span className="block text-white/90 font-semibold">Faculty</span>
              <span className="text-[10px] text-[#666666]">faculty@campuslab.dev</span>
            </button>

            <button
              type="button"
              onClick={() => handleFillDemo('mentor@campuslab.dev', 'Mentor@123')}
              className="p-2 rounded bg-black/40 border border-white/[0.04] hover:border-brand-teal/40 hover:text-white text-left transition-colors cursor-pointer"
            >
              <span className="block text-white/90 font-semibold">Mentor</span>
              <span className="text-[10px] text-[#666666]">mentor@campuslab.dev</span>
            </button>

            <button
              type="button"
              onClick={() => handleFillDemo('student1@campuslab.dev', 'Student@123')}
              className="p-2 rounded bg-black/40 border border-white/[0.04] hover:border-brand-teal/40 hover:text-white text-left transition-colors cursor-pointer"
            >
              <span className="block text-white/90 font-semibold">Student</span>
              <span className="text-[10px] text-[#666666]">student1@campuslab.dev</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
