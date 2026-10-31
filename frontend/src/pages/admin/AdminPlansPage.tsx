import React, { useState } from 'react';
import {
  AdminLayout,
  AdminTable,
  AdminBadge,
  AdminButton,
  AdminDrawer,
  AdminInput,
  AdminModal,
  AdminToggle,
  AdminSegmentedControl,
  Column,
} from '../../components/admin';
import { useToast } from '../../components/common/Toast';

type BillingPeriod = 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';

interface Plan {
  id: string;
  name: string;
  price: number;
  billingPeriod: BillingPeriod;
  minQuantity: number;
  availableFrom: string;
  availableTo: string;
  autoCloseAtEnd: boolean;
  allowEarlyClose: boolean;
  allowPause: boolean;
  allowRenew: boolean;
}

const MOCK_PLANS: Plan[] = [
  { id: 'plan-001', name: 'Starter Monthly', price: 49.0, billingPeriod: 'Monthly', minQuantity: 1, availableFrom: '2025-01-01', availableTo: '2025-12-31', autoCloseAtEnd: true, allowEarlyClose: false, allowPause: true, allowRenew: true },
  { id: 'plan-002', name: 'Pro Monthly', price: 149.0, billingPeriod: 'Monthly', minQuantity: 1, availableFrom: '2025-01-01', availableTo: '2025-12-31', autoCloseAtEnd: false, allowEarlyClose: true, allowPause: true, allowRenew: true },
  { id: 'plan-003', name: 'Enterprise Yearly', price: 4999.0, billingPeriod: 'Yearly', minQuantity: 5, availableFrom: '2025-01-01', availableTo: '2026-12-31', autoCloseAtEnd: false, allowEarlyClose: false, allowPause: false, allowRenew: true },
  { id: 'plan-004', name: 'Developer Weekly', price: 15.0, billingPeriod: 'Weekly', minQuantity: 1, availableFrom: '2025-03-01', availableTo: '2025-09-30', autoCloseAtEnd: true, allowEarlyClose: true, allowPause: false, allowRenew: false },
];

const PERIOD_STATUS: Record<BillingPeriod, string> = { Daily: 'pending', Weekly: 'quotation', Monthly: 'confirmed', Yearly: 'active' };

const EMPTY_PLAN: Omit<Plan, 'id'> = { name: '', price: 0, billingPeriod: 'Monthly', minQuantity: 1, availableFrom: '', availableTo: '', autoCloseAtEnd: false, allowEarlyClose: false, allowPause: true, allowRenew: true };

export const AdminPlansPage: React.FC = () => {
  const { showToast } = useToast();
  const [plans, setPlans] = useState<Plan[]>(MOCK_PLANS);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [form, setForm] = useState<Omit<Plan, 'id'>>(EMPTY_PLAN);
  const [errors, setErrors] = useState<Partial<Record<keyof Plan, string>>>({});
  const [deleteTarget, setDeleteTarget] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const openCreate = () => { setEditing(null); setForm(EMPTY_PLAN); setErrors({}); setDrawerOpen(true); };
  const openEdit = (p: Plan) => { setEditing(p); setForm({ ...p }); setErrors({}); setDrawerOpen(true); };

  const validate = (): boolean => {
    const e: Partial<Record<keyof Plan, string>> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (form.price < 0) e.price = 'Price must be ≥ 0';
    if (form.minQuantity < 1) e.minQuantity = 'Min quantity must be ≥ 1';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    setIsLoading(true);
    setTimeout(() => {
      if (editing) {
        setPlans((prev) => prev.map((p) => (p.id === editing.id ? { ...editing, ...form } : p)));
        showToast('Plan updated successfully', 'success');
      } else {
        setPlans((prev) => [{ id: `plan-${Date.now()}`, ...form }, ...prev]);
        showToast('Plan created successfully', 'success');
      }
      setIsLoading(false);
      setDrawerOpen(false);
    }, 600);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setPlans((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    showToast('Plan deleted', 'success');
    setDeleteTarget(null);
  };

  const toggle = (field: 'autoCloseAtEnd' | 'allowEarlyClose' | 'allowPause' | 'allowRenew') =>
    setForm((f) => ({ ...f, [field]: !f[field] }));

  const columns: Column<Plan>[] = [
    { key: 'name', header: 'Name', render: (p) => <span className="font-medium text-slate-900">{p.name}</span> },
    { key: 'price', header: 'Price', render: (p) => <span className="tabular-nums">${p.price.toFixed(2)}</span> },
    { key: 'billingPeriod', header: 'Billing', render: (p) => <AdminBadge status={PERIOD_STATUS[p.billingPeriod]} label={p.billingPeriod} /> },
    { key: 'minQuantity', header: 'Min Qty', render: (p) => <span>{p.minQuantity}</span> },
    { key: 'availableFrom', header: 'Available', render: (p) => <span className="text-xs text-slate-500">{p.availableFrom || '—'} → {p.availableTo || '—'}</span> },
    {
      key: 'actions', header: '',
      render: (p) => (
        <div className="flex items-center gap-2 justify-end">
          <AdminButton variant="subtle" size="sm" onClick={() => openEdit(p)}>Edit</AdminButton>
          <AdminButton variant="subtle" size="sm" onClick={() => setDeleteTarget(p)} className="text-red-500 hover:text-red-700">Delete</AdminButton>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="Plans" subtitle="Define billing plans and their renewal policies"
      actions={<AdminButton variant="primary" size="sm" onClick={openCreate}>+ New Plan</AdminButton>}
    >
      <AdminTable columns={columns} data={plans} keyExtractor={(p) => p.id} emptyMessage="No plans yet" emptySubtext="Create your first plan to start selling." />

      <AdminDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? 'Edit Plan' : 'New Plan'}
        footer={
          <>
            <AdminButton variant="secondary" onClick={() => setDrawerOpen(false)}>Cancel</AdminButton>
            <AdminButton variant="primary" onClick={handleSave} isLoading={isLoading}>{editing ? 'Save Changes' : 'Create Plan'}</AdminButton>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <AdminInput label="Plan Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} error={errors.name} placeholder="e.g. Starter Monthly" />
          <AdminInput label="Price ($)" type="number" value={String(form.price)} onChange={(e) => setForm((f) => ({ ...f, price: parseFloat(e.target.value) || 0 }))} error={errors.price} />

          <AdminSegmentedControl
            label="Billing Period"
            options={[
              { label: 'Daily', value: 'Daily' },
              { label: 'Weekly', value: 'Weekly' },
              { label: 'Monthly', value: 'Monthly' },
              { label: 'Yearly', value: 'Yearly' },
            ]}
            value={form.billingPeriod}
            onChange={(v) => setForm((f) => ({ ...f, billingPeriod: v as BillingPeriod }))}
          />

          <AdminInput label="Min Quantity" type="number" value={String(form.minQuantity)} onChange={(e) => setForm((f) => ({ ...f, minQuantity: parseInt(e.target.value) || 1 }))} error={errors.minQuantity} />

          <div className="grid grid-cols-2 gap-3">
            <AdminInput label="Available From" type="date" value={form.availableFrom} onChange={(e) => setForm((f) => ({ ...f, availableFrom: e.target.value }))} />
            <AdminInput label="Available To" type="date" value={form.availableTo} onChange={(e) => setForm((f) => ({ ...f, availableTo: e.target.value }))} />
          </div>

          <div className="border-t border-slate-100 pt-4 flex flex-col gap-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Renewal Policies</span>
            <AdminToggle label="Auto-close at end" checked={form.autoCloseAtEnd} onChange={() => toggle('autoCloseAtEnd')} />
            <AdminToggle label="Allow early close" checked={form.allowEarlyClose} onChange={() => toggle('allowEarlyClose')} />
            <AdminToggle label="Allow pause" checked={form.allowPause} onChange={() => toggle('allowPause')} />
            <AdminToggle label="Allow renew" checked={form.allowRenew} onChange={() => toggle('allowRenew')} />
          </div>
        </div>
      </AdminDrawer>

      <AdminModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Plan" description={`Are you sure you want to delete "${deleteTarget?.name}"? Active subscriptions using this plan may be affected.`} onConfirm={handleDelete} isDestructive />
    </AdminLayout>
  );
};
