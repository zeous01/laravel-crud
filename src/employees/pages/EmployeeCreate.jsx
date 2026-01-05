// src/employees/pages/EmployeeCreate.jsx
import { useNavigate } from 'react-router-dom';
import EmployeeForm from '../components/EmployeeForm';
import { employeeApi } from '../services/api';

export default function EmployeeCreate() {
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    try {
      await employeeApi.create(data);
      navigate('/employees');
    } catch (err) {
      alert(err.response?.data?.message || 'Create failed');
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Create New Employee</h1>
      <EmployeeForm onSubmit={handleSubmit} submitLabel="Create" />
    </div>
  );
}