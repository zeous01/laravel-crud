import DataTable from 'react-data-table-component';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

export default function EmployeeList({
  employees,
  onDelete,
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
              hasFilter
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {isOpen ? <X size={18} /> : <Search size={18} />}
            {hasFilter && !isOpen && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>
        </div>

        {/* Inline search dropdown – thead ke neeche */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 z-20 bg-white border border-gray-300 rounded-lg shadow-xl">
            <div className="p-3 w-60">
              <input
                type="text"
                placeholder={`Search ${label}...`}
                value={value}
                onChange={(e) =>
                  onSearchChange({ ...searchFilters, [columnName]: e.target.value })
                }
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
      name: <SearchableHeader columnName="name" label="Name" />,
      selector: (row) => row.name,
      sortable: true,
      sortField: 'name',
      grow: 2,
    },
    {
      name: <SearchableHeader columnName="email" label="Email" />,
      selector: (row) => row.email,
      sortable: true,
      sortField: 'email',
    },
    {
      name: <SearchableHeader columnName="designation" label="Designation" />,
      selector: (row) => row.designation,
      sortable: true,
      sortField: 'designation',
    },
    {
      name: <SearchableHeader columnName="department" label="Department" />,
      selector: (row) => row.department,
      sortable: true,
      sortField: 'department',
    },
    {
      name: 'Family Members',
      selector: (row) => row.families?.length || 0,
      sortable: false,
      center: true,
      width: '150px',
    },
    {
      name: 'Actions',
      cell: (row) => (
        <div className="flex gap-2">
          <Link
            to={`/employees/${row.id}`}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            View / Edit
          </Link>
          <button
            onClick={() => onDelete(row)}
            className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: '220px',
    },
  ];

  const handleSort = (column, sortDirection) => {
    if (column.sortField) {
      onSortChange(column.sortField, sortDirection);
    }
  };

  // Click outside → close search
  useEffect(() => {
    const handleClickOutside = () => setOpenSearchColumn(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Esc key → close search
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setOpenSearchColumn(null);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  // Custom No Data Component – Header ko chhupne se bachata hai
  const CustomNoData = () => (
    <div className="py-16 text-center">
      <p className="text-xl text-gray-600 font-medium">No employees found</p>
      <p className="text-sm text-gray-500 mt-2">
        Try adjusting your search filters or add a new employee.
      </p>
    </div>
  );

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <DataTable
        columns={columns}
        data={employees}
        progressPending={loading}
        progressComponent={<div className="p-12 text-center text-gray-600">Loading employees...</div>}
        pagination
        paginationServer
        paginationTotalRows={totalRows}
        onChangeRowsPerPage={handlePerRowsChange}
        onChangePage={handlePageChange}
        paginationPerPage={perPage}
        persistTableHead={true}
        paginationRowsPerPageOptions={[10, 20, 30, 50, 100]}
        paginationComponentOptions={{
          rowsPerPageText: 'Rows per page:',
          rangeSeparatorText: 'of',
        }}
        onSort={handleSort}
        sortServer
        defaultSortFieldId={currentSortField}
        defaultSortAsc={currentSortDirection === 'asc'}
        highlightOnHover
        pointerOnHover
        responsive
        fixedHeader // Header scroll pe bhi dikhega
        fixedHeaderScrollHeight="700px" // Table height – adjust as needed
        noDataComponent={<CustomNoData />} // Yeh important hai!
      />
    </div>
  );
}