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

type StaffRole = 'Admin' | 'Manager' | 'Billing Clerk' | 'Support';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  createdDate: string;
  isActive: boolean;
}

const ROLE_STATUS: Record<StaffRole, string> = { Admin: 'quotation', Manager: 'confirmed', 'Billing Clerk': 'active', Support: 'pending' };

const MOCK: StaffMember[] = [
  { id: 'staff-001', name: 'Divyashree Ramanuja', email: 'divya@brightloop.io', role: 'Admin', createdDate: 'Jan 01, 2025', isActive: true },
  { id: 'staff-002', name: 'Adil Khan', email: 'adil.k@brightloop.io', role: 'Manager', createdDate: 'Jan 05, 2025', isActive: true },
  { id: 'staff-003', name: 'Swathy Nair', email: 'swathy.n@brightloop.io', role: 'Manager', createdDate: 'Jan 10, 2025', isActive: true },
  { id: 'staff-004', name: 'Priya Menon', email: 'priya.m@brightloop.io', role: 'Billing Clerk', createdDate: 'Feb 01, 2025', isActive: true },
  { id: 'staff-005', name: 'Rahul Desai', email: 'rahul.d@brightloop.io', role: 'Support', createdDate: 'Mar 15, 2025', isActive: false },
];

interface StaffForm { name: string; email: string; role: StaffRole; tempPassword: string; }
const EMPTY_FORM: StaffForm = { name: '', email: '', role: 'Billing Clerk', tempPassword: '' };

export const AdminStaffPage: React.FC = () => {
  const { showToast } = useToast();
  const [staff, setStaff] = useState<StaffMember[]>(MOCK);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState<StaffForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof StaffForm, string>>>({});
  const [deleteTarget, setDeleteTarget] = useState<StaffMember | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const openCreate = () => { setForm(EMPTY_FORM); setErrors({}); setDrawerOpen(true); };

  const validate = (): boolean => {
    const e: Partial<Record<keyof StaffForm, string>> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email format';
    else if (staff.some((s) => s.email.toLowerCase() === form.email.toLowerCase())) e.email = 'Email already exists';
    if (!form.tempPassword) e.tempPassword = 'Temporary password is required';
    else if (form.tempPassword.length < 8) e.tempPassword = 'Must be at least 8 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = () => {
    if (!validate()) return;
    setIsLoading(true);
    setTimeout(() => {
      const newMember: StaffMember = {
        id: `staff-${Date.now()}`, name: form.name, email: form.email, role: form.role,
        createdDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        isActive: true,
      };
      setStaff((prev) => [newMember, ...prev]);
      showToast(`${form.name} added to staff`, 'success');
      setIsLoading(false); setDrawerOpen(false);
    }, 600);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setStaff((prev) => prev.filter((s) => s.id !== deleteTarget.id));
    showToast(`${deleteTarget.name} removed`, 'success');
    setDeleteTarget(null);
  };

  const toggleActive = (member: StaffMember) => {
    setStaff((prev) => prev.map((s) => (s.id === member.id ? { ...s, isActive: !s.isActive } : s)));
    showToast(`${member.name} ${member.isActive ? 'deactivated' : 'activated'}`, 'success');
  };

  const columns: Column<StaffMember>[] = [
    {
      key: 'name', header: 'Name',
      render: (s) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
            {s.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <span className="font-medium text-slate-900 block text-sm">{s.name}</span>
            <span className="text-xs text-slate-400">{s.email}</span>
          </div>
        </div>
      ),
    },
    { key: 'role', header: 'Role', render: (s) => <AdminBadge status={ROLE_STATUS[s.role]} label={s.role} /> },
    { key: 'createdDate', header: 'Added', render: (s) => <span className="text-xs text-slate-500">{s.createdDate}</span> },
    { key: 'isActive', header: 'Status', render: (s) => <AdminBadge status={s.isActive ? 'active' : 'closed'} label={s.isActive ? 'Active' : 'Inactive'} /> },
    {
      key: 'actions', header: '',
      render: (s) => (
        <div className="flex items-center gap-2 justify-end">
          <AdminButton variant="subtle" size="sm" onClick={() => toggleActive(s)}>{s.isActive ? 'Deactivate' : 'Activate'}</AdminButton>
          <AdminButton variant="subtle" size="sm" onClick={() => setDeleteTarget(s)} className="text-red-500 hover:text-red-700">Remove</AdminButton>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="Staff" subtitle="Manage admin portal users and their access"
      actions={<AdminButton variant="primary" size="sm" onClick={openCreate}>+ Add Staff Member</AdminButton>}
    >
      <AdminTable columns={columns} data={staff} keyExtractor={(s) => s.id} emptyMessage="No staff members" emptySubtext="Add your first team member to get started." />

      <AdminDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title="Add Staff Member"
        footer={<><AdminButton variant="secondary" onClick={() => setDrawerOpen(false)}>Cancel</AdminButton><AdminButton variant="primary" onClick={handleCreate} isLoading={isLoading}>Add Member</AdminButton></>}
      >
        <div className="flex flex-col gap-4">
          <AdminInput label="Full Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} error={errors.name} placeholder="e.g. Jane Doe" />
          <AdminInput label="Email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} error={errors.email} placeholder="jane.doe@brightloop.io" />
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Role</label>
            <select className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as StaffRole }))}>
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Billing Clerk">Billing Clerk</option>
              <option value="Support">Support</option>
            </select>
          </div>
          <AdminInput label="Temporary Password" type="password" value={form.tempPassword} onChange={(e) => setForm((f) => ({ ...f, tempPassword: e.target.value }))} error={errors.tempPassword} placeholder="At least 8 characters" />
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs text-amber-700"><strong>Note:</strong> The staff member will be asked to change this password on first login.</p>
          </div>
        </div>
      </AdminDrawer>

      <AdminModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Remove Staff Member" description={`Remove ${deleteTarget?.name} from the admin portal? They will lose all access immediately.`} onConfirm={handleDelete} isDestructive />
    </AdminLayout>
  );
};
