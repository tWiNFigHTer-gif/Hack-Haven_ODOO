import React, { useState, useMemo } from 'react';
import { StaffLayout } from '../../components/staff/StaffLayout';
import { useToast } from '../../components/common/Toast';

type QuotationStatus = 'Draft' | 'Quotation' | 'Confirmed' | 'Active' | 'Closed' | 'Expired';

interface QuotationLine {
  id: string;
  product: string;
  quantity: number;
  unitPrice: number;
  taxRate: number; // e.g., 0.10 for 10%
}

interface Quotation {
  id: string;
  quotationNumber: string;
  customerName: string;
  templateName: string;
  startDate: string;
  expiryDate: string;
  issueDate: string;
  paymentTerms: string;
  notes: string;
  lines: QuotationLine[];
  status: QuotationStatus;
  subtotal: number;
  tax: number;
  total: number;
}

interface TemplateBlueprint {
  id: string;
  name: string;
  tag: string;
  icon: string;
  tagColor: string;
  description: string;
  baseValue: number;
  lines: Omit<QuotationLine, 'id'>[];
}

const TEMPLATES: TemplateBlueprint[] = [
  {
    id: 'tmpl-1',
    name: 'Standard SaaS Annual',
    tag: 'Most popular',
    icon: 'verified',
    tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description: 'Pre-configured annual platform license, bundled support credits, and standard SLA onboard package.',
    baseValue: 14200.0,
    lines: [
      { product: 'Platform Core SaaS (12 Months)', quantity: 1, unitPrice: 10000.0, taxRate: 0.1 },
      { product: 'Dedicated Solution Onboarding', quantity: 1, unitPrice: 2200.0, taxRate: 0.1 },
      { product: '10x Seat Tier Expansion Bundle', quantity: 1, unitPrice: 2000.0, taxRate: 0.1 },
    ],
  },
  {
    id: 'tmpl-2',
    name: 'Enterprise Usage & Growth',
    tag: 'Enterprise',
    icon: 'corporate_fare',
    tagColor: 'bg-purple-50 text-purple-700 border-purple-200',
    description: 'High-volume tiered subscription with custom egress limits, security reviews, and 99.95% SLA guarantee.',
    baseValue: 38500.0,
    lines: [
      { product: 'Enterprise Volume Cluster (Annual)', quantity: 1, unitPrice: 30000.0, taxRate: 0.1 },
      { product: 'Priority 24/7 SLA Hotline', quantity: 1, unitPrice: 5000.0, taxRate: 0.1 },
      { product: 'SOC2 Type II Audit Documentation Pack', quantity: 1, unitPrice: 3500.0, taxRate: 0.1 },
    ],
  },
  {
    id: 'tmpl-3',
    name: 'Starter Monthly',
    tag: 'Flexible',
    icon: 'bolt',
    tagColor: 'bg-blue-50 text-blue-700 border-blue-200',
    description: 'Lightweight self-serve tier with standard per-seat billing and monthly cancellation elasticity.',
    baseValue: 1850.0,
    lines: [
      { product: 'Starter Base Workspace Plan', quantity: 1, unitPrice: 1200.0, taxRate: 0.1 },
      { product: 'Standard User Seats (x5)', quantity: 1, unitPrice: 450.0, taxRate: 0.1 },
      { product: 'Community Support Tier', quantity: 1, unitPrice: 200.0, taxRate: 0.1 },
    ],
  },
];

const INITIAL_QUOTATIONS: Quotation[] = [
  {
    id: 'q-117',
    quotationNumber: 'Q-2024-117',
    customerName: 'Meridian Health Systems',
    templateName: 'Enterprise Usage & Growth',
    startDate: 'Nov 08, 2024',
    expiryDate: 'Dec 08, 2024',
    issueDate: 'Nov 08, 2024',
    paymentTerms: 'Net 30',
    notes: 'Enterprise compliance deployment with dedicated onboarding.',
    lines: [
      { id: 'l-0', product: 'Enterprise Volume Cluster (Annual)', quantity: 1, unitPrice: 30000.0, taxRate: 0.1 },
      { id: 'l-0b', product: 'Priority 24/7 SLA Hotline', quantity: 1, unitPrice: 5000.0, taxRate: 0.1 },
    ],
    status: 'Confirmed',
    subtotal: 35000.0,
    tax: 3500.0,
    total: 38500.0,
  },
  {
    id: 'q-116',
    quotationNumber: 'Q-2024-116',
    customerName: 'Acme Studio Inc.',
    templateName: 'Standard SaaS Annual',
    startDate: 'Nov 06, 2024',
    expiryDate: 'Dec 06, 2024',
    issueDate: 'Nov 06, 2024',
    paymentTerms: 'Net 30',
    notes: 'Annual contract cycle includes standard QBR milestone reviews and priority onboarding schedule.',
    lines: [
      { id: 'l-1', product: 'Platform Core SaaS (12 Months)', quantity: 1, unitPrice: 10000.0, taxRate: 0.1 },
      { id: 'l-2', product: 'Dedicated Solution Onboarding', quantity: 1, unitPrice: 2200.0, taxRate: 0.1 },
      { id: 'l-3', product: '10x Seat Tier Expansion Bundle', quantity: 1, unitPrice: 2000.0, taxRate: 0.1 },
    ],
    status: 'Quotation',
    subtotal: 14200.0,
    tax: 1420.0,
    total: 15620.0,
  },
  {
    id: 'q-115',
    quotationNumber: 'Q-2024-115',
    customerName: 'Kinetix Logistics',
    templateName: 'Starter Monthly',
    startDate: 'Nov 05, 2024',
    expiryDate: 'Nov 19, 2024',
    issueDate: 'Nov 05, 2024',
    paymentTerms: 'Net 15',
    notes: 'Direct client checkout with recurring card authorization.',
    lines: [
      { id: 'l-6', product: 'Starter Base Workspace Plan', quantity: 1, unitPrice: 1200.0, taxRate: 0.1 },
    ],
    status: 'Draft',
    subtotal: 1200.0,
    tax: 120.0,
    total: 1320.0,
  },
  {
    id: 'q-104',
    quotationNumber: 'Q-2024-104',
    customerName: 'Bluebird Labs',
    templateName: 'Standard SaaS Annual',
    startDate: 'Oct 12, 2024',
    expiryDate: 'Oct 26, 2024',
    issueDate: 'Oct 12, 2024',
    paymentTerms: 'Net 30',
    notes: 'Quote lapsed — customer requested renewal at updated pricing.',
    lines: [
      { id: 'l-7', product: 'Platform Core SaaS (12 Months)', quantity: 1, unitPrice: 10000.0, taxRate: 0.1 },
    ],
    status: 'Expired',
    subtotal: 10000.0,
    tax: 1000.0,
    total: 11000.0,
  },
];

const STATUS_BADGES: Record<QuotationStatus, { bg: string; text: string; dot: string }> = {
  Draft: { bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-400' },
  Quotation: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
  Confirmed: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  Active: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  Closed: { bg: 'bg-slate-100', text: 'text-slate-500', dot: 'bg-slate-400' },
  Expired: { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500' },
};

export const StaffQuotationsPage: React.FC = () => {
  const { showToast } = useToast();
  const [quotations, setQuotations] = useState<Quotation[]>(INITIAL_QUOTATIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | QuotationStatus>('All');

  // Multi-step builder flow state
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [builderStep, setBuilderStep] = useState<1 | 2>(1);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateBlueprint>(TEMPLATES[0]);

  // Step 2 Form State
  const [formCustomer, setFormCustomer] = useState('Acme Studio (HQ)');
  const [formStartDate, setFormStartDate] = useState('Nov 15, 2024');
  const [formExpiryDate, setFormExpiryDate] = useState('Dec 15, 2024');
  const [formTerms, setFormTerms] = useState('Net 30');
  const [formNotes, setFormNotes] = useState('Annual contract cycle includes standard QBR milestone reviews and priority onboarding schedule.');
  const [formLines, setFormLines] = useState<QuotationLine[]>([]);

  // Open flow with initial template
  const handleStartCreate = () => {
    setIsBuilderOpen(true);
    setBuilderStep(1);
  };

  const handleSelectTemplate = (template: TemplateBlueprint) => {
    setSelectedTemplate(template);
    setFormLines(
      template.lines.map((l, idx) => ({
        ...l,
        id: `line-${Date.now()}-${idx}`,
      }))
    );
    setBuilderStep(2);
  };

  // Recalculate totals
  const subtotal = useMemo(() => {
    return formLines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
  }, [formLines]);

  const tax = useMemo(() => {
    return formLines.reduce((sum, line) => sum + line.quantity * line.unitPrice * line.taxRate, 0);
  }, [formLines]);

  const total = subtotal + tax;

  const handleUpdateLine = (id: string, field: keyof QuotationLine, value: any) => {
    setFormLines((prev) =>
      prev.map((l) => (l.id === id ? { ...l, [field]: value } : l))
    );
  };

  const handleAddLine = () => {
    const newLine: QuotationLine = {
      id: `line-${Date.now()}`,
      product: 'Standard Add-on Module',
      quantity: 1,
      unitPrice: 500.0,
      taxRate: 0.1,
    };
    setFormLines((prev) => [...prev, newLine]);
  };

  const handleRemoveLine = (id: string) => {
    setFormLines((prev) => prev.filter((l) => l.id !== id));
  };

  const handleSaveQuotation = (targetStatus: 'Draft' | 'Quotation') => {
    if (!formCustomer.trim()) {
      showToast('Please specify a customer account.', 'error');
      return;
    }
    if (formLines.length === 0) {
      showToast('Quotation must contain at least one line item.', 'error');
      return;
    }

    const newQuote: Quotation = {
      id: `q-${Date.now()}`,
      quotationNumber: `Q-2024-${Math.floor(100 + Math.random() * 900)}`,
      customerName: formCustomer,
      templateName: selectedTemplate.name,
      startDate: formStartDate,
      expiryDate: formExpiryDate,
      issueDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      paymentTerms: formTerms,
      notes: formNotes,
      lines: formLines,
      status: targetStatus,
      subtotal,
      tax,
      total,
    };

    setQuotations((prev) => [newQuote, ...prev]);
    showToast(
      targetStatus === 'Draft'
        ? `Quotation ${newQuote.quotationNumber} saved as draft`
        : `Quotation ${newQuote.quotationNumber} dispatched to ${newQuote.customerName}`,
      'success'
    );
    setIsBuilderOpen(false);
  };

  // Filtered quotations list
  const filteredQuotations = useMemo(() => {
    return quotations.filter((q) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesCust = q.customerName.toLowerCase().includes(query);
        const matchesNum = q.quotationNumber.toLowerCase().includes(query);
        if (!matchesCust && !matchesNum) return false;
      }
      if (statusFilter !== 'All' && q.status !== statusFilter) return false;
      return true;
    });
  }, [quotations, searchQuery, statusFilter]);

  return (
    <StaffLayout
      title="Quotations"
      subtitle="Frontline quote builder and status tracking for customer proposals"
      actions={
        <button
          type="button"
          onClick={handleStartCreate}
          className="h-10 px-4 bg-[#0F766E] text-white font-medium text-sm rounded-[10px] shadow-xs hover:bg-[#115E59] transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>New quotation</span>
        </button>
      }
    >
      {/* ── MULTI-STEP BUILDER FLOW (When open) ── */}
      {isBuilderOpen && (
        <div className="flex flex-col gap-5 bg-slate-50/50 p-4 sm:p-5 rounded-2xl border border-slate-200 mb-2">
          {/* Step Indicator Bar */}
          <div className="w-full bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Step 1 Button */}
              <button
                type="button"
                onClick={() => setBuilderStep(1)}
                className="flex items-center gap-2 text-left"
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    builderStep === 1
                      ? 'bg-[#0F766E] text-white'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  1
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Step 1</span>
                  <span className={`text-xs font-semibold ${builderStep === 1 ? 'text-slate-900' : 'text-slate-500'}`}>
                    Choose blueprint
                  </span>
                </div>
              </button>

              <span className="material-symbols-outlined text-slate-300 text-[18px]">chevron_right</span>

              {/* Step 2 Button */}
              <button
                type="button"
                onClick={() => setBuilderStep(2)}
                className="flex items-center gap-2 text-left"
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    builderStep === 2
                      ? 'bg-[#0F766E] text-white'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  2
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Step 2</span>
                  <span className={`text-xs font-semibold ${builderStep === 2 ? 'text-slate-900' : 'text-slate-500'}`}>
                    Configure & terms
                  </span>
                </div>
              </button>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="inline-flex items-center gap-1 text-[#0F766E] bg-emerald-50 px-2 py-0.5 rounded-full text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E]" />
                Template flow
              </span>
              <button
                type="button"
                onClick={() => setIsBuilderOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Cancel flow"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          </div>

          {/* ── STEP 1: TEMPLATE PICKER CARDS ── */}
          {builderStep === 1 && (
            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Select a quotation blueprint</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pick a pre-configured service template to auto-populate terms, plan tiers, and line items.
                  </p>
                </div>
                <span className="text-xs text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-md">
                  3 templates available
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {TEMPLATES.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    onClick={() => handleSelectTemplate(tmpl)}
                    className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs hover:shadow-md hover:border-[#0F766E]/50 transition-all flex flex-col justify-between group cursor-pointer"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="p-2 rounded-lg bg-emerald-50 text-[#0F766E] flex items-center justify-center">
                          <span className="material-symbols-outlined text-[20px]">{tmpl.icon}</span>
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${tmpl.tagColor}`}>
                          {tmpl.tag}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm group-hover:text-[#0F766E] transition-colors">
                        {tmpl.name}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2">{tmpl.description}</p>

                      <div className="bg-slate-50 rounded-lg p-3 flex flex-col gap-1.5 border border-slate-100">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          Default bundle items:
                        </span>
                        {tmpl.lines.map((l, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-xs text-slate-700">
                            <span className="material-symbols-outlined text-[14px] text-[#0F766E]">check</span>
                            <span className="truncate">{l.product}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Est. base value</span>
                        <span className="text-sm font-bold text-slate-900">
                          ${tmpl.baseValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="h-8 px-3 rounded-lg bg-[#0F766E] text-white text-xs font-semibold hover:bg-[#115E59] transition-colors shadow-2xs"
                      >
                        Select template
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── STEP 2: PRE-FILLED FORM & LINE BUILDER ── */}
          {builderStep === 2 && (
            <section className="flex flex-col gap-4">
              {/* Meta Details Form Card */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs flex flex-col gap-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-[#F0FDFA] text-[#0F766E] border border-[#CCFBF1] text-xs font-semibold">
                      Template: {selectedTemplate.name}
                    </span>
                    <span className="text-xs text-slate-400">
                      ID Ref: <span className="font-mono font-semibold text-slate-800">Q-2024-NEW</span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBuilderStep(1)}
                    className="text-xs font-semibold text-[#0F766E] hover:underline flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
                    <span>Switch blueprint</span>
                  </button>
                </div>

                {/* Customer & Term Fields Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                      Customer Account
                    </label>
                    <input
                      type="text"
                      value={formCustomer}
                      onChange={(e) => setFormCustomer(e.target.value)}
                      placeholder="e.g. Acme Studio"
                      className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                      Contract Start
                    </label>
                    <input
                      type="text"
                      value={formStartDate}
                      onChange={(e) => setFormStartDate(e.target.value)}
                      className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                      Valid Until
                    </label>
                    <input
                      type="text"
                      value={formExpiryDate}
                      onChange={(e) => setFormExpiryDate(e.target.value)}
                      className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                      Payment Terms
                    </label>
                    <select
                      value={formTerms}
                      onChange={(e) => setFormTerms(e.target.value)}
                      className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                    >
                      <option>Net 30</option>
                      <option>Net 15</option>
                      <option>Immediate / Upon Receipt</option>
                      <option>Net 60</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Editable Line Items Table Card */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
                <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">Quotation Line Items</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-medium">
                      {formLines.length} items
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddLine}
                    className="h-7 px-2.5 rounded-md bg-white hover:bg-slate-50 text-[#0F766E] border border-slate-200 text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    <span>Add line item</span>
                  </button>
                </div>

                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="h-9 bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider select-none">
                        <th className="px-4 py-2 min-w-[260px]">Product / Service Plan</th>
                        <th className="px-2 py-2 w-20 text-center">Qty</th>
                        <th className="px-2 py-2 w-32 text-right">Unit Price</th>
                        <th className="px-2 py-2 w-28 text-center">Tax Spec</th>
                        <th className="px-4 py-2 w-32 text-right">Line Total</th>
                        <th className="w-10 px-2 text-center" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {formLines.map((line) => (
                        <tr key={line.id} className="h-11 hover:bg-slate-50/70 transition-colors">
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              value={line.product}
                              onChange={(e) => handleUpdateLine(line.id, 'product', e.target.value)}
                              className="w-full h-8 px-2 rounded-md bg-slate-50 border border-transparent hover:border-slate-200 focus:bg-white focus:border-[#0F766E] text-xs font-medium text-slate-900 outline-none"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="number"
                              min="1"
                              value={line.quantity}
                              onChange={(e) =>
                                handleUpdateLine(line.id, 'quantity', parseInt(e.target.value, 10) || 1)
                              }
                              className="w-full h-8 px-2 text-center rounded-md bg-slate-50 border border-transparent hover:border-slate-200 focus:bg-white focus:border-[#0F766E] text-xs font-semibold text-slate-900 outline-none"
                            />
                          </td>
                          <td className="px-2 py-2 text-right">
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                              <input
                                type="number"
                                step="1"
                                value={line.unitPrice}
                                onChange={(e) =>
                                  handleUpdateLine(line.id, 'unitPrice', parseFloat(e.target.value) || 0)
                                }
                                className="w-full h-8 pl-5 pr-2 text-right rounded-md bg-slate-50 border border-transparent hover:border-slate-200 focus:bg-white focus:border-[#0F766E] text-xs font-semibold text-slate-900 outline-none tabular-nums"
                              />
                            </div>
                          </td>
                          <td className="px-2 py-2 text-center">
                            <span className="inline-block px-2 py-0.5 rounded-md text-[10px] bg-slate-100 text-slate-600 font-medium">
                              Standard (10%)
                            </span>
                          </td>
                          <td className="px-4 py-2 text-right font-semibold text-slate-900 tabular-nums">
                            ${(line.quantity * line.unitPrice).toFixed(2)}
                          </td>
                          <td className="px-2 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveLine(line.id)}
                              className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete line"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary Split: Notes vs Valuation Box */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
                <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-slate-200 shadow-2xs flex flex-col gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-slate-400 text-[18px]">notes</span>
                    <span className="text-xs font-bold text-slate-900">Client Facing Scope Notes</span>
                  </div>
                  <textarea
                    rows={3}
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Enter special delivery notes or onboarding schedule commitments..."
                    className="w-full p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E] transition-all resize-none"
                  />
                  <span className="text-[10px] text-slate-400">Included on generated customer PDF proposal</span>
                </div>

                {/* Totals Valuation Box */}
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs flex flex-col gap-2">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Financial Calculation
                  </span>
                  <div className="flex flex-col gap-1.5 pt-1 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal</span>
                      <span className="font-medium text-slate-900 tabular-nums">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Applicable Tax (10%)</span>
                      <span className="font-medium text-slate-900 tabular-nums">${tax.toFixed(2)}</span>
                    </div>
                    <div className="h-px bg-slate-100 my-1" />
                    <div className="flex justify-between items-baseline pt-1">
                      <span className="text-sm font-bold text-slate-900">Quotation Value</span>
                      <span className="text-xl font-bold text-[#0F766E] tabular-nums">${total.toFixed(2)}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 text-right">Calculated in USD • Billed per terms</span>
                  </div>
                </div>
              </div>

              {/* Execution Action Bar */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="material-symbols-outlined text-[18px] text-[#0F766E]">schedule</span>
                  <span>Draft blueprint ready for review</span>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => handleSaveQuotation('Draft')}
                    className="h-9 px-4 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium text-xs hover:bg-slate-50 transition-colors shadow-2xs"
                  >
                    Save as draft
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveQuotation('Quotation')}
                    className="h-9 px-4 rounded-lg bg-[#0F766E] text-white font-semibold text-xs hover:bg-[#115E59] transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">send</span>
                    <span>Send as quotation</span>
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>
      )}

      {/* ── EXISTING QUOTATIONS LEDGER ── */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex flex-col gap-0.5">
            <h3 className="text-base font-bold text-slate-900">Existing Quotations Ledger</h3>
            <p className="text-xs text-slate-500">Frontline queue and status tracking for customer proposals.</p>
          </div>

          {/* Metric Status Chips — matching Stitch: All / In Review / Awaiting Client / Expired */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setStatusFilter('All')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                statusFilter === 'All'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              All ({quotations.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('Quotation')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                statusFilter === 'Quotation'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              In Review ({quotations.filter((q) => q.status === 'Quotation').length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('Confirmed')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                statusFilter === 'Confirmed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Awaiting Client ({quotations.filter((q) => q.status === 'Confirmed').length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('Expired')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                statusFilter === 'Expired'
                  ? 'bg-rose-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Expired ({quotations.filter((q) => q.status === 'Expired').length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('Draft')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                statusFilter === 'Draft'
                  ? 'bg-slate-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Drafts ({quotations.filter((q) => q.status === 'Draft').length})
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by customer, quote #, creator..."
              className="w-full h-8 pl-8 pr-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
            />
          </div>
        </div>

        {/* Quotations Table — columns: Ref #, Customer (with avatar), Template Type, Issue Date, Expiry, Value, Status, Action */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="h-9 bg-slate-50/80 border-b border-slate-200 text-slate-500 text-[11px] font-semibold uppercase tracking-wider select-none">
                  <th className="px-4 py-2">Ref #</th>
                  <th className="px-4 py-2">Customer</th>
                  <th className="px-4 py-2">Template Type</th>
                  <th className="px-4 py-2">Issue Date</th>
                  <th className="px-4 py-2">Expiry</th>
                  <th className="px-4 py-2 text-right">Value</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQuotations.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 px-4 text-center">
                      <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                        <span className="material-symbols-outlined text-[24px] text-slate-400 mb-1">request_quote</span>
                        <h4 className="text-sm font-semibold text-slate-900">No quotations found</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Try clearing filters or click "New quotation" above.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredQuotations.map((q) => {
                    const badge = STATUS_BADGES[q.status];
                    // Customer avatar initials
                    const initials = q.customerName
                      .split(' ')
                      .slice(0, 2)
                      .map((w) => w[0])
                      .join('')
                      .toUpperCase();
                    const avatarColors: Record<string, string> = {
                      M: 'bg-blue-100 text-blue-700',
                      A: 'bg-emerald-100 text-emerald-700',
                      K: 'bg-amber-100 text-amber-700',
                      B: 'bg-rose-100 text-rose-700',
                      H: 'bg-purple-100 text-purple-700',
                      N: 'bg-sky-100 text-sky-700',
                      V: 'bg-teal-100 text-teal-700',
                    };
                    const avatarColor = avatarColors[initials[0]] || 'bg-slate-100 text-slate-600';

                    // Context-sensitive action button
                    const actionLabel =
                      q.status === 'Confirmed'
                        ? 'View'
                        : q.status === 'Quotation'
                        ? 'Convert'
                        : q.status === 'Expired'
                        ? 'Reopen'
                        : 'Edit';

                    return (
                      <tr key={q.id} className="h-11 hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-2 font-mono font-semibold text-xs text-[#0F766E]">
                          {q.quotationNumber}
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            {/* Customer avatar initials */}
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${avatarColor}`}
                            >
                              {initials}
                            </div>
                            <span className="font-medium text-xs text-slate-900">{q.customerName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-xs text-slate-600">{q.templateName}</td>
                        <td className="px-4 py-2 text-xs text-slate-500">{q.issueDate || q.startDate}</td>
                        <td className={`px-4 py-2 text-xs font-medium ${q.status === 'Expired' ? 'text-rose-600' : 'text-slate-500'}`}>
                          {q.expiryDate}
                        </td>
                        <td className="px-4 py-2 text-right font-semibold text-xs text-slate-900 tabular-nums">
                          ${q.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${badge.bg} ${badge.text}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                            {q.status === 'Quotation' ? 'Quotation' : q.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              showToast(
                                q.status === 'Expired'
                                  ? `Reopening ${q.quotationNumber}…`
                                  : q.status === 'Quotation'
                                  ? `Converting ${q.quotationNumber} to confirmed order`
                                  : `Loaded ${q.quotationNumber}`,
                                'info'
                              );
                            }}
                            className={`h-7 px-2.5 rounded-md text-xs font-semibold shadow-2xs transition-colors ${
                              actionLabel === 'Convert'
                                ? 'bg-teal-700 text-white hover:bg-teal-800'
                                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {actionLabel}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
};
