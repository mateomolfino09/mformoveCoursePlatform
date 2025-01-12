'use client';

import React, { useState, useEffect } from 'react';

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
  onSort?: (key: keyof T | string, direction: 'asc' | 'desc') => void;
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

  const renderPaginationControls = () => (
    <div className="flex items-center justify-between">
      {/* <div className="flex items-center space-x-2">
        <label htmlFor="rowsPerPage" className="text-sm text-gray-600">
          Reg./Pág
        </label>
        <select
          id="rowsPerPage"
          value={rowsPerPage}
          onChange={handleRowsPerPageChange}
          className="text-sm border border-gray-300 rounded px-2 py-1 bg-white text-black"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={15}>15</option>
          <option value={20}>20</option>
        </select>
      </div> */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-2 py-1 text-sm border rounded ${
            currentPage === 1 ? 'text-gray-400' : 'text-gray-700 hover:bg-gray-200'
          }`}
        >
          &lt;
        </button>
        <span className="text-sm text-gray-600">
          {`${(currentPage - 1) * rowsPerPage + 1} - ${
            Math.min(currentPage * rowsPerPage, total)
          } de ${total}`}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-2 py-1 text-sm border rounded ${
            currentPage === totalPages ? 'text-gray-400' : 'text-gray-700 hover:bg-gray-200'
          }`}
        >
          &gt;
        </button>
      </div>
    </div>
  );

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
                onClick={() => col.sortable && handleSort(String(col.key))}
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
            <>
              {data.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((col) => (
                    <td key={String(col.key)} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customRenderers && customRenderers[String(col.key)]
                        ? customRenderers[String(col.key)](row[col.key], row)
                        : row[col.key] !== undefined
                        ? String(row[col.key])
                        : ''}
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
              ))}
            </>
          ) : (
            <tr>
              <td colSpan={columns.length + (renderActions ? 1 : 0)} className="px-6 py-4 text-center text-gray-500">
                No hay datos para mostrar.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {data.length > 0 && <div className="p-4 bg-white">{renderPaginationControls()}</div>}
    </div>
  );
};

export default DataTable;
