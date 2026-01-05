import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import DataTable from 'react-data-table-component';

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
const [currentPage, setCurrentPage] = useState(1); // For jump to page
 

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


  // Columns define karo
  const columns = [
    {
      name: 'ID',
      selector: row => row.id,
      sortable: true,
      width: '80px',
    },
    {
      name: 'Title',
      selector: row => row.title,
      sortable: true,
      width: '250px',
      style: {
        fontWeight: 'bold',
      },
    },
    {
      name: 'Description',
      selector: row => row.description,
      sortable: true,
      width: '350px',
    },
    {
      name: 'Status',
      selector: row => row.completed ? 'Completed' : 'Pending',
      sortable: true,
      width: '200px',
      cell: row => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium text-align ${
          row.completed 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {row.completed ? 'Completed' : 'Pending'}
        </span>
      ),
    },
    {
  name: 'Actions',
  cell: (row) => (
    <div className="flex gap-4 py-2">  {/* space-x-2 ki jagah gap-4 better look deta hai */}
      {/* View Button */}
      <Link 
        to={`/todo/${row.id}`} 
        className="text-indigo-600 hover:text-indigo-900 font-medium hover:underline"
      >
        View
      </Link>

      {/* Edit Button */}
      <Link 
        to={`/edit/${row.id}`} 
        className="text-blue-600 hover:text-blue-900 font-medium hover:underline"
      >
        Edit
      </Link>

      {/* Delete Button */}
      <button
        onClick={() => deleteTodo(row.id)}
        className="text-red-600 hover:text-red-900 font-medium hover:underline"
      >
        Delete
      </button>

      {/* PDF Button - Frontend PDF generate */}
      <button
        onClick={() => downloadPDFbyFrontend(row)}
        className="text-green-600 hover:text-green-900 font-medium hover:underline"
      >
        PDF
      </button>

      {/* Optional: Backend PDF as backup */}
      {/* <button
        onClick={() => downloadPDFbyBackend(row)}
        className="text-purple-600 hover:text-purple-900 font-medium"
      >
        PDF (Server)
      </button> */}
    </div>
  ),
  ignoreRowClick: true,     // ← Ye important hai taake row click na ho
  allowOverflow: true,      // ← Buttons overflow na karein
  button: true,             // ← Ye bhi zaroori hai actions ke liye
  width: '200px',           // Optional: fixed width taake table distort na ho
},
  ];

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

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const headerHeight = 60;       // Logo + title + date space
  const footerHeight = 20;       // Page number ke liye space
  const contentBottom = pageHeight - footerHeight - 10;  // Safe bottom limit

  const logoWidth = 40;
  const logoHeight = 40;
  const logoX = margin;
  const logoY = 10;

  // Header & Footer add karne ka function (har page pe)
  const addHeaderFooter = (pageNumber, totalPages) => {
    // === HEADER ===
    doc.addImage('/images/images.png', 'PNG', logoX, logoY, logoWidth, logoHeight);

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(79, 70, 229);
    doc.text('Todo Report', pageWidth - margin, logoY + 20, { align: 'right' });

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-GB')}`, pageWidth - margin, logoY + 30, { align: 'right' });

    // === FOOTER ===
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'normal');
    // Bottom se 15mm upar (safe margin)
    doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth / 2, pageHeight - 15, { align: 'center' });

    // Optional: Footer line
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - 25, pageWidth - margin, pageHeight - 25);
  };

  // Content start position
  let y = logoY + headerHeight;

  const addRow = (label, value) => {
    const lineHeight = 7;
    const maxWidth = pageWidth - 2 * margin - 50;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, margin, y);

    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(String(value || '-'), maxWidth);
    doc.text(lines, margin + 50, y);

    y += lineHeight * lines.length + 5;

    // Agar content footer area mein ghus raha hai → new page
    if (y > contentBottom) {
      doc.addPage();
      y = logoY + headerHeight; // new page pe reset
    }
  };

  // Real Todo Data
  addRow('ID', todo.id);
  addRow('Title', todo.title);
  addRow('Description', todo.description || 'No description');
  addRow('Status', todo.completed ? 'Completed ✓' : 'Pending ○');
  addRow('Created At', new Date(todo.created_at).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }));

  // Dummy data for multi-page testing
  y += 10;
  if (y > contentBottom) { doc.addPage(); y = logoY + headerHeight; }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Dummy Long Content (for multi-page test)', margin, y);
  y += 10;

  const dummyText = "This is a long dummy text to fill the page and test pagination behavior. ".repeat(15);
  for (let i = 1; i <= 60; i++) {
    addRow(`Dummy Field ${i}`, `Value ${i}: ${dummyText}`);
  }

  // Sab pages pe header/footer laga do
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addHeaderFooter(i, totalPages);
  }

  // Save PDF
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

      {/* Search and Sort UI
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
      </div> */}

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
            {/* <table className="min-w-full table-auto text-left">
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
                      <button onClick={() => downloadPDFbyBackend(todo)} className="text-green-600 hover:text-blue-800 font-medium">
                        Download PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table> */}
           <DataTable
  columns={columns}
  data={todos}
  progressPending={loading}                    // Loading spinner
  pagination
  paginationServer                             // ← YE IMPORTANT: server-side batata hai
  paginationTotalRows={totalItems}             // Total items backend se
  paginationDefaultPage={currentPage}          // Current page sync
  paginationPerPage={todosPerPage}             // Rows per page
  paginationRowsPerPageOptions={[5, 10, 20, 50]}
  
  onChangePage={(page) => setCurrentPage(page)}                    // Page change → fetch
  onChangeRowsPerPage={(newPerPage, page) => {
    setTodosPerPage(newPerPage);
    setCurrentPage(1);  // Jab limit change ho to page 1 pe jao
  }}
  
  onSort={(column, sortDirection) => {
    // column.selector ya column.name se identify karo
    // Hum simple -id / id use kar rahe hain, lekin ab column-wise sort chahiye to extend kar sakte hain
    // Abhi ke liye newest/oldest dropdown se hi sort kar rahe ho – wo rakho
  }}

  highlightOnHover
  pointerOnHover
  striped
  responsive
  noDataComponent="No todos found 😔"
  subHeader                                    // ← Search box table ke upar dikhane ke liye
  subHeaderComponent={
    <div className=" max-w-md">
      <input
        type="text"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        placeholder="Search title or description..."
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  }
/>
          </div>

          {/* 5. Pagination UI Controls */}
          {/* Advanced Pagination Controls */}
{/* <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
  <div className="flex flex-col sm:flex-row justify-between items-center gap-6"> */}

    {/* Left: Items per page selector */}
    {/* <div className="flex items-center gap-3">
      <span className="text-gray-700 font-medium">Show:</span> */}
      {/* <select
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
    </div> */}

    {/* Center: Page info + Jump to page
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
    </div> */}

    {/* Right: Prev / Next buttons
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
</div> */}
        </>
      )}
    </div>
  );
}

export default TodoList;