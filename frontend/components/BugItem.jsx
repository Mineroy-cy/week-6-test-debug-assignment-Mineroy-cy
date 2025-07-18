import React from 'react';
import PropTypes from 'prop-types';
import StatusUpdate from './StatusUpdate';

const statusStyles = {
  open: 'bg-blue-100 text-blue-700',
  'in-progress': 'bg-yellow-100 text-yellow-700',
  resolved: 'bg-green-100 text-green-700',
};

export default function BugItem({ bug, onDelete, onStatusChange }) {
  return (
    <li className="py-4 flex flex-col gap-2 hover:bg-gray-50 transition">
      <div className="flex justify-between items-center">
        <span className="font-semibold text-base">{bug.title}</span>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusStyles[bug.status]}`}>{bug.status.replace('-', ' ')}</span>
      </div>
      <div className="text-gray-600 text-sm">{bug.description}</div>
      <div className="text-gray-400 text-xs">
        Created: {new Date(bug.createdAt).toLocaleString()}
        {bug.updatedAt && <span> &middot; Updated: {new Date(bug.updatedAt).toLocaleString()}</span>}
      </div>
      <div className="flex gap-3 items-center mt-1">
        <StatusUpdate
          currentStatus={bug.status}
          onChange={(status) => onStatusChange(bug._id, status)}
        />
        <button
          className="ml-auto bg-red-100 hover:bg-red-200 text-red-600 px-3 py-1 rounded-lg text-sm font-medium transition"
          onClick={() => onDelete(bug._id)}
          aria-label="Delete bug"
        >
          Delete
        </button>
      </div>
    </li>
  );
}

BugItem.propTypes = {
  bug: PropTypes.object.isRequired,
  onDelete: PropTypes.func.isRequired,
  onStatusChange: PropTypes.func.isRequired,
};
