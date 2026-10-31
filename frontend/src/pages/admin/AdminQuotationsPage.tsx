import React, { useState } from 'react';
import {
  AdminLayout,
  AdminTable,
  AdminButton,
  AdminDrawer,
  AdminInput,
  AdminModal,
  Column,
} from '../../components/admin';
import { useToast } from '../../components/common/Toast';

interface QuotationLine { id: string; product: string; quantity: number; }
interface QuotationTemplate { id: string; name: string; validityDays: number; plan: string; lines: QuotationLine[]; }

const PLANS = ['Starter Monthly', 'Pro Monthly', 'Enterprise Yearly', 'Developer Weekly'];
const PRODUCTS = ['Brightloop Starter', 'Brightloop Pro', 'Brightloop Enterprise', 'API Access Add-on', 'Dedicated Support'];

const MOCK: QuotationTemplate[] = [
  { id: 'qt-001', name: 'Standard Onboarding', validityDays: 30, plan: 'Starter Monthly', lines: [{ id: 'l1', product: 'Brightloop Starter', quantity: 1 }, { id: 'l2', product: 'Dedicated Support', quantity: 1 }] },
  { id: 'qt-002', name: 'Pro Upgrade Bundle', validityDays: 14, plan: 'Pro Monthly', lines: [{ id: 'l3', product: 'Brightloop Pro', quantity: 1 }, { id: 'l4', product: 'API Access Add-on', quantity: 2 }] },
  { id: 'qt-003', name: 'Enterprise Proposal', validityDays: 60, plan: 'Enterprise Yearly', lines: [{ id: 'l5', product: 'Brightloop Enterprise', quantity: 10 }, { id: 'l6', product: 'Dedicated Support', quantity: 10 }] },
];

const EMPTY: Omit<QuotationTemplate, 'id'> = { name: '', validityDays: 30, plan: PLANS[0], lines: [] };

export const AdminQuotationsPage: React.FC = () => {
  const { showToast } = useToast();
  const [templates, setTemplates] = useState<QuotationTemplate[]>(MOCK);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<QuotationTemplate | null>(null);
  const [form, setForm] = useState<Omit<QuotationTemplate, 'id'>>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof QuotationTemplate, string>>>({});
  const [deleteTarget, setDeleteTarget] = useState<QuotationTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setErrors({}); setDrawerOpen(true); };
  const openEdit = (t: QuotationTemplate) => { setEditing(t); setForm({ ...t, lines: [...t.lines] }); setErrors({}); setDrawerOpen(true); };

  const validate = (): boolean => {
    const e: Partial<Record<keyof QuotationTemplate, string>> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (form.validityDays < 1) e.validityDays = 'Validity must be ≥ 1 day';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    setIsLoading(true);
    setTimeout(() => {
      if (editing) {
        setTemplates((prev) => prev.map((t) => (t.id === editing.id ? { ...editing, ...form } : t)));
        showToast('Template updated', 'success');
      } else {
        setTemplates((prev) => [{ id: `qt-${Date.now()}`, ...form }, ...prev]);
        showToast('Template created', 'success');
      }
      setIsLoading(false); setDrawerOpen(false);
    }, 600);
  };

  const handleDelete = () => { if (!deleteTarget) return; setTemplates((prev) => prev.filter((t) => t.id !== deleteTarget.id)); showToast('Template deleted', 'success'); setDeleteTarget(null); };

  const addLine = () => setForm((f) => ({ ...f, lines: [...f.lines, { id: `l-${Date.now()}`, product: PRODUCTS[0], quantity: 1 }] }));
  const removeLine = (id: string) => setForm((f) => ({ ...f, lines: f.lines.filter((l) => l.id !== id) }));
  const updateLine = (id: string, field: keyof QuotationLine, value: string | number) =>
    setForm((f) => ({ ...f, lines: f.lines.map((l) => (l.id === id ? { ...l, [field]: value } : l)) }));

  const columns: Column<QuotationTemplate>[] = [
    { key: 'name', header: 'Name', render: (t) => <span className="font-medium text-slate-900">{t.name}</span> },
    { key: 'plan', header: 'Plan', render: (t) => <span className="text-sm text-slate-600">{t.plan}</span> },
    { key: 'validityDays', header: 'Valid For', render: (t) => <span>{t.validityDays} days</span> },
    { key: 'lines', header: 'Lines', render: (t) => <span>{t.lines.length}</span> },
    {
      key: 'actions', header: '',
      render: (t) => (
        <div className="flex items-center gap-2 justify-end">
          <AdminButton variant="subtle" size="sm" onClick={() => openEdit(t)}>Edit</AdminButton>
          <AdminButton variant="subtle" size="sm" onClick={() => setDeleteTarget(t)} className="text-red-500 hover:text-red-700">Delete</AdminButton>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="Quotation Templates" subtitle="Reusable templates for generating customer quotations"
      actions={<AdminButton variant="primary" size="sm" onClick={openCreate}>+ New Template</AdminButton>}
    >
      <AdminTable columns={columns} data={templates} keyExtractor={(t) => t.id} emptyMessage="No templates yet" emptySubtext="Create a quotation template to speed up your sales process." />

      <AdminDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? 'Edit Template' : 'New Template'}
        footer={<><AdminButton variant="secondary" onClick={() => setDrawerOpen(false)}>Cancel</AdminButton><AdminButton variant="primary" onClick={handleSave} isLoading={isLoading}>{editing ? 'Save Changes' : 'Create Template'}</AdminButton></>}
      >
        <div className="flex flex-col gap-4">
          <AdminInput label="Template Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} error={errors.name} placeholder="e.g. Standard Onboarding" />
          <AdminInput label="Validity (days)" type="number" value={String(form.validityDays)} onChange={(e) => setForm((f) => ({ ...f, validityDays: parseInt(e.target.value) || 1 }))} error={errors.validityDays} />
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Plan</label>
            <select className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={form.plan} onChange={(e) => setForm((f) => ({ ...f, plan: e.target.value }))}>{PLANS.map((p) => <option key={p}>{p}</option>)}</select>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Product Lines</span>
              <AdminButton variant="subtle" size="sm" onClick={addLine}>+ Add Line</AdminButton>
            </div>
            {form.lines.length === 0 && <p className="text-xs text-slate-400 italic py-2">No lines. Click "+ Add Line" to add products.</p>}
            <div className="flex flex-col gap-2">
              {form.lines.map((l) => (
                <div key={l.id} className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2">
                  <select className="flex-1 text-xs bg-white border border-slate-200 rounded px-2 py-1 focus:outline-none focus:border-indigo-400" value={l.product} onChange={(e) => updateLine(l.id, 'product', e.target.value)}>{PRODUCTS.map((p) => <option key={p}>{p}</option>)}</select>
                  <input className="w-16 text-xs bg-white border border-slate-200 rounded px-2 py-1 text-right tabular-nums focus:outline-none focus:border-indigo-400" type="number" min={1} value={l.quantity} onChange={(e) => updateLine(l.id, 'quantity', parseInt(e.target.value) || 1)} />
                  <button className="text-slate-400 hover:text-red-500" onClick={() => removeLine(l.id)} title="Remove">✕</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AdminDrawer>

      <AdminModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Template" description={`Delete template "${deleteTarget?.name}"? This cannot be undone.`} onConfirm={handleDelete} isDestructive />
    </AdminLayout>
  );
};
