import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function TodoList() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const res = await axios.get('/api/tasks');
      setTodos(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const deleteTodo = async (id) => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      await axios.delete(`/api/tasks/${id}`);
      fetchTodos();
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
    return <p className="text-center text-gray-500">Loading todos...</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">All Todos</h1>

      {todos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-500">No todos yet. Create your first one!</p>
          <Link to="/create" className="mt-4 inline-block text-indigo-600 hover:underline">
            → Add a new todo
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {todos.map((todo) => (
            <div
              key={todo.id}
              className={`p-6 rounded-xl shadow-lg transition-all hover:shadow-xl ${
                todo.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
              } border`}
            >
              <div className="flex justify-between items-start mb-3">
                <h3
                  className={`text-xl font-semibold ${
                    todo.completed ? 'line-through text-green-700' : 'text-gray-800'
                  }`}
                >
                  {todo.title}
                </h3>
                <button
                  onClick={() => toggleComplete(todo)}
                  className="text-sm px-3 py-1 rounded-full bg-gray-200 hover:bg-gray-300"
                >
                  {todo.completed ? '✓ Done' : '○ Pending'}
                </button>
              </div>

              {todo.description && (
                <p className="text-gray-600 mb-4">{todo.description}</p>
              )}

              <div className="flex justify-between items-center mt-4">
                <Link
                  to={`/todo/${todo.id}`}
                  className="text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  View →
                </Link>

                <div className="space-x-3">
                  <Link
                    to={`/edit/${todo.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TodoList;