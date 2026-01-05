import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import EmployeeList from '../components/EmployeeList';
import { employeeApi } from '../services/api';

export default function EmployeeIndex() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);

  // Server-side search filters (per column)
  const [searchFilters, setSearchFilters] = useState({
    name: '',
    email: '',
    designation: '',
    department: '',
  });

  const debounceTimeout = useRef(null);

  const debouncedLoadEmployees = () => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      setCurrentPage(1); // search change pe page 1 pe jao
      loadEmployees();
    }, 600); // 600ms delay – adjust kar sakte ho (500-800 acha hai)
  };

  // Server-side sorting
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: perPage,
        sort_field: sortField,
        sort_direction: sortDirection,
        // Only send non-empty filters
        ...Object.fromEntries(
          Object.entries(searchFilters).filter(([_, value]) => value.trim() !== '')
        ),
      };

      const res = await employeeApi.getAll(params);
      const paginatedData = res.data;

      setEmployees(paginatedData.data);
      setTotalRows(paginatedData.total);
      setPerPage(paginatedData.per_page);
      setCurrentPage(paginatedData.current_page);
    } catch (err) {
      console.error(err);
      alert('Error loading employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    debouncedLoadEmployees();

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [searchFilters]);

  // Reload whenever any filter, sort, page, or perPage changes
  useEffect(() => {
    loadEmployees();
  }, [currentPage, perPage, sortField, sortDirection]);

  // Initial load
  useEffect(() => {
    loadEmployees();
  }, []);

  const handleDelete = async (emp) => {
    if (!window.confirm(`Delete ${emp.name}?`)) return;

    try {
      await employeeApi.delete(emp.id);
      loadEmployees(); // reload same page
    } catch (err) {
      alert('Delete failed');
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePerRowsChange = (newPerPage, page) => {
    setPerPage(newPerPage);
    setCurrentPage(page);
  };

  const handleSearchChange = (newFilters) => {
    setSearchFilters(newFilters);
    setCurrentPage(1); // important: search change → go to page 1
  };

  const handleSortChange = (field, direction) => {
    setSortField(field);
    setSortDirection(direction);
    setCurrentPage(1); // sort change → page 1
  };

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

      {/* Global search removed – ab per-column search hai table mein */}

      <EmployeeList
        employees={employees}
        onDelete={handleDelete}
        loading={loading}
        totalRows={totalRows}
        handlePageChange={handlePageChange}
        handlePerRowsChange={handlePerRowsChange}
        perPage={perPage}
        
        // New props for server-side control
        searchFilters={searchFilters}
        onSearchChange={handleSearchChange}
        currentSortField={sortField}
        currentSortDirection={sortDirection}
        onSortChange={handleSortChange}
      />
    </div>
  );
}