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

interface Variant {
  id: string;
  attribute: string;
  value: string;
  extraPrice: number;
}

interface Product {
  id: string;
  name: string;
  type: 'Service' | 'Physical' | 'Digital';
  salesPrice: number;
  costPrice: number;
  notes: string;
  variants: Variant[];
}

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-001', name: 'Brightloop Starter', type: 'Service', salesPrice: 49.0, costPrice: 12.0,
    notes: 'Entry-level subscription product.',
    variants: [
      { id: 'v1', attribute: 'Brand', value: 'Odoo', extraPrice: 0 },
      { id: 'v2', attribute: 'Tier', value: 'Basic', extraPrice: 0 },
    ],
  },
  {
    id: 'prod-002', name: 'Brightloop Pro', type: 'Service', salesPrice: 149.0, costPrice: 45.0,
    notes: 'Professional tier with advanced features.',
    variants: [
      { id: 'v3', attribute: 'Brand', value: 'Odoo', extraPrice: 560 },
      { id: 'v4', attribute: 'Tier', value: 'Pro', extraPrice: 100 },
      { id: 'v5', attribute: 'Add-on', value: 'Analytics', extraPrice: 20 },
    ],
  },
  {
    id: 'prod-003', name: 'Brightloop Enterprise', type: 'Service', salesPrice: 499.0, costPrice: 180.0,
    notes: 'Enterprise contract, billed annually.',
    variants: [{ id: 'v6', attribute: 'Tier', value: 'Enterprise', extraPrice: 0 }],
  },
  {
    id: 'prod-004', name: 'API Access Add-on', type: 'Digital', salesPrice: 29.0, costPrice: 5.0,
    notes: 'Standalone API key add-on.', variants: [],
  },
  {
    id: 'prod-005', name: 'Dedicated Support', type: 'Service', salesPrice: 99.0, costPrice: 30.0,
    notes: 'Priority support SLA.', variants: [],
  },
];

const TYPE_STATUS: Record<string, string> = { Service: 'confirmed', Physical: 'active', Digital: 'quotation' };

const EMPTY_PRODUCT: Omit<Product, 'id'> = {
  name: '', type: 'Service', salesPrice: 0, costPrice: 0, notes: '', variants: [],
};

export const AdminProductsPage: React.FC = () => {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<Omit<Product, 'id'>>(EMPTY_PRODUCT);
  const [errors, setErrors] = useState<Partial<Record<keyof Product, string>>>({});
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const openCreate = () => { setEditing(null); setForm(EMPTY_PRODUCT); setErrors({}); setDrawerOpen(true); };
  const openEdit = (p: Product) => { setEditing(p); setForm({ ...p, variants: [...p.variants] }); setErrors({}); setDrawerOpen(true); };

  const validate = (): boolean => {
    const e: Partial<Record<keyof Product, string>> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (form.salesPrice < 0) e.salesPrice = 'Sales price must be ≥ 0';
    if (form.costPrice < 0) e.costPrice = 'Cost price must be ≥ 0';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    setIsLoading(true);
    setTimeout(() => {
      if (editing) {
        setProducts((prev) => prev.map((p) => (p.id === editing.id ? { ...editing, ...form } : p)));
        showToast('Product updated successfully', 'success');
      } else {
        setProducts((prev) => [{ id: `prod-${Date.now()}`, ...form }, ...prev]);
        showToast('Product created successfully', 'success');
      }
      setIsLoading(false);
      setDrawerOpen(false);
    }, 600);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    showToast('Product deleted', 'success');
    setDeleteTarget(null);
  };

  const addVariant = () => setForm((f) => ({
    ...f, variants: [...f.variants, { id: `v-${Date.now()}`, attribute: 'Brand', value: '', extraPrice: 0 }],
  }));
  const removeVariant = (id: string) => setForm((f) => ({ ...f, variants: f.variants.filter((v) => v.id !== id) }));
  const updateVariant = (id: string, field: keyof Variant, value: string | number) =>
    setForm((f) => ({ ...f, variants: f.variants.map((v) => (v.id === id ? { ...v, [field]: value } : v)) }));

  const columns: Column<Product>[] = [
    { key: 'name', header: 'Name', render: (p) => <span className="font-medium text-slate-900">{p.name}</span> },
    { key: 'type', header: 'Type', render: (p) => <AdminBadge status={TYPE_STATUS[p.type] || 'draft'} label={p.type} /> },
    { key: 'salesPrice', header: 'Sales Price', render: (p) => <span className="tabular-nums">${p.salesPrice.toFixed(2)}</span> },
    { key: 'costPrice', header: 'Cost Price', render: (p) => <span className="tabular-nums text-slate-500">${p.costPrice.toFixed(2)}</span> },
    { key: 'variants', header: 'Variants', render: (p) => <span className="text-slate-600">{p.variants.length}</span> },
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
    <AdminLayout
      title="Products"
      subtitle="Manage your product catalogue and variants"
      actions={<AdminButton variant="primary" size="sm" onClick={openCreate}>+ New Product</AdminButton>}
    >
      <AdminTable columns={columns} data={products} keyExtractor={(p) => p.id} emptyMessage="No products yet" emptySubtext="Create your first product to get started." />

      <AdminDrawer
        isOpen={drawerOpen} onClose={() => setDrawerOpen(false)}
        title={editing ? 'Edit Product' : 'New Product'}
        footer={
          <>
            <AdminButton variant="secondary" onClick={() => setDrawerOpen(false)}>Cancel</AdminButton>
            <AdminButton variant="primary" onClick={handleSave} isLoading={isLoading}>
              {editing ? 'Save Changes' : 'Create Product'}
            </AdminButton>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <AdminInput label="Product Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} error={errors.name} placeholder="e.g. Brightloop Pro" />
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Type</label>
            <select className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as Product['type'] }))}>
              <option value="Service">Service</option>
              <option value="Physical">Physical</option>
              <option value="Digital">Digital</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <AdminInput label="Sales Price ($)" type="number" value={String(form.salesPrice)} onChange={(e) => setForm((f) => ({ ...f, salesPrice: parseFloat(e.target.value) || 0 }))} error={errors.salesPrice} />
            <AdminInput label="Cost Price ($)" type="number" value={String(form.costPrice)} onChange={(e) => setForm((f) => ({ ...f, costPrice: parseFloat(e.target.value) || 0 }))} error={errors.costPrice} />
          </div>
          <AdminInput label="Notes" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Optional internal notes" />

          {/* Variants */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Variants</span>
              <AdminButton variant="subtle" size="sm" onClick={addVariant}>+ Add Variant</AdminButton>
            </div>
            {form.variants.length === 0 && <p className="text-xs text-slate-400 italic py-2">No variants. Click "+ Add Variant" to create one.</p>}
            <div className="flex flex-col gap-2">
              {form.variants.map((v) => (
                <div key={v.id} className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2">
                  <input className="flex-1 text-xs bg-transparent border-b border-slate-200 focus:outline-none focus:border-indigo-400 py-0.5" placeholder="Attribute" value={v.attribute} onChange={(e) => updateVariant(v.id, 'attribute', e.target.value)} />
                  <input className="flex-1 text-xs bg-transparent border-b border-slate-200 focus:outline-none focus:border-indigo-400 py-0.5" placeholder="Value" value={v.value} onChange={(e) => updateVariant(v.id, 'value', e.target.value)} />
                  <input className="w-20 text-xs bg-transparent border-b border-slate-200 focus:outline-none focus:border-indigo-400 py-0.5 text-right tabular-nums" type="number" placeholder="+$0" value={v.extraPrice} onChange={(e) => updateVariant(v.id, 'extraPrice', parseFloat(e.target.value) || 0)} />
                  <button className="text-slate-400 hover:text-red-500 ml-1" onClick={() => removeVariant(v.id)} title="Remove">✕</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AdminDrawer>

      <AdminModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Product" description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`} onConfirm={handleDelete} isDestructive />
    </AdminLayout>
  );
};
