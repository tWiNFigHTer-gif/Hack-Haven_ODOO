import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { api, Invoice } from '../lib/api';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { useToast } from '../components/common/Toast';
import { downloadInvoicePDF } from '../lib/pdf';
import { PayNowModal } from '../components/payment/PayNowModal';

export const InvoiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPayModalOpen, setIsPayModalOpen] = useState(searchParams.get('pay') === 'true');

  useEffect(() => {
    async function loadInvoice() {
      setIsLoading(true);
      try {
        const inv = await api.invoices.getById(id || 'inv-2025-005');
        setInvoice(inv);
      } catch {
        showToast('Could not load invoice statement.', 'error');
      } finally {
        setIsLoading(false);
      }
    }
    loadInvoice();
  }, [id]);

  const handlePaymentSuccess = (invoiceId: string) => {
    if (invoice && invoice.id === invoiceId) {
      setInvoice({
        ...invoice,
        status: 'paid',
        paidAt: new Date().toLocaleDateString('en-US'),
        receiptRef: '#REC-98214-BT',
      });
    }
    showToast('Payment authorization successful. Statement settled.', 'success');
  };

  if (isLoading || !invoice) {
    return (
      <div className="w-full pt-28 pb-16 bg-background-canvas min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-[32px] text-primary animate-spin">
            progress_activity
          </span>
          <span className="text-sm text-secondary">Loading ledger record...</span>
        </div>
      </div>
    );
  }

  const isOverdue = invoice.status === 'overdue';

  return (
    <div className="w-full pt-24 pb-24 sm:pb-16 bg-background-canvas min-h-screen">
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 flex flex-col gap-6 sm:gap-8">
        {/* Top Breadcrumb & Desktop Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            onClick={() => navigate('/invoices')}
            className="inline-flex items-center gap-1.5 text-secondary hover:text-on-surface text-sm font-medium transition-colors group cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-0.5 transition-transform">
              arrow_back
            </span>
            <span>Back to Invoices</span>
          </button>

          {/* Desktop Floating Actions */}
          <div className="hidden sm:flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={() => downloadInvoicePDF(invoice)}
              leftIcon={<span className="material-symbols-outlined text-[18px]">download</span>}
            >
              Download PDF
            </Button>
            {invoice.status !== 'paid' && (
              <Button
                variant="primary"
                onClick={() => setIsPayModalOpen(true)}
                leftIcon={<span className="material-symbols-outlined text-[18px]">credit_card</span>}
              >
                Pay now
              </Button>
            )}
          </div>
        </div>

        {/* Urgent Overdue Notice Banner if overdue */}
        {isOverdue && (
          <div className="w-full bg-status-overdue-bg/70 rounded-xl p-4 sm:p-5 flex items-start gap-4 border border-status-overdue-bg shadow-sm">
            <div className="w-9 h-9 rounded-full bg-status-overdue-bg flex items-center justify-center shrink-0 text-status-overdue-text mt-0.5">
              <span className="material-symbols-outlined text-[20px]">notification_important</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-2 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-status-overdue-text text-sm">
                    Settlement Overdue
                  </span>
                  <span className="font-medium uppercase tracking-wider px-2 py-0.5 bg-status-overdue-bg text-status-overdue-text rounded text-[10px]">
                    Grace Period Active
                  </span>
                </div>
                <p className="text-secondary mt-0.5 leading-relaxed">
                  This statement concluded its standard 15-day botanical settlement terms on{' '}
                  <strong className="text-status-overdue-text font-semibold">{invoice.dueDate}</strong>. Please balance this invoice to avoid disruption to scheduled shipments.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPayModalOpen(true)}
                className="text-primary hover:text-accent-hover font-semibold underline underline-offset-4 shrink-0 cursor-pointer self-start sm:self-auto"
              >
                Settle Statement Now →
              </button>
            </div>
          </div>
        )}

        {/* Main Invoice Document Canvas */}
        <Card className="flex flex-col gap-8 relative overflow-hidden p-6 sm:p-10">
          {/* Header: Reference & Document Status */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-border-subtle">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-primary border border-border-subtle">
                  <span className="material-symbols-outlined text-[24px]">eco</span>
                </div>
                <div>
                  <span className="font-serif text-lg font-semibold text-on-surface block leading-tight">
                    Brightloop Sanctuary
                  </span>
                  <span className="text-[11px] uppercase tracking-widest text-secondary block font-medium">
                    Private Apothecary Archive
                  </span>
                </div>
              </div>
              <div className="pt-2">
                <span className="text-xs uppercase tracking-wider text-secondary font-medium block">
                  Document Reference
                </span>
                <span className="font-serif text-3xl font-bold text-on-surface tracking-tight">
                  {invoice.invoiceNumber}
                </span>
              </div>
            </div>

            {/* Document Dates Grid */}
            <div className="flex flex-wrap sm:flex-nowrap items-stretch gap-4 bg-surface-container-low/70 p-4 rounded-xl border border-border-subtle/50 text-xs">
              <div className="flex flex-col gap-0.5 pr-3">
                <span className="text-secondary uppercase tracking-wider font-medium text-[10px]">
                  Status
                </span>
                <Badge status={invoice.status} pulse={isOverdue} className="mt-1" />
              </div>
              <div className="hidden sm:block w-[1px] bg-border-subtle" />
              <div className="flex flex-col gap-0.5 px-3">
                <span className="text-secondary uppercase tracking-wider font-medium text-[10px]">
                  Issue Date
                </span>
                <span className="font-semibold text-on-surface mt-1">{invoice.issueDate}</span>
              </div>
              <div className="hidden sm:block w-[1px] bg-border-subtle" />
              <div className="flex flex-col gap-0.5 pl-3">
                <span className="text-secondary uppercase tracking-wider font-medium text-[10px]">
                  Due Date
                </span>
                <span
                  className={`mt-1 font-semibold flex items-center gap-1 ${
                    isOverdue ? 'text-status-overdue-text' : 'text-on-surface'
                  }`}
                >
                  <span>{invoice.dueDate}</span>
                  {isOverdue && <span className="material-symbols-outlined text-[14px]">event_busy</span>}
                </span>
              </div>
            </div>
          </div>

          {/* Bilateral Counterparties Grid (3 Cols) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-surface-container-low rounded-xl border border-border-subtle/50 text-xs">
            {/* Billed To */}
            <div className="flex flex-col gap-1">
              <span className="uppercase tracking-wider text-secondary font-semibold text-[10px]">
                Billed To
              </span>
              <h2 className="font-serif text-base font-semibold text-on-surface mt-0.5">
                {invoice.customer.name}
              </h2>
              <span className="text-primary font-medium">Client Reference: {invoice.customer.clientRef}</span>
              <div className="text-secondary mt-1 whitespace-pre-line leading-relaxed">
                {invoice.customer.address}
              </div>
              <span className="text-secondary mt-1">{invoice.customer.email}</span>
            </div>

            {/* Issued By */}
            <div className="flex flex-col gap-1">
              <span className="uppercase tracking-wider text-secondary font-semibold text-[10px]">
                Issued By
              </span>
              <h3 className="font-semibold text-on-surface mt-0.5">
                {invoice.issuer.company}
              </h3>
              <span className="text-secondary">Federal EIN: {invoice.issuer.ein}</span>
              <div className="text-secondary mt-1 whitespace-pre-line leading-relaxed">
                {invoice.issuer.address}
              </div>
              <span className="text-secondary mt-1">{invoice.issuer.email}</span>
            </div>

            {/* Linked Subscription */}
            <div className="flex flex-col justify-between bg-surface-card p-4 rounded-lg border border-border-subtle/50 shadow-xs">
              <div className="flex flex-col gap-1">
                <span className="uppercase tracking-wider text-secondary font-semibold text-[10px]">
                  Linked Subscription
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="material-symbols-outlined text-primary text-[18px]">spa</span>
                  <span className="font-semibold text-on-surface">{invoice.subscriptionName}</span>
                </div>
                <span className="text-secondary">Monthly Curation • {invoice.periodCovered}</span>
              </div>
              <div className="pt-3 mt-3 border-t border-border-subtle/50 flex items-center justify-between">
                <span className="text-secondary">Delivery Status</span>
                <span className="inline-flex items-center gap-1 text-status-active-text font-medium bg-status-active-bg px-2 py-0.5 rounded">
                  <span className="material-symbols-outlined text-[13px]">local_shipping</span>
                  Fulfilled
                </span>
              </div>
            </div>
          </div>

          {/* Line Items Section */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold text-on-surface">
                Curated Botanicals & Formulations
              </h2>
              <span className="text-xs uppercase tracking-wider text-secondary font-medium">
                Currency: USD ($)
              </span>
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low text-secondary text-xs uppercase tracking-wider">
                    <th className="py-2.5 px-4 rounded-l-lg font-medium">Item & Description</th>
                    <th className="py-2.5 px-4 text-center font-medium">Qty</th>
                    <th className="py-2.5 px-4 text-right font-medium">Unit Price</th>
                    <th className="py-2.5 px-4 text-right font-medium">Tax (8.875%)</th>
                    <th className="py-2.5 px-4 text-right rounded-r-lg font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle/50 text-sm">
                  {invoice.items.map((item) => (
                    <tr key={item.id} className="hover:bg-surface-container-low/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-3">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-11 h-11 rounded-lg object-cover shrink-0 border border-border-subtle/50"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-lg bg-surface-container flex items-center justify-center shrink-0 text-primary">
                              <span className="material-symbols-outlined text-[20px]">science</span>
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="font-semibold text-on-surface">{item.title}</span>
                            <span className="text-xs text-secondary mt-0.5">{item.description}</span>
                            {item.batch && (
                              <span className="text-[10px] text-secondary/70 mt-0.5 font-mono">
                                {item.batch}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-medium text-on-surface">
                        {item.quantity}
                      </td>
                      <td className="py-3.5 px-4 text-right text-on-surface">
                        ${item.unitPrice.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-right text-secondary text-xs">
                        ${item.tax.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-on-surface">
                        ${item.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  {/* Complimentary Shipping Line */}
                  <tr className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-lg bg-surface-container flex items-center justify-center shrink-0 text-primary">
                          <span className="material-symbols-outlined text-[22px]">package_2</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-on-surface">
                            Complimentary Courier Distillation Shipping
                          </span>
                          <span className="text-xs text-secondary">
                            Climate-controlled white-glove transit to Manhattan residence
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center text-on-surface">1</td>
                    <td className="py-3 px-4 text-right text-on-surface">$0.00</td>
                    <td className="py-3 px-4 text-right text-secondary text-xs">$0.00</td>
                    <td className="py-3 px-4 text-right font-semibold text-status-active-text">
                      Complimentary
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Items View */}
            <div className="sm:hidden flex flex-col gap-3">
              {invoice.items.map((item) => (
                <div key={item.id} className="p-3.5 bg-surface-container-low rounded-xl border border-border-subtle/40 text-xs">
                  <div className="flex items-center gap-3">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-10 h-10 rounded-lg object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
                        <span className="material-symbols-outlined text-[20px]">science</span>
                      </div>
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-on-surface truncate">{item.title}</span>
                      <span className="text-secondary text-[11px] truncate">{item.description}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2 mt-2 border-t border-border-subtle/50">
                    <span className="text-secondary">
                      Qty: {item.quantity} × ${item.unitPrice.toFixed(2)}
                    </span>
                    <span className="font-semibold text-on-surface">${item.amount.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Calculation & Totals Block */}
          <div className="pt-4 flex flex-col lg:flex-row gap-8 items-start justify-between">
            {/* Directives Note */}
            <div className="w-full lg:max-w-[460px] flex flex-col gap-4 text-xs">
              <div className="bg-surface-container-low/70 p-5 rounded-xl border border-border-subtle/50 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                  <span className="material-symbols-outlined text-[20px]">verified</span>
                  <span>Settlement Directives & Protocols</span>
                </div>
                <p className="text-secondary leading-relaxed">
                  Standard 15-day botanical settlement terms. Accepted settlement mechanisms include Private Client Card on file, Automated ACH Bank Transfer, and Instant UPI.
                </p>
                <div className="pt-2 flex items-center gap-3 text-secondary text-[11px]">
                  <span className="inline-flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">lock</span>
                    256-Bit Encrypted
                  </span>
                  <span>•</span>
                  <span>Tax Exemption: Non-Applicable</span>
                </div>
              </div>
            </div>

            {/* Totals Box */}
            <div className="w-full lg:max-w-[420px] bg-surface-container-low p-6 rounded-xl border border-border-subtle/60 flex flex-col gap-4 text-sm">
              <span className="text-xs uppercase tracking-wider text-secondary font-semibold">
                Financial Breakdown
              </span>
              <div className="flex flex-col gap-2.5 text-secondary">
                <div className="flex justify-between items-center">
                  <span>Gross Botanicals Subtotal</span>
                  <span className="text-on-surface font-semibold">${invoice.subtotal.toFixed(2)}</span>
                </div>
                {invoice.discount > 0 && (
                  <div className="flex justify-between items-center text-status-active-text font-medium">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">local_offer</span>
                      <span>{invoice.discountLabel || 'Solstice Benefit'}</span>
                    </div>
                    <span>-${invoice.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span>State & Local Tax (NY 8.875%)</span>
                  <span className="text-on-surface font-semibold">${invoice.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Cold-Chain Express Shipping</span>
                  <span className="text-on-surface font-semibold">$0.00</span>
                </div>
              </div>

              <div className="w-full h-[1px] bg-border-subtle" />

              <div className="flex items-baseline justify-between pt-1">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wider text-secondary font-semibold">
                    Total Amount Due
                  </span>
                  {isOverdue && (
                    <span className="text-[11px] text-status-overdue-text font-medium">
                      Immediate settlement requested
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-serif text-3xl font-bold text-on-surface">
                    ${invoice.totalAmount.toFixed(2)}
                  </span>
                  <span className="text-xs text-secondary font-semibold uppercase">USD</span>
                </div>
              </div>

              {invoice.status !== 'paid' ? (
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full mt-2"
                  onClick={() => setIsPayModalOpen(true)}
                  leftIcon={<span className="material-symbols-outlined text-[20px]">credit_card</span>}
                >
                  Authorize & Pay ${invoice.totalAmount.toFixed(2)}
                </Button>
              ) : (
                <div className="p-3 bg-status-active-bg text-status-active-text rounded-lg text-center font-semibold text-xs flex items-center justify-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">done_all</span>
                  <span>Invoice Settled in Full</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Sticky Bottom Mobile Action Dock (≤640px) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-card/95 backdrop-blur-md p-4 border-t border-border-subtle shadow-[0_-4px_16px_rgba(28,25,23,0.08)] flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-[10px] text-secondary uppercase font-semibold">
            {invoice.status === 'paid' ? 'Statement Paid' : 'Amount Due'}
          </span>
          <span className="font-serif text-xl font-bold text-on-surface leading-tight">
            ${invoice.totalAmount.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadInvoicePDF(invoice)}
            className="h-11 w-11 bg-surface-container-low border border-border-subtle rounded-[10px] flex items-center justify-center text-secondary active:scale-95"
            title="Download PDF"
          >
            <span className="material-symbols-outlined text-[20px]">download</span>
          </button>
          {invoice.status !== 'paid' && (
            <Button
              variant="primary"
              onClick={() => setIsPayModalOpen(true)}
              className="h-11 px-5"
            >
              Pay now
            </Button>
          )}
        </div>
      </div>

      {/* Pay Modal */}
      {isPayModalOpen && (
        <PayNowModal
          isOpen={true}
          invoice={invoice}
          onClose={() => setIsPayModalOpen(false)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};
