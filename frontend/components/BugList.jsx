import React from 'react';
import PropTypes from 'prop-types';
import BugItem from './BugItem';

export default function BugList({ bugs, onDelete, onStatusChange, loading, error }) {
  if (loading) return <div className="text-blue-600 text-center py-6 text-lg font-medium">Loading bugs...</div>;
  if (error) return <div className="text-red-600 bg-red-50 border border-red-200 rounded p-2 text-center text-sm" role="alert">{error}</div>;
  if (!bugs.length) return <div className="text-gray-400 text-center py-6 text-base">No bugs reported yet.</div>;

  return (
    <div className="w-full bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-bold text-blue-700 mb-4">Reported Bugs</h2>
      <ul className="divide-y divide-gray-200">
        {bugs.map((bug) => (
          <BugItem
            key={bug._id}
            bug={bug}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
          />
        ))}
      </ul>
    </div>
  );
}

BugList.propTypes = {
  bugs: PropTypes.array.isRequired,
  onDelete: PropTypes.func.isRequired,
  onStatusChange: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string,
};
