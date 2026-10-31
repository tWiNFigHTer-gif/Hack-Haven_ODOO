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

type SubStatus = 'Draft' | 'Quotation' | 'Confirmed' | 'Active' | 'Paused' | 'Closed';

interface SubLine { product: string; quantity: number; unitPrice: number; }

interface Subscription {
  id: string;
  number: string;
  customer: string;
  customerEmail: string;
  plan: string;
  status: SubStatus;
  startDate: string;
  expiryDate: string;
  lines: SubLine[];
}

const STATUS_MAP: Record<SubStatus, string> = { Draft: 'draft', Quotation: 'quotation', Confirmed: 'confirmed', Active: 'active', Paused: 'paused', Closed: 'closed' };

const TIMELINE_STEPS: SubStatus[] = ['Draft', 'Quotation', 'Confirmed', 'Active', 'Closed'];

const MOCK: Subscription[] = [
  { id: 'sub-001', number: 'SUB-2025-001', customer: 'Nadia Farouq', customerEmail: 'nadia.farouq@luminary-skincare.com', plan: 'Starter Monthly', status: 'Active', startDate: 'Jan 15, 2025', expiryDate: 'Dec 31, 2025', lines: [{ product: 'Brightloop Starter', quantity: 1, unitPrice: 49 }] },
  { id: 'sub-002', number: 'SUB-2025-002', customer: 'Marcus Vance', customerEmail: 'm.vance@apothecary-botanicals.com', plan: 'Pro Monthly', status: 'Active', startDate: 'Feb 1, 2025', expiryDate: 'Jan 31, 2026', lines: [{ product: 'Brightloop Pro', quantity: 1, unitPrice: 149 }, { product: 'API Access Add-on', quantity: 1, unitPrice: 29 }] },
  { id: 'sub-003', number: 'SUB-2025-003', customer: 'Elena Rostova', customerEmail: 'elena.rostova@atelier-sanctuary.com', plan: 'Enterprise Yearly', status: 'Confirmed', startDate: 'Mar 1, 2025', expiryDate: 'Feb 28, 2026', lines: [{ product: 'Brightloop Enterprise', quantity: 5, unitPrice: 499 }] },
  { id: 'sub-004', number: 'SUB-2025-004', customer: 'James Whitfield', customerEmail: 'j.whitfield@crystalline-lab.com', plan: 'Starter Monthly', status: 'Paused', startDate: 'Feb 10, 2025', expiryDate: 'Feb 9, 2026', lines: [{ product: 'Brightloop Starter', quantity: 1, unitPrice: 49 }] },
  { id: 'sub-005', number: 'SUB-2025-005', customer: 'Claire Beauchamp', customerEmail: 'claire@velvet-roots.com', plan: 'Developer Weekly', status: 'Draft', startDate: 'Apr 1, 2025', expiryDate: 'Sep 30, 2025', lines: [{ product: 'API Access Add-on', quantity: 2, unitPrice: 29 }] },
  { id: 'sub-006', number: 'SUB-2024-098', customer: 'Samuel Osei', customerEmail: 's.osei@terranova-drinks.com', plan: 'Starter Monthly', status: 'Closed', startDate: 'Jan 1, 2024', expiryDate: 'Dec 31, 2024', lines: [{ product: 'Brightloop Starter', quantity: 1, unitPrice: 49 }] },
];

type AllowedAction = 'Confirm' | 'Activate' | 'Pause' | 'Resume' | 'Close' | 'Reopen';

function getAllowedActions(status: SubStatus): AllowedAction[] {
  switch (status) {
    case 'Draft': return ['Confirm'];
    case 'Quotation': return ['Confirm'];
    case 'Confirmed': return ['Activate'];
    case 'Active': return ['Pause', 'Close'];
    case 'Paused': return ['Resume', 'Close'];
    case 'Closed': return ['Reopen'];
    default: return [];
  }
}

function applyAction(_status: SubStatus, action: AllowedAction): SubStatus {
  const map: Record<AllowedAction, SubStatus> = { Confirm: 'Confirmed', Activate: 'Active', Pause: 'Paused', Resume: 'Active', Close: 'Closed', Reopen: 'Active' };
  return map[action] ?? _status;
}

export const AdminSubscriptionsPage: React.FC = () => {
  const { showToast } = useToast();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(MOCK);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ sub: Subscription; action: AllowedAction } | null>(null);

  const selected = subscriptions.find((s) => s.id === selectedId) ?? null;

  const handleAction = () => {
    if (!confirmAction) return;
    const { sub, action } = confirmAction;
    const newStatus = applyAction(sub.status, action);
    setSubscriptions((prev) => prev.map((s) => (s.id === sub.id ? { ...s, status: newStatus } : s)));
    showToast(`Subscription ${sub.number} → ${newStatus}`, 'success');
    setConfirmAction(null);
  };

  const columns: Column<Subscription>[] = [
    { key: 'number', header: 'Number', render: (s) => <button className="font-mono text-indigo-600 hover:underline text-xs font-semibold" onClick={() => setSelectedId(s.id)}>{s.number}</button> },
    { key: 'customer', header: 'Customer', render: (s) => <span className="font-medium text-slate-900">{s.customer}</span> },
    { key: 'plan', header: 'Plan', render: (s) => <span className="text-sm text-slate-600">{s.plan}</span> },
    { key: 'status', header: 'Status', render: (s) => <AdminBadge status={STATUS_MAP[s.status]} label={s.status} /> },
    { key: 'startDate', header: 'Start', render: (s) => <span className="text-xs text-slate-500">{s.startDate}</span> },
    { key: 'expiryDate', header: 'Expiry', render: (s) => <span className="text-xs text-slate-500">{s.expiryDate}</span> },
    { key: 'view', header: '', render: (s) => <AdminButton variant="subtle" size="sm" onClick={() => setSelectedId(s.id)}>View</AdminButton> },
  ];

  return (
    <AdminLayout title="Subscriptions" subtitle="Manage all customer subscriptions">
      {selected ? (
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <AdminButton variant="subtle" size="sm" onClick={() => setSelectedId(null)}>← Back</AdminButton>
            <h2 className="text-lg font-bold text-slate-900">{selected.number}</h2>
            <AdminBadge status={STATUS_MAP[selected.status]} label={selected.status} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-slate-700 mb-1">Details</h3>
              <div className="flex flex-col gap-2 text-sm">
                <div><span className="text-slate-400 text-xs">Customer</span><p className="font-medium">{selected.customer}</p></div>
                <div><span className="text-slate-400 text-xs">Email</span><p>{selected.customerEmail}</p></div>
                <div><span className="text-slate-400 text-xs">Plan</span><p>{selected.plan}</p></div>
                <div><span className="text-slate-400 text-xs">Start Date</span><p>{selected.startDate}</p></div>
                <div><span className="text-slate-400 text-xs">Expiry Date</span><p>{selected.expiryDate}</p></div>
              </div>
              <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                {getAllowedActions(selected.status).map((action) => (
                  <AdminButton key={action} variant={action === 'Close' ? 'destructive' : 'secondary'} size="sm" onClick={() => setConfirmAction({ sub: selected, action })}>{action}</AdminButton>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="text-sm font-semibold text-slate-700 mb-4">Status Timeline</h3>
                <div className="flex items-center">
                  {TIMELINE_STEPS.map((step, i) => {
                    const stepIndex = TIMELINE_STEPS.indexOf(selected.status);
                    const isPast = i < stepIndex;
                    const isCurrent = step === selected.status;
                    const isFuture = i > stepIndex;
                    return (
                      <React.Fragment key={step}>
                        <div className="flex flex-col items-center gap-1">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${isCurrent ? 'bg-indigo-600 border-indigo-600 text-white' : isPast ? 'bg-green-500 border-green-500 text-white' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
                            {isPast ? '✓' : i + 1}
                          </div>
                          <span className={`text-[10px] font-medium whitespace-nowrap ${isFuture ? 'text-slate-300' : isCurrent ? 'text-indigo-600' : 'text-slate-500'}`}>{step}</span>
                        </div>
                        {i < TIMELINE_STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-1 ${i < stepIndex ? 'bg-green-400' : 'bg-slate-200'}`} />}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Product</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Qty</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Unit Price</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.lines.map((l, i) => (
                      <tr key={i} className="border-b border-slate-50 last:border-0">
                        <td className="px-4 py-3 font-medium">{l.product}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{l.quantity}</td>
                        <td className="px-4 py-3 text-right tabular-nums">${l.unitPrice.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right tabular-nums font-semibold">${(l.quantity * l.unitPrice).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50">
                      <td colSpan={3} className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Total</td>
                      <td className="px-4 py-3 text-right tabular-nums font-bold text-slate-900">${selected.lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0).toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <AdminTable columns={columns} data={subscriptions} keyExtractor={(s) => s.id} emptyMessage="No subscriptions" emptySubtext="Subscriptions will appear here once created." />
      )}

      <AdminModal isOpen={!!confirmAction} onClose={() => setConfirmAction(null)} title={`Confirm: ${confirmAction?.action}`} description={`Are you sure you want to ${confirmAction?.action?.toLowerCase()} subscription ${confirmAction?.sub.number}?`} onConfirm={handleAction} isDestructive={confirmAction?.action === 'Close'} />
    </AdminLayout>
  );
};
