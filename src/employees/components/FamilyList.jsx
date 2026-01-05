// src/components/FamilyList.jsx

import DataTable from 'react-data-table-component';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
// import FamilyMembersCell from './FamilyMembersCell'; // reuse kar rahe hain

export default function FamilyList({
  families,
  loading,
  totalRows,
  handlePageChange,
  handlePerRowsChange,
  perPage,
  currentSortField,
  currentSortDirection,
  onSortChange,
  searchFilters,
  onSearchChange,
}) {
  const [openSearchColumn, setOpenSearchColumn] = useState(null);

  const SearchableHeader = ({ columnName, label }) => {
    const value = searchFilters[columnName] || '';
    const isOpen = openSearchColumn === columnName;
    const hasFilter = value.trim() !== '';

    return (
      <div className="relative py-3">
        <div className="flex items-center justify-between gap-3">
          <span className="font-semibold text-gray-800">{label}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpenSearchColumn(isOpen ? null : columnName);
            }}
            className={`relative p-2 rounded-lg transition-all ${
              hasFilter ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {isOpen ? <X size={18} /> : <Search size={18} />}
            {hasFilter && !isOpen && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>
        </div>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 z-20 bg-white border border-gray-300 rounded-lg shadow-xl">
            <div className="p-3">
              <input
                type="text"
                placeholder={`Search ${label}...`}
                value={value}
                onChange={(e) => onSearchChange({ ...searchFilters, [columnName]: e.target.value })}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                autoFocus
              />
              {value && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSearchChange({ ...searchFilters, [columnName]: '' });
                    setOpenSearchColumn(null);
                  }}
                  className="mt-2 w-full text-left text-sm font-medium text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg"
                >
                  Clear filter
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const columns = [
    {
      name: <SearchableHeader columnName="family_name" label="Family Member" />,
      selector: (row) => row.name,
      sortable: true,
      sortField: 'name',
      grow: 2,
    },
    {
      name: <SearchableHeader columnName="relation" label="Relation" />,
      selector: (row) => row.relation,
      
      
      sortable: true,
      sortField: 'relation',
      cell: (row) => (
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
          row.relation === 'Spouse' ? 'bg-purple-100 text-purple-800' :
          row.relation === 'Son' ? 'bg-blue-100 text-blue-800' :
          row.relation === 'Daughter' ? 'bg-pink-100 text-pink-800' :
          row.relation.includes('Father') || row.relation.includes('Mother') ? 'bg-green-100 text-green-800' :
          'bg-gray-200 text-gray-700'
        }`}>
          {row.relation}
        </span>
      ),
    },
    {
      name: <SearchableHeader columnName="employee_name" label="Employee" />,
      cell: (row) => (
        <div>
          <div className="font-semibold">{row.employee?.name || 'N/A'}</div>
          <div className="text-sm text-gray-600">
            {row.employee?.designation}
          </div>
        </div>
      ),
      sortable: false,
    },
    {
        name: <SearchableHeader columnName="employee_department" label="Department" />,
        selector: (row) => row.employee?.department || 'N/A',
        sortable: true,
        sortField: 'department',
    },
    {
      name: 'Actions',
      cell: (row) => (
        <div className="flex gap-2">
          <Link
            to={`/employees/${row.employee.id}`}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            View / Edit
          </Link>
        </div>
      ),
      ignoreRowClick: true,
      button: true,
      width: '180px',
    },
  ];

  const handleSort = (column, sortDirection) => {
    if (column.sortField) {
      onSortChange(column.sortField, sortDirection);
    }
  };

  useEffect(() => {
    const handleClickOutside = () => setOpenSearchColumn(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <DataTable
        columns={columns}
        data={families}
        progressPending={loading}
        pagination
        paginationServer
        paginationTotalRows={totalRows}
        onChangeRowsPerPage={handlePerRowsChange}
        onChangePage={handlePageChange}
        paginationPerPage={perPage}
        paginationRowsPerPageOptions={[10, 20, 30, 50]}
        onSort={handleSort}
        sortServer
        defaultSortFieldId={currentSortField}
        defaultSortAsc={currentSortDirection === 'asc'}
        fixedHeader
        persistTableHead={true}
        highlightOnHover
        pointerOnHover
        responsive
        noDataComponent={<div className="py-16 text-center text-gray-500">No family members found.</div>}
      />
    </div>
  );
}