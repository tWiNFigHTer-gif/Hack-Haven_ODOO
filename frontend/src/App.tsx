import React, { useState } from 'react';

type UserRole = 'ADMIN' | 'CUSTOMER';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, isPositive }) => (
  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
    <div className="text-xs font-semibold tracking-wider text-slate-500 uppercase">{title}</div>
    <div className="mt-2 text-2xl font-bold text-slate-900">{value}</div>
    <div className={`mt-1 text-xs font-medium ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
      {change}
    </div>
  </div>
);

export const App: React.FC = () => {
  const [activeRole, setActiveRole] = useState<UserRole>('ADMIN');

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased">
      {/* Top Application Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              S
            </div>
            <div>
              <span className="font-bold text-slate-900 tracking-tight">SubSphere</span>
              <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                v1.0.0
              </span>
            </div>
          </div>

          {/* Role Switching Simulator */}
          <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setActiveRole('ADMIN')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                activeRole === 'ADMIN'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Admin Dashboard
            </button>
            <button
              onClick={() => setActiveRole('CUSTOMER')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                activeRole === 'CUSTOMER'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Customer Portal
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeRole === 'ADMIN' ? (
          /* ================= ADMIN DASHBOARD VIEW ================= */
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Executive Billing Overview</h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  Real-time subscription metrics, recurring revenues, and account lifecycle analytics.
                </p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition">
                  + Create Custom Plan
                </button>
              </div>
            </div>

            {/* KPI Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard title="Monthly Recurring Rev (MRR)" value="$42,850.00" change="+12.4% vs last month" isPositive={true} />
              <MetricCard title="Active Subscriptions" value="1,248" change="+8.1% vs last month" isPositive={true} />
              <MetricCard title="Gross Churn Rate" value="1.8%" change="-0.4% improvement" isPositive={true} />
              <MetricCard title="Past-Due Invoices" value="7 ($2,140)" change="+2 needs dunning action" isPositive={false} />
            </div>

            {/* Recent Subscriptions Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">Recent Customer Subscriptions</h2>
                <span className="text-xs text-slate-400">Displaying latest active & trialing accounts</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-3">Account / Tenant</th>
                      <th className="px-6 py-3">Plan Tier</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Next Renewal</th>
                      <th className="px-6 py-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50/70 transition">
                      <td className="px-6 py-3.5 font-medium text-slate-900">Acme Cloud Corp</td>
                      <td className="px-6 py-3.5">Enterprise Annual</td>
                      <td className="px-6 py-3.5">
                        <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-3.5">Dec 15, 2026</td>
                      <td className="px-6 py-3.5 text-right font-semibold text-slate-900">$2,400.00</td>
                    </tr>
                    <tr className="hover:bg-slate-50/70 transition">
                      <td className="px-6 py-3.5 font-medium text-slate-900">PixelCraft Studios</td>
                      <td className="px-6 py-3.5">Pro Monthly</td>
                      <td className="px-6 py-3.5">
                        <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          Trialing
                        </span>
                      </td>
                      <td className="px-6 py-3.5">Nov 07, 2026</td>
                      <td className="px-6 py-3.5 text-right font-semibold text-slate-900">$79.00</td>
                    </tr>
                    <tr className="hover:bg-slate-50/70 transition">
                      <td className="px-6 py-3.5 font-medium text-slate-900">Delta Dynamics</td>
                      <td className="px-6 py-3.5">Scale Monthly</td>
                      <td className="px-6 py-3.5">
                        <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                          Past Due
                        </span>
                      </td>
                      <td className="px-6 py-3.5">Nov 01, 2026</td>
                      <td className="px-6 py-3.5 text-right font-semibold text-slate-900">$199.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* ================= CUSTOMER PORTAL VIEW ================= */
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">Subscription & Billing Portal</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Manage your organization’s active tier, metered usage, payment methods, and invoices.
              </p>
            </div>

            {/* Active Subscription Summary Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-100 gap-4">
                <div>
                  <div className="flex items-center space-x-3">
                    <h2 className="text-xl font-bold text-slate-900">Pro Developer Tier</h2>
                    <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">Billed monthly • Next invoice on Nov 28, 2026</p>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-2xl font-black text-slate-900">$79.00<span className="text-sm font-normal text-slate-500">/mo</span></div>
                  <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline mt-1">
                    Upgrade to Enterprise
                  </button>
                </div>
              </div>

              {/* Metered Usage Progress */}
              <div className="mt-6 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Current Cycle Usage</h3>
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 mb-1.5">
                    <span>API Invocations</span>
                    <span className="font-semibold text-slate-900">42,190 / 50,000 (84%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '84%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 mb-1.5">
                    <span>Provisioned Team Seats</span>
                    <span className="font-semibold text-slate-900">4 of 10 Seats</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '40%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Invoicing History */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Payment & Invoice History</h3>
              </div>
              <div className="divide-y divide-slate-100">
                <div className="px-6 py-3.5 flex items-center justify-between text-sm">
                  <div>
                    <div className="font-semibold text-slate-900">Invoice #INV-2026-1002</div>
                    <div className="text-xs text-slate-400">Oct 28, 2026 • Visa ending in 4242</div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="font-semibold text-slate-900">$79.00</span>
                    <button className="text-xs font-medium text-indigo-600 hover:text-indigo-800">
                      Download PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;

