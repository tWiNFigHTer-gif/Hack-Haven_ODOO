import React from 'react';
import { StaffLayout } from '../../components/staff/StaffLayout';

export const StaffInvoicesPage: React.FC = () => {
  return (
    <StaffLayout
      title="Invoices"
      subtitle="Issue, confirm, send, and print customer invoices"
    >
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
        Invoices View is ready to be implemented in Step D.
      </div>
    </StaffLayout>
  );
};
