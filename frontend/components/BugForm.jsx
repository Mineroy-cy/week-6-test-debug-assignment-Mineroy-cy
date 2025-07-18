import React, { useState } from 'react';
import PropTypes from 'prop-types';

const initialState = { title: '', description: '', status: 'open' };
const DESCRIPTION_MAX = 1000;

export default function BugForm({ onSubmit, loading, error }) {
  const [form, setForm] = useState(initialState);
  const [formError, setFormError] = useState('');
  const [focus, setFocus] = useState({ title: false, description: false, status: false });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormError('');
  };

  const handleFocus = (e) => {
    setFocus((prev) => ({ ...prev, [e.target.name]: true }));
  };
  const handleBlur = (e) => {
    setFocus((prev) => ({ ...prev, [e.target.name]: false }));
  };

  const labelClass = (field, value) =>
    `absolute left-4 transition-all duration-200 bg-white px-1 pointer-events-none ` +
    ((focus[field] || value) ?
      '-top-3 text-xs text-blue-600' :
      'top-1/2 -translate-y-1/2 text-base text-gray-400');

  // For select, float label if focused or value is not 'open'
  const statusLabelClass = (focused, value) =>
    `absolute left-4 transition-all duration-200 bg-white px-1 pointer-events-none ` +
    ((focused || value !== 'open') ?
      '-top-3 text-xs text-blue-600' :
      'top-1/2 -translate-y-1/2 text-base text-gray-400');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      setFormError('Title and description are required.');
      return;
    }
    onSubmit(form, () => setForm(initialState));
  };

  return (
    <form className="w-full bg-white rounded-xl shadow p-6 flex flex-col gap-6" onSubmit={handleSubmit} aria-labelledby="bug-form-title">
      <h2 id="bug-form-title" className="text-2xl font-bold text-blue-700 mb-2">Report a New Bug</h2>
      <div className="relative mb-2">
        <input
          id="title"
          name="title"
          type="text"
          value={form.title}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          maxLength={100}
          required
          className="pl-4 pr-3 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-base bg-gray-50 text-black peer"
          placeholder="Title"
          aria-required="true"
          aria-label="Bug Title"
        />
        <label htmlFor="title" className={labelClass('title', form.title)}>
          Title
        </label>
        <span className="block text-xs text-gray-400 mt-1 ml-4">Short, descriptive bug title (max 100 chars)</span>
      </div>
      <div className="relative mb-2">
        <textarea
          id="description"
          name="description"
          value={form.description}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          maxLength={DESCRIPTION_MAX}
          required
          className="pl-4 pr-3 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-base bg-gray-50 min-h-[90px] resize-vertical text-black peer"
          placeholder="Description"
          aria-required="true"
          aria-label="Bug Description"
        />
        <label htmlFor="description" className={labelClass('description', form.description)}>
          Description
        </label>
        <span className="block text-xs text-gray-400 mt-1 ml-4">Detailed bug description (max {DESCRIPTION_MAX} chars)
          <span className="float-right text-blue-500">{form.description.length}/{DESCRIPTION_MAX}</span>
        </span>
      </div>
      <div className="relative mb-2">
        <select
          id="status"
          name="status"
          value={form.status}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="pl-4 pr-3 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-base bg-gray-50 text-black"
          aria-label="Bug Status"
        >
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
        <label htmlFor="status" className={statusLabelClass(focus.status, form.status)}>
          Status
        </label>
      </div>
      {formError && <div className="text-red-600 bg-red-50 border border-red-200 rounded p-2 text-sm" role="alert">{formError}</div>}
      {error && <div className="text-red-600 bg-red-50 border border-red-200 rounded p-2 text-sm" role="alert">{error}</div>}
      <button type="submit" className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow transition disabled:opacity-60 disabled:cursor-not-allowed" disabled={loading} aria-busy={loading}>
        {loading ? 'Submitting...' : 'Submit Bug'}
      </button>
    </form>
  );
}

BugForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string,
};
