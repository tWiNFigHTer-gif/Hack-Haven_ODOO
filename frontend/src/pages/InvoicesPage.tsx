import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, Invoice } from '../lib/api';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Table } from '../components/common/Table';
import { TableSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../components/common/Toast';
import { downloadInvoicePDF } from '../lib/pdf';
import { PayNowModal } from '../components/payment/PayNowModal';

export const InvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filter, setFilter] = useState<'all' | 'outstanding' | 'paid'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [demoState, setDemoState] = useState<'normal' | 'skeleton' | 'empty'>('normal');

  // Pay modal state
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null);

  const navigate = useNavigate();
  const { showToast } = useToast();

  const loadInvoices = async () => {
    setIsLoading(true);
    try {
      const data = await api.invoices.list('all');
      setInvoices(data);
    } catch {
      showToast('Could not load invoices.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  // Filter & search
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesFilter =
        filter === 'all'
          ? true
          : filter === 'outstanding'
          ? inv.status === 'outstanding' || inv.status === 'overdue'
          : inv.status === 'paid';

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.subscriptionName.toLowerCase().includes(q);

      return matchesFilter && matchesSearch;
    });
  }, [invoices, filter, searchQuery]);

  const totalInvoiced = invoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const outstandingInvoices = invoices.filter((i) => i.status === 'outstanding' || i.status === 'overdue');
  const outstandingAmount = outstandingInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const paidInvoices = invoices.filter((i) => i.status === 'paid');
  const settledAmount = paidInvoices.reduce((sum, i) => sum + i.totalAmount, 0);

  const handlePaymentSuccess = (invoiceId: string) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId
          ? { ...inv, status: 'paid', paidAt: new Date().toLocaleDateString('en-US') }
          : inv
      )
    );
    showToast('Payment settled in full. Thank you!', 'success');
  };

  return (
    <div className="w-full pt-24 pb-16 bg-background-canvas min-h-screen">
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 flex flex-col gap-6 sm:gap-8">
        {/* Top Contextual Strip & Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2 text-secondary text-xs uppercase tracking-wider font-medium">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary-container" />
              <span>Financial Archives & Ledgers</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-on-surface tracking-tight">
              Invoices
            </h1>
            <p className="text-sm text-secondary leading-relaxed">
              Review billing history, download official tax statements, and settle outstanding balances in your bespoke archive.
            </p>
          </div>

          {/* Action & Filter Presets */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => {
                const next =
                  demoState === 'normal'
                    ? 'skeleton'
                    : demoState === 'skeleton'
                    ? 'empty'
                    : 'normal';
                setDemoState(next);
              }}
              className="px-3.5 py-2 bg-surface-container-low hover:bg-surface-container text-on-surface rounded-lg transition-colors text-xs font-medium flex items-center gap-1.5 border border-border-subtle/50 cursor-pointer shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">sync_alt</span>
              <span>
                State: {demoState === 'normal' ? 'Live' : demoState === 'skeleton' ? 'Skeleton' : 'Empty'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => showToast('Compiling cumulative annual tax statement...', 'info')}
              className="px-3.5 py-2 bg-surface-card hover:bg-surface-container-low text-on-surface rounded-lg transition-colors text-xs font-medium flex items-center gap-1.5 border border-border-subtle shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">receipt_long</span>
              <span>Annual Tax Statement</span>
            </button>
          </div>
        </div>

        {/* Editorial Metrics Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Metric 1: Total Invoiced */}
          <Card className="flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between text-secondary mb-3">
              <span className="text-xs uppercase tracking-wider font-medium">Total Invoiced</span>
              <span className="material-symbols-outlined text-secondary text-[20px]">
                account_balance_wallet
              </span>
            </div>
            <div>
              <div className="font-serif text-2xl sm:text-3xl font-bold text-on-surface mb-0.5">
                ${totalInvoiced.toFixed(2)}
              </div>
              <p className="text-xs text-secondary">
                Cumulative across {invoices.length} ledger entries
              </p>
            </div>
          </Card>

          {/* Metric 2: Overdue / Outstanding */}
          <Card
            className={`flex flex-col justify-between relative overflow-hidden ${
              outstandingAmount > 0
                ? 'bg-gradient-to-br from-surface-card via-surface-card to-status-overdue-bg/30 border-status-overdue-bg'
                : ''
            }`}
          >
            <div className="flex items-center justify-between text-status-overdue-text mb-3">
              <span className="text-xs uppercase tracking-wider font-semibold">
                Outstanding Action
              </span>
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-status-overdue-bg text-status-overdue-text">
                <span className="material-symbols-outlined text-[16px]">priority_high</span>
              </span>
            </div>
            <div>
              <div className="font-serif text-2xl sm:text-3xl font-bold text-status-overdue-text mb-0.5">
                ${outstandingAmount.toFixed(2)}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-status-overdue-text animate-pulse" />
                <p className="text-xs text-status-overdue-text font-medium">
                  {outstandingInvoices.length} statement requires settlement
                </p>
              </div>
            </div>
          </Card>

          {/* Metric 3: Fully Settled */}
          <Card className="flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between text-status-active-text mb-3">
              <span className="text-xs uppercase tracking-wider font-medium">Settled to Date</span>
              <span className="material-symbols-outlined text-status-active-text text-[20px]">
                check_circle
              </span>
            </div>
            <div>
              <div className="font-serif text-2xl sm:text-3xl font-bold text-on-surface mb-0.5">
                ${settledAmount.toFixed(2)}
              </div>
              <p className="text-xs text-secondary">
                {paidInvoices.length} billing statements verified paid
              </p>
            </div>
          </Card>
        </div>

        {/* Main Invoices Table Card */}
        <Card className="flex flex-col gap-6">
          {/* Toolbar & Filter Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border-subtle/50">
            {/* Tabs */}
            <div className="flex items-center gap-1 p-1 bg-surface-container-low rounded-lg border border-border-subtle/50 self-start sm:self-auto text-xs">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`px-3.5 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                  filter === 'all'
                    ? 'bg-primary-container text-white shadow-sm'
                    : 'text-secondary hover:text-on-surface'
                }`}
              >
                All ({invoices.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('outstanding')}
                className={`px-3.5 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  filter === 'outstanding'
                    ? 'bg-primary-container text-white shadow-sm'
                    : 'text-secondary hover:text-on-surface'
                }`}
              >
                <span>Outstanding ({outstandingInvoices.length})</span>
                {outstandingInvoices.length > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-status-overdue-text animate-pulse" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setFilter('paid')}
                className={`px-3.5 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                  filter === 'paid'
                    ? 'bg-primary-container text-white shadow-sm'
                    : 'text-secondary hover:text-on-surface'
                }`}
              >
                Paid ({paidInvoices.length})
              </button>
            </div>

            {/* Search Input */}
            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-64">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by statement #..."
                  className="w-full pl-9 pr-3 py-1.5 bg-surface-container-low focus:bg-surface-card border border-border-subtle/50 rounded-lg text-xs text-on-surface placeholder:text-secondary focus:outline-none focus:ring-1 focus:ring-primary-container transition-all"
                />
              </div>
              <button
                type="button"
                onClick={() => showToast('Exporting ledger CSV...', 'info')}
                className="p-2 bg-surface-container-low hover:bg-surface-container text-secondary hover:text-on-surface rounded-lg transition-colors border border-border-subtle/40 cursor-pointer"
                title="Export ledger list"
              >
                <span className="material-symbols-outlined text-[18px]">file_download</span>
              </button>
            </div>
          </div>

          {/* Render States */}
          {demoState === 'skeleton' || isLoading ? (
            <TableSkeleton rows={5} />
          ) : demoState === 'empty' || filteredInvoices.length === 0 ? (
            <EmptyState
              icon="receipt_long"
              title="No billing archives found"
              description="Your statements and invoices will automatically populate here once subscriptions cycle or private appointments are confirmed."
              primaryActionLabel="Reset Filter"
              onPrimaryAction={() => {
                setFilter('all');
                setSearchQuery('');
                setDemoState('normal');
              }}
              secondaryActionLabel="Contact Concierge"
              onSecondaryAction={() => showToast('Concierge requested.', 'info')}
            />
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <Table
                  headers={[
                    'Invoice Number',
                    'Date',
                    'Due Date',
                    'Subscription / Plan',
                    'Amount',
                    <span key="st" className="block text-center">Status</span>,
                    'Actions',
                  ]}
                >
                  {filteredInvoices.map((inv) => {
                    const isOverdue = inv.status === 'overdue';

                    return (
                      <tr
                        key={inv.id}
                        className={`transition-colors ${
                          isOverdue
                            ? 'bg-status-overdue-bg/40 hover:bg-status-overdue-bg/60'
                            : 'hover:bg-surface-container-low/40'
                        }`}
                      >
                        <td className="py-4 px-4 font-medium text-on-surface">
                          <div className="flex items-center gap-2">
                            {isOverdue && (
                              <span className="material-symbols-outlined text-status-overdue-text text-[18px]">
                                error
                              </span>
                            )}
                            <button
                              onClick={() => navigate(`/invoices/${inv.id}`)}
                              className="font-medium hover:text-primary transition-colors text-left"
                            >
                              {inv.invoiceNumber}
                            </button>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-xs text-secondary">{inv.issueDate}</td>
                        <td className="py-4 px-4 text-xs">
                          <span
                            className={`flex items-center gap-1 font-medium ${
                              isOverdue ? 'text-status-overdue-text' : 'text-secondary'
                            }`}
                          >
                            <span>{inv.dueDate}</span>
                            {isOverdue && (
                              <span className="material-symbols-outlined text-[14px]">warning</span>
                            )}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-xs font-semibold text-on-surface">
                            {inv.subscriptionName}
                          </div>
                          <div className="text-[11px] text-secondary">{inv.periodCovered}</div>
                        </td>
                        <td className="py-4 px-4 text-right font-serif text-base font-semibold text-on-surface">
                          ${inv.totalAmount.toFixed(2)}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Badge status={inv.status} pulse={isOverdue} />
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="inline-flex items-center gap-2 text-xs">
                            {inv.status !== 'paid' && (
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => setSelectedInvoiceForPayment(inv)}
                                leftIcon={
                                  <span className="material-symbols-outlined text-[15px]">
                                    credit_card
                                  </span>
                                }
                              >
                                Pay now
                              </Button>
                            )}
                            <button
                              type="button"
                              onClick={() => navigate(`/invoices/${inv.id}`)}
                              className="p-1.5 text-secondary hover:text-on-surface hover:bg-surface-container rounded transition-colors"
                              title="View details"
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                visibility
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => downloadInvoicePDF(inv)}
                              className="p-1.5 text-secondary hover:text-on-surface hover:bg-surface-container rounded transition-colors"
                              title="Download PDF"
                            >
                              <span className="material-symbols-outlined text-[18px]">download</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </Table>
              </div>

              {/* Mobile Stacked Card View */}
              <div className="md:hidden space-y-4">
                {filteredInvoices.map((inv) => {
                  const isOverdue = inv.status === 'overdue';

                  return (
                    <div
                      key={inv.id}
                      className={`p-4 rounded-xl space-y-3 border ${
                        isOverdue
                          ? 'bg-status-overdue-bg/30 border-status-overdue-bg/60'
                          : 'bg-surface-container-low/40 border-border-subtle/40'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-sm font-semibold text-on-surface flex items-center gap-1">
                            {inv.invoiceNumber}
                            {isOverdue && (
                              <span className="material-symbols-outlined text-status-overdue-text text-[16px]">
                                priority_high
                              </span>
                            )}
                          </span>
                          <span className="text-[11px] text-secondary">
                            Issued {inv.issueDate}
                          </span>
                        </div>
                        <Badge status={inv.status} pulse={isOverdue} />
                      </div>

                      <div className="text-xs text-on-surface font-medium">
                        {inv.subscriptionName}
                      </div>

                      <div className="flex items-baseline justify-between pt-1 text-xs">
                        <div>
                          <div className="text-secondary text-[11px]">Due Date</div>
                          <div
                            className={`font-semibold ${
                              isOverdue ? 'text-status-overdue-text' : 'text-on-surface'
                            }`}
                          >
                            {inv.dueDate}
                          </div>
                        </div>
                        <div className="font-serif text-lg font-bold text-on-surface">
                          ${inv.totalAmount.toFixed(2)}
                        </div>
                      </div>

                      <div className="pt-2 flex items-center gap-2">
                        {inv.status !== 'paid' && (
                          <Button
                            size="sm"
                            variant="primary"
                            className="flex-1"
                            onClick={() => setSelectedInvoiceForPayment(inv)}
                            leftIcon={
                              <span className="material-symbols-outlined text-[15px]">
                                credit_card
                              </span>
                            }
                          >
                            Pay now
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => navigate(`/invoices/${inv.id}`)}
                          className={inv.status === 'paid' ? 'flex-1' : ''}
                        >
                          View
                        </Button>
                        <button
                          type="button"
                          onClick={() => downloadInvoicePDF(inv)}
                          className="p-2 bg-surface-card border border-border-subtle rounded-lg text-secondary hover:text-on-surface"
                          title="Download PDF"
                        >
                          <span className="material-symbols-outlined text-[18px]">download</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Ledger Footer Pagination / Meta */}
              <div className="pt-4 border-t border-border-subtle/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-secondary">
                <div>
                  Showing 1 to {filteredInvoices.length} of {invoices.length} statements
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-status-active-text" />
                  <span>Ledger current as of today</span>
                </div>
              </div>
            </>
          )}
        </Card>

        {/* Assurance Note */}
        <section className="p-4 bg-surface-container-low/60 rounded-xl border border-border-subtle/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-secondary">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-[20px]">verified_user</span>
            <span>Encrypted payment reconciliation provided through Brightloop Vault & Stripe.</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#dispute" className="underline hover:text-on-surface">Dispute Policy</a>
            <a href="#vat" className="underline hover:text-on-surface">VAT & Tax ID Settings</a>
          </div>
        </section>
      </div>

      {/* Pay Now Modal Trigger */}
      {selectedInvoiceForPayment && (
        <PayNowModal
          isOpen={true}
          invoice={selectedInvoiceForPayment}
          onClose={() => setSelectedInvoiceForPayment(null)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

