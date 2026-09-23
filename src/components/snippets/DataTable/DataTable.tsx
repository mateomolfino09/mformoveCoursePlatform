'use client';

import React, { useState, useEffect } from 'react';
import { AdminEmptyState } from '../../admin';

interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: readonly Column<T>[];
  data: T[];
  total: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSort?: (key: any | string, direction: 'asc' | 'desc') => void;
  renderActions?: (row: T) => React.ReactNode;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  initialRowsPerPage?: number;
  customRenderers?: { [key: string]: (value: any, row: T) => React.ReactNode };
}

const DataTable = <T extends Record<string, any>>({
  columns,
  data,
  total,
  currentPage,
  totalPages,
  onPageChange,
  onSort,
  renderActions,
  onRowsPerPageChange,
  initialRowsPerPage = 10,
  customRenderers,
}: DataTableProps<T>) => {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [rowsPerPage, setRowsPerPage] = useState<number>(initialRowsPerPage);

  useEffect(() => {
    setRowsPerPage(initialRowsPerPage);
  }, [initialRowsPerPage]);

  const handleSort = (key: string) => {
    let newDirection: 'asc' | 'desc' = 'asc';
    if (sortKey === key && sortDirection === 'asc') {
      newDirection = 'desc';
    }
    setSortKey(key);
    setSortDirection(newDirection);

    if (onSort) {
      onSort(key, newDirection);
    }
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    if (onRowsPerPageChange) {
      onRowsPerPageChange(newRowsPerPage);
    }
  };

  return (
    <div className="overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)]">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b border-[var(--admin-border)]">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={`px-3 py-2 text-[11px] font-medium uppercase tracking-wider text-[var(--admin-muted)] ${
                    col.sortable ? 'cursor-pointer select-none hover:text-[var(--admin-fg)]' : ''
                  }`}
                  onClick={() => col.sortable && handleSort(String(col.key))}
                >
                  {col.label}
                  {col.sortable && sortKey === col.key ? (
                    <span className="ml-1 text-[var(--admin-subtle)]">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  ) : null}
                </th>
              ))}
              {renderActions ? (
                <th className="px-3 py-2 text-[11px] font-medium uppercase tracking-wider text-[var(--admin-muted)]">
                  Acciones
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="border-b border-[var(--admin-border)] last:border-b-0 hover:bg-[var(--admin-hover)]"
                >
                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      className="whitespace-nowrap px-3 py-2.5 text-[13px] text-[var(--admin-fg)]"
                    >
                      {customRenderers && customRenderers[String(col.key)]
                        ? customRenderers[String(col.key)](row[col.key], row)
                        : row[col.key] !== undefined
                          ? String(row[col.key])
                          : ''}
                    </td>
                  ))}
                  {renderActions ? (
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">{renderActions(row)}</div>
                    </td>
                  ) : null}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + (renderActions ? 1 : 0)} className="p-4">
                  <AdminEmptyState title="No hay datos para mostrar." />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {data.length > 0 ? (
        <div className="flex items-center justify-between border-t border-[var(--admin-border)] px-3 py-2">
          <p className="text-[12px] text-[var(--admin-muted)]">
            {(currentPage - 1) * rowsPerPage + 1}–{Math.min(currentPage * rowsPerPage, total)} de {total}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-7 rounded-[var(--admin-radius)] px-2 text-[12px] text-[var(--admin-fg)] hover:bg-[var(--admin-hover)] disabled:text-[var(--admin-subtle)]"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-7 rounded-[var(--admin-radius)] px-2 text-[12px] text-[var(--admin-fg)] hover:bg-[var(--admin-hover)] disabled:text-[var(--admin-subtle)]"
            >
              Siguiente
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default DataTable;
