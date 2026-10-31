import React, { useState } from 'react';
import {
  AdminLayout,
  AdminStatCard,
  AdminTable,
  AdminBadge,
  AdminButton,
  AdminDrawer,
  AdminInput,
  AdminModal,
  Column,
} from '../../components/admin';
import { useToast } from '../../components/common/Toast';

interface OverdueInvoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  dueDate: string;
  daysOverdue: number;
  amount: number;
  status: 'overdue';
}

const mockOverdueInvoices: OverdueInvoice[] = [
  {
    id: 'inv-2025-005',
    invoiceNumber: 'INV-2025-005',
    customerName: 'Elena Rostova',
    customerEmail: 'elena.rostova@atelier-sanctuary.com',
    dueDate: 'Apr 01, 2025',
    daysOverdue: 14,
    amount: 180.0,
    status: 'overdue',
  },
  {
    id: 'inv-2025-008',
    invoiceNumber: 'INV-2025-008',
    customerName: 'Marcus Vance',
    customerEmail: 'm.vance@apothecary-botanicals.com',
    dueDate: 'Mar 24, 2025',
    daysOverdue: 22,
    amount: 540.0,
    status: 'overdue',
  },
  {
    id: 'inv-2025-012',
    invoiceNumber: 'INV-2025-012',
    customerName: 'Claire Beauchamp',
    customerEmail: 'claire@highland-herbs.co.uk',
    dueDate: 'Mar 15, 2025',
    daysOverdue: 31,
    amount: 1250.0,
    status: 'overdue',
  },
  {
    id: 'inv-2025-019',
    invoiceNumber: 'INV-2025-019',
    customerName: 'Soren Lindqvist',
    customerEmail: 'soren@nordic-flora.se',
    dueDate: 'Mar 10, 2025',
    daysOverdue: 36,
    amount: 880.0,
    status: 'overdue',
  },
];

export const AdminDashboardPage: React.FC = () => {
  const { showToast } = useToast();

  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [isRecordDrawerOpen, setIsRecordDrawerOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<OverdueInvoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenRecordPayment = (invoice: OverdueInvoice) => {
    setSelectedInvoice(invoice);
    setPaymentAmount(invoice.amount.toFixed(2));
    setIsRecordDrawerOpen(true);
  };

  const handleConfirmPayment = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsRecordDrawerOpen(false);
      showToast(`Payment of $${paymentAmount} recorded successfully for ${selectedInvoice?.invoiceNumber}.`, 'success');
    }, 600);
  };

  const columns: Column<OverdueInvoice>[] = [
    {
      key: 'invoiceNumber',
      header: 'Invoice #',
      render: (inv) => (
        <span className="font-semibold text-slate-900 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-rose-600 text-[16px]">priority_high</span>
          <span>{inv.invoiceNumber}</span>
        </span>
      ),
    },
    {
      key: 'customerName',
      header: 'Customer',
      render: (inv) => (
        <div>
          <div className="font-medium text-slate-900">{inv.customerName}</div>
          <div className="text-xs text-slate-400">{inv.customerEmail}</div>
        </div>
      ),
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: (inv) => <span className="text-xs text-slate-600">{inv.dueDate}</span>,
    },
    {
      key: 'daysOverdue',
      header: 'Aging',
      render: (inv) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          {inv.daysOverdue} days overdue
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (inv) => (
        <span className="font-mono font-bold text-slate-900 tabular-nums">
          ${inv.amount.toFixed(2)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: () => <AdminBadge status="overdue" label="Overdue" pulseDot />,
    },
    {
      key: 'actions',
      header: 'Action',
      align: 'right',
      render: (inv) => (
        <AdminButton
          variant="secondary"
          size="xs"
          icon="payments"
          onClick={(e) => {
            e.stopPropagation();
            handleOpenRecordPayment(inv);
          }}
        >
          Record payment
        </AdminButton>
      ),
    },
  ];

  return (
    <AdminLayout
      title="Finance Analytics"
      subtitle="Executive oversight of monthly recurring revenue, ledger collections, and receivables aging."
      actions={
        <>
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1 text-xs">
            {['Today', 'Last 7 Days', 'Last 30 Days', 'Quarter to Date'].map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setDateRange(range)}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  dateRange === range
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <AdminButton
            variant="primary"
            size="sm"
            icon="file_download"
            onClick={() => showToast('Compiling financial export ledger CSV...', 'info')}
          >
            Export Ledger
          </AdminButton>
        </>
      }
    >
      {/* 4 StatCards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard
          title="Active Subscriptions"
          value="1,420"
          change="+12.4%"
          isPositive={true}
          subtitle="vs previous period"
          icon="autorenew"
        />

        <AdminStatCard
          title="Revenue Collected"
          value="$142,500.00"
          change="+8.2%"
          isPositive={true}
          subtitle="98.1% collection rate"
          icon="account_balance_wallet"
        />

        <AdminStatCard
          title="Outstanding Amount"
          value="$18,420.00"
          change="-3.1%"
          isPositive={true}
          subtitle="18 open invoices"
          icon="pending"
        />

        <AdminStatCard
          title="Overdue Invoices"
          value="$4,250.00"
          change="4 requires action"
          isPositive={false}
          subtitle="Critical receivables"
          icon="warning"
          variant="overdue"
        />
      </div>

      {/* Chart & Donut Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Over Time Line Chart Placeholder */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Revenue Over Time</h3>
              <p className="text-xs text-slate-500">Trailing quarterly recurring recognized billings</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                Recurring Subscriptions
              </span>
              <span className="flex items-center gap-1.5 text-slate-400 font-medium ml-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                Add-on Allocations
              </span>
            </div>
          </div>

          {/* Simple Visual Line Chart SVG */}
          <div className="h-56 w-full flex items-end">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 600 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="40" x2="600" y2="40" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="0" y1="90" x2="600" y2="90" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="0" y1="140" x2="600" y2="140" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="0" y1="190" x2="600" y2="190" stroke="#E2E8F0" strokeWidth="1" />

              {/* Gradient Area */}
              <polygon
                fill="url(#revenueGrad)"
                points="0,180 50,150 100,160 150,130 200,120 250,95 300,110 350,85 400,65 450,75 500,45 550,55 600,30 600,190 0,190"
              />

              {/* Main Line */}
              <polyline
                fill="none"
                stroke="#4F46E5"
                strokeWidth="2.5"
                points="0,180 50,150 100,160 150,130 200,120 250,95 300,110 350,85 400,65 450,75 500,45 550,55 600,30"
              />

              {/* Key Data Dots */}
              <circle cx="250" cy="95" r="4" fill="#4F46E5" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="450" cy="75" r="4" fill="#4F46E5" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="600" cy="30" r="5" fill="#4F46E5" stroke="#FFFFFF" strokeWidth="2" />
            </svg>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-400 font-mono">
            <span>Jan 1</span>
            <span>Feb 1</span>
            <span>Mar 1</span>
            <span>Apr 1</span>
            <span>Current (Peak $142.5k)</span>
          </div>
        </div>

        {/* Invoice Status Donut Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Invoice Distribution</h3>
            <p className="text-xs text-slate-500">Breakdown of total issued billing statements</p>
          </div>

          <div className="flex items-center justify-center py-4">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                {/* Background Ring */}
                <circle cx="18" cy="18" r="14" fill="none" stroke="#F1F5F9" strokeWidth="4" />
                {/* Paid: 78% (Green) */}
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="4"
                  strokeDasharray="68 100"
                  strokeDashoffset="0"
                />
                {/* Outstanding: 18% (Sky) */}
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#0EA5E9"
                  strokeWidth="4"
                  strokeDasharray="18 100"
                  strokeDashoffset="-68"
                />
                {/* Overdue: 4% (Red) */}
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="4"
                  strokeDasharray="6 100"
                  strokeDashoffset="-86"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold font-mono text-slate-900">98.1%</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Settled</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Paid Statements (184)
              </span>
              <span className="font-mono font-medium text-slate-900">$138,250.00</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                Open Invoices (18)
              </span>
              <span className="font-mono font-medium text-slate-900">$18,420.00</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Overdue (4)
              </span>
              <span className="font-mono font-medium text-rose-600">$4,250.00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Overdue Invoices Table Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <h3 className="text-sm font-semibold text-slate-900">Overdue Invoices Requiring Settlement</h3>
            <span className="text-xs text-slate-400 font-mono">({mockOverdueInvoices.length} entries)</span>
          </div>
          <AdminButton
            variant="subtle"
            size="xs"
            icon="refresh"
            onClick={() => showToast('Synchronized overdue receivables ledger.', 'info')}
          >
            Refresh Ledger
          </AdminButton>
        </div>

        <AdminTable
          columns={columns}
          data={mockOverdueInvoices}
          keyExtractor={(inv) => inv.id}
          onRowClick={(inv) => handleOpenRecordPayment(inv)}
        />
      </div>

      {/* Slide-Over Drawer: Record Payment Form (DESIGN.md specification) */}
      <AdminDrawer
        isOpen={isRecordDrawerOpen}
        onClose={() => setIsRecordDrawerOpen(false)}
        title="Record Invoice Settlement"
        subtitle={selectedInvoice ? `Recording manual or external payment for ${selectedInvoice.invoiceNumber}` : ''}
        footer={
          <>
            <AdminButton variant="secondary" size="sm" onClick={() => setIsRecordDrawerOpen(false)}>
              Cancel
            </AdminButton>
            <AdminButton
              variant="primary"
              size="sm"
              icon="check"
              isLoading={isSubmitting}
              onClick={handleConfirmPayment}
            >
              Record Payment
            </AdminButton>
          </>
        }
      >
        <div className="space-y-4">
          {/* Target Invoice Context Card */}
          {selectedInvoice && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">{selectedInvoice.invoiceNumber}</span>
                <AdminBadge status="overdue" label="Overdue" />
              </div>
              <div className="text-xs text-slate-600">
                Customer: <strong className="text-slate-900">{selectedInvoice.customerName}</strong>
              </div>
              <div className="flex justify-between items-baseline pt-1 border-t border-slate-200">
                <span className="text-xs text-slate-500">Outstanding Balance:</span>
                <span className="text-base font-bold font-mono text-rose-700">
                  ${selectedInvoice.amount.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Amount Input */}
          <AdminInput
            label="Payment Amount"
            prefix="$"
            type="number"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            helperText="Full or partial settlement amount in USD."
          />

          {/* Payment Method Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full rounded-lg border border-slate-300 py-2 px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 bg-white"
            >
              <option value="Credit Card">Credit Card (Stripe Terminal)</option>
              <option value="ACH Direct Debit">ACH Direct Debit (Bank Wire)</option>
              <option value="Check">Cashier Check</option>
              <option value="Manual Credit">Internal Ledger Credit</option>
            </select>
          </div>

          {/* Date Picker */}
          <AdminInput
            label="Settlement Date"
            type="date"
            defaultValue={new Date().toISOString().split('T')[0]}
            helperText="Date payment was acknowledged in bank statements."
          />

          {/* Notes Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
              Reconciliation Notes
            </label>
            <textarea
              rows={3}
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
              placeholder="e.g. Cleared via Wire Reference #TX-90142..."
              className="w-full rounded-lg border border-slate-300 py-2 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 bg-white"
            />
          </div>
        </div>
      </AdminDrawer>

      {/* Confirmation Modal */}
      <AdminModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Confirm Reconciliation"
        description="This will register a financial transaction in the immutable ledger and mark the invoice as settled."
        onConfirm={() => {
          setIsConfirmModalOpen(false);
          handleConfirmPayment();
        }}
      />
    </AdminLayout>
  );
};

