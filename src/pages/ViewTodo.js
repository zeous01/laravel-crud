import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

function ViewTodo() {
  const { id } = useParams();
  const [todo, setTodo] = useState(null);
  const [loading, setLoading] = useState(true);

  

  useEffect(() => {
    const fetchTodo = async () => {
    try {
      const res = await axios.get(`/api/tasks/${id}`);
      setTodo(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };
    fetchTodo();
  }, [id]);

  if (loading) return <p className="text-center">Loading...</p>;
  if (!todo) return <p className="text-center text-red-500">Todo not found</p>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">Todo Details</h1>

        <table className="table-auto w-full text-left">
          <thead>
            <tr>
              <th className="px-4 py-2 text-gray-700">Field</th>
              <th className="px-4 py-2 text-gray-700">Details</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-4 py-2 font-semibold text-gray-700">Title</td>
              <td className="px-4 py-2 text-gray-800">{todo.title}</td>
            </tr>
            <tr>
              <td className="px-4 py-2 font-semibold text-gray-700">Status</td>
              <td className="px-4 py-2">
                <span
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    todo.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {todo.completed ? 'Completed' : 'Pending'}
                </span>
              </td>
            </tr>
            {todo.description && (
              <tr>
                <td className="px-4 py-2 font-semibold text-gray-700">Description</td>
                <td className="px-4 py-2 text-gray-600">{todo.description}</td>
              </tr>
            )}
            <tr>
              <td className="px-4 py-2 font-semibold text-gray-700">Created At</td>
              <td className="px-4 py-2 text-gray-600">{new Date(todo.created_at).toLocaleDateString()}</td>
            </tr>
          </tbody>
        </table>

        <div className="flex gap-4 mt-6">
          <Link
            to={`/edit/${todo.id}`}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Edit Todo
          </Link>
          <Link
            to="/"
            className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400"
          >
            ← Back to List
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ViewTodo;
