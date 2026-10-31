import React, { useState } from 'react';
import { StaffLayout } from '../../components/staff/StaffLayout';
import { useToast } from '../../components/common/Toast';

export type StaffInvoiceStatus = 'Draft' | 'Confirmed' | 'Paid' | 'Overdue' | 'Cancelled';

export interface StaffInvoice {
  id: string;
  number: string;
  customerName: string;
  customerEmail: string;
  subscriptionNumber: string;
  amount: number;
  balanceDue: number;
  status: StaffInvoiceStatus;
  issueDate: string;
  dueDate: string;
  lineItemsCount: number;
}

const INITIAL_INVOICES: StaffInvoice[] = [
  {
    id: 'inv-8841-01',
    number: 'INV-2024-8841',
    customerName: 'Acme Studio Group',
    customerEmail: 'billing@acmestudio.io',
    subscriptionNumber: 'SUB-2024-8841',
    amount: 14200.0,
    balanceDue: 14200.0,
    status: 'Overdue',
    issueDate: 'Sep 15, 2024',
    dueDate: 'Oct 15, 2024',
    lineItemsCount: 3,
  },
  {
    id: 'inv-7719-01',
    number: 'INV-2024-7719',
    customerName: 'Meridian Health Ltd',
    customerEmail: 'ap@meridianhealth.org',
    subscriptionNumber: 'SUB-2024-7719',
    amount: 3200.0,
    balanceDue: 0.0,
    status: 'Paid',
    issueDate: 'Oct 01, 2024',
    dueDate: 'Oct 31, 2024',
    lineItemsCount: 2,
  },
  {
    id: 'inv-6632-01',
    number: 'INV-2024-6632',
    customerName: 'Vanguard Freight Co',
    customerEmail: 'finance@vanguardfreight.com',
    subscriptionNumber: 'SUB-2024-6632',
    amount: 38500.0,
    balanceDue: 38500.0,
    status: 'Confirmed',
    issueDate: 'Oct 28, 2024',
    dueDate: 'Nov 28, 2024',
    lineItemsCount: 2,
  },
  {
    id: 'inv-5510-01',
    number: 'INV-2024-5510',
    customerName: 'Elevate Capital Partners',
    customerEmail: 'accounting@elevatecap.co',
    subscriptionNumber: 'SUB-2024-5510',
    amount: 18900.0,
    balanceDue: 18900.0,
    status: 'Draft',
    issueDate: 'Nov 01, 2024',
    dueDate: 'Dec 01, 2024',
    lineItemsCount: 2,
  },
  {
    id: 'inv-4402-01',
    number: 'INV-2024-4402',
    customerName: 'Pinnacle Biometrics',
    customerEmail: 'accounts@pinnaclebio.com',
    subscriptionNumber: 'SUB-2024-4402',
    amount: 8400.0,
    balanceDue: 0.0,
    status: 'Paid',
    issueDate: 'Aug 10, 2024',
    dueDate: 'Sep 10, 2024',
    lineItemsCount: 1,
  },
  {
    id: 'inv-9921-01',
    number: 'INV-2024-9921',
    customerName: 'Starlight Analytics',
    customerEmail: 'admin@starlight.io',
    subscriptionNumber: 'SUB-2024-9921',
    amount: 6750.0,
    balanceDue: 6750.0,
    status: 'Overdue',
    issueDate: 'Sep 20, 2024',
    dueDate: 'Oct 20, 2024',
    lineItemsCount: 2,
  },
  {
    id: 'inv-3310-01',
    number: 'INV-2024-3310',
    customerName: 'Omni Retail Group',
    customerEmail: 'treasury@omniretail.com',
    subscriptionNumber: 'SUB-2024-3310',
    amount: 4500.0,
    balanceDue: 0.0,
    status: 'Cancelled',
    issueDate: 'Jul 01, 2024',
    dueDate: 'Jul 31, 2024',
    lineItemsCount: 1,
  },
  {
    id: 'inv-2201-01',
    number: 'INV-2024-2201',
    customerName: 'NextWave Media Corp',
    customerEmail: 'invoicing@nextwave.net',
    subscriptionNumber: 'SUB-2024-2201',
    amount: 5120.0,
    balanceDue: 5120.0,
    status: 'Confirmed',
    issueDate: 'Oct 15, 2024',
    dueDate: 'Nov 15, 2024',
    lineItemsCount: 2,
  },
];

const STATUS_BADGES: Record<StaffInvoiceStatus, { bg: string; text: string; dot: string }> = {
  Draft: { bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-400' },
  Confirmed: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  Paid: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  Overdue: { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500' },
  Cancelled: { bg: 'bg-slate-100', text: 'text-slate-500', dot: 'bg-slate-400' },
};

type PermittedInvoiceAction = 'Confirm' | 'Cancel' | 'Send' | 'Print';

export const StaffInvoicesPage: React.FC = () => {
  const { showToast } = useToast();
  const [invoices, setInvoices] = useState<StaffInvoice[]>(INITIAL_INVOICES);
  const [statusFilter, setStatusFilter] = useState<'All' | StaffInvoiceStatus>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{
    invoice: StaffInvoice;
    action: PermittedInvoiceAction;
  } | null>(null);

  const filteredInvoices = invoices.filter((inv) => {
    const matchesFilter = statusFilter === 'All' || inv.status === statusFilter;
    const matchesSearch =
      inv.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.subscriptionNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getPermittedActions = (status: StaffInvoiceStatus): PermittedInvoiceAction[] => {
    switch (status) {
      case 'Draft':
        return ['Confirm', 'Cancel'];
      case 'Confirmed':
        return ['Send', 'Cancel', 'Print'];
      case 'Overdue':
        return ['Send', 'Print'];
      case 'Paid':
        return ['Print'];
      case 'Cancelled':
        return ['Print'];
      default:
        return [];
    }
  };

  const handleActionClick = (invoice: StaffInvoice, action: PermittedInvoiceAction) => {
    if (action === 'Print') {
      showToast(`Generating print stylesheet for ${invoice.number}...`, 'info');
      return;
    }
    if (action === 'Send') {
      showToast(`Invoice ${invoice.number} sent to ${invoice.customerEmail}`, 'success');
      return;
    }
    // Confirm or Cancel requires staff review/confirmation
    setConfirmDialog({ invoice, action });
  };

  const executeConfirmedAction = () => {
    if (!confirmDialog) return;
    const { invoice, action } = confirmDialog;

    setInvoices((prev) =>
      prev.map((item) => {
        if (item.id !== invoice.id) return item;
        if (action === 'Confirm') {
          return { ...item, status: 'Confirmed' };
        }
        if (action === 'Cancel') {
          return { ...item, status: 'Cancelled' };
        }
        return item;
      })
    );

    showToast(
      `Invoice ${invoice.number} successfully marked as ${
        action === 'Confirm' ? 'Confirmed' : 'Cancelled'
      }`,
      action === 'Confirm' ? 'success' : 'info'
    );
    setConfirmDialog(null);
  };

  return (
    <StaffLayout
      title="Invoices Management"
      subtitle="Issue, confirm, dispatch, and track customer invoice lifecycles"
    >
      <div className="space-y-6">
        {/* Header summary and status pill bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/80">
            {(['All', 'Draft', 'Confirmed', 'Paid', 'Overdue', 'Cancelled'] as const).map((tab) => {
              const count =
                tab === 'All'
                  ? invoices.length
                  : invoices.filter((i) => i.status === tab).length;
              const isActive = statusFilter === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-white text-teal-800 shadow-xs border border-teal-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  {tab} <span className="opacity-60 text-[11px] font-normal">({count})</span>
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none">
              search
            </span>
            <input
              type="text"
              placeholder="Search by invoice #, customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition"
            />
          </div>
        </div>

        {/* 44px Row Invoices Ledger */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
                  <th className="px-5 py-3">Invoice #</th>
                  <th className="px-5 py-3">Customer Name</th>
                  <th className="px-5 py-3">Subscription</th>
                  <th className="px-5 py-3">Issue Date</th>
                  <th className="px-5 py-3">Due Date</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                  <th className="px-5 py-3 text-center">Status</th>
                  <th className="px-5 py-3 text-right">Permitted Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                      No invoices found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => {
                    const badge = STATUS_BADGES[inv.status];
                    const actions = getPermittedActions(inv.status);
                    return (
                      <tr
                        key={inv.id}
                        className="hover:bg-slate-50/70 transition-colors h-[48px]"
                      >
                        <td className="px-5 py-2.5 font-mono font-semibold text-teal-800">
                          {inv.number}
                        </td>
                        <td className="px-5 py-2.5">
                          <div className="font-semibold text-slate-900">{inv.customerName}</div>
                          <div className="text-[11px] text-slate-400">{inv.customerEmail}</div>
                        </td>
                        <td className="px-5 py-2.5 font-mono text-[11px] text-slate-500">
                          {inv.subscriptionNumber}
                        </td>
                        <td className="px-5 py-2.5 text-slate-600">{inv.issueDate}</td>
                        <td className="px-5 py-2.5">
                          <span
                            className={
                              inv.status === 'Overdue'
                                ? 'text-rose-700 font-semibold'
                                : 'text-slate-600'
                            }
                          >
                            {inv.dueDate}
                          </span>
                        </td>
                        <td className="px-5 py-2.5 text-right font-mono font-bold text-slate-900">
                          ${inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-5 py-2.5 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${badge.bg} ${badge.text}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-5 py-2.5 text-right">
                          <div className="inline-flex items-center gap-1">
                            {actions.map((act) => {
                              const isPrimary = act === 'Confirm' || act === 'Send';
                              const isDanger = act === 'Cancel';
                              return (
                                <button
                                  key={act}
                                  onClick={() => handleActionClick(inv, act)}
                                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                                    isPrimary
                                      ? 'bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200/60 font-semibold'
                                      : isDanger
                                      ? 'text-rose-600 hover:bg-rose-50 hover:text-rose-800'
                                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                  }`}
                                >
                                  {act}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table summary bar */}
          <div className="p-4 bg-slate-50/60 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
            <span>
              Showing <strong className="text-slate-700">{filteredInvoices.length}</strong> of{' '}
              <strong className="text-slate-700">{invoices.length}</strong> total invoices
            </span>
            <div className="flex items-center gap-4">
              <span>
                Outstanding:{' '}
                <strong className="text-rose-700 font-mono">
                  $
                  {invoices
                    .filter((i) => i.status === 'Overdue')
                    .reduce((a, b) => a + b.amount, 0)
                    .toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </strong>
              </span>
              <span>
                Confirmed:{' '}
                <strong className="text-blue-700 font-mono">
                  $
                  {invoices
                    .filter((i) => i.status === 'Confirmed')
                    .reduce((a, b) => a + b.amount, 0)
                    .toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        {confirmDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
              <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-800 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-xl">
                  {confirmDialog.action === 'Confirm' ? 'check_circle' : 'warning'}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {confirmDialog.action === 'Confirm'
                  ? 'Confirm Customer Invoice'
                  : 'Cancel Invoice'}
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Are you sure you want to mark invoice{' '}
                <strong className="text-slate-800">{confirmDialog.invoice.number}</strong> (
                {confirmDialog.invoice.customerName}) as{' '}
                <strong className="text-slate-800">
                  {confirmDialog.action === 'Confirm' ? 'Confirmed' : 'Cancelled'}
                </strong>
                ? This updates accounting ledger statuses accordingly.
              </p>
              <div className="mt-6 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setConfirmDialog(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Dismiss
                </button>
                <button
                  type="button"
                  onClick={executeConfirmedAction}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold text-white shadow-xs transition ${
                    confirmDialog.action === 'Confirm'
                      ? 'bg-teal-700 hover:bg-teal-800'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  Proceed with {confirmDialog.action}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </StaffLayout>
  );
};
