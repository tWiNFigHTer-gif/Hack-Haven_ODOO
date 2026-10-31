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

type DiscountType = 'Fixed' | 'Percentage';

interface Discount {
  id: string;
  name: string;
  type: DiscountType;
  value: number;
  minPurchase: number;
  minQuantity: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usedCount: number;
  appliesTo: string;
}

const PRODUCTS = ['All Products', 'Brightloop Starter', 'Brightloop Pro', 'Brightloop Enterprise', 'API Access Add-on'];

const MOCK: Discount[] = [
  { id: 'disc-001', name: 'Spring Sale 20%', type: 'Percentage', value: 20, minPurchase: 50, minQuantity: 1, startDate: '2025-03-01', endDate: '2025-03-31', usageLimit: 200, usedCount: 87, appliesTo: 'All Products' },
  { id: 'disc-002', name: 'First Month Free', type: 'Fixed', value: 49, minPurchase: 0, minQuantity: 1, startDate: '2025-01-01', endDate: '2025-06-30', usageLimit: 500, usedCount: 312, appliesTo: 'Brightloop Starter' },
  { id: 'disc-003', name: 'Pro Loyalty 15%', type: 'Percentage', value: 15, minPurchase: 100, minQuantity: 1, startDate: '2025-04-01', endDate: '2025-12-31', usageLimit: 100, usedCount: 24, appliesTo: 'Brightloop Pro' },
];

const EMPTY: Omit<Discount, 'id' | 'usedCount'> = { name: '', type: 'Percentage', value: 10, minPurchase: 0, minQuantity: 1, startDate: '', endDate: '', usageLimit: 100, appliesTo: PRODUCTS[0] };

export const AdminDiscountsPage: React.FC = () => {
  const { showToast } = useToast();
  const [discounts, setDiscounts] = useState<Discount[]>(MOCK);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Discount | null>(null);
  const [form, setForm] = useState<Omit<Discount, 'id' | 'usedCount'>>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Discount, string>>>({});
  const [deleteTarget, setDeleteTarget] = useState<Discount | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setErrors({}); setDrawerOpen(true); };
  const openEdit = (d: Discount) => { setEditing(d); setForm({ name: d.name, type: d.type, value: d.value, minPurchase: d.minPurchase, minQuantity: d.minQuantity, startDate: d.startDate, endDate: d.endDate, usageLimit: d.usageLimit, appliesTo: d.appliesTo }); setErrors({}); setDrawerOpen(true); };

  const validate = (): boolean => {
    const e: Partial<Record<keyof Discount, string>> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (form.value <= 0) e.value = 'Value must be > 0';
    if (form.type === 'Percentage' && form.value > 100) e.value = 'Percentage cannot exceed 100';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    setIsLoading(true);
    setTimeout(() => {
      if (editing) {
        setDiscounts((prev) => prev.map((d) => (d.id === editing.id ? { ...editing, ...form } : d)));
        showToast('Discount updated', 'success');
      } else {
        setDiscounts((prev) => [{ id: `disc-${Date.now()}`, usedCount: 0, ...form }, ...prev]);
        showToast('Discount created', 'success');
      }
      setIsLoading(false); setDrawerOpen(false);
    }, 600);
  };

  const handleDelete = () => { if (!deleteTarget) return; setDiscounts((prev) => prev.filter((d) => d.id !== deleteTarget.id)); showToast('Discount deleted', 'success'); setDeleteTarget(null); };

  const columns: Column<Discount>[] = [
    { key: 'name', header: 'Name', render: (d) => <span className="font-medium text-slate-900">{d.name}</span> },
    { key: 'type', header: 'Type', render: (d) => <AdminBadge status={d.type === 'Percentage' ? 'quotation' : 'confirmed'} label={d.type} /> },
    { key: 'value', header: 'Value', render: (d) => <span className="font-semibold tabular-nums text-indigo-600">{d.type === 'Percentage' ? `${d.value}%` : `$${d.value.toFixed(2)}`}</span> },
    { key: 'appliesTo', header: 'Applies To', render: (d) => <span className="text-sm text-slate-600">{d.appliesTo}</span> },
    { key: 'usedCount', header: 'Usage', render: (d) => <span className="text-xs text-slate-500">{d.usedCount} / {d.usageLimit}</span> },
    { key: 'startDate', header: 'Period', render: (d) => <span className="text-xs text-slate-400">{d.startDate || '—'} → {d.endDate || '—'}</span> },
    {
      key: 'actions', header: '',
      render: (d) => (
        <div className="flex items-center gap-2 justify-end">
          <AdminButton variant="subtle" size="sm" onClick={() => openEdit(d)}>Edit</AdminButton>
          <AdminButton variant="subtle" size="sm" onClick={() => setDeleteTarget(d)} className="text-red-500 hover:text-red-700">Delete</AdminButton>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="Discounts" subtitle="Create and manage promotional discount codes"
      actions={<AdminButton variant="primary" size="sm" onClick={openCreate}>+ New Discount</AdminButton>}
    >
      <AdminTable columns={columns} data={discounts} keyExtractor={(d) => d.id} emptyMessage="No discounts yet" emptySubtext="Create a discount to offer promotions." />

      <AdminDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? 'Edit Discount' : 'New Discount'}
        footer={<><AdminButton variant="secondary" onClick={() => setDrawerOpen(false)}>Cancel</AdminButton><AdminButton variant="primary" onClick={handleSave} isLoading={isLoading}>{editing ? 'Save Changes' : 'Create Discount'}</AdminButton></>}
      >
        <div className="flex flex-col gap-4">
          <AdminInput label="Discount Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} error={errors.name} placeholder="e.g. Spring Sale 20%" />
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Type</label>
            <select className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as DiscountType }))}>
              <option value="Percentage">Percentage (%)</option>
              <option value="Fixed">Fixed Amount ($)</option>
            </select>
          </div>
          <AdminInput label={form.type === 'Percentage' ? 'Discount %' : 'Discount Amount ($)'} type="number" value={String(form.value)} onChange={(e) => setForm((f) => ({ ...f, value: parseFloat(e.target.value) || 0 }))} error={errors.value} />
          <div className="grid grid-cols-2 gap-3">
            <AdminInput label="Min Purchase ($)" type="number" value={String(form.minPurchase)} onChange={(e) => setForm((f) => ({ ...f, minPurchase: parseFloat(e.target.value) || 0 }))} />
            <AdminInput label="Min Quantity" type="number" value={String(form.minQuantity)} onChange={(e) => setForm((f) => ({ ...f, minQuantity: parseInt(e.target.value) || 1 }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <AdminInput label="Start Date" type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
            <AdminInput label="End Date" type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} />
          </div>
          <AdminInput label="Usage Limit" type="number" value={String(form.usageLimit)} onChange={(e) => setForm((f) => ({ ...f, usageLimit: parseInt(e.target.value) || 1 }))} />
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Applies To</label>
            <select className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={form.appliesTo} onChange={(e) => setForm((f) => ({ ...f, appliesTo: e.target.value }))}>{PRODUCTS.map((p) => <option key={p}>{p}</option>)}</select>
          </div>
        </div>
      </AdminDrawer>

      <AdminModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Discount" description={`Delete discount "${deleteTarget?.name}"? This cannot be undone.`} onConfirm={handleDelete} isDestructive />
    </AdminLayout>
  );
};
