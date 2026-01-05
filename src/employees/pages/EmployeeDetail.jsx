import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { employeeApi } from '../services/api';

export default function EmployeeDetail() {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [families, setFamilies] = useState([]);
  const [showFamilyForm, setShowFamilyForm] = useState(false);
  const [editingFamily, setEditingFamily] = useState(null);
  const [formData, setFormData] = useState({ name: '', relation: '', contact: '', cnic: '', address: '' });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [empRes, famRes] = await Promise.all([
        employeeApi.getOne(id),
        employeeApi.getFamilies(id)
      ]);
      setEmployee(empRes.data);
      setFamilies(famRes.data);
    } catch (err) {
      alert('Error loading data');
    }
  };

  const handleFamilySubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFamily) {
        await employeeApi.updateFamily(id, editingFamily.id, formData);
      } else {
        await employeeApi.addFamily(id, formData);
      }
      resetFamilyForm();
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving family member');
    }
  };

  const resetFamilyForm = () => {
    setFormData({ name: '', relation: '', contact: '', cnic: '', address: '' });
    setEditingFamily(null);
    setShowFamilyForm(false);
  };

  const handleEditFamily = (fam) => {
    setFormData(fam);
    setEditingFamily(fam);
    setShowFamilyForm(true);
  };

  const handleDeleteFamily = async (famId) => {
    if (!window.confirm('Delete this family member?')) return;
    try {
      await employeeApi.deleteFamily(id, famId);
      loadData();
    } catch (err) {
      alert('Delete failed');
    }
  };

  if (!employee) return <p>Loading...</p>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link to="/employees" className="text-blue-600 hover:underline mb-4 inline-block">
        ← Back to List
      </Link>

      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h1 className="text-3xl font-bold mb-4">{employee.name}</h1>
        <p><strong>Email:</strong> {employee.email}</p>
        <p><strong>Department:</strong> {employee.department}</p>
        <p><strong>Designation:</strong> {employee.designation}</p>
        <p><strong>City:</strong> {employee.city}</p>
        <p><strong>Contact:</strong> {employee.contact}</p>
        <p><strong>CNIC:</strong> {employee.cnic}</p>
        <p><strong>Address:</strong> {employee.address}</p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Family Members ({families.length})</h2>
          <button
            onClick={() => setShowFamilyForm(true)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Add Family Member
          </button>
        </div>

        {showFamilyForm && (
          <form onSubmit={handleFamilySubmit} className="mb-6 p-4 border rounded bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">
              {editingFamily ? 'Edit' : 'Add'} Family Member
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <input
                required
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="p-2 border rounded"
              />
              <select
  name="relation"
  value={formData.relation}
  onChange= {(e) => setFormData({ ...formData, relation: e.target.value })}
  required
  className="p-2 border rounded"
>
  <option value="">Select Relation</option>
  <option value="spouse">Spouse</option>
  <option value="child">Child</option>
  <option value="parent">Parent</option>
  <option value="sibling">Sibling</option>
</select>
              <input
                placeholder="Contact"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                className="p-2 border rounded"
              />
              <input
                placeholder="CNIC"
                value={formData.cnic}
                onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                className="p-2 border rounded"
              />
              <textarea
                placeholder="Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="p-2 border rounded col-span-2"
                rows="3"
              />
            </div>
            <div className="mt-4 flex gap-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
                Save
              </button>
              <button type="button" onClick={resetFamilyForm} className="px-4 py-2 bg-gray-500 text-white rounded">
                Cancel
              </button>
            </div>
          </form>
        )}

        {families.length === 0 ? (
          <p>No family members added yet.</p>
        ) : (
          <div className="space-y-4">
            {families.map((fam) => (
              <div key={fam.id} className="p-4 border rounded flex justify-between items-center">
                <div>
                  <strong>{fam.name}</strong> ({fam.relation})
                  <p className="text-sm text-gray-600">Contact: {fam.contact || '-'}</p>
                  <p className="text-sm text-gray-600">CNIC: {fam.cnic || '-'}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditFamily(fam)}
                    className="px-3 py-1 bg-yellow-600 text-white rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteFamily(fam.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}