import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useToast } from '../components/common/Toast';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('clara@botanical-studio.com');
  const [isSent, setIsSent] = useState(false);
  const [countdown, setCountdown] = useState(48);
  const [isResending, setIsResending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    let timer: any;
    if (isSent && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((c) => c - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isSent, countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.auth.forgotPassword(email);
      setIsSent(true);
      setCountdown(48);
      showToast('Recovery instructions dispatched to your email.', 'success');
    } catch {
      showToast('Could not process recovery link. Try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || isResending) return;
    setIsResending(true);
    try {
      await api.auth.forgotPassword(email);
      setCountdown(48);
      showToast('A fresh recovery link has been dispatched.', 'success');
    } finally {
      setIsResending(false);
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
        <button
          onClick={() => navigate('/login')}
          className="text-xs text-secondary hover:text-on-surface transition-colors flex items-center gap-1 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Back to log in</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="w-full flex-1 flex items-center justify-center my-6">
        <div className="w-full max-w-[560px] flex flex-col gap-6">
          {/* Primary Sanctuary Card */}
          <div className="bg-surface-card rounded-[14px] p-6 sm:p-8 shadow-[0_4px_24px_-2px_rgba(28,25,23,0.06)] border border-border-subtle relative overflow-hidden transition-all duration-300">
            {/* Ambient Decorative Blur */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-fixed/20 rounded-full blur-3xl pointer-events-none" />

            {/* Back link */}
            <div className="mb-6">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-1.5 text-xs text-secondary hover:text-on-surface transition-colors group cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-0.5 transition-transform">
                  arrow_back
                </span>
                <span>Back to log in</span>
              </button>
            </div>

            {/* Editorial Header */}
            <div className="space-y-1 mb-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-container" />
                <span className="text-xs text-secondary uppercase tracking-widest font-medium">
                  Account Recovery
                </span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-on-surface tracking-tight">
                Reset your password
              </h1>
              <p className="text-sm text-secondary leading-relaxed pt-1">
                Enter the email associated with your Brightloop customer account and we'll send you a recovery link.
              </p>
            </div>

            {/* Reset Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Account email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                helperText="Ensure this matches your billing contact address on file."
                leftIcon={<span className="material-symbols-outlined text-[18px]">mail</span>}
                placeholder="name@domain.com"
              />

              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                className="w-full h-11"
                rightIcon={
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                }
              >
                Send recovery link
              </Button>
            </form>

            {/* Security Note */}
            <div className="mt-6 pt-4 border-t border-border-subtle/50 flex items-center justify-center gap-2 text-secondary/70 text-xs">
              <span className="material-symbols-outlined text-[16px]">lock</span>
              <span>End-to-end encrypted account dispatch</span>
            </div>
          </div>

          {/* Confirmation / Success Card when sent */}
          {isSent && (
            <div className="bg-surface-card rounded-[14px] p-6 border border-border-subtle shadow-[0_4px_20px_-2px_rgba(28,25,23,0.05)] animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-status-active-bg flex items-center justify-center shrink-0 text-status-active-text shadow-sm">
                  <span className="material-symbols-outlined text-[22px]">mark_email_read</span>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-lg font-semibold text-on-surface">
                      Recovery link sent
                    </h3>
                    <span className="bg-status-active-bg text-status-active-text text-xs font-medium px-2 py-0.5 rounded-[6px]">
                      Delivered
                    </span>
                  </div>
                  <p className="text-sm text-secondary leading-relaxed">
                    We've sent password reset instructions to{' '}
                    <span className="font-medium text-on-surface">{email}</span>. Please check your inbox or spam folder.
                  </p>
                  <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-secondary">
                      <span className="material-symbols-outlined text-[16px]">schedule</span>
                      <span>
                        Didn't receive the email?{' '}
                        <span className="font-medium text-on-surface">
                          {countdown > 0 ? `Resend in ${countdown}s` : 'Ready to resend'}
                        </span>
                      </span>
                    </div>
                    <button
                      type="button"
                      disabled={countdown > 0 || isResending}
                      onClick={handleResend}
                      className="font-medium text-primary hover:text-accent-hover transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                    >
                      {isResending ? 'Sending...' : 'Request new link'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footnote */}
          <div className="text-center">
            <p className="text-xs text-secondary/70">
              Brightloop Botanical Portal • Private Client Sanctuary • ID #BL-78201
            </p>
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

