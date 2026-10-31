import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, Subscription, Invoice, SubscriptionLifecycle } from '../lib/api';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Table } from '../components/common/Table';
import { useToast } from '../components/common/Toast';
import { downloadInvoicePDF } from '../lib/pdf';

export const SubscriptionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [relatedInvoices, setRelatedInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const sub = await api.subscriptions.getById(id || 'sub-84920');
        setSubscription(sub);
        const invs = await api.invoices.list('all');
        setRelatedInvoices(invs.filter((i) => !sub || i.subscriptionName === sub.planName || i.subscriptionId === sub.id));
      } catch {
        showToast('Could not load subscription details.', 'error');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleTogglePause = async () => {
    if (!subscription) return;
    setIsUpdating(true);
    try {
      const updated = await api.subscriptions.togglePause(subscription.id);
      setSubscription(updated);
      showToast(
        updated.status === 'paused'
          ? 'Subscription has been temporarily suspended. No charges will incur.'
          : 'Subscription resumed. Next solstice shipment active.',
        'success'
      );
    } catch {
      showToast('Failed to update subscription status.', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSetStateSimulator = async (newStatus: 'active' | 'paused' | 'closed') => {
    if (!subscription) return;
    try {
      const updated = await api.subscriptions.updateStatus(subscription.id, newStatus);
      setSubscription(updated);
      showToast(`Subscription status simulated as ${newStatus}.`, 'info');
    } catch {
      showToast('Could not set simulated status.', 'error');
    }
  };

  if (isLoading || !subscription) {
    return (
      <div className="w-full pt-28 pb-16 bg-background-canvas min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-[32px] text-primary animate-spin">
            progress_activity
          </span>
          <span className="text-sm text-secondary">Loading sanctuary record...</span>
        </div>
      </div>
    );
  }

  const timelineSteps: { name: SubscriptionLifecycle; date: string }[] = [
    { name: 'Draft', date: 'Mar 28, 2024' },
    { name: 'Quotation', date: 'Apr 02, 2024' },
    { name: 'Confirmed', date: 'Apr 10, 2024' },
    { name: 'Active', date: 'Apr 15, 2024' },
    { name: 'Closed', date: 'Muted' },
  ];

  const currentStepIndex =
    subscription.status === 'closed' ? 4 : subscription.status === 'paused' ? 3 : 3;

  return (
    <div className="w-full pt-24 pb-16 bg-background-canvas min-h-screen">
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 flex flex-col gap-6 sm:gap-8">
        {/* Top Breadcrumb & Simulator Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-secondary font-medium">
            <button
              onClick={() => navigate('/subscriptions')}
              className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Back to Subscriptions</span>
            </button>
            <span className="text-border-subtle">/</span>
            <span className="uppercase tracking-wider">Sanctuary Client</span>
            <span className="text-border-subtle">/</span>
            <span className="text-on-surface font-semibold">{subscription.subscriptionNumber}</span>
          </div>

          {/* Preview Mode Switcher */}
          <div className="flex items-center gap-1.5 bg-surface-container-low p-1 rounded-lg self-start sm:self-auto border border-border-subtle/50 text-xs shadow-sm">
            <span className="text-secondary uppercase tracking-widest px-2 text-[10px] font-semibold">
              Preview Mode:
            </span>
            <button
              type="button"
              onClick={() => handleSetStateSimulator('active')}
              className={`px-2.5 py-1 rounded-[6px] font-medium transition-all cursor-pointer ${
                subscription.status === 'active'
                  ? 'bg-primary-container text-white shadow-sm'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => handleSetStateSimulator('paused')}
              className={`px-2.5 py-1 rounded-[6px] font-medium transition-all cursor-pointer ${
                subscription.status === 'paused'
                  ? 'bg-status-paused-bg text-status-paused-text shadow-sm'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              Paused
            </button>
            <button
              type="button"
              onClick={() => handleSetStateSimulator('closed')}
              className={`px-2.5 py-1 rounded-[6px] font-medium transition-all cursor-pointer ${
                subscription.status === 'closed'
                  ? 'bg-status-closed-bg text-status-closed-text shadow-sm'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              Closed
            </button>
          </div>
        </div>

        {/* Editorial Header Card */}
        <Card className="flex flex-col gap-6">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="flex flex-col gap-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase tracking-wider text-secondary bg-surface-container px-2 py-0.5 rounded font-medium">
                  Atelier Botanical Plan
                </span>
                <span className="text-xs text-secondary">{subscription.edition}</span>
              </div>
              <div className="flex items-center gap-3 flex-wrap mt-1">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
                  {subscription.planName}
                </h1>
                <span className="text-sm text-secondary font-mono">
                  #{subscription.subscriptionNumber}
                </span>
                <Badge status={subscription.status} pulse={subscription.status === 'active'} />
              </div>
              <p className="text-sm text-secondary mt-0.5 leading-relaxed">
                {subscription.tagline}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3 self-start lg:self-center flex-wrap">
              <Button
                variant="secondary"
                size="md"
                isLoading={isUpdating}
                onClick={handleTogglePause}
                leftIcon={
                  <span className="material-symbols-outlined text-[18px]">
                    {subscription.status === 'active' ? 'pause_circle' : 'play_circle'}
                  </span>
                }
              >
                {subscription.status === 'active'
                  ? 'Pause Subscription'
                  : subscription.status === 'paused'
                  ? 'Resume Subscription'
                  : 'Re-enroll Plan'}
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => showToast('Compiling summary sheet...', 'info')}
                leftIcon={
                  <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                }
              >
                Download Summary PDF
              </Button>
            </div>
          </div>

          {/* Key-Value Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-surface-container-low/60 rounded-xl border border-border-subtle/50 text-xs">
            <div className="flex flex-col gap-0.5">
              <span className="text-secondary uppercase tracking-wider font-medium text-[11px]">
                Start Date
              </span>
              <span className="font-semibold text-on-surface">{subscription.startDate}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-secondary uppercase tracking-wider font-medium text-[11px]">
                Next Expiry / Renewal
              </span>
              <span className="font-semibold text-on-surface">{subscription.nextRenewalDate}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-secondary uppercase tracking-wider font-medium text-[11px]">
                Payment Terms
              </span>
              <span className="font-semibold text-on-surface">Quarterly Solstice Batch</span>
              <span className="text-secondary text-[11px]">Auto-renewal enabled</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-secondary uppercase tracking-wider font-medium text-[11px]">
                Payment Method
              </span>
              <div className="flex items-center gap-1.5 font-semibold text-on-surface">
                <span className="material-symbols-outlined text-[16px] text-primary">credit_card</span>
                <span>
                  {subscription.paymentMethod.brand} •••• {subscription.paymentMethod.last4}
                </span>
              </div>
              <span className="text-secondary text-[11px]">
                Expires {subscription.paymentMethod.exp}
              </span>
            </div>
          </div>
        </Card>

        {/* Horizontal Status Timeline */}
        <Card className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-secondary font-semibold">
              Lifecycle Status Progression
            </span>
            <span className="text-xs text-secondary">
              Current State:{' '}
              <strong className="text-on-surface font-semibold">
                {subscription.status === 'paused'
                  ? 'Temporarily Suspended'
                  : subscription.status === 'closed'
                  ? 'Terminated Archive'
                  : 'Confirmed & In Active Dispatch Cycle'}
              </strong>
            </span>
          </div>

          <div className="relative w-full pt-4 pb-2 overflow-x-auto">
            <div className="min-w-[620px] flex items-center justify-between relative px-6">
              {/* Background Track Line */}
              <div className="absolute left-10 right-10 top-[18px] h-[2px] bg-border-subtle -z-0" />

              {/* Dynamic Progress Line */}
              <div
                className="absolute left-10 top-[18px] h-[2px] bg-primary transition-all duration-500 -z-0"
                style={{
                  width: `${(currentStepIndex / (timelineSteps.length - 1)) * 100}%`,
                }}
              />

              {/* Timeline Steps */}
              {timelineSteps.map((step, idx) => {
                const isPassed = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={step.name} className="flex flex-col items-center text-center gap-2 relative z-10">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                        isCurrent
                          ? subscription.status === 'paused'
                            ? 'bg-status-paused-bg text-status-paused-text shadow-md ring-4 ring-status-paused-bg/30'
                            : subscription.status === 'closed'
                            ? 'bg-status-closed-bg text-status-closed-text ring-4 ring-status-closed-bg/30'
                            : 'bg-primary-container text-white shadow-md ring-4 ring-primary-container/20'
                          : isPassed
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-surface-container text-secondary'
                      }`}
                    >
                      {isPassed ? (
                        <span className="material-symbols-outlined text-[16px]">check</span>
                      ) : isCurrent ? (
                        <span className="material-symbols-outlined text-[18px]">
                          {subscription.status === 'paused' ? 'pause' : 'spa'}
                        </span>
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-secondary" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span
                        className={`text-xs font-semibold ${
                          isCurrent ? 'text-primary' : 'text-on-surface'
                        }`}
                      >
                        {step.name}
                      </span>
                      <span className="text-[10px] text-secondary">{step.date}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Main Two-Column Layout (8 cols + 4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Left Column (8 cols): Items Table & Protocols */}
          <div className="lg:col-span-8 flex flex-col gap-6 sm:gap-8">
            {/* Subscription Items Card */}
            <Card className="flex flex-col gap-4">
              <div className="flex items-center justify-between pb-1">
                <div>
                  <h2 className="font-serif text-lg font-semibold text-on-surface">
                    Subscription Items & Allocations
                  </h2>
                  <p className="text-xs text-secondary mt-0.5">
                    Solstice batch allocations prepared in UV-proof apothecary vessels.
                  </p>
                </div>
                <span className="text-xs bg-surface-container-low text-secondary px-2.5 py-1 rounded font-medium">
                  Batch No. SOL-09
                </span>
              </div>

              {/* Items Table */}
              <Table
                headers={[
                  'Product / Formulation',
                  <span key="qty" className="block text-center">Qty</span>,
                  'Cycle',
                  'Unit Price',
                  'Tax',
                  'Amount',
                ]}
              >
                {subscription.items.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center shrink-0 text-primary">
                          <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium text-on-surface truncate">{item.name}</span>
                          <span className="text-xs text-secondary">{item.description}</span>
                          {item.batchInfo && (
                            <span className="text-[10px] text-secondary/70 mt-0.5">
                              {item.batchInfo}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center font-medium text-on-surface">
                      {item.quantity}
                    </td>
                    <td className="py-4 px-4 text-xs text-secondary">{item.cycle}</td>
                    <td className="py-4 px-4 text-right text-on-surface">
                      ${item.unitPrice.toFixed(2)}
                    </td>
                    <td className="py-4 px-4 text-right text-secondary text-xs">
                      ${item.tax.toFixed(2)}
                    </td>
                    <td className="py-4 px-4 text-right font-semibold text-on-surface">
                      ${item.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </Table>

              {/* Assurance Banner */}
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-container-low/70 border border-border-subtle/40">
                <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">
                  nest_eco_leaf
                </span>
                <div className="text-xs text-on-surface">
                  <span className="font-semibold block mb-0.5">Bespoke Apothecary Assurance</span>
                  <p className="text-secondary leading-relaxed">
                    Each formulation is bottled under sterile inert nitrogen gas 48 hours prior to dispatch. Sealed with virgin beeswax stamps.
                  </p>
                </div>
              </div>
            </Card>

            {/* Delivery Protocol Card */}
            <Card className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg font-semibold text-on-surface">
                  Delivery & Allocation Protocol
                </h3>
                <button
                  type="button"
                  onClick={() => showToast('Address update modal requested.', 'info')}
                  className="text-xs text-primary hover:underline flex items-center gap-1 font-medium cursor-pointer"
                >
                  <span>Change delivery address</span>
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                {/* Destination */}
                <div className="flex flex-col gap-1 p-3.5 rounded-xl bg-surface-container-low border border-border-subtle/40">
                  <div className="flex items-center gap-1.5 text-secondary mb-1">
                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                    <span className="uppercase tracking-wider font-medium text-[10px]">
                      Destination
                    </span>
                  </div>
                  <span className="font-semibold text-on-surface">{subscription.destination.name}</span>
                  <span className="text-secondary">{subscription.destination.street}</span>
                  <span className="text-secondary">
                    {subscription.destination.city}, {subscription.destination.state} {subscription.destination.zip}
                  </span>
                </div>

                {/* Courier */}
                <div className="flex flex-col gap-1 p-3.5 rounded-xl bg-surface-container-low border border-border-subtle/40">
                  <div className="flex items-center gap-1.5 text-secondary mb-1">
                    <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                    <span className="uppercase tracking-wider font-medium text-[10px]">
                      Courier Service
                    </span>
                  </div>
                  <span className="font-semibold text-on-surface">{subscription.courier.service}</span>
                  <span className="text-secondary">{subscription.courier.spec}</span>
                  <span className="text-status-active-text font-medium mt-1">
                    {subscription.courier.note}
                  </span>
                </div>

                {/* Dispatch Window */}
                <div className="flex flex-col gap-1 p-3.5 rounded-xl bg-surface-container-low border border-border-subtle/40">
                  <div className="flex items-center gap-1.5 text-secondary mb-1">
                    <span className="material-symbols-outlined text-[18px]">schedule</span>
                    <span className="uppercase tracking-wider font-medium text-[10px]">
                      Dispatch Window
                    </span>
                  </div>
                  <span className="font-semibold text-on-surface">April 12 – April 15, 2025</span>
                  <span className="text-secondary">{subscription.nextBatch.name}</span>
                  <span className="text-secondary mt-1">Tracking issued 24h prior</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column (4 cols): Totals & Scheduled Charge */}
          <div className="lg:col-span-4 flex flex-col gap-6 sticky top-24">
            <Card className="flex flex-col gap-4">
              <div className="flex items-center justify-between pb-1">
                <h2 className="font-serif text-lg font-semibold text-on-surface">
                  Totals & Billing
                </h2>
                <span className="text-xs uppercase tracking-wider text-secondary font-medium">
                  Recurring Summary
                </span>
              </div>

              {/* Financial Breakdown */}
              <div className="flex flex-col gap-2.5 text-sm pt-1">
                <div className="flex justify-between items-center text-secondary">
                  <span>Line Items Subtotal</span>
                  <span className="text-on-surface font-medium">$180.00</span>
                </div>
                <div className="flex justify-between items-center text-secondary">
                  <span>State & Local Tax (8.875%)</span>
                  <span className="text-on-surface font-medium">$15.98</span>
                </div>
                <div className="flex justify-between items-center text-secondary">
                  <span>Courier Distillation Shipping</span>
                  <span className="text-status-active-text font-medium text-xs">
                    Included (Complimentary)
                  </span>
                </div>
                <div className="flex justify-between items-center text-secondary">
                  <span>Sanctuary Vessel Deposit</span>
                  <span className="text-on-surface font-medium">$0.00</span>
                </div>

                {/* Grand Total */}
                <div className="pt-3 mt-2 bg-surface-container-low/70 rounded-xl p-4 flex flex-col gap-1 border border-border-subtle/50">
                  <span className="text-[11px] uppercase tracking-wider text-secondary font-semibold">
                    Total Per Period
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif text-3xl font-bold text-on-surface">
                      ${subscription.pricePerPeriod.toFixed(2)}
                    </span>
                    <span className="text-xs text-secondary font-medium">
                      {subscription.billingFrequency}
                    </span>
                  </div>
                  <span className="text-[11px] text-secondary mt-1">
                    Inclusive of applicable regional tax credits.
                  </span>
                </div>
              </div>

              {/* Next Scheduled Charge Block */}
              <div className="p-4 rounded-xl bg-surface-container-low flex flex-col gap-2 border border-border-subtle/40 text-xs">
                <div className="flex items-center gap-2 font-medium text-on-surface">
                  <span className="material-symbols-outlined text-primary text-[18px]">
                    calendar_clock
                  </span>
                  <span>Next Scheduled Charge</span>
                </div>
                <div className="flex flex-col gap-1 text-secondary pt-1">
                  <div className="flex justify-between">
                    <span>Charge Date:</span>
                    <span className="font-medium text-on-surface">{subscription.nextRenewalDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Source:</span>
                    <span className="font-medium text-on-surface">
                      {subscription.paymentMethod.brand} •••• {subscription.paymentMethod.last4}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="text-status-active-text font-medium">
                      {subscription.status === 'paused' ? 'Hold active' : 'Scheduled for batch pull'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Inquire link */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => showToast('Connecting you with your dedicated atelier concierge.', 'info')}
                  className="text-xs text-secondary hover:text-primary transition-colors flex items-center justify-center gap-1 mx-auto cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">help_outline</span>
                  <span>Inquire with Private Concierge Desk</span>
                </button>
              </div>
            </Card>
          </div>
        </div>

        {/* Related Invoices Section */}
        <Card className="flex flex-col gap-4">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-lg font-semibold text-on-surface">Related Invoices</h2>
              <span className="text-xs text-secondary font-medium">
                ({relatedInvoices.length})
              </span>
            </div>
            <button
              type="button"
              onClick={() => navigate('/invoices')}
              className="text-xs text-primary hover:underline flex items-center gap-1 font-medium cursor-pointer"
            >
              <span>View all invoices archive</span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>

          <Table
            headers={[
              'Invoice Number',
              'Billing Date',
              'Period Covered',
              'Amount',
              <span key="status" className="block text-center">Status</span>,
              'Actions',
            ]}
          >
            {relatedInvoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-surface-container-low/40 transition-colors">
                <td className="py-4 px-4 font-medium text-on-surface">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[18px]">
                      receipt_long
                    </span>
                    <span>{inv.invoiceNumber}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-xs text-secondary">{inv.issueDate}</td>
                <td className="py-4 px-4 text-xs text-secondary">{inv.periodCovered}</td>
                <td className="py-4 px-4 text-right font-medium text-on-surface">
                  ${inv.totalAmount.toFixed(2)}
                </td>
                <td className="py-4 px-4 text-center">
                  <Badge status={inv.status} />
                </td>
                <td className="py-4 px-4 text-right">
                  <div className="flex items-center justify-end gap-3 text-xs">
                    <button
                      type="button"
                      onClick={() => downloadInvoicePDF(inv)}
                      className="text-secondary hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">download</span>
                      <span>PDF</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/invoices/${inv.id}`)}
                      className="text-primary hover:underline font-semibold cursor-pointer"
                    >
                      View invoice
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>
    </div>
  );
};

