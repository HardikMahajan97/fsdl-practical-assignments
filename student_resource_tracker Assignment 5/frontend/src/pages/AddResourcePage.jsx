import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createResource } from '../api/resources';
import ResourceForm from '../components/ResourceForm';
import Toast from '../components/Toast';

export default function AddResourcePage() {
  const navigate = useNavigate();
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const handleSubmit = async (formData) => {
    try {
      await createResource(formData);
      setToast({ message: 'Resource added successfully!', type: 'success' });
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Failed to add resource. Please try again.';
      setToast({ message: msg, type: 'error' });
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Add New Resource</h1>
      </div>
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
      <div className="form-container">
        <ResourceForm onSubmit={handleSubmit} submitLabel="Add Resource" />
      </div>
    </div>
  );
}
