import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import EmployeeList from '../components/EmployeeList';
import { employeeApi } from '../services/api';

export default function EmployeeIndex() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);

  const loadEmployees = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        per_page: perPage,
        search: searchTerm || undefined, // sirf non-empty bhejo
      };

      const res = await employeeApi.getAll(params);
      const paginatedData = res.data;

      setEmployees(paginatedData.data);              // actual employees array
      setCurrentPage(paginatedData.current_page);
      setTotalRows(paginatedData.total);
      setPerPage(paginatedData.per_page);
    } catch (err) {
      console.error(err);
      alert('Error loading employees');
    } finally {
      setLoading(false);
    }
  };

  // Initial load + reload on search change
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1); // search karne pe first page pe jao
      loadEmployees(1);
    }, 500); // debounce 500ms

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Page change se reload
  useEffect(() => {
    loadEmployees(currentPage);
  }, [currentPage]);

  // Initial load
  useEffect(() => {
    loadEmployees(1);
  }, []);

  const handleDelete = async (emp) => {
    if (!window.confirm(`Delete ${emp.name}?`)) return;

    try {
      await employeeApi.delete(emp.id);
      // Reload current page after delete
      loadEmployees(currentPage);
    } catch (err) {
      alert('Delete failed');
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePerRowsChange = async (newPerPage, page) => {
    setPerPage(newPerPage);
    setCurrentPage(page);
    loadEmployees(page);
  };

  if (loading && employees.length === 0) {
    return <p className="p-8 text-center">Loading employees...</p>;
  }

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Employees</h1>
        <Link
          to="/employees/create"
          className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          Add New Employee
        </Link>
      </div>

      {/* Search Box */}
      <div className="mb-6 max-w-md">
        <input
          type="text"
          placeholder="Search by name, email, department, CNIC..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Employee Table */}
      <EmployeeList
        employees={employees}
        onDelete={handleDelete}
        loading={loading}
        totalRows={totalRows}
        handlePageChange={handlePageChange}
        handlePerRowsChange={handlePerRowsChange}
        perPage={perPage}
      />
    </div>
  );
}