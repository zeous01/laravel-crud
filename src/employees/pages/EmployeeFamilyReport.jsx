// src/pages/EmployeeFamilyReport.jsx

import { useState, useEffect, useMemo } from 'react';
import DataTable from 'react-data-table-component';
import { employeeApi } from '../services/api';

export default function EmployeeFamilyReport() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [loadingFamily, setLoadingFamily] = useState(false);

  // Search term for filtering employees
  const [searchTerm, setSearchTerm] = useState('');

  // Load all employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoadingEmployees(true);
        const res = await employeeApi.getAll({ per_page: 1000 });
        setEmployees(res.data.data);
      } catch (err) {
        console.error(err);
        alert('Error loading employees');
      } finally {
        setLoadingEmployees(false);
      }
    };
    fetchEmployees();
  }, []);

  // Load family members when employee selected
  useEffect(() => {
    if (!selectedEmployee) {
      setFamilyMembers([]);
      return;
    }

    const fetchFamily = async () => {
      try {
        setLoadingFamily(true);
        const res = await employeeApi.getEmployeeFamilies(selectedEmployee);
        setFamilyMembers(res.data);
      } catch (err) {
        console.error(err);
        alert('Error loading family members');
      } finally {
        setLoadingFamily(false);
      }
    };
    fetchFamily();
  }, [selectedEmployee]);

  // Filtered employees based on search term (with debounce feel via useMemo)
  const filteredEmployees = useMemo(() => {
    if (!searchTerm.trim()) return employees;

    const lowerSearch = searchTerm.toLowerCase();
    return employees.filter(emp =>
      emp.name.toLowerCase().includes(lowerSearch) ||
      emp.designation.toLowerCase().includes(lowerSearch) ||
      (emp.department && emp.department.toLowerCase().includes(lowerSearch))
    );
  }, [employees, searchTerm]);

  const selectedEmpName = employees.find(e => e.id == selectedEmployee)?.name || 'Select an employee';

  const columns = [
    {
      name: 'Family Member Name',
      selector: row => row.name,
      sortable: true,
      grow: 2,
    },
    {
      name: 'Relation',
      selector: row => row.relation,
      sortable: true,
      cell: row => (
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
          row.relation === 'Spouse' ? 'bg-purple-100 text-purple-800' :
          row.relation === 'Son' ? 'bg-blue-100 text-blue-800' :
          row.relation === 'Daughter' ? 'bg-pink-100 text-pink-800' :
          ['Father', 'Mother'].includes(row.relation) ? 'bg-green-100 text-green-800' :
          'bg-gray-100 text-gray-700'
        }`}>
          {row.relation}
        </span>
      ),
    },
    {
      name: 'Contact',
      selector: row => row.contact || '-',
      sortable: true,
    },
    {
      name: 'CNIC',
      selector: row => row.cnic || '-',
      sortable: true,
    },
    {
      name: 'Address',
      selector: row => row.address || '-',
      sortable: true,
      grow: 2,
    },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Employee Family Report
      </h1>

      {/* Searchable Employee Selector */}
      <div className="mb-10 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <label className="block text-lg font-medium text-gray-700 mb-4">
          Search & Select Employee
        </label>

        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Type to search employee by name, designation, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-lg px-5 py-4 pr-12 text-base border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition shadow-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl"
            >
              ×
            </button>
          )}
        </div>

        {/* Dropdown List */}
        <select
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
          disabled={loadingEmployees}
          size={Math.min(filteredEmployees.length, 10)} // max 10 visible
          className="w-full max-w-lg mt-4 px-5 py-3 text-base border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition shadow-sm block h-auto"
          style={{ height: 'auto' }}
        >
          {!searchTerm && (
            <option value="" disabled>
              -- Type to search or select below --
            </option>
          )}
          {filteredEmployees.length === 0 ? (
            <option value="" disabled>
              No employees found
            </option>
          ) : (
            filteredEmployees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.designation} - {emp.department || 'N/A'})
              </option>
            ))
          )}
        </select>

        {loadingEmployees && (
          <p className="mt-4 text-sm text-gray-500">Loading employees...</p>
        )}
        {searchTerm && filteredEmployees.length > 0 && (
          <p className="mt-2 text-sm text-blue-600">
            {filteredEmployees.length} employee{filteredEmployees.length !== 1 ? 's' : ''} found
          </p>
        )}
      </div>

      {/* Selected Employee Header */}
      {selectedEmployee && (
        <div className="mb-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
          <h2 className="text-2xl font-semibold text-blue-900">
            Family Members of: <span className="text-blue-700 font-bold">{selectedEmpName}</span>
          </h2>
          <p className="text-sm text-blue-600 mt-1">
            Total: {familyMembers.length} family member{familyMembers.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Family Table */}
      <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
        <DataTable
          columns={columns}
          data={familyMembers}
          progressPending={loadingFamily}
          progressComponent={
            <div className="p-12 text-center text-gray-600">
              Loading family members...
            </div>
          }
          noDataComponent={
            <div className="p-16 text-center">
              <p className="text-xl text-gray-500">
                {selectedEmployee
                  ? 'No family members found for this employee.'
                  : 'Please select an employee to view their family details.'}
              </p>
            </div>
          }
          pagination
          paginationPerPage={10}
          paginationRowsPerPageOptions={[5, 10, 20]}
          highlightOnHover
          pointerOnHover
          responsive
          fixedHeader
          fixedHeaderScrollHeight="600px"
          persistTableHead={true}
        />
      </div>
    </div>
  );
}