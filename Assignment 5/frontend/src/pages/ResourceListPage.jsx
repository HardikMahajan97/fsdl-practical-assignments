import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchResources, deleteResource } from '../api/resources';
import Toast from '../components/Toast';

const DIFFICULTY_BADGE = {
  Beginner: 'badge-green',
  Intermediate: 'badge-yellow',
  Advanced: 'badge-red',
};

export default function ResourceListPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const loadResources = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await fetchResources();
      setResources(data);
    } catch {
      setToast({ message: 'Failed to load resources.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    try {
      await deleteResource(id);
      setToast({ message: `"${title}" deleted successfully.`, type: 'success' });
      setResources((prev) => prev.filter((r) => r._id !== id));
    } catch {
      setToast({ message: 'Failed to delete resource.', type: 'error' });
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>All Resources</h1>
        <Link to="/add" className="btn btn-primary">
          + Add Resource
        </Link>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />

      {loading ? (
        <p className="loading-text">Loading resources…</p>
      ) : resources.length === 0 ? (
        <div className="empty-state">
          <p>No resources yet.</p>
          <Link to="/add" className="btn btn-primary">
            Add your first resource
          </Link>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="resource-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Subject</th>
                <th>Type</th>
                <th>Difficulty</th>
                <th>Link</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((r) => (
                <tr key={r._id}>
                  <td>{r.title}</td>
                  <td>{r.subject}</td>
                  <td>
                    <span className="badge badge-blue">{r.type}</span>
                  </td>
                  <td>
                    <span className={`badge ${DIFFICULTY_BADGE[r.difficulty] || ''}`}>
                      {r.difficulty}
                    </span>
                  </td>
                  <td>
                    {r.link ? (
                      <a href={r.link} target="_blank" rel="noreferrer" className="resource-link">
                        Open ↗
                      </a>
                    ) : (
                      <span className="no-link">—</span>
                    )}
                  </td>
                  <td className="actions">
                    <Link to={`/edit/${r._id}`} className="btn btn-sm btn-secondary">
                      Edit
                    </Link>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(r._id, r.title)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
