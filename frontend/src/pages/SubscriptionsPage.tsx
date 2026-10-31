import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, Subscription } from '../lib/api';
import { Badge } from '../components/common/Badge';
import { Card } from '../components/common/Card';
import { CardSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../components/common/Toast';

export const SubscriptionsPage: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'closed'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [simulationMode, setSimulationMode] = useState<'normal' | 'skeleton' | 'empty'>('normal');

  const navigate = useNavigate();
  const { showToast } = useToast();

  const fetchSubscriptions = async () => {
    setIsLoading(true);
    try {
      const data = await api.subscriptions.list(filter);
      setSubscriptions(data);
    } catch {
      showToast('Failed to load subscriptions.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [filter]);

  const activeCount = subscriptions.filter((s) => s.status === 'active').length;
  const closedCount = subscriptions.filter((s) => s.status === 'closed').length;

  return (
    <div className="w-full pt-24 pb-16 bg-background-canvas min-h-screen">
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 flex flex-col gap-8">
        {/* Page Header & Filtering Section */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
          <div className="flex flex-col max-w-2xl">
            <div className="flex items-center gap-2 text-secondary text-xs uppercase tracking-wider mb-1.5 font-medium">
              <span>Sanctuary Client</span>
              <span>/</span>
              <span>Memberships & Allocations</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-on-surface tracking-tight">
              My Subscriptions
            </h1>
            <p className="text-sm text-secondary mt-1.5 leading-relaxed">
              Review your ongoing botanical memberships, billing frequencies, and active deliveries.
            </p>
          </div>

          {/* Filter Pills */}
          <div
            aria-label="Subscription filters"
            className="flex items-center gap-1.5 p-1 bg-surface-container-low rounded-lg self-start md:self-auto border border-border-subtle/50 shadow-sm"
            role="tablist"
          >
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-primary-container text-white shadow-sm'
                  : 'bg-transparent text-secondary hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              All ({subscriptions.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('active')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                filter === 'active'
                  ? 'bg-primary-container text-white shadow-sm'
                  : 'bg-transparent text-secondary hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('closed')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                filter === 'closed'
                  ? 'bg-primary-container text-white shadow-sm'
                  : 'bg-transparent text-secondary hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              Closed ({closedCount})
            </button>
          </div>
        </section>

        {/* Botanical Highlights Mosaic Header */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Active Delivery Banner */}
          <div className="md:col-span-2 relative overflow-hidden rounded-[14px] bg-surface-card p-6 border border-border-subtle shadow-[0_4px_20px_-2px_rgba(28,25,23,0.05)] flex flex-col justify-between">
            <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-primary-fixed/20 blur-2xl pointer-events-none" />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-status-active-bg text-status-active-text flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">spa</span>
                </div>
                <div>
                  <div className="text-xs text-secondary uppercase tracking-wider font-medium">
                    Next Allocation Cycle
                  </div>
                  <div className="font-serif text-lg font-semibold text-on-surface">
                    Spring Solstice Batch #09
                  </div>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs text-status-active-text bg-status-active-bg px-2.5 py-1 rounded-[6px] font-medium self-start sm:self-auto">
                <span className="w-1.5 h-1.5 rounded-full bg-status-active-text animate-pulse" />
                Scheduled April 15
              </span>
            </div>
            <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-surface-container-low p-3 rounded-lg border border-border-subtle/40">
                <span className="text-[11px] text-secondary block font-medium">Formulation</span>
                <span className="text-xs font-semibold text-on-surface">Cold-Pressed Myrtle</span>
              </div>
              <div className="bg-surface-container-low p-3 rounded-lg border border-border-subtle/40">
                <span className="text-[11px] text-secondary block font-medium">Vessel</span>
                <span className="text-xs font-semibold text-on-surface">Miron Violet Glass</span>
              </div>
              <div className="bg-surface-container-low p-3 rounded-lg border border-border-subtle/40">
                <span className="text-[11px] text-secondary block font-medium">Destination</span>
                <span className="text-xs font-semibold text-on-surface truncate block">Upper East Side Flat</span>
              </div>
              <div className="bg-surface-container-low p-3 rounded-lg border border-border-subtle/40">
                <span className="text-[11px] text-secondary block font-medium">Courier</span>
                <span className="text-xs font-semibold text-on-surface">White Glove #4</span>
              </div>
            </div>
          </div>

          {/* Concierge Advisory Note */}
          <div className="relative rounded-[14px] bg-surface-container p-6 border border-border-subtle/70 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider text-secondary font-medium">
                Apothecary Note
              </span>
              <span className="material-symbols-outlined text-primary text-[20px]">auto_stories</span>
            </div>
            <blockquote className="font-serif text-[15px] leading-snug text-on-surface italic">
              “The early wild chamomile harvest has reached peak infusion potency. Your quarterly curation reflects this extraction.”
            </blockquote>
            <div className="pt-3 flex items-center justify-between border-t border-border-subtle/50 text-xs">
              <span className="text-secondary">Matthias Vance — Master Distiller</span>
              <span className="text-primary font-medium">Details →</span>
            </div>
          </div>
        </section>

        {/* State Simulation Controls (as presented in Stitch design) */}
        <section className="bg-surface-container-low p-3.5 rounded-lg border border-border-subtle/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-secondary">
            <span className="material-symbols-outlined text-primary text-[20px]">tune</span>
            <div>
              <span className="font-medium text-on-surface block">Client Portal State Demonstrations</span>
              <span>Toggle simulated loading skeleton, empty sanctuary view, or live view.</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSimulationMode('skeleton')}
              className={`px-3 py-1.5 rounded-md border font-medium transition-colors cursor-pointer ${
                simulationMode === 'skeleton'
                  ? 'bg-primary-container text-white border-primary-container'
                  : 'bg-surface-card text-on-surface border-border-subtle hover:bg-surface-container'
              }`}
            >
              Skeleton Loading
            </button>
            <button
              type="button"
              onClick={() => setSimulationMode('empty')}
              className={`px-3 py-1.5 rounded-md border font-medium transition-colors cursor-pointer ${
                simulationMode === 'empty'
                  ? 'bg-primary-container text-white border-primary-container'
                  : 'bg-surface-card text-on-surface border-border-subtle hover:bg-surface-container'
              }`}
            >
              Empty State
            </button>
            <button
              type="button"
              onClick={() => setSimulationMode('normal')}
              className={`px-3 py-1.5 rounded-md border font-medium transition-colors cursor-pointer ${
                simulationMode === 'normal'
                  ? 'bg-primary-container text-white border-primary-container'
                  : 'bg-surface-card text-on-surface border-border-subtle hover:bg-surface-container'
              }`}
            >
              Reset Live View
            </button>
          </div>
        </section>

        {/* Subscription Cards Grid (or Simulated States) */}
        <section>
          {simulationMode === 'skeleton' || isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : simulationMode === 'empty' || subscriptions.length === 0 ? (
            <EmptyState
              icon="local_florist"
              title="You have no subscriptions yet."
              description="When you subscribe to curated plans or bespoke apothecary deliveries, they will appear here."
              primaryActionLabel="Explore Catalog & Memberships"
              onPrimaryAction={() => showToast('Connecting to Sanctuary Catalog...', 'info')}
              secondaryActionLabel="Contact concierge"
              onSecondaryAction={() => showToast('Concierge requested.', 'info')}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subscriptions.map((sub) => (
                <Card
                  key={sub.id}
                  hoverable
                  className="flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Identifier & Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs text-secondary uppercase tracking-wider font-medium">
                        {sub.subscriptionNumber}
                      </span>
                      <Badge status={sub.status} />
                    </div>

                    {/* Subscription Title */}
                    <h2
                      onClick={() => navigate(`/subscriptions/${sub.id}`)}
                      className="font-serif text-xl font-semibold text-on-surface mb-2 hover:text-primary transition-colors cursor-pointer"
                    >
                      {sub.planName}
                    </h2>
                    <p className="text-xs text-secondary line-clamp-2 mb-6 leading-relaxed">
                      {sub.tagline}
                    </p>

                    {/* Timeline Mini Anchor */}
                    <div className="bg-surface-container-low rounded-lg p-3 mb-6 flex items-center justify-between border border-border-subtle/40">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-primary">
                          event_upcoming
                        </span>
                        <span className="text-xs text-secondary">
                          {sub.status === 'closed' ? 'Terminated' : 'Next Renewal'}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-on-surface">
                        {sub.nextRenewalDate}
                      </span>
                    </div>

                    {/* Price & Period */}
                    <div className="mb-6">
                      <span className="font-serif text-2xl font-bold text-on-surface">
                        ${sub.pricePerPeriod.toFixed(2)}
                      </span>
                      <span className="text-xs text-secondary ml-1.5">
                        {sub.billingFrequency}
                      </span>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="pt-4 border-t border-border-subtle/50 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => navigate(`/subscriptions/${sub.id}`)}
                      className="inline-flex items-center gap-1 text-xs text-primary hover:text-accent-hover font-semibold transition-colors cursor-pointer group"
                    >
                      <span>{sub.status === 'closed' ? 'View archive' : 'View details'}</span>
                      <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                        arrow_forward
                      </span>
                    </button>
                    {sub.status === 'closed' ? (
                      <button
                        type="button"
                        onClick={() => showToast('Renew Tier protocol initialized.', 'info')}
                        className="text-xs text-primary hover:underline font-medium cursor-pointer"
                      >
                        Renew Tier
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => navigate(`/subscriptions/${sub.id}`)}
                        className="p-1 text-secondary hover:text-on-surface rounded hover:bg-surface-container-low transition-colors"
                        title="Manage subscription"
                      >
                        <span className="material-symbols-outlined text-[18px]">more_vert</span>
                      </button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Heritage Footer Guarantee */}
        <section className="p-6 rounded-[14px] bg-surface-card border border-border-subtle shadow-[0_4px_20px_-2px_rgba(28,25,23,0.05)] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-surface-container flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-[22px]">verified</span>
            </div>
            <div>
              <h4 className="font-serif text-sm font-semibold text-on-surface">
                Brightloop Guaranteed Distillation
              </h4>
              <p className="text-xs text-secondary">
                Pause, reschedule, or re-route any quarterly box with 48 hours notice prior to harvest allocation.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0 text-xs">
            <a href="#policy" className="text-secondary hover:text-on-surface">
              Client Policy
            </a>
            <span className="text-border-subtle">•</span>
            <button
              onClick={() => showToast('Payment settings dialog opened.', 'info')}
              className="text-primary hover:text-accent-hover font-semibold cursor-pointer"
            >
              Modify Payment Method →
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

