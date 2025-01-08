'use client';

import React, { useState } from 'react';

interface Column<T> {
  key: keyof T;
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
  onSort?: (key: keyof T, direction: 'asc' | 'desc') => void;
  renderActions?: (row: T) => React.ReactNode;
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
}: DataTableProps<T>) => {
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: keyof T) => {
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

  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
            i === currentPage
              ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
          }`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                  col.sortable ? 'cursor-pointer' : ''
                }`}
                onClick={() => col.sortable && handleSort(col.key)}
              >
                {col.label}
                {col.sortable && sortKey === col.key && (
                  <span className="ml-2 text-gray-400">
                    {sortDirection === 'asc' ? '▲' : '▼'}
                  </span>
                )}
              </th>
            ))}
            {renderActions && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row[col.key] !== undefined ? String(row[col.key]) : ''}
                  </td>
                ))}
                {renderActions && (
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center text-base">
                      {renderActions(row)}
                    </div>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length + (renderActions ? 1 : 0)} className="px-6 py-4 text-center text-gray-500">
                No hay datos para mostrar.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="flex justify-between items-center p-4 bg-white">
        <p className="text-sm text-gray-700">
          Mostrando {data.length > 0 ? (currentPage - 1) * 10 + 1 : 0} a{' '}
          {(currentPage - 1) * 10 + data.length} de {total} resultados
        </p>
        <div className="isolate inline-flex -space-x-px rounded-md shadow-sm">
          {renderPagination()}
        </div>
      </div>
    </div>
  );
};

export default DataTable;
