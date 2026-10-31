import React, { useState, useMemo } from 'react';
import { StaffLayout } from '../../components/staff/StaffLayout';
import { useToast } from '../../components/common/Toast';

export type PaymentMethod = 'Bank Wire' | 'Credit Card' | 'Direct Debit' | 'Check';

export interface StaffPaymentRecord {
  id: string;
  paymentNumber: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  method: PaymentMethod;
  amount: number;
  date: string;
  referenceNumber: string;
  status: 'Completed' | 'Pending' | 'Reconciled';
  notes?: string;
}

interface InvoiceCandidate {
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  balanceDue: number;
  dueDate: string;
}

const CANDIDATE_INVOICES: InvoiceCandidate[] = [
  {
    invoiceNumber: 'INV-2024-8841',
    customerName: 'Acme Studio Group',
    customerEmail: 'billing@acmestudio.io',
    totalAmount: 14200.0,
    balanceDue: 14200.0,
    dueDate: 'Oct 15, 2024',
  },
  {
    invoiceNumber: 'INV-2024-6632',
    customerName: 'Vanguard Freight Co',
    customerEmail: 'finance@vanguardfreight.com',
    totalAmount: 38500.0,
    balanceDue: 38500.0,
    dueDate: 'Nov 28, 2024',
  },
  {
    invoiceNumber: 'INV-2024-9921',
    customerName: 'Starlight Analytics',
    customerEmail: 'admin@starlight.io',
    totalAmount: 6750.0,
    balanceDue: 6750.0,
    dueDate: 'Oct 20, 2024',
  },
  {
    invoiceNumber: 'INV-2024-2201',
    customerName: 'NextWave Media Corp',
    customerEmail: 'invoicing@nextwave.net',
    totalAmount: 5120.0,
    balanceDue: 5120.0,
    dueDate: 'Nov 15, 2024',
  },
  {
    invoiceNumber: 'INV-2024-5510',
    customerName: 'Elevate Capital Partners',
    customerEmail: 'accounting@elevatecap.co',
    totalAmount: 18900.0,
    balanceDue: 18900.0,
    dueDate: 'Dec 01, 2024',
  },
];

const INITIAL_PAYMENTS: StaffPaymentRecord[] = [
  {
    id: 'pay-001',
    paymentNumber: 'PAY-2024-092',
    invoiceNumber: 'INV-2024-118',
    customerName: 'Meridian Health Systems',
    customerEmail: 'ap@meridianhealth.org',
    method: 'Bank Wire',
    amount: 19200.0,
    date: 'Nov 18, 2024',
    referenceNumber: 'WIRE-891024-MRD',
    status: 'Completed',
    notes: 'Settled via Fedwire transfer directly into operational reserve.',
  },
  {
    id: 'pay-002',
    paymentNumber: 'PAY-2024-093',
    invoiceNumber: 'INV-2024-114',
    customerName: 'Horizon Digital Labs',
    customerEmail: 'billing@horizondigitallabs.com',
    method: 'Direct Debit',
    amount: 6800.0,
    date: 'Nov 18, 2024',
    referenceNumber: 'DD-440192-HOR',
    status: 'Completed',
    notes: 'Automatic monthly batch collection.',
  },
  {
    id: 'pay-003',
    paymentNumber: 'PAY-2024-091',
    invoiceNumber: 'INV-2024-110',
    customerName: 'Acme Studio Inc.',
    customerEmail: 'billing@acmestudio.io',
    method: 'Credit Card',
    amount: 3200.0,
    date: 'Nov 15, 2024',
    referenceNumber: 'CC-AUTH-33918',
    status: 'Completed',
    notes: 'Stripe charge authorization ch_3Op199a.',
  },
  {
    id: 'pay-004',
    paymentNumber: 'PAY-2024-090',
    invoiceNumber: 'INV-2024-108',
    customerName: 'Pacific Logistics Alliance',
    customerEmail: 'finance@paclogalliance.com',
    method: 'Direct Debit',
    amount: 2450.0,
    date: 'Nov 12, 2024',
    referenceNumber: 'DD-661520-PAC',
    status: 'Completed',
    notes: 'Recurring monthly payment.',
  },
  {
    id: 'pay-005',
    paymentNumber: 'PAY-2024-094',
    invoiceNumber: 'INV-2024-094',
    customerName: 'Bluebird Media Group',
    customerEmail: 'accounts@bluebirdmedia.com',
    method: 'Credit Card',
    amount: 650.0,
    date: 'Today, 09:42 AM',
    referenceNumber: 'CC-AUTH-99411',
    status: 'Completed',
    notes: 'Card authorization completed via payment gateway.',
  },
];

const METHOD_BADGES: Record<PaymentMethod, { bg: string; text: string }> = {
  'Bank Wire': { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/60', text: 'Bank Wire' },
  'Credit Card': { bg: 'bg-sky-50 text-sky-700 border-sky-200/60', text: 'Credit Card' },
  'Direct Debit': { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200/60', text: 'Direct Debit' },
  'Check': { bg: 'bg-amber-50 text-amber-700 border-amber-200/60', text: 'Check' },
};

export const StaffPaymentsPage: React.FC = () => {
  const { showToast } = useToast();
  const [payments, setPayments] = useState<StaffPaymentRecord[]>(INITIAL_PAYMENTS);
  const [candidateInvoices, setCandidateInvoices] = useState<InvoiceCandidate[]>(CANDIDATE_INVOICES);
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<'All' | PaymentMethod>('All');

  // Record Payment Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedInvoiceNumber, setSelectedInvoiceNumber] = useState<string>(
    candidateInvoices[0]?.invoiceNumber || ''
  );
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank Wire');
  const [paymentRef, setPaymentRef] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [paymentNotes, setPaymentNotes] = useState<string>('');
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active candidate invoice inspected in the drawer
  const activeInvoice = useMemo(() => {
    return candidateInvoices.find((inv) => inv.invoiceNumber === selectedInvoiceNumber) || candidateInvoices[0];
  }, [candidateInvoices, selectedInvoiceNumber]);

  const openDrawerWithInvoice = (inv?: InvoiceCandidate) => {
    const target = inv || candidateInvoices[0];
    if (target) {
      setSelectedInvoiceNumber(target.invoiceNumber);
      setPaymentAmount(target.balanceDue.toFixed(2));
      setPaymentRef(`TXN-${Math.floor(1000000 + Math.random() * 9000000)}`);
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setPaymentNotes('');
      setFormErrors({});
      setIsDrawerOpen(true);
    } else {
      showToast('All open candidate invoices are already settled.', 'info');
    }
  };

  const handleInvoiceChange = (invNum: string) => {
    setSelectedInvoiceNumber(invNum);
    const found = candidateInvoices.find((i) => i.invoiceNumber === invNum);
    if (found) {
      setPaymentAmount(found.balanceDue.toFixed(2));
    }
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};
    if (!selectedInvoiceNumber) {
      errors.invoice = 'Please select a pending invoice.';
    }
    const amt = parseFloat(paymentAmount);
    if (isNaN(amt) || amt <= 0) {
      errors.amount = 'Please enter a valid amount greater than $0.00.';
    } else if (activeInvoice && amt > activeInvoice.balanceDue) {
      errors.amount = `Amount cannot exceed current outstanding balance ($${activeInvoice.balanceDue.toFixed(2)}).`;
    }
    if (!paymentDate) {
      errors.date = 'Payment date is required.';
    }
    if (!paymentRef.trim()) {
      errors.reference = 'Reference number or transaction ID is required.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSavePayment = () => {
    if (!validateForm() || !activeInvoice) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const amt = parseFloat(paymentAmount);
      const newPayment: StaffPaymentRecord = {
        id: `pay-${Date.now()}`,
        paymentNumber: `PAY-2024-${Math.floor(1000 + Math.random() * 9000)}`,
        invoiceNumber: activeInvoice.invoiceNumber,
        customerName: activeInvoice.customerName,
        customerEmail: activeInvoice.customerEmail,
        method: paymentMethod,
        amount: amt,
        date: new Date(paymentDate).toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
        }),
        referenceNumber: paymentRef.trim(),
        status: 'Completed',
        notes: paymentNotes.trim() || undefined,
      };

      // Add to payments list
      setPayments((prev) => [newPayment, ...prev]);

      // Update candidate invoices balance
      setCandidateInvoices((prev) =>
        prev
          .map((inv) => {
            if (inv.invoiceNumber === activeInvoice.invoiceNumber) {
              const remaining = inv.balanceDue - amt;
              return { ...inv, balanceDue: Math.max(0, remaining) };
            }
            return inv;
          })
          .filter((inv) => inv.balanceDue > 0.01)
      );

      showToast(
        `Payment of $${amt.toLocaleString(undefined, { minimumFractionDigits: 2 })} recorded for ${
          activeInvoice.invoiceNumber
        }`,
        'success'
      );
      setIsSubmitting(false);
      setIsDrawerOpen(false);
    }, 450);
  };

  const filteredPayments = payments.filter((p) => {
    const matchesMethod = methodFilter === 'All' || p.method === methodFilter;
    const matchesSearch =
      p.paymentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMethod && matchesSearch;
  });

  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <StaffLayout
      title="Payments Ledger"
      subtitle="View settlement history, verify transaction references, and record customer payments"
      actions={
        <button
          type="button"
          onClick={() => openDrawerWithInvoice()}
          className="h-10 px-4 bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-xs hover:bg-teal-800 transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-teal-600"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>Record Payment</span>
        </button>
      }
    >
      <div className="space-y-6">
        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Total Collected
            </span>
            <div className="text-2xl font-bold font-mono text-slate-900">
              ${totalCollected.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-emerald-700 font-medium mt-1 inline-flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              {payments.length} settled payments recorded
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Awaiting Settlement
            </span>
            <div className="text-2xl font-bold font-mono text-amber-700">
              $
              {candidateInvoices
                .reduce((a, b) => a + b.balanceDue, 0)
                .toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 inline-block">
              Across {candidateInvoices.length} outstanding invoices
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Quick Action
            </span>
            <p className="text-xs text-slate-600 mb-2">
              Ready to record check, wire, or card settlements directly into accounts receivable.
            </p>
            <button
              onClick={() => openDrawerWithInvoice()}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              <span>Open Settlement Drawer</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Filter bar and search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/80">
            {(['All', 'Bank Transfer', 'Credit Card', 'ACH Direct', 'Wire', 'UPI'] as const).map(
              (method) => {
                const count =
                  method === 'All'
                    ? payments.length
                    : payments.filter((p) => p.method === method).length;
                const isActive = methodFilter === method;
                return (
                  <button
                    key={method}
                    onClick={() => setMethodFilter(method as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-white text-teal-800 shadow-xs border border-teal-200/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    {method} <span className="opacity-60 text-[11px] font-normal">({count})</span>
                  </button>
                );
              }
            )}
          </div>

          <div className="relative w-full sm:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none">
              search
            </span>
            <input
              type="text"
              placeholder="Search payments, invoice, reference..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition"
            />
          </div>
        </div>

        {/* 44px Row Payments Table */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
                  <th className="px-5 py-3">Payment #</th>
                  <th className="px-5 py-3">Invoice #</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Method</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Reference / Txn ID</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                  <th className="px-5 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                      No payment records found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((p) => {
                    const badge = METHOD_BADGES[p.method] || {
                      bg: 'bg-slate-100 text-slate-700 border-slate-200',
                      text: p.method,
                    };
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/70 transition-colors h-[48px]">
                        <td className="px-5 py-2.5 font-mono font-semibold text-teal-800">
                          {p.paymentNumber}
                        </td>
                        <td className="px-5 py-2.5 font-mono text-[11px] text-slate-600">
                          {p.invoiceNumber}
                        </td>
                        <td className="px-5 py-2.5">
                          <div className="font-semibold text-slate-900">{p.customerName}</div>
                          <div className="text-[11px] text-slate-400">{p.customerEmail}</div>
                        </td>
                        <td className="px-5 py-2.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${badge.bg}`}
                          >
                            {badge.text}
                          </span>
                        </td>
                        <td className="px-5 py-2.5 text-slate-600">{p.date}</td>
                        <td className="px-5 py-2.5 font-mono text-[11px] text-slate-500">
                          {p.referenceNumber}
                        </td>
                        <td className="px-5 py-2.5 text-right font-mono font-bold text-slate-900">
                          ${p.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-5 py-2.5 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                              p.status === 'Reconciled'
                                ? 'bg-purple-50 text-purple-700'
                                : 'bg-emerald-50 text-emerald-700'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                p.status === 'Reconciled' ? 'bg-purple-500' : 'bg-emerald-500'
                              }`}
                            />
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing <strong className="text-slate-700">{filteredPayments.length}</strong> of{' '}
              <strong className="text-slate-700">{payments.length}</strong> recorded payments
            </span>
            <span className="font-medium text-slate-700">
              Compliant Ledger Tracking • Direct Staff Entry
            </span>
          </div>
        </div>

        {/* Record Payment Drawer (Showing Invoice Balance Before Saving) */}
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
              onClick={() => !isSubmitting && setIsDrawerOpen(false)}
            />

            <div className="fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
              {/* Drawer Header */}
              <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center border border-teal-200/60">
                    <span className="material-symbols-outlined text-lg">payments</span>
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Record Settlement</h2>
                    <p className="text-xs text-slate-500">Log incoming payment against invoice</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  disabled={isSubmitting}
                  className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Invoice Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Select Invoice <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedInvoiceNumber}
                    onChange={(e) => handleInvoiceChange(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition"
                  >
                    {candidateInvoices.map((inv) => (
                      <option key={inv.invoiceNumber} value={inv.invoiceNumber}>
                        {inv.invoiceNumber} — {inv.customerName} (Bal: ${inv.balanceDue.toFixed(2)})
                      </option>
                    ))}
                  </select>
                  {formErrors.invoice && (
                    <p className="text-[11px] text-rose-500 mt-1">{formErrors.invoice}</p>
                  )}
                </div>

                {/* Real-time Invoice Balance Tile */}
                {activeInvoice && (
                  <div className="bg-teal-50/50 border border-teal-200/70 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-teal-900 font-semibold">Customer:</span>
                      <span className="font-bold text-slate-900">{activeInvoice.customerName}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-teal-900 font-semibold">Total Invoice Amount:</span>
                      <span className="font-mono text-slate-700">
                        ${activeInvoice.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-1.5 border-t border-teal-200/60">
                      <span className="text-teal-900 font-bold uppercase text-[11px]">
                        Current Balance Due:
                      </span>
                      <span className="font-mono font-bold text-base text-rose-700">
                        ${activeInvoice.balanceDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    {paymentAmount && !isNaN(parseFloat(paymentAmount)) && (
                      <div className="flex items-center justify-between text-xs pt-1 text-[11px] text-teal-800">
                        <span>Balance After Settlement:</span>
                        <span className="font-mono font-bold">
                          $
                          {Math.max(0, activeInvoice.balanceDue - parseFloat(paymentAmount)).toLocaleString(
                            undefined,
                            { minimumFractionDigits: 2 }
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Amount to Record */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Payment Amount ($) <span className="text-rose-500">*</span>
                    </label>
                    {activeInvoice && (
                      <button
                        type="button"
                        onClick={() => setPaymentAmount(activeInvoice.balanceDue.toFixed(2))}
                        className="text-[11px] text-teal-700 hover:underline font-semibold"
                      >
                        Set Full Balance
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className={`w-full pl-8 pr-3 py-2 text-xs font-mono bg-white border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 transition ${
                        formErrors.amount ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200'
                      }`}
                    />
                  </div>
                  {formErrors.amount && (
                    <p className="text-[11px] text-rose-500 mt-1">{formErrors.amount}</p>
                  )}
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Settlement Method <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['Bank Transfer', 'Credit Card', 'ACH Direct', 'Wire', 'UPI'] as PaymentMethod[]).map(
                      (m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setPaymentMethod(m)}
                          className={`px-3 py-2 text-xs font-semibold rounded-xl border text-left transition ${
                            paymentMethod === m
                              ? 'bg-teal-50 border-teal-600 text-teal-800 ring-1 ring-teal-600/30'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {m}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Payment Date & Reference */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 transition"
                    />
                    {formErrors.date && (
                      <p className="text-[11px] text-rose-500 mt-1">{formErrors.date}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Ref / Txn ID <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. TXN-984120"
                      value={paymentRef}
                      onChange={(e) => setPaymentRef(e.target.value)}
                      className="w-full text-xs font-mono bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 transition"
                    />
                    {formErrors.reference && (
                      <p className="text-[11px] text-rose-500 mt-1">{formErrors.reference}</p>
                    )}
                  </div>
                </div>

                {/* Audit & Staff Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Settlement Notes (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide details regarding confirmation wires, customer remitter details, or internal memos..."
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-xl p-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 transition resize-none"
                  />
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-5 border-t border-slate-200 bg-slate-50/70 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSavePayment}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-teal-700 text-white hover:bg-teal-800 shadow-xs transition flex items-center gap-1.5 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <span className="material-symbols-outlined text-sm animate-spin">refresh</span>
                      <span>Recording...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">check</span>
                      <span>Save Settlement</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </StaffLayout>
  );
};
