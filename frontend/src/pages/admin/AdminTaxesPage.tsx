import React, { useState } from 'react';
import {
  AdminLayout,
  AdminTable,
  AdminBadge,
  AdminButton,
  AdminDrawer,
  AdminInput,
  AdminModal,
  Column,
} from '../../components/admin';
import { useToast } from '../../components/common/Toast';

type TaxType = 'Inclusive' | 'Exclusive';

interface Tax {
  id: string;
  name: string;
  rate: number;
  type: TaxType;
  applicableTo: string;
  isActive: boolean;
}

const PRODUCTS = ['All Products', 'Brightloop Starter', 'Brightloop Pro', 'Brightloop Enterprise', 'API Access Add-on'];

const MOCK: Tax[] = [
  { id: 'tax-001', name: 'GST 18%', rate: 18, type: 'Exclusive', applicableTo: 'All Products', isActive: true },
  { id: 'tax-002', name: 'VAT 20%', rate: 20, type: 'Inclusive', applicableTo: 'Brightloop Pro', isActive: true },
  { id: 'tax-003', name: 'Service Tax 12%', rate: 12, type: 'Exclusive', applicableTo: 'Brightloop Starter', isActive: false },
  { id: 'tax-004', name: 'Digital Goods Tax 5%', rate: 5, type: 'Exclusive', applicableTo: 'API Access Add-on', isActive: true },
];

const EMPTY: Omit<Tax, 'id'> = { name: '', rate: 18, type: 'Exclusive', applicableTo: PRODUCTS[0], isActive: true };

export const AdminTaxesPage: React.FC = () => {
  const { showToast } = useToast();
  const [taxes, setTaxes] = useState<Tax[]>(MOCK);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Tax | null>(null);
  const [form, setForm] = useState<Omit<Tax, 'id'>>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Tax, string>>>({});
  const [deleteTarget, setDeleteTarget] = useState<Tax | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setErrors({}); setDrawerOpen(true); };
  const openEdit = (t: Tax) => { setEditing(t); setForm({ ...t }); setErrors({}); setDrawerOpen(true); };

  const validate = (): boolean => {
    const e: Partial<Record<keyof Tax, string>> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (form.rate <= 0 || form.rate > 100) e.rate = 'Rate must be between 1 and 100';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    setIsLoading(true);
    setTimeout(() => {
      if (editing) {
        setTaxes((prev) => prev.map((t) => (t.id === editing.id ? { ...editing, ...form } : t)));
        showToast('Tax updated', 'success');
      } else {
        setTaxes((prev) => [{ id: `tax-${Date.now()}`, ...form }, ...prev]);
        showToast('Tax created', 'success');
      }
      setIsLoading(false); setDrawerOpen(false);
    }, 600);
  };

  const handleDelete = () => { if (!deleteTarget) return; setTaxes((prev) => prev.filter((t) => t.id !== deleteTarget.id)); showToast('Tax deleted', 'success'); setDeleteTarget(null); };

  const columns: Column<Tax>[] = [
    { key: 'name', header: 'Name', render: (t) => <span className="font-medium text-slate-900">{t.name}</span> },
    { key: 'rate', header: 'Rate', render: (t) => <span className="font-semibold tabular-nums text-indigo-600">{t.rate}%</span> },
    { key: 'type', header: 'Type', render: (t) => <AdminBadge status={t.type === 'Inclusive' ? 'confirmed' : 'quotation'} label={t.type} /> },
    { key: 'applicableTo', header: 'Applicable To', render: (t) => <span className="text-sm text-slate-600">{t.applicableTo}</span> },
    { key: 'isActive', header: 'Status', render: (t) => <AdminBadge status={t.isActive ? 'active' : 'closed'} label={t.isActive ? 'Active' : 'Inactive'} /> },
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
    <AdminLayout title="Taxes" subtitle="Configure tax rates applied to products and plans"
      actions={<AdminButton variant="primary" size="sm" onClick={openCreate}>+ New Tax</AdminButton>}
    >
      <AdminTable columns={columns} data={taxes} keyExtractor={(t) => t.id} emptyMessage="No taxes configured" emptySubtext="Add tax rules to automatically apply them to invoices." />

      <AdminDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? 'Edit Tax' : 'New Tax'}
        footer={<><AdminButton variant="secondary" onClick={() => setDrawerOpen(false)}>Cancel</AdminButton><AdminButton variant="primary" onClick={handleSave} isLoading={isLoading}>{editing ? 'Save Changes' : 'Create Tax'}</AdminButton></>}
      >
        <div className="flex flex-col gap-4">
          <AdminInput label="Tax Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} error={errors.name} placeholder="e.g. GST 18%" />
          <AdminInput label="Rate (%)" type="number" value={String(form.rate)} onChange={(e) => setForm((f) => ({ ...f, rate: parseFloat(e.target.value) || 0 }))} error={errors.rate} />
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Type</label>
            <select className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as TaxType }))}>
              <option value="Exclusive">Exclusive (added on top)</option>
              <option value="Inclusive">Inclusive (included in price)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Applicable To</label>
            <select className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={form.applicableTo} onChange={(e) => setForm((f) => ({ ...f, applicableTo: e.target.value }))}>{PRODUCTS.map((p) => <option key={p}>{p}</option>)}</select>
          </div>
          <div className="flex items-center gap-3">
            <input id="tax-active" type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
            <label htmlFor="tax-active" className="text-sm text-slate-700">Active (applied to new invoices)</label>
          </div>
        </div>
      </AdminDrawer>

      <AdminModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Tax" description={`Delete tax "${deleteTarget?.name}"? This may affect future invoices.`} onConfirm={handleDelete} isDestructive />
    </AdminLayout>
  );
};
