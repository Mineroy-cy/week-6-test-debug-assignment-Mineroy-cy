import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import BugForm from '../components/BugForm';
import BugList from '../components/BugList';
import ErrorBoundary from '../components/ErrorBoundary';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/bugs';

function App() {
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchBugs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(API_URL);
      setBugs(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch bugs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBugs();
  }, [fetchBugs]);

  const handleCreateBug = async (bug, resetForm) => {
    setFormLoading(true);
    setFormError('');
    try {
      await axios.post(API_URL, bug);
      resetForm();
      fetchBugs();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create bug');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteBug = async (id) => {
    setLoading(true);
    setError('');
    try {
      await axios.delete(`${API_URL}/${id}`);
      setBugs((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete bug');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    setLoading(true);
    setError('');
    try {
      const bug = bugs.find((b) => b._id === id);
      await axios.put(`${API_URL}/${id}`, { ...bug, status });
      setBugs((prev) => prev.map((b) => (b._id === id ? { ...b, status } : b)));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-900 flex flex-col">
        <header className="w-full py-8 bg-gradient-to-r from-blue-700 to-blue-500 text-white text-center shadow">
          <h1 className="text-3xl font-bold mb-1 tracking-tight">Bug Tracker</h1>
          <p className="text-blue-100 text-base">Track, update, and resolve project issues efficiently.</p>
        </header>
        <main className="flex-1 flex items-center justify-center bg-gray-900">
          <div className="w-full max-w-3xl flex flex-col gap-8 bg-white rounded-2xl shadow-2xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 my-8">
            <BugForm onSubmit={handleCreateBug} loading={formLoading} error={formError} />
            <BugList
              bugs={bugs}
              onDelete={handleDeleteBug}
              onStatusChange={handleStatusChange}
              loading={loading}
              error={error}
            />
          </div>
        </main>
        <footer className="w-full text-center py-4 text-gray-400 text-sm bg-white border-t border-gray-200">
          &copy; {new Date().getFullYear()} MERN Bug Tracker
        </footer>
      </div>
    </ErrorBoundary>
  );
}

export default App;
