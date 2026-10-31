import React, { useState } from 'react';
import {
  AdminLayout,
  AdminTable,
  AdminBadge,
  AdminButton,
  AdminModal,
  Column,
} from '../../components/admin';
import { useToast } from '../../components/common/Toast';

type InvStatus = 'Draft' | 'Confirmed' | 'Paid' | 'Overdue' | 'Cancelled';

interface Invoice {
  id: string;
  number: string;
  customer: string;
  subscription: string;
  amount: number;
  status: InvStatus;
  issueDate: string;
  dueDate: string;
}

const STATUS_MAP: Record<InvStatus, string> = { Draft: 'draft', Confirmed: 'confirmed', Paid: 'paid', Overdue: 'overdue', Cancelled: 'cancelled' };

const TABS: { label: string; value: InvStatus | 'All' }[] = [
  { label: 'All', value: 'All' },
  { label: 'Draft', value: 'Draft' },
  { label: 'Confirmed', value: 'Confirmed' },
  { label: 'Paid', value: 'Paid' },
  { label: 'Overdue', value: 'Overdue' },
];

const MOCK: Invoice[] = [
  { id: 'inv-001', number: 'INV-2025-001', customer: 'Nadia Farouq', subscription: 'SUB-2025-001', amount: 49.0, status: 'Paid', issueDate: 'Jan 15, 2025', dueDate: 'Feb 14, 2025' },
  { id: 'inv-002', number: 'INV-2025-002', customer: 'Marcus Vance', subscription: 'SUB-2025-002', amount: 178.0, status: 'Paid', issueDate: 'Feb 01, 2025', dueDate: 'Mar 03, 2025' },
  { id: 'inv-003', number: 'INV-2025-003', customer: 'Elena Rostova', subscription: 'SUB-2025-003', amount: 2495.0, status: 'Confirmed', issueDate: 'Mar 01, 2025', dueDate: 'Mar 31, 2025' },
  { id: 'inv-004', number: 'INV-2025-004', customer: 'Nadia Farouq', subscription: 'SUB-2025-001', amount: 49.0, status: 'Draft', issueDate: 'Apr 15, 2025', dueDate: 'May 15, 2025' },
  { id: 'inv-005', number: 'INV-2025-005', customer: 'Elena Rostova', subscription: 'SUB-2025-003', amount: 180.0, status: 'Overdue', issueDate: 'Mar 01, 2025', dueDate: 'Apr 01, 2025' },
  { id: 'inv-006', number: 'INV-2025-006', customer: 'James Whitfield', subscription: 'SUB-2025-004', amount: 49.0, status: 'Cancelled', issueDate: 'Feb 10, 2025', dueDate: 'Mar 12, 2025' },
  { id: 'inv-007', number: 'INV-2025-007', customer: 'Claire Beauchamp', subscription: 'SUB-2025-005', amount: 58.0, status: 'Draft', issueDate: 'Apr 01, 2025', dueDate: 'May 01, 2025' },
  { id: 'inv-008', number: 'INV-2025-008', customer: 'Marcus Vance', subscription: 'SUB-2025-002', amount: 540.0, status: 'Overdue', issueDate: 'Feb 22, 2025', dueDate: 'Mar 24, 2025' },
  { id: 'inv-009', number: 'INV-2025-009', customer: 'Samuel Osei', subscription: 'SUB-2024-098', amount: 49.0, status: 'Paid', issueDate: 'Dec 01, 2024', dueDate: 'Dec 31, 2024' },
  { id: 'inv-010', number: 'INV-2025-010', customer: 'Marcus Vance', subscription: 'SUB-2025-002', amount: 178.0, status: 'Confirmed', issueDate: 'Mar 01, 2025', dueDate: 'Mar 31, 2025' },
];

type InvAction = 'Confirm' | 'Cancel' | 'Send' | 'Print';

function getActions(status: InvStatus): InvAction[] {
  switch (status) {
    case 'Draft': return ['Confirm', 'Cancel'];
    case 'Confirmed': return ['Send', 'Cancel'];
    case 'Overdue': return ['Send', 'Cancel'];
    case 'Paid': return ['Print'];
    case 'Cancelled': return [];
    default: return [];
  }
}

function applyAction(status: InvStatus, action: InvAction): InvStatus {
  if (action === 'Confirm') return 'Confirmed';
  if (action === 'Cancel') return 'Cancelled';
  return status;
}

export const AdminInvoicesPage: React.FC = () => {
  const { showToast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK);
  const [activeTab, setActiveTab] = useState<InvStatus | 'All'>('All');
  const [confirmAction, setConfirmAction] = useState<{ inv: Invoice; action: InvAction } | null>(null);

  const filtered = activeTab === 'All' ? invoices : invoices.filter((i) => i.status === activeTab);

  const handleAction = (inv: Invoice, action: InvAction) => {
    if (action === 'Print') { showToast(`Printing ${inv.number}…`, 'info'); return; }
    if (action === 'Send') { showToast(`Invoice ${inv.number} sent to ${inv.customer}`, 'success'); return; }
    setConfirmAction({ inv, action });
  };

  const confirmAndApply = () => {
    if (!confirmAction) return;
    const { inv, action } = confirmAction;
    const newStatus = applyAction(inv.status, action);
    setInvoices((prev) => prev.map((i) => (i.id === inv.id ? { ...i, status: newStatus } : i)));
    showToast(`${inv.number} → ${newStatus}`, 'success');
    setConfirmAction(null);
  };

  const columns: Column<Invoice>[] = [
    { key: 'number', header: 'Invoice #', render: (i) => <span className="font-mono text-xs font-semibold text-indigo-600">{i.number}</span> },
    { key: 'customer', header: 'Customer', render: (i) => <span className="font-medium text-slate-900">{i.customer}</span> },
    { key: 'subscription', header: 'Subscription', render: (i) => <span className="text-xs text-slate-500 font-mono">{i.subscription}</span> },
    { key: 'amount', header: 'Amount', render: (i) => <span className="font-semibold tabular-nums">${i.amount.toFixed(2)}</span> },
    { key: 'status', header: 'Status', render: (i) => <AdminBadge status={STATUS_MAP[i.status]} label={i.status} /> },
    { key: 'issueDate', header: 'Issued', render: (i) => <span className="text-xs text-slate-500">{i.issueDate}</span> },
    { key: 'dueDate', header: 'Due', render: (i) => <span className="text-xs text-slate-500">{i.dueDate}</span> },
    {
      key: 'actions', header: '',
      render: (i) => {
        const actions = getActions(i.status);
        if (actions.length === 0) return null;
        return (
          <div className="flex items-center gap-1.5 justify-end">
            {actions.map((a) => (
              <AdminButton key={a} variant="subtle" size="sm" onClick={() => handleAction(i, a)} className={a === 'Cancel' ? 'text-red-500 hover:text-red-700' : ''}>{a}</AdminButton>
            ))}
          </div>
        );
      },
    },
  ];

  return (
    <AdminLayout title="Invoices" subtitle="Track, confirm, and manage all invoices">
      {/* Status Tabs */}
      <div className="flex items-center gap-1 bg-white rounded-lg border border-slate-200 p-1 w-fit">
        {TABS.map((tab) => {
          const count = tab.value === 'All' ? invoices.length : invoices.filter((i) => i.status === tab.value).length;
          return (
            <button key={tab.value} onClick={() => setActiveTab(tab.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${activeTab === tab.value ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
              {tab.label}
              <span className={`text-[10px] rounded-full px-1.5 py-0.5 ${activeTab === tab.value ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>{count}</span>
            </button>
          );
        })}
      </div>

      <AdminTable columns={columns} data={filtered} keyExtractor={(i) => i.id} emptyMessage="No invoices" emptySubtext="Invoices will appear here once generated." />

      <AdminModal isOpen={!!confirmAction} onClose={() => setConfirmAction(null)} title={`${confirmAction?.action} Invoice`} description={`Are you sure you want to ${confirmAction?.action?.toLowerCase()} invoice ${confirmAction?.inv.number}?`} onConfirm={confirmAndApply} isDestructive={confirmAction?.action === 'Cancel'} />
    </AdminLayout>
  );
};
