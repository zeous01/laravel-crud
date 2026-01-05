import DataTable from 'react-data-table-component';
import { Link } from 'react-router-dom';

export default function EmployeeList({
  employees,
  onDelete,
  loading,
  totalRows,
  handlePageChange,
  handlePerRowsChange,
  perPage,
}) {
  const columns = [
    // ... same columns as before
    {
      name: 'Name',
      selector: row => row.name,
      sortable: true,
      grow: 2,
    },
    {
      name: 'Email',
      selector: row => row.email,
      sortable: true,
    },
    {
      name: 'Designation',
      selector: row => row.designation,
      sortable: true,
    },
    {
      name: 'Department',
      selector: row => row.department,
      sortable: true,
    },
    {
      name: 'Family Members',
      selector: row => row.families?.length || 0,
      sortable: true,
      center: true,
      width: '150px',
    },
    {
      name: 'Actions',
      cell: row => (
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

  const customStyles = { /* same as before */ };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <DataTable
        columns={columns}
        data={employees}
        progressPending={loading}
        progressComponent={<div className="p-8 text-center">Loading...</div>}
        pagination
        paginationServer
        paginationTotalRows={totalRows}
        onChangeRowsPerPage={handlePerRowsChange}
        onChangePage={handlePageChange}
        paginationPerPage={perPage}
        paginationRowsPerPageOptions={[10, 20, 30, 50]}
        highlightOnHover
        pointerOnHover
        responsive
        customStyles={customStyles}
        noDataComponent={
          <div className="text-center py-12 text-gray-500">
            No employees found.
          </div>
        }
      />
    </div>
  );
}