import React, { useState } from 'react';
import { StaffLayout } from '../../components/staff/StaffLayout';
import { useToast } from '../../components/common/Toast';

export type StaffSubStatus = 'Draft' | 'Quotation' | 'Confirmed' | 'Active' | 'Paused' | 'Closed';

export interface SubscriptionItem {
  id: string;
  name: string;
  tier: string;
  quantity: number;
  unitPrice: number;
  tax: number;
  total: number;
}

export interface StaffSubscription {
  id: string;
  number: string;
  customerName: string;
  customerCode: string;
  planName: string;
  planBillingCadence: 'Monthly' | 'Annual';
  status: StaffSubStatus;
  startDate: string;
  nextRenewalDate: string;
  contractValue: number;
  accountManager: string;
  paymentTerms: string;
  timeline: {
    step: 'Draft' | 'Quotation' | 'Confirmed' | 'Active' | 'Closed';
    date: string;
    completed: boolean;
    current?: boolean;
  }[];
  items: SubscriptionItem[];
}

const INITIAL_SUBSCRIPTIONS: StaffSubscription[] = [
  {
    id: 'sub-001',
    number: 'SUB-2024-8841',
    customerName: 'Acme Studio Group',
    customerCode: 'CUST-ACM-09',
    planName: 'Enterprise Growth Tier',
    planBillingCadence: 'Annual',
    status: 'Active',
    startDate: 'Jan 15, 2024',
    nextRenewalDate: 'Jan 14, 2025',
    contractValue: 42500,
    accountManager: 'Alex Chen (Staff)',
    paymentTerms: 'Net 30',
    timeline: [
      { step: 'Draft', date: 'Jan 02, 2024', completed: true },
      { step: 'Quotation', date: 'Jan 06, 2024', completed: true },
      { step: 'Confirmed', date: 'Jan 10, 2024', completed: true },
      { step: 'Active', date: 'Jan 15, 2024', completed: true, current: true },
      { step: 'Closed', date: 'Pending', completed: false },
    ],
    items: [
      { id: 'item-1', name: 'Enterprise Cloud Core Suite', tier: 'Scale Tier', quantity: 1, unitPrice: 24000, tax: 2400, total: 26400 },
      { id: 'item-2', name: 'Dedicated Infrastructure Pod', tier: 'High-Availability', quantity: 2, unitPrice: 6000, tax: 1200, total: 13200 },
      { id: 'item-3', name: 'Priority Engineering SLA Support', tier: 'Level 3 Premium', quantity: 1, unitPrice: 2900, tax: 0, total: 2900 },
    ],
  },
  {
    id: 'sub-002',
    number: 'SUB-2024-7719',
    customerName: 'Meridian Health Ltd',
    customerCode: 'CUST-MRD-14',
    planName: 'Standard Compliance Suite',
    planBillingCadence: 'Monthly',
    status: 'Active',
    startDate: 'Mar 01, 2024',
    nextRenewalDate: 'Apr 01, 2025',
    contractValue: 14200,
    accountManager: 'Sarah Jenkins',
    paymentTerms: 'Net 15',
    timeline: [
      { step: 'Draft', date: 'Feb 15, 2024', completed: true },
      { step: 'Quotation', date: 'Feb 20, 2024', completed: true },
      { step: 'Confirmed', date: 'Feb 26, 2024', completed: true },
      { step: 'Active', date: 'Mar 01, 2024', completed: true, current: true },
      { step: 'Closed', date: 'Pending', completed: false },
    ],
    items: [
      { id: 'item-4', name: 'Standard Compliance Engine', tier: 'Health Standard', quantity: 1, unitPrice: 12000, tax: 1200, total: 13200 },
      { id: 'item-5', name: 'Audit Log Storage 1TB', tier: 'Add-on', quantity: 1, unitPrice: 1000, tax: 0, total: 1000 },
    ],
  },
  {
    id: 'sub-003',
    number: 'SUB-2024-6632',
    customerName: 'Vanguard Freight Co',
    customerCode: 'CUST-VNG-22',
    planName: 'Logistics Fleet Dispatch',
    planBillingCadence: 'Annual',
    status: 'Confirmed',
    startDate: 'Nov 01, 2024',
    nextRenewalDate: 'Oct 31, 2025',
    contractValue: 38500,
    accountManager: 'Alex Chen (Staff)',
    paymentTerms: 'Net 60',
    timeline: [
      { step: 'Draft', date: 'Oct 10, 2024', completed: true },
      { step: 'Quotation', date: 'Oct 18, 2024', completed: true },
      { step: 'Confirmed', date: 'Oct 28, 2024', completed: true, current: true },
      { step: 'Active', date: 'Nov 01, 2024', completed: false },
      { step: 'Closed', date: 'Pending', completed: false },
    ],
    items: [
      { id: 'item-6', name: 'Logistics Fleet Core Router', tier: 'Enterprise Tier', quantity: 1, unitPrice: 32000, tax: 3200, total: 35200 },
      { id: 'item-7', name: 'Telematics Ingestion Channel', tier: 'Uncapped', quantity: 1, unitPrice: 3300, tax: 0, total: 3300 },
    ],
  },
  {
    id: 'sub-004',
    number: 'SUB-2024-5510',
    customerName: 'Elevate Capital Partners',
    customerCode: 'CUST-ELV-03',
    planName: 'Institutional FinTech Hub',
    planBillingCadence: 'Monthly',
    status: 'Paused',
    startDate: 'Jun 10, 2024',
    nextRenewalDate: 'Dec 10, 2024',
    contractValue: 18900,
    accountManager: 'Sarah Jenkins',
    paymentTerms: 'Due on receipt',
    timeline: [
      { step: 'Draft', date: 'May 20, 2024', completed: true },
      { step: 'Quotation', date: 'May 28, 2024', completed: true },
      { step: 'Confirmed', date: 'Jun 05, 2024', completed: true },
      { step: 'Active', date: 'Jun 10, 2024', completed: true },
      { step: 'Closed', date: 'Pending', completed: false },
    ],
    items: [
      { id: 'item-8', name: 'FinTech Secure Execution Node', tier: 'Pro Banking', quantity: 1, unitPrice: 16500, tax: 1650, total: 18150 },
      { id: 'item-9', name: 'PCI Audited Backup Replica', tier: 'Add-on', quantity: 1, unitPrice: 750, tax: 0, total: 750 },
    ],
  },
  {
    id: 'sub-005',
    number: 'SUB-2024-4402',
    customerName: 'Pinnacle Biometrics',
    customerCode: 'CUST-PIN-81',
    planName: 'Starter Workspace Edition',
    planBillingCadence: 'Monthly',
    status: 'Closed',
    startDate: 'Jan 01, 2024',
    nextRenewalDate: 'Oct 31, 2024',
    contractValue: 8400,
    accountManager: 'Alex Chen (Staff)',
    paymentTerms: 'Net 30',
    timeline: [
      { step: 'Draft', date: 'Dec 15, 2023', completed: true },
      { step: 'Quotation', date: 'Dec 20, 2023', completed: true },
      { step: 'Confirmed', date: 'Dec 28, 2023', completed: true },
      { step: 'Active', date: 'Jan 01, 2024', completed: true },
      { step: 'Closed', date: 'Oct 31, 2024', completed: true, current: true },
    ],
    items: [
      { id: 'item-10', name: 'Biometric Gateway Starter', tier: 'Entry Level', quantity: 1, unitPrice: 7500, tax: 750, total: 8250 },
    ],
  },
];

const STATUS_PILLS: Record<StaffSubStatus, { bg: string; text: string; dot: string }> = {
  Draft: { bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-400' },
  Quotation: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
  Confirmed: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  Active: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  Paused: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  Closed: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
};

export const StaffSubscriptionsPage: React.FC = () => {
  const { showToast } = useToast();
  const [subscriptions, setSubscriptions] = useState<StaffSubscription[]>(INITIAL_SUBSCRIPTIONS);
  const [selectedId, setSelectedId] = useState<string>(INITIAL_SUBSCRIPTIONS[0].id);
  const [statusFilter, setStatusFilter] = useState<'All' | StaffSubStatus>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const selectedSub = subscriptions.find((s) => s.id === selectedId) || subscriptions[0];

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesFilter = statusFilter === 'All' || sub.status === statusFilter;
    const matchesSearch =
      sub.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.planName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleTogglePause = (subId: string) => {
    setSubscriptions((prev) =>
      prev.map((sub) => {
        if (sub.id !== subId) return sub;
        const newStatus: StaffSubStatus = sub.status === 'Paused' ? 'Active' : 'Paused';
        showToast(
          `Subscription ${sub.number} ${newStatus === 'Active' ? 'resumed' : 'paused'}`,
          'info'
        );
        return { ...sub, status: newStatus };
      })
    );
  };

  const handleCreateRenewal = (sub: StaffSubscription) => {
    showToast(`Draft renewal invoice generated for ${sub.customerName}`, 'success');
  };

  const handleDownloadPDF = (sub: StaffSubscription) => {
    showToast(`Downloading subscription agreement PDF for ${sub.number}`, 'info');
  };

  return (
    <StaffLayout
      title="Subscriptions Workspace"
      subtitle="Track active customer accounts, monitor lifecycle milestones, and manage renewal schedules"
    >
      <div className="space-y-6">
        {/* Status Filters & Top Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/80">
            {(['All', 'Active', 'Confirmed', 'Paused', 'Closed'] as const).map((filter) => {
              const count =
                filter === 'All'
                  ? subscriptions.length
                  : subscriptions.filter((s) => s.status === filter).length;
              const isActive = statusFilter === filter;
              return (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-white text-teal-800 shadow-xs border border-teal-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  {filter} <span className="opacity-60 text-[11px] font-normal">({count})</span>
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none">
              search
            </span>
            <input
              type="text"
              placeholder="Search subscriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition"
            />
          </div>
        </div>

        {/* Split Layout: Subscriptions list on left, Full details workspace on right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Subscriptions List */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Accounts ({filteredSubscriptions.length})
              </span>
              <span className="text-xs text-slate-400">Click to inspect</span>
            </div>

            {filteredSubscriptions.length === 0 ? (
              <div className="bg-white border border-slate-200/80 rounded-xl p-8 text-center text-slate-400 text-xs">
                No subscriptions match the selected criteria.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[780px] overflow-y-auto pr-1">
                {filteredSubscriptions.map((sub) => {
                  const isSelected = sub.id === selectedSub?.id;
                  const badge = STATUS_PILLS[sub.status];
                  return (
                    <div
                      key={sub.id}
                      onClick={() => setSelectedId(sub.id)}
                      className={`cursor-pointer p-4 rounded-xl border transition-all text-left ${
                        isSelected
                          ? 'bg-teal-50/40 border-teal-600 ring-1 ring-teal-600/30 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h4 className="font-semibold text-slate-900 text-sm">{sub.customerName}</h4>
                          <span className="text-[11px] font-mono text-slate-400">{sub.number}</span>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${badge.bg} ${badge.text}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          {sub.status}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 mb-3 flex items-center gap-1">
                        <span className="font-medium text-slate-700">{sub.planName}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500">{sub.planBillingCadence}</span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                        <span className="text-slate-500">
                          Renews <span className="font-medium text-slate-700">{sub.nextRenewalDate}</span>
                        </span>
                        <span className="font-semibold text-slate-900">
                          ${sub.contractValue.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Selected Subscription Detail Workspace */}
          {selectedSub && (
            <div className="lg:col-span-7 xl:col-span-8 bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
              {/* Header Banner */}
              <div className="p-6 border-b border-slate-100 bg-linear-to-r from-slate-50/60 to-white">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200/60">
                        {selectedSub.number}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          STATUS_PILLS[selectedSub.status].bg
                        } ${STATUS_PILLS[selectedSub.status].text}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_PILLS[selectedSub.status].dot}`} />
                        {selectedSub.status}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">({selectedSub.customerCode})</span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">{selectedSub.customerName}</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Account Manager: <span className="text-slate-700 font-medium">{selectedSub.accountManager}</span>
                    </p>
                  </div>

                  {/* Permitted Staff Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    {selectedSub.status !== 'Closed' && (
                      <button
                        onClick={() => handleTogglePause(selectedSub.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition border ${
                          selectedSub.status === 'Paused'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">
                          {selectedSub.status === 'Paused' ? 'play_arrow' : 'pause'}
                        </span>
                        {selectedSub.status === 'Paused' ? 'Resume Subscription' : 'Pause'}
                      </button>
                    )}

                    <button
                      onClick={() => handleCreateRenewal(selectedSub)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-teal-700 text-white hover:bg-teal-800 shadow-xs transition"
                    >
                      <span className="material-symbols-outlined text-sm">receipt_long</span>
                      Create Renewal Invoice
                    </button>

                    <button
                      onClick={() => handleDownloadPDF(selectedSub)}
                      title="Download PDF"
                      className="inline-flex items-center justify-center p-2 rounded-lg text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition"
                    >
                      <span className="material-symbols-outlined text-base">download</span>
                    </button>
                  </div>
                </div>

                {/* Horizontal Lifecycle Status Timeline matching Stitch */}
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                    Lifecycle Timeline
                  </h3>
                  <div className="relative">
                    {/* Connecting line */}
                    <div className="absolute top-3.5 left-4 right-4 h-0.5 bg-slate-200 -z-0" />
                    
                    <div className="grid grid-cols-5 gap-2 relative z-10">
                      {selectedSub.timeline.map((step, idx) => {
                        const isDone = step.completed;
                        const isCurrent = step.current;
                        return (
                          <div key={idx} className="flex flex-col items-center text-center">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                                isDone
                                  ? 'bg-teal-700 border-teal-700 text-white shadow-xs'
                                  : isCurrent
                                  ? 'bg-white border-teal-600 text-teal-700 ring-2 ring-teal-100'
                                  : 'bg-white border-slate-300 text-slate-400'
                              }`}
                            >
                              {isDone ? (
                                <span className="material-symbols-outlined text-sm">check</span>
                              ) : (
                                idx + 1
                              )}
                            </div>
                            <span
                              className={`text-xs mt-2 font-semibold ${
                                isDone || isCurrent ? 'text-slate-900' : 'text-slate-400'
                              }`}
                            >
                              {step.step}
                            </span>
                            <span className="text-[10px] text-slate-400 mt-0.5">{step.date}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Four Metadata Tiles */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-slate-50/50 border-b border-slate-100">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200/80">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                    Plan Tier
                  </span>
                  <p className="text-xs font-bold text-slate-800 line-clamp-1">{selectedSub.planName}</p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200/80">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                    Billing Cadence
                  </span>
                  <p className="text-xs font-bold text-slate-800">{selectedSub.planBillingCadence}</p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200/80">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                    Next Renewal
                  </span>
                  <p className="text-xs font-bold text-teal-800">{selectedSub.nextRenewalDate}</p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200/80">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                    Total Value
                  </span>
                  <p className="text-xs font-bold text-slate-900">
                    ${selectedSub.contractValue.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Contracted Line Items Table */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900">Contracted Products & Services</h3>
                  <span className="text-xs text-slate-500">Terms: {selectedSub.paymentTerms}</span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                      <tr>
                        <th className="px-4 py-3">Product / Service</th>
                        <th className="px-4 py-3">Tier Spec</th>
                        <th className="px-4 py-3 text-right">Qty</th>
                        <th className="px-4 py-3 text-right">Unit Price</th>
                        <th className="px-4 py-3 text-right">Tax</th>
                        <th className="px-4 py-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {selectedSub.items.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3.5 font-medium text-slate-900">{item.name}</td>
                          <td className="px-4 py-3.5 text-slate-500">{item.tier}</td>
                          <td className="px-4 py-3.5 text-right font-mono">{item.quantity}</td>
                          <td className="px-4 py-3.5 text-right font-mono">${item.unitPrice.toLocaleString()}</td>
                          <td className="px-4 py-3.5 text-right font-mono">${item.tax.toLocaleString()}</td>
                          <td className="px-4 py-3.5 text-right font-semibold font-mono text-slate-900">
                            ${item.total.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50/80 border-t border-slate-200 font-semibold text-slate-800">
                      <tr>
                        <td colSpan={5} className="px-4 py-3 text-right text-xs">
                          Total Contract Commitment:
                        </td>
                        <td className="px-4 py-3 text-right text-xs font-bold text-teal-800 font-mono">
                          $
                          {selectedSub.items
                            .reduce((acc, curr) => acc + curr.total, 0)
                            .toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Footer notes */}
                <div className="mt-4 p-3.5 rounded-lg bg-teal-50/40 border border-teal-100 text-[11px] text-teal-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-teal-700 text-base">verified_user</span>
                  <span>
                    Staff view operates in restricted compliance mode. Direct pricing catalog edits and discount overrides are managed via Admin.
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </StaffLayout>
  );
};
