import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';

function TodoList() {
  // 1. Pagination States: Humne current page aur limit set kiya hai
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
//
  // Search aur Sort states
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');

  const [todosPerPage, setTodosPerPage] = useState(5);
const [totalItems, setTotalItems] = useState(0);        // NEW
const [totalPages, setTotalPages] = useState(1);        // NEW
const [pageInput, setPageInput] = useState('');
const [currentPage, setCurrentPage] = useState(1);      // For jump to page

  // 2. useEffect: Jab search, sort, ya PAGE change hoga, tab data fetch hoga
  useEffect(() => {
    fetchTodos();
  }, [searchQuery, sortOrder, currentPage, todosPerPage]);

  const fetchTodos = async () => {
  try {
    setLoading(true);

    const params = new URLSearchParams();

    if (searchQuery.trim() !== '') {
      params.append('search', searchQuery.trim());
    }

    if (sortOrder === 'newest') {
      params.append('sort', '-id');
    } else if (sortOrder === 'oldest') {
      params.append('sort', 'id');
    }

    params.append('page', currentPage);
    params.append('limit', todosPerPage);

    let url = '/api/tasks';
    const queryString = params.toString();
    if (queryString) url += '?' + queryString;

    const res = await axios.get(url);
    console.log('Fetched response: ', res)

    // Laravel paginate returns: { data: [...], total: X, current_page: Y, last_page: Z }
    setTodos(res.data.data);
    setTotalItems(res.data.total);
    setTotalPages(res.data.last_page);
    setCurrentPage(res.data.current_page); // sync in case of invalid page

  } catch (err) {
    console.error(err);
    alert('Failed to load todos.');
  } finally {
    setLoading(false);
  }
};

const downloadPDFbyBackend = async (todo) => {
  try {
    const response = await axios.get(`/api/tasks/${todo.id}/download-pdf`, {
      responseType: 'blob', // ← Comment kar do temporarily
    });
    const url = window.URL.createObjectURL(response.data); // direct response.data (already Blob)
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `todo_${todo.id}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

  } catch (err) {
    if (err.response) {
      // Agar text response aaya ho
      if (err.response.data instanceof Blob) {
        // Blob ko text mein convert karo
        const text = await err.response.data.text();
        console.error('Server error:', text);
        alert('Server Error: Check console');
      } else {
        console.error(err.response.data);
      }
    }
  }
};

const downloadPDFbyFrontend = (todo) => {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(22);
  doc.setTextColor(79, 70, 229); // indigo
  doc.text('Todo Details', 105, 20, { align: 'center' });

  // Generated date
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleDateString('en-GB')}`, 105, 30, { align: 'center' });

  // Separator line
  doc.setDrawColor(79, 70, 229);
  doc.setLineWidth(0.5);
  doc.line(20, 40, 190, 40);

  // Data rows
  let y = 55;
  const labelX = 30;
  const valueX = 80;
  const lineHeight = 12;

  const addRow = (label, value) => {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text(`${label}:`, labelX, y);

    doc.setFont('helvetica', 'normal');
    const splitValue = doc.splitTextToSize(String(value || '-'), 100);
    doc.text(splitValue, valueX, y);

    y += lineHeight * Math.max(1, splitValue.length);
  };

  addRow('ID', todo.id);
  addRow('Title', todo.title);
  addRow('Description', todo.description);
  addRow('Status', todo.completed ? 'Completed' : 'Pending');
  addRow('Created At', new Date(todo.created_at).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }));

  // Footer line
  doc.setDrawColor(200);
  doc.line(20, y + 10, 190, y + 10);

  // Download
  doc.save(`todo_${todo.id}.pdf`);
};

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setCurrentPage(1); // Search change hone pe page 1 pe wapis jao
  };

  const deleteTodo = async (id) => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      await axios.delete(`/api/tasks/${id}`);
      fetchTodos();
    }
  };

  // 4. Pagination Handlers
  const handleNextPage = () => {
    setCurrentPage((prev) => prev + 1);
  };



  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const toggleComplete = async (todo) => {
    await axios.put(`/api/tasks/${todo.id}`, {
      ...todo,
      completed: !todo.completed,
    });
    fetchTodos();
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-gray-500">Loading todos...</p>
      </div>
    );
  }

  console.log('Todos:', todos.length);
  console.log('Todos:', todos);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">All Todos</h1>

      {/* Search and Sort UI */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white p-5 rounded-xl shadow-md">

        <div className="flex gap-3 w-full sm:w-auto">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search in title..."
            className="flex-1 px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleSearch}
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 font-medium transition whitespace-nowrap"
          >
            Search
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-gray-600 font-medium">Sort by:</span>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-5 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {todos.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-lg">
          <p className="text-xl text-gray-500 mb-4">
            {searchQuery ? 'No todos found matching your search.' : 'No todos yet.'}
          </p>
          {/* Show Prev button even if empty so user can go back if they went too far */}
          {currentPage > 1 && (
            <button
              onClick={handlePrevPage}
              className="mt-4 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Go Back to Page {currentPage - 1}
            </button>
          )}

          <Link
            to="/create"
            className="block mt-6 text-indigo-600 font-medium hover:underline"
          >
            + Create New Todo
          </Link>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto bg-white rounded-xl shadow-lg">
            <table className="min-w-full table-auto text-left">
              <thead className="bg-indigo-50 border-b border-indigo-200">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-indigo-800 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-4 text-sm font-semibold text-indigo-800 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-sm font-semibold text-indigo-800 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-sm font-semibold text-indigo-800 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {todos.map((todo) => (
                  <tr key={todo.id} className={`hover:bg-gray-50 transition ${todo.completed ? 'bg-green-50' : ''}`}>
                    <td className="px-6 py-4 text-sm">
                      <span className={`font-medium ${todo.completed ? 'line-through text-green-700' : 'text-gray-900'}`}>
                        {todo.title}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {todo.description || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => toggleComplete(todo)}
                        className={`px-4 py-2 rounded-full text-xs font-medium transition ${todo.completed
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          }`}
                      >
                        {todo.completed ? 'Completed' : 'Pending'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm space-x-4">
                      <Link to={`/todo/${todo.id}`} className="text-indigo-600 hover:text-indigo-800 font-medium">View</Link>
                      <Link to={`/edit/${todo.id}`} className="text-blue-600 hover:text-blue-800 font-medium">Edit</Link>
                      <button onClick={() => deleteTodo(todo.id)} className="text-red-600 hover:text-red-800 font-medium">
                        Delete
                      </button>
                      <button onClick={() => downloadPDFbyFrontend(todo)} className="text-green-600 hover:text-blue-800 font-medium">
                        Download PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 5. Pagination UI Controls */}
          {/* Advanced Pagination Controls */}
<div className="mt-8 bg-white rounded-xl shadow-lg p-6">
  <div className="flex flex-col sm:flex-row justify-between items-center gap-6">

    {/* Left: Items per page selector */}
    <div className="flex items-center gap-3">
      <span className="text-gray-700 font-medium">Show:</span>
      <select
        value={todosPerPage}
        onChange={(e) => {
          setTodosPerPage(Number(e.target.value));
          setCurrentPage(1); // Reset to page 1 when changing limit
        }}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value={5}>5</option>
        <option value={10}>10</option>
        <option value={20}>20</option>
        <option value={50}>50</option>
      </select>
      <span className="text-gray-600">per page</span>
    </div>

    {/* Center: Page info + Jump to page */}
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <span className="text-gray-700 font-medium">
        Page {currentPage} of {totalPages} 
        {' '} ({totalItems} total items)
      </span>

      <div className="flex items-center gap-2">
        <span className="text-gray-600">Go to:</span>
        <input
          type="number"
          min="1"
          max={totalPages}
          value={pageInput}
          onChange={(e) => setPageInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const page = parseInt(pageInput);
              if (page >= 1 && page <= totalPages) {
                setCurrentPage(page);
                setPageInput('');
              }
            }
          }}
          placeholder={currentPage}
          className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center"
        />
      </div>
    </div>

    {/* Right: Prev / Next buttons */}
    <div className="flex gap-3">
      <button
        onClick={handlePrevPage}
        disabled={currentPage === 1}
        className={`px-6 py-2 rounded-lg font-medium transition ${
          currentPage === 1
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
        }`}
      >
        Previous
      </button>

      <button
        onClick={handleNextPage}
        disabled={currentPage === totalPages || totalPages === 0}
        className={`px-6 py-2 rounded-lg font-medium transition ${
          currentPage === totalPages || totalPages === 0
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
        }`}
      >
        Next
      </button>
    </div>
  </div>
</div>
        </>
      )}
    </div>
  );
}

export default TodoList;