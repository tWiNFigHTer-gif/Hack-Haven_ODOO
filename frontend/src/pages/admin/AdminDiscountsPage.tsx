import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AdminLayout,
  AdminModal,
} from '../../components/admin';
import { useToast } from '../../components/common/Toast';

type DiscountType = 'Percentage' | 'Fixed';
type AppliesTo = 'Whole Subscriptions' | 'Specific Products' | 'Dedicated Subscription Plans Only';
type DiscountStatus = 'Active' | 'Scheduled' | 'Closed';

interface Discount {
  id: string;
  code: string;
  name: string;
  type: DiscountType;
  value: number;
  appliesTo: AppliesTo;
  appliesToDetail?: string;
  startDate?: string;
  endDate?: string;
  neverExpires?: boolean;
  usedCount: number;
  usageLimit?: number; // undefined = unlimited
  status: DiscountStatus;
  minPurchase?: number;
}

const INITIAL_DISCOUNTS: Discount[] = [
  {
    id: 'disc-001',
    code: 'SUMMER2024',
    name: 'Summer SaaS Accelerator',
    type: 'Percentage',
    value: 20,
    appliesTo: 'Whole Subscriptions',
    startDate: '2024-06-01',
    endDate: '2024-08-31',
    usedCount: 142,
    usageLimit: 500,
    status: 'Active',
    minPurchase: 500,
  },
  {
    id: 'disc-002',
    code: 'SCALEUP100',
    name: 'Enterprise Tier Voucher',
    type: 'Fixed',
    value: 100,
    appliesTo: 'Specific Products',
    appliesToDetail: 'Dedicated Compliance Vault',
    neverExpires: true,
    usedCount: 28,
    usageLimit: 50,
    status: 'Active',
    minPurchase: 1000,
  },
  {
    id: 'disc-003',
    code: 'STARTUP50',
    name: 'Y-Combinator Cohort Special',
    type: 'Percentage',
    value: 50,
    appliesTo: 'Specific Products',
    appliesToDetail: 'Cloud Ledger base module',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    usedCount: 84,
    usageLimit: 100,
    status: 'Active',
    minPurchase: 200,
  },
  {
    id: 'disc-004',
    code: 'LOYALTY15',
    name: 'Annual Renewal Rebate',
    type: 'Percentage',
    value: 15,
    appliesTo: 'Whole Subscriptions',
    neverExpires: true,
    usedCount: 310,
    status: 'Active',
    minPurchase: 0,
  },
  {
    id: 'disc-005',
    code: 'BFCM-FIXED',
    name: 'Black Friday Flash Deal',
    type: 'Fixed',
    value: 250,
    appliesTo: 'Whole Subscriptions',
    startDate: '2024-11-24',
    endDate: '2024-11-30',
    usedCount: 500,
    usageLimit: 500,
    status: 'Closed',
    minPurchase: 1200,
  },
];

interface DrawerFormState {
  code: string;
  name: string;
  type: DiscountType;
  value: number;
  appliesTo: AppliesTo;
  minPurchase: number;
  startDate: string;
  endDate: string;
  neverExpires: boolean;
  usageLimit: string;
}

const DEFAULT_FORM: DrawerFormState = {
  code: '',
  name: '',
  type: 'Percentage',
  value: 20,
  appliesTo: 'Whole Subscriptions',
  minPurchase: 0,
  startDate: '2025-01-01',
  endDate: '2025-12-31',
  neverExpires: false,
  usageLimit: '500',
};

export const AdminDiscountsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const [discounts, setDiscounts] = useState<Discount[]>(INITIAL_DISCOUNTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Percentage' | 'Fixed'>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'scheduled' | 'closed'>('all');

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [form, setForm] = useState<DrawerFormState>(DEFAULT_FORM);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Discount | null>(null);

  // Deep-link query parameters support
  useEffect(() => {
    const drawerParam = searchParams.get('drawer');
    const modalParam = searchParams.get('modal');

    if (drawerParam === 'edit') {
      const target = discounts[0];
      if (target) {
        setEditingDiscount(target);
        setForm({
          code: target.code,
          name: target.name,
          type: target.type,
          value: target.value,
          appliesTo: target.appliesTo,
          minPurchase: target.minPurchase || 0,
          startDate: target.startDate || '2024-06-01',
          endDate: target.endDate || '2024-08-31',
          neverExpires: !!target.neverExpires,
          usageLimit: target.usageLimit !== undefined ? String(target.usageLimit) : '',
        });
        setDrawerOpen(true);
      }
    } else if (drawerParam === 'create') {
      setEditingDiscount(null);
      setForm({
        ...DEFAULT_FORM,
        code: 'PROMO2025',
      });
      setDrawerOpen(true);
    }

    if (modalParam === 'archive') {
      setDeleteTarget(discounts[0] || null);
    }
  }, [searchParams, discounts]);

  // Filtered rows
  const filteredDiscounts = useMemo(() => {
    return discounts.filter((d) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCode = d.code.toLowerCase().includes(q);
        const matchesName = d.name.toLowerCase().includes(q);
        if (!matchesCode && !matchesName) return false;
      }
      if (typeFilter !== 'All' && d.type !== typeFilter) {
        return false;
      }
      if (statusFilter !== 'all') {
        if (statusFilter === 'active' && d.status !== 'Active') return false;
        if (statusFilter === 'scheduled' && d.status !== 'Scheduled') return false;
        if (statusFilter === 'closed' && d.status !== 'Closed') return false;
      }
      return true;
    });
  }, [discounts, searchQuery, typeFilter, statusFilter]);

  // Handlers
  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    showToast(`Coupon code ${code} copied to clipboard!`, 'info');
  };

  const handleOpenCreate = () => {
    setEditingDiscount(null);
    setForm({
      ...DEFAULT_FORM,
      code: `PROMO${Math.floor(1000 + Math.random() * 9000)}`,
    });
    setErrors({});
    setDrawerOpen(true);
  };

  const handleOpenEdit = (d: Discount) => {
    setEditingDiscount(d);
    setForm({
      code: d.code,
      name: d.name,
      type: d.type,
      value: d.value,
      appliesTo: d.appliesTo,
      minPurchase: d.minPurchase || 0,
      startDate: d.startDate || '2025-01-01',
      endDate: d.endDate || '2025-12-31',
      neverExpires: !!d.neverExpires,
      usageLimit: d.usageLimit !== undefined ? String(d.usageLimit) : '',
    });
    setErrors({});
    setDrawerOpen(true);
  };

  const handleGenerateCode = () => {
    const prefixes = ['PROMO', 'DEAL', 'SPRING', 'LAUNCH', 'VIP', 'GROWTH'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const code = `${prefix}${Math.floor(1000 + Math.random() * 9000)}`;
    setForm((f) => ({ ...f, code }));
  };

  const handleSave = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.code.trim()) newErrors.code = 'Discount code is required';
    if (!form.name.trim()) newErrors.name = 'Campaign description is required';
    if (form.value <= 0) newErrors.value = 'Value must be greater than 0';
    if (form.type === 'Percentage' && form.value > 100) {
      newErrors.value = 'Percentage reduction cannot exceed 100%';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      const usageLimit = form.usageLimit.trim() ? parseInt(form.usageLimit, 10) : undefined;
      if (editingDiscount) {
        setDiscounts((prev) =>
          prev.map((d) =>
            d.id === editingDiscount.id
              ? {
                  ...d,
                  code: form.code.toUpperCase(),
                  name: form.name,
                  type: form.type,
                  value: form.value,
                  appliesTo: form.appliesTo,
                  minPurchase: form.minPurchase,
                  startDate: form.neverExpires ? undefined : form.startDate,
                  endDate: form.neverExpires ? undefined : form.endDate,
                  neverExpires: form.neverExpires,
                  usageLimit: usageLimit,
                }
              : d
          )
        );
        showToast(`Discount ${form.code} updated successfully`, 'success');
      } else {
        const newDisc: Discount = {
          id: `disc-${Date.now()}`,
          code: form.code.toUpperCase(),
          name: form.name,
          type: form.type,
          value: form.value,
          appliesTo: form.appliesTo,
          minPurchase: form.minPurchase,
          startDate: form.neverExpires ? undefined : form.startDate,
          endDate: form.neverExpires ? undefined : form.endDate,
          neverExpires: form.neverExpires,
          usedCount: 0,
          usageLimit: usageLimit,
          status: 'Active',
        };
        setDiscounts((prev) => [newDisc, ...prev]);
        showToast(`Discount ${newDisc.code} created successfully`, 'success');
      }
      setIsSaving(false);
      setDrawerOpen(false);
    }, 450);
  };

  const handleConfirmArchive = () => {
    if (!deleteTarget) return;
    setDiscounts((prev) => prev.filter((d) => d.id !== deleteTarget.id));
    showToast(`Discount ${deleteTarget.code} archived`, 'success');
    setDeleteTarget(null);
    if (drawerOpen && editingDiscount?.id === deleteTarget.id) {
      setDrawerOpen(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Code', 'Campaign', 'Type', 'Value', 'Applies To', 'Used Count', 'Usage Limit', 'Status'];
    const rows = discounts.map((d) => [
      d.code,
      `"${d.name}"`,
      d.type,
      d.type === 'Percentage' ? `${d.value}%` : `$${d.value}`,
      `"${d.appliesTo}"`,
      d.usedCount,
      d.usageLimit ?? 'Unlimited',
      d.status,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'discounts_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Discounts exported to CSV', 'success');
  };

  return (
    <AdminLayout
      title="Discounts"
      subtitle="Manage promotional coupon codes, percentage reductions, and fixed volume discounts across subscriptions and catalog products."
      actions={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center justify-center gap-1.5 h-[38px] px-4 rounded-[10px] bg-white text-slate-700 font-medium text-sm border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px] text-slate-500">download</span>
            Export CSV
          </button>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center gap-1.5 h-[38px] px-4 rounded-[10px] bg-indigo-600 text-white font-semibold text-sm shadow-sm hover:bg-indigo-700 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Create Discount
          </button>
        </div>
      }
    >
      {/* ── Metric Summary Grid (3 Cards matching Stitch) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1: Active Discounts */}
        <div className="p-5 rounded-[14px] bg-white border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Active Discounts
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <span className="material-symbols-outlined text-[18px]">sell</span>
            </div>
          </div>
          <div className="my-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 tracking-tight tabular-nums">
              {discounts.filter((d) => d.status === 'Active').length}
            </span>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="material-symbols-outlined text-[12px]">trending_up</span>
              +3 this quarter
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>8 auto-renew eligible</span>
            <span className="font-medium text-indigo-600">2 expiring soon</span>
          </div>
        </div>

        {/* Metric 2: Total Redeemed Value */}
        <div className="p-5 rounded-[14px] bg-white border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Total Redeemed Value
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600">
              <span className="material-symbols-outlined text-[18px]">payments</span>
            </div>
          </div>
          <div className="my-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 tracking-tight tabular-nums">
              $38,420.00
            </span>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              +18.4%
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Across 826 invoices</span>
            <span className="tabular-nums">Avg. $46.51 / order</span>
          </div>
        </div>

        {/* Metric 3: Redemption Velocity (Inline Sparkline Chart) */}
        <div className="p-5 rounded-[14px] bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Redemption Velocity
            </span>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
              Last 30 Days
            </span>
          </div>
          <div className="flex items-end justify-between gap-4 mt-2">
            <div>
              <div className="text-2xl font-bold text-slate-900 tabular-nums">412</div>
              <div className="text-xs text-slate-500">Claims processed</div>
            </div>
            {/* Inline Sparkline Chart */}
            <div className="w-36 h-10 shrink-0">
              <svg className="w-full h-full text-indigo-600" fill="none" preserveAspectRatio="none" viewBox="0 0 140 40">
                <defs>
                  <linearGradient id="metricGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0,32 Q15,35 30,24 T60,20 T90,8 T115,16 T140,4 L140,40 L0,40 Z" fill="url(#metricGradient)" />
                <path d="M0,32 Q15,35 30,24 T60,20 T90,8 T115,16 T140,4" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" />
              </svg>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
            <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: '74%' }} />
          </div>
        </div>
      </div>

      {/* ── Table & Filters Container ── */}
      <div className="flex flex-col bg-white rounded-[14px] border border-slate-200 shadow-sm overflow-hidden">
        {/* Filter & Search Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[280px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400 pointer-events-none">
              search
            </span>
            <input
              className="w-full h-[38px] pl-9 pr-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              placeholder="Search by code or campaign name..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter Controls Group */}
          <div className="flex items-center flex-wrap gap-2 shrink-0">
            {/* Filter: Type Pills */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              {(['All', 'Percentage', 'Fixed'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setTypeFilter(type)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    typeFilter === type
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {type === 'All' ? 'All Types' : type}
                </button>
              ))}
            </div>

            {/* Status Dropdown Filter */}
            <div className="relative">
              <select
                className="appearance-none h-[38px] pl-3 pr-8 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="all">Status: All</option>
                <option value="active">Status: Active</option>
                <option value="scheduled">Status: Scheduled</option>
                <option value="closed">Status: Closed</option>
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[18px] text-slate-400 pointer-events-none">
                expand_more
              </span>
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={() => {
                setDiscounts([...INITIAL_DISCOUNTS]);
                setSearchQuery('');
                setTypeFilter('All');
                setStatusFilter('all');
                showToast('Discounts refreshed', 'info');
              }}
              className="w-[38px] h-[38px] rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
              title="Refresh list"
            >
              <span className="material-symbols-outlined text-[18px]">sync</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="h-10 bg-slate-50/80 border-b border-slate-200 text-slate-500 text-[11px] font-semibold uppercase tracking-wider select-none">
                <th className="pl-4 pr-3 py-3" scope="col">Code & Campaign</th>
                <th className="px-4 py-3" scope="col">Type</th>
                <th className="px-4 py-3" scope="col">Applies To</th>
                <th className="px-4 py-3" scope="col">Duration / Validity</th>
                <th className="px-4 py-3" scope="col">Redemption / Limit</th>
                <th className="px-4 py-3" scope="col">Status</th>
                <th className="pr-4 pl-3 py-3 text-right" scope="col">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDiscounts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 px-4 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                        <span className="material-symbols-outlined text-[24px]">sell</span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-900">No discounts found</h4>
                      <p className="text-xs text-slate-500 mt-1">Try clearing your filters or create a new discount.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDiscounts.map((d) => {
                  const percent = d.usageLimit ? Math.min(100, Math.round((d.usedCount / d.usageLimit) * 100)) : 100;
                  const isMaxed = d.usageLimit ? d.usedCount >= d.usageLimit : false;

                  return (
                    <tr key={d.id} className="h-14 hover:bg-slate-50/70 transition-colors group">
                      {/* Code & Campaign */}
                      <td className="pl-4 pr-3 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                            d.type === 'Percentage' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-700'
                          }`}>
                            <span className="material-symbols-outlined text-[16px]">
                              {d.type === 'Percentage' ? 'percent' : 'attach_money'}
                            </span>
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-semibold text-slate-900 tracking-tight text-xs">
                                {d.code}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyCode(d.code)}
                                className="text-slate-400 opacity-0 group-hover:opacity-100 hover:text-indigo-600 transition-opacity"
                                title="Copy code"
                              >
                                <span className="material-symbols-outlined text-[14px]">content_copy</span>
                              </button>
                            </div>
                            <span className="text-xs text-slate-500 truncate">{d.name}</span>
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${
                          d.type === 'Percentage'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {d.type === 'Percentage' ? `Percentage (${d.value}%)` : `Fixed ($${d.value.toFixed(2)})`}
                        </span>
                      </td>

                      {/* Applies To */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-slate-800 truncate max-w-[180px]">
                            {d.appliesTo}
                          </span>
                          {d.appliesToDetail && (
                            <span
                              className="material-symbols-outlined text-[16px] text-slate-400 hover:text-slate-600 cursor-help"
                              title={d.appliesToDetail}
                            >
                              info
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Duration / Validity */}
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {d.neverExpires ? (
                          <span className="inline-flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">all_inclusive</span>
                            No expiration
                          </span>
                        ) : d.startDate && d.endDate ? (
                          <span>{d.startDate} - {d.endDate}</span>
                        ) : (
                          'Continuous'
                        )}
                      </td>

                      {/* Redemption / Limit */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1 w-32">
                          <div className="flex justify-between text-xs tabular-nums">
                            <span className="font-medium text-slate-800">{d.usedCount} used</span>
                            <span className="text-slate-400">
                              / {d.usageLimit !== undefined ? d.usageLimit : '∞'}
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${isMaxed ? 'bg-rose-500' : 'bg-indigo-600'}`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ${
                          d.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${d.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          {d.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="pr-4 pl-3 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(d)}
                            className="px-2.5 py-1 rounded-md text-xs font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(d)}
                            className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                            title="Archive discount"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="h-[52px] px-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500 tabular-nums">
            Showing <span className="font-semibold text-slate-800">1</span> to{' '}
            <span className="font-semibold text-slate-800">{filteredDiscounts.length}</span> of{' '}
            <span className="font-semibold text-slate-800">{discounts.length}</span> discounts
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled
              className="h-8 px-2.5 rounded-md text-xs font-medium bg-white border border-slate-200 text-slate-400 cursor-not-allowed flex items-center gap-1 shadow-2xs"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              Previous
            </button>
            <button type="button" className="w-8 h-8 rounded-md text-xs font-semibold bg-indigo-600 text-white flex items-center justify-center">
              1
            </button>
            <button
              type="button"
              disabled
              className="h-8 px-2.5 rounded-md text-xs font-medium bg-white border border-slate-200 text-slate-400 cursor-not-allowed flex items-center gap-1 shadow-2xs"
            >
              Next
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Supplementary Micro-Audit Info Box */}
      <div className="rounded-[10px] p-4 bg-slate-100 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-indigo-600 text-[20px]">verified</span>
          <span className="text-xs text-slate-700">
            Discounts are strictly audited against customer billing profiles and cannot exceed gross line-item contract values.
          </span>
        </div>
        <a
          href="#docs"
          onClick={(e) => {
            e.preventDefault();
            showToast('Opening Stacking Logic documentation…', 'info');
          }}
          className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1 shrink-0"
        >
          Review Stacking Logic Docs
          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
        </a>
      </div>

      {/* ── Slide-Over Drawer for Edit / Create Discount ── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
          {/* Backdrop Mask */}
          <div
            className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-[2px] transition-opacity duration-300"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer Shell */}
          <div className="fixed top-0 right-0 z-50 h-full w-full max-w-[500px] bg-white shadow-[-4px_0_24px_rgba(15,23,42,0.14)] flex flex-col justify-between transition-transform duration-300 ease-out">
            {/* Drawer Header */}
            <div className="h-16 px-6 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50/50">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                  <span className="material-symbols-outlined text-[18px]">edit_note</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-slate-900 tracking-tight truncate">
                      {editingDiscount ? `Edit: ${editingDiscount.code}` : 'Create New Discount'}
                    </h2>
                    {editingDiscount && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Active Promotion
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400">
                    {editingDiscount ? 'Modified 4 days ago by Admin User' : 'Drafting promotion'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close drawer"
                onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Drawer Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
              {/* Coupon Code */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide flex items-center justify-between" htmlFor="coupon-code">
                  <span>Discount Code</span>
                  <span className="text-[10px] text-slate-400 uppercase">Customer Facing</span>
                </label>
                <div className="relative">
                  <input
                    id="coupon-code"
                    type="text"
                    className="w-full h-[38px] px-3 font-mono font-bold uppercase rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 tracking-wider text-sm"
                    value={form.code}
                    onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                  />
                  <button
                    type="button"
                    onClick={handleGenerateCode}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600"
                    title="Generate Code"
                  >
                    <span className="material-symbols-outlined text-[18px]">autorenew</span>
                  </button>
                </div>
                {errors.code && <p className="text-xs text-rose-600 font-medium">{errors.code}</p>}
              </div>

              {/* Campaign Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide" htmlFor="campaign-name">
                  Campaign Description / Internal Name
                </label>
                <input
                  id="campaign-name"
                  type="text"
                  placeholder="e.g. Q3 Growth Initiative"
                  className="w-full h-[38px] px-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
                {errors.name && <p className="text-xs text-rose-600 font-medium">{errors.name}</p>}
              </div>

              {/* Reduction Mechanism (Segmented Toggle) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                  Reduction Mechanism
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, type: 'Percentage' }))}
                    className={`h-9 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      form.type === 'Percentage'
                        ? 'bg-white text-indigo-600 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">percent</span>
                    Percentage Off
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, type: 'Fixed' }))}
                    className={`h-9 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      form.type === 'Fixed'
                        ? 'bg-white text-indigo-600 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">attach_money</span>
                    Fixed Deduction
                  </button>
                </div>
              </div>

              {/* Discount Value Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide" htmlFor="discount-value">
                  Value Reducer
                </label>
                <div className="relative flex items-center">
                  <input
                    id="discount-value"
                    type="number"
                    min="1"
                    max={form.type === 'Percentage' ? 100 : undefined}
                    step="1"
                    className="w-full h-[38px] pl-3 pr-10 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-semibold text-sm tabular-nums focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500"
                    value={form.value}
                    onChange={(e) => setForm((f) => ({ ...f, value: parseFloat(e.target.value) || 0 }))}
                  />
                  <div className="absolute right-0 top-0 bottom-0 px-3 bg-slate-100 border-l border-slate-200 rounded-r-lg flex items-center justify-center text-xs font-bold text-slate-600 select-none">
                    {form.type === 'Percentage' ? '%' : '$'}
                  </div>
                </div>
                {errors.value && <p className="text-xs text-rose-600 font-medium">{errors.value}</p>}
                <p className="text-xs text-slate-400">
                  {form.type === 'Percentage'
                    ? 'Applies percentage reduction against all eligible recurring cycle items.'
                    : 'Deducts fixed dollar amount once per invoice generation.'}
                </p>
              </div>

              {/* Applies To Scope */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide" htmlFor="applies-to">
                  Applies To Scope
                </label>
                <div className="relative">
                  <select
                    id="applies-to"
                    className="w-full appearance-none h-[38px] pl-3 pr-9 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    value={form.appliesTo}
                    onChange={(e) => setForm((f) => ({ ...f, appliesTo: e.target.value as AppliesTo }))}
                  >
                    <option value="Whole Subscriptions">Whole Subscriptions (All Contract Lines)</option>
                    <option value="Specific Products">Specific Catalog Products & Add-ons</option>
                    <option value="Dedicated Subscription Plans Only">Dedicated Subscription Plans Only</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[18px] text-slate-400 pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Minimum Purchase Requirement */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide" htmlFor="min-purchase">
                  Minimum Threshold Order
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-500 font-medium text-sm select-none">$</span>
                  <input
                    id="min-purchase"
                    type="number"
                    className="w-full h-[38px] pl-7 pr-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-sm tabular-nums focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500"
                    value={form.minPurchase}
                    onChange={(e) => setForm((f) => ({ ...f, minPurchase: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <span className="text-xs text-slate-400">
                  Orders below this gross threshold cannot apply the promotional voucher.
                </span>
              </div>

              {/* Validity Window */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                    Validity Window
                  </span>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      id="never-expires-check"
                      type="checkbox"
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-0 cursor-pointer"
                      checked={form.neverExpires}
                      onChange={(e) => setForm((f) => ({ ...f, neverExpires: e.target.checked }))}
                    />
                    <span className="text-xs text-slate-600">Never expires</span>
                  </label>
                </div>
                {!form.neverExpires && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] text-slate-500">Start Date</span>
                      <input
                        type="date"
                        className="w-full h-[38px] px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500"
                        value={form.startDate}
                        onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] text-slate-500">End Date</span>
                      <input
                        type="date"
                        className="w-full h-[38px] px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500"
                        value={form.endDate}
                        onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Usage Redemptions Limit */}
              <div className="flex flex-col gap-1.5 pb-2">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide" htmlFor="max-redemptions">
                  Global Usage Cap
                </label>
                <input
                  id="max-redemptions"
                  type="number"
                  placeholder="Leave empty for unlimited"
                  className="w-full h-[38px] px-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-sm tabular-nums focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  value={form.usageLimit}
                  onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value }))}
                />
                <p className="text-xs text-slate-400">
                  Total times this coupon can be claimed system-wide before automatic deactivation.
                </p>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="h-16 px-6 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between shrink-0">
              {editingDiscount ? (
                <button
                  type="button"
                  id="delete-campaign-btn"
                  onClick={() => setDeleteTarget(editingDiscount)}
                  className="inline-flex items-center gap-1 h-[38px] px-3 rounded-lg text-rose-600 hover:bg-rose-50 font-medium text-sm transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                  Archive
                </button>
              ) : (
                <div />
              )}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="cancel-drawer-btn"
                  onClick={() => setDrawerOpen(false)}
                  className="h-[38px] px-4 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors shadow-2xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  id="save-drawer-btn"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex items-center justify-center gap-1.5 h-[38px] px-5 rounded-lg bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-all shadow-sm disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">check</span>
                      Save Discount
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete / Archive Confirmation Modal */}
      <AdminModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Archive Discount Campaign"
        description={`Are you sure you want to archive "${deleteTarget?.code}" (${deleteTarget?.name})? Customers will no longer be able to redeem this voucher code.`}
        confirmLabel="Archive Campaign"
        onConfirm={handleConfirmArchive}
        isDestructive
      />
    </AdminLayout>
  );
};
