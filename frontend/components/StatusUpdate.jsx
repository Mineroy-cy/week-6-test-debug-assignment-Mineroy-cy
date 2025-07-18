import React from 'react';
import PropTypes from 'prop-types';

const statuses = [
  { value: 'open', label: 'Open' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
];

export default function StatusUpdate({ currentStatus, onChange }) {
  return (
    <select
      className="border border-gray-300 rounded-lg px-3 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
      value={currentStatus}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Update status"
    >
      {statuses.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  );
}

StatusUpdate.propTypes = {
  currentStatus: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};
