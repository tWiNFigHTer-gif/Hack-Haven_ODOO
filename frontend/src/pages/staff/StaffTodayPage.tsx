import React from 'react';
import { StaffLayout } from '../../components/staff/StaffLayout';

export const StaffTodayPage: React.FC = () => {
  return (
    <StaffLayout
      title="Today"
      subtitle="Your operational priority queue and overview"
    >
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
        Today Home is ready to be implemented in Step B.
      </div>
    </StaffLayout>
  );
};
