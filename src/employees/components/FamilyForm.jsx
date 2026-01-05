// src/employees/components/FamilyForm.jsx (Reusable for Add & Edit Family)
import { useState } from 'react';

export default function FamilyForm({ initialData = {}, onSubmit, onCancel, submitLabel = 'Save' }) {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    relation: initialData.relation || '',
    contact: initialData.contact || '',
    cnic: initialData.cnic || '',
    address: initialData.address || '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded bg-gray-50 grid grid-cols-1 md:grid-cols-2 gap-4">
      <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" required className="p-2 border rounded" />
      <select
  name="relation"
  value={formData.relation}
  onChange={handleChange}
  required
  className="p-2 border rounded"
>
  <option value="">Select Relation</option>
  <option value="spouse">Spouse</option>
  <option value="child">Child</option>
  <option value="parent">Parent</option>
  <option value="sibling">Sibling</option>
</select>
      <input name="contact" value={formData.contact} onChange={handleChange} placeholder="Contact" className="p-2 border rounded" />
      <input name="cnic" value={formData.cnic} onChange={handleChange} placeholder="CNIC" className="p-2 border rounded" />
      <textarea name="address" value={formData.address} onChange={handleChange} placeholder="Address" className="p-2 border rounded md:col-span-2" rows="3" />
      <div className="mt-4 flex gap-2 md:col-span-2">
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
          {submitLabel}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-500 text-white rounded">
          Cancel
        </button>
      </div>
    </form>
  );
}