import React from 'react';

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string;
  render?: (item: T, index: number) => React.ReactNode;
}

export interface AdminTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  emptySubtext?: string;
  actionRow?: (item: T) => React.ReactNode;
  className?: string;
}

export function AdminTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  isLoading = false,
  emptyMessage = 'No records found',
  emptySubtext = 'Get started by creating your first entry.',
  className = '',
}: AdminTableProps<T>) {
  return (
    <div
      className={`w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
      <table className="w-full text-left border-collapse">
        {/* Sticky Header */}
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width }}
                className={`py-3.5 px-4 font-semibold ${
                  col.align === 'right'
                    ? 'text-right'
                    : col.align === 'center'
                    ? 'text-center'
                    : 'text-left'
                }`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
          {isLoading ? (
            // Skeleton Rows
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="h-12 animate-pulse bg-white">
                {columns.map((col) => (
                  <td key={col.key} className="py-3 px-4">
                    <div className="h-4 bg-slate-100 rounded w-3/4" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            // Empty State
            <tr>
              <td colSpan={columns.length} className="py-12 px-4 text-center">
                <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                    <span className="material-symbols-outlined text-[24px]">inbox</span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900">{emptyMessage}</h4>
                  <p className="text-xs text-slate-500 mt-1">{emptySubtext}</p>
                </div>
              </td>
            </tr>
          ) : (
            // Data Rows
            data.map((item, index) => (
              <tr
                key={keyExtractor(item)}
                onClick={() => onRowClick && onRowClick(item)}
                className={`h-12 transition-colors duration-100 hover:bg-slate-50/70 ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
              >
                {columns.map((col) => {
                  const content = col.render
                    ? col.render(item, index)
                    : (item as Record<string, unknown>)[col.key] !== undefined
                    ? String((item as Record<string, unknown>)[col.key])
                    : null;

                  return (
                    <td
                      key={col.key}
                      className={`py-3 px-4 align-middle ${
                        col.align === 'right'
                          ? 'text-right'
                          : col.align === 'center'
                          ? 'text-center'
                          : 'text-left'
                      }`}
                    >
                      {content}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

