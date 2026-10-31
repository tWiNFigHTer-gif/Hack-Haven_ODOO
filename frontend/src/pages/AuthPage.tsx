import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api, User } from '../lib/api';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useToast } from '../components/common/Toast';

interface AuthPageProps {
  onLoginSuccess: (user: User) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  const [email, setEmail] = useState('elena.rostova@atelier-nord.com');
  const [password, setPassword] = useState('AuraNord2025!');
  const [confirmPassword, setConfirmPassword] = useState('AuraNord2025!');
  const [termsAccepted, setTermsAccepted] = useState(true);

  const [emailError, setEmailError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { showToast } = useToast();

  // Password rules evaluation for live checklist
  const hasMinLength = password.length > 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasSpecial;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setGeneralError(null);

    if (mode === 'signup') {
      if (!isPasswordValid) {
        setGeneralError('Please meet all password requirements before continuing.');
        return;
      }
      if (password !== confirmPassword) {
        setGeneralError('Passwords do not match.');
        return;
      }
      if (!termsAccepted) {
        setGeneralError('Please accept the Terms of Service to proceed.');
        return;
      }
    }

    setIsLoading(true);
    try {
      if (mode === 'signup') {
        const { user } = await api.auth.signup(email, password);
        showToast(`Welcome to Brightloop, ${user.firstName}!`, 'success');
        onLoginSuccess(user);
        navigate('/subscriptions');
      } else {
        const { user } = await api.auth.login(email, password);
        showToast(`Welcome back, ${user.firstName}.`, 'success');
        onLoginSuccess(user);
        navigate('/subscriptions');
      }
    } catch (err: any) {
      if (err.message && err.message.includes('already has an account')) {
        setEmailError('This email already has an account. Sign in instead?');
      } else {
        setGeneralError(err.message || 'Authentication failed. Please verify credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-canvas flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <header className="max-w-[1120px] w-full mx-auto flex items-center justify-between py-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-primary border border-border-subtle">
            <span className="material-symbols-outlined text-[20px]">eco</span>
          </div>
          <span className="font-serif text-xl font-semibold text-on-surface tracking-tight">
            Brightloop
          </span>
        </div>
        <a
          href="#help"
          className="text-xs text-secondary hover:text-on-surface transition-colors flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[16px]">help</span>
          <span>Need Assistance?</span>
        </a>
      </header>

      {/* Main Auth Split Container */}
      <main className="w-full flex-1 flex items-center justify-center my-6">
        <div className="w-full max-w-[1120px] bg-surface-card rounded-[14px] shadow-[0_4px_24px_-2px_rgba(28,25,23,0.06)] border border-border-subtle overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Left Editorial Brand Panel (5 Cols) */}
          <div className="lg:col-span-5 relative flex flex-col justify-between p-6 sm:p-10 bg-surface-container-low min-h-[360px] lg:min-h-[640px] overflow-hidden">
            {/* Background image & gradient */}
            <div
              className="absolute inset-0 bg-cover bg-center mix-blend-multiply opacity-80"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDPUyYZ4K8sZPaBlqfKgJvQhM_ctzrLEN5ybZOv1zZX4ywHsOvX0RentIbcDd7eYrq10sjC-X_ovN63tbDvYzDwRi1cwM5oahn1NMTrN8JraTIeYWV0donQc7P0a5x4Sl0Mxe6N4EwDKmtAqYFjMJGOoDZU64f3DZfNXK5TaAZZ8fdDi-nWAKw0TXxNvek1P4omqeHboPM-z0hJPrcQuNc_ibXIY8Wnwx43iXkuS1I')",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-on-surface/90 via-on-surface/40 to-background-canvas/40" />

            {/* Top Brand Pill */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="text-xs font-semibold text-white bg-primary-container/90 px-3 py-1 rounded-[6px] backdrop-blur-sm">
                Client Sanctuary
              </span>
            </div>

            {/* Bottom Statement */}
            <div className="relative z-10 mt-auto pt-8">
              <div className="w-10 h-0.5 bg-primary-fixed mb-4" />
              <p className="font-serif text-2xl sm:text-3xl text-surface-bright leading-tight drop-shadow-sm mb-3">
                Seamless subscription billing, curated with tranquility.
              </p>
              <p className="text-sm text-surface-variant/90 font-light max-w-sm leading-relaxed">
                An unhurried account portal designed for clarity, mindful oversight, and elevated subscription stewardship.
              </p>
              <div className="mt-6 pt-5 flex items-center gap-3">
                <div className="flex -space-x-2">
                  <span className="inline-flex h-7 w-7 rounded-full bg-secondary-container items-center justify-center text-xs font-medium text-primary ring-2 ring-white">
                    ER
                  </span>
                  <span className="inline-flex h-7 w-7 rounded-full bg-primary-container items-center justify-center text-xs font-medium text-white ring-2 ring-white">
                    CV
                  </span>
                  <span className="inline-flex h-7 w-7 rounded-full bg-surface-container-high items-center justify-center text-xs font-medium text-on-surface ring-2 ring-white">
                    MK
                  </span>
                </div>
                <span className="text-xs text-surface-bright/80">
                  Trusted by 1,200+ bespoke ateliers & studios
                </span>
              </div>
            </div>
          </div>

          {/* Right Structured Auth Form (7 Cols) */}
          <div className="lg:col-span-7 bg-surface-card p-6 sm:p-10 flex flex-col justify-between">
            <div>
              {/* Mode Switcher Tabs */}
              <div className="flex items-center justify-between mb-8 pb-3 border-b border-border-subtle">
                <div className="flex items-center gap-6" role="tablist">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setEmailError(null);
                      setGeneralError(null);
                    }}
                    className={`relative pb-2 text-base font-medium transition-all cursor-pointer ${
                      mode === 'signup'
                        ? 'text-primary'
                        : 'text-secondary hover:text-on-surface'
                    }`}
                  >
                    Sign up
                    {mode === 'signup' && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary-container rounded-full" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setEmailError(null);
                      setGeneralError(null);
                    }}
                    className={`relative pb-2 text-base font-medium transition-all cursor-pointer ${
                      mode === 'login'
                        ? 'text-primary'
                        : 'text-secondary hover:text-on-surface'
                    }`}
                  >
                    Log in
                    {mode === 'login' && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary-container rounded-full" />
                    )}
                  </button>
                </div>
                <div className="flex items-center gap-1.5 text-secondary text-xs">
                  <span className="material-symbols-outlined text-[16px] text-primary">lock</span>
                  <span className="uppercase tracking-wider">256-Bit Encrypted</span>
                </div>
              </div>

              {/* Title & Lead */}
              <div className="mb-6">
                <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-on-surface tracking-tight">
                  {mode === 'signup' ? 'Create your account' : 'Welcome back'}
                </h1>
                <p className="text-sm text-secondary mt-1">
                  {mode === 'signup'
                    ? 'Manage your subscriptions, view invoices, and track billing seamlessly.'
                    : 'Access your botanical memberships, receipts, and statement archives.'}
                </p>
              </div>

              {/* Error banner if present */}
              {generalError && (
                <div className="p-3.5 mb-5 rounded-lg bg-status-overdue-bg text-status-overdue-text text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  <span>{generalError}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Address */}
                <Input
                  label="Email address"
                  sublabel="Work or personal"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError(null);
                  }}
                  leftIcon={<span className="material-symbols-outlined text-[18px]">mail</span>}
                  error={emailError || undefined}
                  placeholder="name@domain.com"
                />

                {emailError && (
                  <div className="flex items-center gap-1.5 pt-0.5 text-xs text-status-overdue-text font-medium">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setEmailError(null);
                      }}
                      className="underline text-primary hover:text-accent-hover transition-colors"
                    >
                      Sign in instead?
                    </button>
                  </div>
                )}

                {/* Password Field */}
                <Input
                  label={mode === 'signup' ? 'Create password' : 'Password'}
                  sublabel={mode === 'signup' ? 'Must be secure' : undefined}
                  isPassword
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<span className="material-symbols-outlined text-[18px]">key</span>}
                  placeholder="Enter password"
                />

                {/* Live Password Checklist for Signup */}
                {mode === 'signup' && (
                  <div className="p-3 bg-surface-container-low rounded-lg space-y-1.5 border border-border-subtle/50">
                    <p className="text-xs uppercase tracking-wider text-secondary font-medium">
                      Password requirements:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-4 pt-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className={`flex items-center justify-center w-4 h-4 rounded-full text-[10px] ${
                            hasMinLength
                              ? 'bg-status-active-bg text-status-active-text'
                              : 'bg-surface-container text-secondary'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[12px]">
                            {hasMinLength ? 'check' : 'remove'}
                          </span>
                        </span>
                        <span className={hasMinLength ? 'text-on-surface font-medium' : 'text-secondary'}>
                          8+ characters
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`flex items-center justify-center w-4 h-4 rounded-full text-[10px] ${
                            hasUppercase
                              ? 'bg-status-active-bg text-status-active-text'
                              : 'bg-surface-container text-secondary'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[12px]">
                            {hasUppercase ? 'check' : 'remove'}
                          </span>
                        </span>
                        <span className={hasUppercase ? 'text-on-surface font-medium' : 'text-secondary'}>
                          Uppercase letter
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`flex items-center justify-center w-4 h-4 rounded-full text-[10px] ${
                            hasLowercase
                              ? 'bg-status-active-bg text-status-active-text'
                              : 'bg-surface-container text-secondary'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[12px]">
                            {hasLowercase ? 'check' : 'remove'}
                          </span>
                        </span>
                        <span className={hasLowercase ? 'text-on-surface font-medium' : 'text-secondary'}>
                          Lowercase letter
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`flex items-center justify-center w-4 h-4 rounded-full text-[10px] ${
                            hasSpecial
                              ? 'bg-status-active-bg text-status-active-text'
                              : 'bg-surface-container text-secondary'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[12px]">
                            {hasSpecial ? 'check' : 'remove'}
                          </span>
                        </span>
                        <span className={hasSpecial ? 'text-on-surface font-medium' : 'text-secondary'}>
                          Special symbol (!@#$)
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Confirm Password (only for signup) */}
                {mode === 'signup' && (
                  <Input
                    label="Confirm password"
                    isPassword
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    leftIcon={<span className="material-symbols-outlined text-[18px]">verified_user</span>}
                    placeholder="Re-enter password"
                  />
                )}

                {/* Forgot password link for login mode */}
                {mode === 'login' && (
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => navigate('/forgot-password')}
                      className="text-xs text-primary hover:text-accent-hover font-medium transition-colors"
                    >
                      Forgot your password?
                    </button>
                  </div>
                )}

                {/* Terms for signup */}
                {mode === 'signup' && (
                  <div className="flex items-start gap-2.5 pt-1">
                    <input
                      type="checkbox"
                      id="termsAccept"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded accent-primary-container cursor-pointer"
                    />
                    <label htmlFor="termsAccept" className="text-xs text-secondary select-none leading-relaxed">
                      I agree to the{' '}
                      <a href="#terms" className="text-primary hover:underline">
                        Terms of Service
                      </a>{' '}
                      and acknowledge the client{' '}
                      <a href="#privacy" className="text-primary hover:underline">
                        Privacy Policy
                      </a>
                      .
                    </label>
                  </div>
                )}

                {/* Submit CTA */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isLoading}
                    className="w-full h-11"
                    rightIcon={
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    }
                  >
                    {mode === 'signup' ? 'Create account' : 'Sign in to sanctuary'}
                  </Button>
                </div>
              </form>
            </div>

            {/* Bottom Switcher */}
            <div className="mt-8 pt-4 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-secondary">
              <p>
                {mode === 'signup' ? 'Already have an account?' : "Don't have an account yet?"}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === 'signup' ? 'login' : 'signup');
                    setEmailError(null);
                    setGeneralError(null);
                  }}
                  className="text-primary font-medium hover:text-accent-hover transition-colors ml-1 cursor-pointer"
                >
                  {mode === 'signup' ? 'Log in' : 'Create an account'}
                </button>
              </p>
              <div className="flex items-center gap-3">
                <a href="#privacy" className="hover:text-on-surface">Privacy</a>
                <span>•</span>
                <a href="#security" className="hover:text-on-surface">Security</a>
                <span>•</span>
                <a href="#support" className="hover:text-on-surface">Support</a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-4">
        <p className="text-xs text-secondary">
          © 2025 Brightloop Client Portal. All interactions are secure and encrypted.
        </p>
      </footer>
    </div>
  );
};

