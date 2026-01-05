import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import TodoList from './pages/TodoList';
import CreateTodo from './pages/CreateTodo';
import ViewTodo from './pages/ViewTodo';
import EditTodo from './pages/EditTodo';
import EmployeeIndex from './employees/pages/EmployeeIndex';
import EmployeeCreate from './employees/pages/EmployeeCreate';
import EmployeeDetail from './employees/pages/EmployeeDetail';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-indigo-600">
            My Todo App
          </Link>
          <div className="space-x-6">
            <Link
              to="/"
              className="text-gray-700 hover:text-indigo-600 font-medium transition"
            >
              All Todos
            </Link>
            <Link
              to="/create"
              className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition font-medium"
            >
              + Add Todo
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<TodoList />} />
          <Route path="/create" element={<CreateTodo />} />
          <Route path="/todo/:id" element={<ViewTodo />} />
          <Route path="/edit/:id" element={<EditTodo />} />
          <Route path="/employees" element={<EmployeeIndex />} />
        <Route path="/employees/create" element={<EmployeeCreate />} />
        <Route path="/employees/:id" element={<EmployeeDetail />} />
        </Routes>
      </main>

      {/* Optional Footer */}
      <footer className="bg-white border-t mt-16 py-6">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-500 text-sm">
          © 2026 My Todo App • Built with Laravel + React + Tailwind CSS
        </div>
      </footer>
    </div>
  );
}

export default App;