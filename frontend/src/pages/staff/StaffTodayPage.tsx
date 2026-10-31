import React, { useState, useMemo } from 'react';
import { StaffLayout } from '../../components/staff/StaffLayout';
import { useToast } from '../../components/common/Toast';
import { Link, useNavigate } from 'react-router-dom';

interface OverdueTask {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerTag?: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  daysOverdue: number;
  status: 'Overdue';
}

const INITIAL_QUEUE: OverdueTask[] = [
  {
    id: 'inv-89',
    invoiceNumber: 'INV-2024-089',
    customerName: 'Acme Studio',
    customerTag: 'Agency',
    issueDate: 'Oct 04, 2024',
    dueDate: 'Oct 18, 2024',
    amount: 1240.0,
    daysOverdue: 6,
    status: 'Overdue',
  },
  {
    id: 'inv-82',
    invoiceNumber: 'INV-2024-082',
    customerName: 'Horizon Media',
    customerTag: 'Digital Pub',
    issueDate: 'Sep 29, 2024',
    dueDate: 'Oct 13, 2024',
    amount: 3450.0,
    daysOverdue: 11,
    status: 'Overdue',
  },
  {
    id: 'inv-77',
    invoiceNumber: 'INV-2024-077',
    customerName: 'Northwind Cloud',
    customerTag: 'SaaS',
    issueDate: 'Sep 22, 2024',
    dueDate: 'Oct 06, 2024',
    amount: 890.0,
    daysOverdue: 18,
    status: 'Overdue',
  },
  {
    id: 'inv-71',
    invoiceNumber: 'INV-2024-071',
    customerName: 'Lumina Creative',
    customerTag: 'Studio',
    issueDate: 'Sep 15, 2024',
    dueDate: 'Sep 29, 2024',
    amount: 2100.0,
    daysOverdue: 25,
    status: 'Overdue',
  },
  {
    id: 'inv-65',
    invoiceNumber: 'INV-2024-065',
    customerName: 'Vertex Logistics',
    customerTag: 'Enterprise',
    issueDate: 'Sep 08, 2024',
    dueDate: 'Sep 22, 2024',
    amount: 740.0,
    daysOverdue: 32,
    status: 'Overdue',
  },
];

export const StaffTodayPage: React.FC = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<OverdueTask[]>(INITIAL_QUEUE);
  const [searchQuery, setSearchQuery] = useState('');
  const [agingFilter, setAgingFilter] = useState<'all' | '1-7' | '8-14' | '15+'>('all');

  // Record payment drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<OverdueTask | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter queue
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCust = t.customerName.toLowerCase().includes(q);
        const matchesInv = t.invoiceNumber.toLowerCase().includes(q);
        if (!matchesCust && !matchesInv) return false;
      }
      if (agingFilter === '1-7' && (t.daysOverdue < 1 || t.daysOverdue > 7)) return false;
      if (agingFilter === '8-14' && (t.daysOverdue < 8 || t.daysOverdue > 14)) return false;
      if (agingFilter === '15+' && t.daysOverdue < 15) return false;
      return true;
    });
  }, [tasks, searchQuery, agingFilter]);

  const totalOutstanding = tasks.reduce((sum, t) => sum + t.amount, 0);

  const handleOpenPayment = (task?: OverdueTask) => {
    const target = task || tasks[0];
    if (!target) {
      showToast('No outstanding invoices to record payment for.', 'info');
      return;
    }
    setActiveTask(target);
    setPaymentAmount(target.amount.toFixed(2));
    setPaymentMethod('bank_transfer');
    setPaymentRef(`TXN-${Math.floor(1000000 + Math.random() * 9000000)}`);
    setPaymentNotes('');
    setDrawerOpen(true);
  };

  const handleSubmitPayment = () => {
    if (!activeTask) return;
    const amt = parseFloat(paymentAmount);
    if (isNaN(amt) || amt <= 0) {
      showToast('Please enter a valid payment amount.', 'error');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setTasks((prev) => prev.filter((t) => t.id !== activeTask.id));
      showToast(`Payment of $${amt.toFixed(2)} recorded for ${activeTask.invoiceNumber}`, 'success');
      setIsSubmitting(false);
      setDrawerOpen(false);
    }, 450);
  };

  return (
    <StaffLayout
      title="Good morning, Sarah"
      subtitle="Operational priority queue and follow-up workspace"
      actions={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleOpenPayment()}
            className="h-10 px-4 bg-white text-slate-800 font-medium text-sm rounded-[10px] border border-slate-200 shadow-xs hover:bg-slate-50 transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
          >
            <span className="material-symbols-outlined text-[18px] text-slate-500">payments</span>
            <span>Record payment</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/staff/quotations')}
            className="h-10 px-4 bg-[#0F766E] text-white font-medium text-sm rounded-[10px] shadow-xs hover:bg-[#115E59] transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>New quotation</span>
          </button>
        </div>
      }
    >
      {/* ── 3 Summary KPI Cards (No Charts) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Quotations awaiting confirmation */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow group">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Quotations awaiting confirmation
              </span>
              <span className="h-7 w-7 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-[16px]">request_quote</span>
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold text-slate-900 tracking-tight leading-none">
                4
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                2 expiring this week
              </span>
            </div>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
            <Link
              to="/staff/quotations"
              className="text-xs font-semibold text-[#0F766E] hover:text-[#115E59] flex items-center gap-1 group-hover:gap-1.5 transition-all"
            >
              <span>View quotations</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
            <span className="text-[11px] text-slate-400">Stage: Sent</span>
          </div>
        </div>

        {/* Card 2: Invoices to send */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow group">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Invoices to send
              </span>
              <span className="h-7 w-7 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-[16px]">send</span>
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold text-slate-900 tracking-tight leading-none">
                7
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
                3 ready for dispatch
              </span>
            </div>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
            <Link
              to="/staff/invoices"
              className="text-xs font-semibold text-[#0F766E] hover:text-[#115E59] flex items-center gap-1 group-hover:gap-1.5 transition-all"
            >
              <span>Review draft invoices</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
            <span className="text-[11px] text-slate-400">Generated today</span>
          </div>
        </div>

        {/* Card 3: Overdue to chase */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow group">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Overdue to chase
              </span>
              <span className="h-7 w-7 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-[16px]">error</span>
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold text-slate-900 tracking-tight leading-none">
                {tasks.length}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-semibold">
                ${totalOutstanding.toLocaleString('en-US', { minimumFractionDigits: 2 })} outstanding
              </span>
            </div>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
            <a
              href="#work-queue-section"
              className="text-xs font-semibold text-[#0F766E] hover:text-[#115E59] flex items-center gap-1 group-hover:gap-1.5 transition-all"
            >
              <span>Jump to queue</span>
              <span className="material-symbols-outlined text-[14px]">south</span>
            </a>
            <span className="text-[11px] font-semibold text-rose-600">Action critical</span>
          </div>
        </div>
      </div>

      {/* ── Operational Work Queue Section ── */}
      <section className="flex flex-col mt-2" id="work-queue-section">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">My work queue</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200">
                {tasks.length} overdue invoices
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Overdue invoices requiring immediate follow-up or payment collection
            </p>
          </div>

          {/* Quick Triage Search & Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative min-w-[200px]">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[16px] pointer-events-none">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by customer..."
                className="w-full h-9 pl-8 pr-3 bg-white border border-slate-200 text-slate-900 text-xs rounded-lg shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
              />
            </div>
            <div className="relative">
              <select
                value={agingFilter}
                onChange={(e) => setAgingFilter(e.target.value as any)}
                className="h-9 pl-3 pr-8 bg-white border border-slate-200 text-slate-700 text-xs rounded-lg shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#0F766E] appearance-none cursor-pointer"
              >
                <option value="all">All overdue</option>
                <option value="1-7">1-7 days</option>
                <option value="8-14">8-14 days</option>
                <option value="15+">15+ days</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-[18px] pointer-events-none">
                expand_more
              </span>
            </div>
          </div>
        </div>

        {/* Work Queue Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 h-9 text-slate-500 text-[11px] font-semibold uppercase tracking-wider select-none">
                  <th className="px-4 py-2" scope="col">Invoice</th>
                  <th className="px-4 py-2" scope="col">Customer</th>
                  <th className="px-4 py-2" scope="col">Issue Date</th>
                  <th className="px-4 py-2" scope="col">Due Date</th>
                  <th className="px-4 py-2 text-right" scope="col">Amount</th>
                  <th className="px-4 py-2" scope="col">Overdue</th>
                  <th className="px-4 py-2" scope="col">Status</th>
                  <th className="px-4 py-2 text-right" scope="col">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 px-4 text-center">
                      <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                          <span className="material-symbols-outlined text-[22px]">check_circle</span>
                        </div>
                        <h4 className="text-sm font-semibold text-slate-900">Nothing to chase today</h4>
                        <p className="text-xs text-slate-500 mt-0.5">All customer invoices in your operational queue are up to date.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((t) => (
                    <tr key={t.id} className="h-11 hover:bg-slate-50/70 transition-colors group">
                      <td className="px-4 py-2 font-mono font-semibold text-xs text-[#0F766E]">
                        {t.invoiceNumber}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-slate-900 text-xs">{t.customerName}</span>
                          {t.customerTag && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium">
                              {t.customerTag}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-xs text-slate-500">{t.issueDate}</td>
                      <td className="px-4 py-2 text-xs text-slate-500">{t.dueDate}</td>
                      <td className="px-4 py-2 text-right font-semibold text-xs text-slate-900 tabular-nums">
                        ${t.amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-2">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          <span>{t.daysOverdue} days overdue</span>
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          Overdue
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenPayment(t)}
                          className="h-7 px-2.5 bg-white hover:bg-slate-50 text-[#0F766E] border border-slate-200 text-xs font-semibold rounded-md shadow-2xs transition-colors"
                        >
                          Record payment
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Clean Table Footer */}
          <div className="px-4 py-3 bg-slate-50/70 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-slate-400">info</span>
              <span>Showing overdue invoices assigned to your operational team queue.</span>
            </div>
            <span className="font-medium text-slate-700">
              Showing {filteredTasks.length} of {tasks.length} items
            </span>
          </div>
        </div>
      </section>

      {/* ── Slide-over Drawer for "Record Payment" ── */}
      {drawerOpen && activeTask && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
          {/* Backdrop Mask Layer */}
          <div
            className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-[2px] transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer Shell */}
          <div className="fixed top-0 right-0 z-50 h-full w-full max-w-[440px] bg-white shadow-[-4px_0_24px_rgba(15,23,42,0.14)] flex flex-col justify-between transition-transform duration-300 ease-out">
            {/* Header */}
            <div className="h-16 px-6 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0F766E] text-[22px]">payments</span>
                <h3 className="font-bold text-slate-900 text-base">Record Received Payment</h3>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-4">
              {/* Target Snapshot Box */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Target Reference</span>
                  <span className="font-mono font-semibold text-[#0F766E]">{activeTask.invoiceNumber}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Customer</span>
                  <span className="font-medium text-slate-800">{activeTask.customerName}</span>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-900">Outstanding Balance</span>
                  <span className="text-base font-bold text-rose-600 tabular-nums">
                    ${activeTask.amount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Form Fields */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                  Amount Received ($)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full h-9 pl-7 pr-3 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                >
                  <option value="bank_transfer">ACH / Direct Bank Transfer</option>
                  <option value="credit_card">Corporate Credit Card</option>
                  <option value="wire">International Wire</option>
                  <option value="check">Physical Check</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                  Transaction / Ref Number
                </label>
                <input
                  type="text"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  placeholder="e.g. TXN-8921820"
                  className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                  Internal Note (Optional)
                </label>
                <textarea
                  rows={3}
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="Confirmed with accounts payable over phone..."
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F766E] resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="h-16 px-6 bg-slate-50/80 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="h-9 px-4 bg-white border border-slate-200 text-slate-700 font-medium text-xs rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitPayment}
                disabled={isSubmitting}
                className="h-9 px-4 bg-[#0F766E] text-white font-semibold text-xs rounded-lg hover:bg-[#115E59] transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
                    <span>Recording...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">check</span>
                    <span>Submit Payment</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </StaffLayout>
  );
};
