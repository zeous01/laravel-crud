import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function EditTodo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  

  useEffect(() => {
    const fetchTodo = async () => {
        try {
        const res = await axios.get(`/api/tasks/${id}`);
        setTitle(res.data.title);
        setDescription(res.data.description || '');
        setCompleted(res.data.completed);
        setLoading(false);
      } catch (err) {
        alert('Failed to load todo');
        setLoading(false);
      }
    };
    fetchTodo();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/todos/${id}`, {
        title,
        description,
        completed,
      });
      navigate(`/todo/${id}`);
    } catch (err) {
      alert('Failed to update');
    }
  };

  if (loading) return <p className="text-center">Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Edit Todo</h1>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg">
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="5"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="mb-8">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={completed}
              onChange={(e) => setCompleted(e.target.checked)}
              className="mr-3 h-5 w-5 text-indigo-600"
            />
            <span className="text-gray-700 font-medium">Mark as completed</span>
          </label>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-medium"
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={() => navigate(`/todo/${id}`)}
            className="bg-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditTodo;