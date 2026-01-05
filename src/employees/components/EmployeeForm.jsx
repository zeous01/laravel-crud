// src/employees/components/EmployeeForm.jsx (Reusable for Create & Edit)
import { useState } from 'react';

export default function EmployeeForm({ initialData = {}, onSubmit, submitLabel = 'Save' }) {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    email: initialData.email || '',
    contact: initialData.contact || '',
    city: initialData.city || '',
    department: initialData.department || '',
    cnic: initialData.cnic || '',
    designation: initialData.designation || '',
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
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" required className="p-2 border rounded" />
      <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" required className="p-2 border rounded" />
      <input name="contact" value={formData.contact} onChange={handleChange} placeholder="Contact" required className="p-2 border rounded" />
      <input name="city" value={formData.city} onChange={handleChange} placeholder="City" required className="p-2 border rounded" />
      <select name="department" value={formData.department} onChange={handleChange} placeholder="Department" required className="p-2 border rounded" >
        <option value="">Select Department</option>
        <option value="IT">IT</option>
        <option value="HR">HR</option>
        <option value="Finance">Finance</option>
        <option value="Marketing">Marketing</option>
      </select>
      <input name="cnic" value={formData.cnic} onChange={handleChange} placeholder="CNIC" required className="p-2 border rounded" />
      <input name="designation" value={formData.designation} onChange={handleChange} placeholder="Designation" required className="p-2 border rounded" />
      <textarea name="address" value={formData.address} onChange={handleChange} placeholder="Address" required className="p-2 border rounded md:col-span-2" rows="3" />
      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 md:col-span-2">
        {submitLabel}
      </button>
    </form>
  );
}