import React from 'react';

export interface TableProps {
  headers: React.ReactNode[];
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ headers, children, className = '' }) => {
  return (
    <div className={`overflow-x-auto w-full ${className}`}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-container-low/60 text-secondary text-xs uppercase tracking-wider">
            {headers.map((header, idx) => (
              <th
                key={idx}
                className={`py-3 px-4 font-medium ${
                  idx === 0 ? 'rounded-l-lg' : ''
                } ${idx === headers.length - 1 ? 'rounded-r-lg text-right' : ''}`}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle/50 text-sm">
          {children}
        </tbody>
      </table>
    </div>
  );
};

