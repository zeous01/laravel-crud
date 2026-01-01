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
    fetchTodo()
  }, [id]);

  if (loading) return <p className="text-center">Loading...</p>;
  if (!todo) return <p className="text-center text-red-500">Todo not found</p>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-4xl font-bold text-gray-800">{todo.title}</h1>
          <span
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              todo.completed
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {todo.completed ? 'Completed' : 'Pending'}
          </span>
        </div>

        {todo.description && (
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-700 mb-3">Description</h3>
            <p className="text-gray-600 text-lg leading-relaxed">{todo.description}</p>
          </div>
        )}

        <div className="text-sm text-gray-500 mb-8">
          Created at: {new Date(todo.created_at).toLocaleDateString()}
        </div>

        <div className="flex gap-4">
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