import React from 'react';
import { StaffLayout } from '../../components/staff/StaffLayout';

export const StaffQuotationsPage: React.FC = () => {
  return (
    <StaffLayout
      title="Quotations"
      subtitle="Prepare and send customer subscription quotations"
    >
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
        Quotations Flow is ready to be implemented in Step C.
      </div>
    </StaffLayout>
  );
};
