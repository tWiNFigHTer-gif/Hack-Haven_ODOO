import React from 'react';
import { StaffLayout } from '../../components/staff/StaffLayout';

export const StaffPaymentsPage: React.FC = () => {
  return (
    <StaffLayout
      title="Payments"
      subtitle="View payments ledger and record incoming settlements"
    >
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
        Payments View & Drawer is ready to be implemented in Step E.
      </div>
    </StaffLayout>
  );
};
