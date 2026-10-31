import React, { useState } from 'react';
import {
  AdminLayout,
  AdminTable,
  AdminBadge,
  AdminButton,
  AdminDrawer,
  AdminInput,
  Column,
} from '../../components/admin';
import { useToast } from '../../components/common/Toast';

type PaymentMethod = 'Credit Card' | 'Bank Transfer' | 'UPI' | 'Cash';

interface Payment {
  id: string;
  paymentNumber: string;
  invoice: string;
  customer: string;
  method: PaymentMethod;
  amount: number;
  date: string;
  note: string;
}

const INVOICES = ['INV-2025-001', 'INV-2025-002', 'INV-2025-003', 'INV-2025-004', 'INV-2025-005', 'INV-2025-008', 'INV-2025-010'];

const METHOD_STATUS: Record<PaymentMethod, string> = { 'Credit Card': 'confirmed', 'Bank Transfer': 'active', 'UPI': 'quotation', 'Cash': 'pending' };

const MOCK: Payment[] = [
  { id: 'pay-001', paymentNumber: 'PAY-2025-001', invoice: 'INV-2025-001', customer: 'Nadia Farouq', method: 'Credit Card', amount: 49.0, date: 'Jan 20, 2025', note: 'Auto-payment via Stripe' },
  { id: 'pay-002', paymentNumber: 'PAY-2025-002', invoice: 'INV-2025-002', customer: 'Marcus Vance', method: 'Bank Transfer', amount: 178.0, date: 'Feb 10, 2025', note: 'Wire from HSBC' },
  { id: 'pay-003', paymentNumber: 'PAY-2025-003', invoice: 'INV-2025-009', customer: 'Samuel Osei', method: 'UPI', amount: 49.0, date: 'Dec 15, 2024', note: 'UPI ref: TXN2024121500345' },
  { id: 'pay-004', paymentNumber: 'PAY-2025-004', invoice: 'INV-2025-001', customer: 'Nadia Farouq', method: 'Credit Card', amount: 49.0, date: 'Feb 15, 2025', note: '' },
  { id: 'pay-005', paymentNumber: 'PAY-2025-005', invoice: 'INV-2025-002', customer: 'Marcus Vance', method: 'Credit Card', amount: 178.0, date: 'Mar 02, 2025', note: 'Recurring' },
];

interface RecordForm { invoice: string; method: PaymentMethod; amount: string; date: string; note: string; }
const EMPTY_FORM: RecordForm = { invoice: INVOICES[0], method: 'Credit Card', amount: '', date: new Date().toISOString().split('T')[0], note: '' };

export const AdminPaymentsPage: React.FC = () => {
  const { showToast } = useToast();
  const [payments, setPayments] = useState<Payment[]>(MOCK);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState<RecordForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof RecordForm, string>>>({});
  const [isLoading, setIsLoading] = useState(false);

  const openDrawer = () => { setForm(EMPTY_FORM); setErrors({}); setDrawerOpen(true); };

  const validate = (): boolean => {
    const e: Partial<Record<keyof RecordForm, string>> = {};
    if (!form.invoice) e.invoice = 'Select an invoice';
    const amt = parseFloat(form.amount);
    if (!form.amount || isNaN(amt) || amt <= 0) e.amount = 'Amount must be > 0';
    if (!form.date) e.date = 'Date is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRecord = () => {
    if (!validate()) return;
    setIsLoading(true);
    setTimeout(() => {
      const newPayment: Payment = {
        id: `pay-${Date.now()}`,
        paymentNumber: `PAY-2025-${String(payments.length + 1).padStart(3, '0')}`,
        invoice: form.invoice,
        customer: 'Customer',
        method: form.method,
        amount: parseFloat(form.amount),
        date: new Date(form.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        note: form.note,
      };
      setPayments((prev) => [newPayment, ...prev]);
      showToast(`Payment ${newPayment.paymentNumber} recorded`, 'success');
      setIsLoading(false); setDrawerOpen(false);
    }, 600);
  };

  const totalCollected = payments.reduce((s, p) => s + p.amount, 0);

  const columns: Column<Payment>[] = [
    { key: 'paymentNumber', header: 'Payment #', render: (p) => <span className="font-mono text-xs font-semibold text-indigo-600">{p.paymentNumber}</span> },
    { key: 'invoice', header: 'Invoice', render: (p) => <span className="font-mono text-xs text-slate-500">{p.invoice}</span> },
    { key: 'customer', header: 'Customer', render: (p) => <span className="font-medium text-slate-900">{p.customer}</span> },
    { key: 'method', header: 'Method', render: (p) => <AdminBadge status={METHOD_STATUS[p.method]} label={p.method} /> },
    { key: 'amount', header: 'Amount', render: (p) => <span className="font-semibold tabular-nums">${p.amount.toFixed(2)}</span> },
    { key: 'date', header: 'Date', render: (p) => <span className="text-xs text-slate-500">{p.date}</span> },
    { key: 'note', header: 'Note', render: (p) => <span className="text-xs text-slate-400 truncate max-w-[160px] inline-block">{p.note || '—'}</span> },
  ];

  return (
    <AdminLayout title="Payments" subtitle="View recorded payments and register new ones"
      actions={<AdminButton variant="primary" size="sm" onClick={openDrawer}>+ Record Payment</AdminButton>}
    >
      {/* Summary */}
      <div className="flex items-center gap-6 bg-white rounded-xl border border-slate-200 p-4">
        <div>
          <span className="text-xs text-slate-500 block">Total Collected</span>
          <span className="text-xl font-bold text-slate-900 tabular-nums">${totalCollected.toFixed(2)}</span>
        </div>
        <div className="w-px h-8 bg-slate-200" />
        <div>
          <span className="text-xs text-slate-500 block">Payments Count</span>
          <span className="text-xl font-bold text-slate-900">{payments.length}</span>
        </div>
      </div>

      <AdminTable columns={columns} data={payments} keyExtractor={(p) => p.id} emptyMessage="No payments recorded" emptySubtext="Click 'Record Payment' to register the first payment." />

      <AdminDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title="Record Payment"
        footer={<><AdminButton variant="secondary" onClick={() => setDrawerOpen(false)}>Cancel</AdminButton><AdminButton variant="primary" onClick={handleRecord} isLoading={isLoading}>Record Payment</AdminButton></>}
      >
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Invoice</label>
            <select className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={form.invoice} onChange={(e) => setForm((f) => ({ ...f, invoice: e.target.value }))}>{INVOICES.map((inv) => <option key={inv}>{inv}</option>)}</select>
            {errors.invoice && <p className="text-xs text-red-500 mt-1">{errors.invoice}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Payment Method</label>
            <select className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={form.method} onChange={(e) => setForm((f) => ({ ...f, method: e.target.value as PaymentMethod }))}>
              <option value="Credit Card">Credit Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="UPI">UPI</option>
              <option value="Cash">Cash</option>
            </select>
          </div>
          <AdminInput label="Amount ($)" type="number" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} error={errors.amount} placeholder="0.00" />
          <AdminInput label="Payment Date" type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} error={errors.date} />
          <AdminInput label="Note (optional)" value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} placeholder="e.g. Wire ref #1234, Stripe charge ID…" />
        </div>
      </AdminDrawer>
    </AdminLayout>
  );
};
