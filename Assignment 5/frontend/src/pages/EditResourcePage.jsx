import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchResourceById, updateResource } from '../api/resources';
import ResourceForm from '../components/ResourceForm';
import Toast from '../components/Toast';

export default function EditResourcePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await fetchResourceById(id);
        setResource(data);
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to load resource.';
        setToast({ message: msg, type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleSubmit = async (formData) => {
    try {
      await updateResource(id, formData);
      setToast({ message: 'Resource updated successfully!', type: 'success' });
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Failed to update resource. Please try again.';
      setToast({ message: msg, type: 'error' });
    }
  };

  if (loading) return <p className="loading-text">Loading resource…</p>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Edit Resource</h1>
      </div>
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
      <div className="form-container">
        {resource ? (
          <ResourceForm
            initialData={resource}
            onSubmit={handleSubmit}
            submitLabel="Update Resource"
          />
        ) : (
          <p>Resource not found.</p>
        )}
      </div>
    </div>
  );
}
