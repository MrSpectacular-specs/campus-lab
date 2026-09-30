import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { BrandLogo } from '../components/BrandLogo';
import type { Institution } from '../lib/types';

export const SignupPage: React.FC = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [institutionId, setInstitutionId] = useState('');
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadInstitutions = async () => {
      try {
        const res = await api.get<{ institutions: Institution[] }>('/api/institutions');
        if (res.institutions) setInstitutions(res.institutions);
      } catch (err: unknown) {
        console.warn('[Signup] Could not fetch institutions:', err);
      }
    };
    loadInstitutions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    const selectedInst = institutionId.trim() ? institutionId.trim() : undefined;
    const { error: err } = await signUp(email, password, {
      full_name: fullName.trim(),
      role,
      institution_id: selectedInst,
    });
    setLoading(false);

    if (err) {
      setError(err);
    } else {
      setSuccess(true);
      // Auto-navigate after brief delay (Supabase may require email confirmation)
      setTimeout(() => navigate('/login'), 2000);
    }
  };

  const roleOptions = [
    { value: 'student', label: 'Student' },
    { value: 'mentor', label: 'Mentor' },
    { value: 'faculty', label: 'Faculty' },
    { value: 'admin', label: 'Institution Admin' },
  ];

  if (success) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-[#0D0D0D] border border-brand-teal/20 rounded-2xl p-8">
            <div className="w-12 h-12 rounded-full bg-brand-teal/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-brand-teal text-xl">✓</span>
            </div>
            <h2 className="text-white font-sans text-lg font-semibold mb-2">Account Created</h2>
            <p className="text-text-muted text-xs font-mono mb-4">
              Check your email to verify your account, then sign in.
            </p>
            <Link
              to="/login"
              className="text-brand-teal-light hover:text-brand-teal text-xs font-mono transition-colors"
            >
              Go to Sign In →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4 py-12">
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
            Create your account
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-[#0D0D0D] border border-white/[0.07] rounded-2xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-xs text-red-400 font-mono">
                {error}
              </div>
            )}

            <Input
              label="Full Name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Dr. Priya Sharma"
              required
            />

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@institution.edu"
              required
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              required
              autoComplete="new-password"
            />

            {/* Role Selector */}
            <div className="w-full flex flex-col gap-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-text-secondary select-none">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-[#0D0D0D]/80 border border-border-default focus:border-border-hover rounded-lg text-sm text-text-primary px-3.5 py-2.5 transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-white/10 appearance-none cursor-pointer"
              >
                {roleOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Institution Selector */}
            <div className="w-full flex flex-col gap-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-text-secondary select-none">
                Institution
              </label>
              <select
                value={institutionId}
                onChange={(e) => setInstitutionId(e.target.value)}
                className="w-full bg-[#0D0D0D]/80 border border-border-default focus:border-border-hover rounded-lg text-sm text-text-primary px-3.5 py-2.5 transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-white/10 appearance-none cursor-pointer"
              >
                <option value="">Select institution…</option>
                {institutions.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name}
                  </option>
                ))}
              </select>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={loading}
              disabled={loading}
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/[0.07] text-center">
            <p className="text-xs text-text-muted font-mono">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-teal-light hover:text-brand-teal transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
