import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BugList from '../components/BugList';

// Mock the BugItem component
vi.mock('../components/BugItem', () => ({
  default: ({ bug, onDelete, onStatusChange }) => (
    <div data-testid={`bug-item-${bug._id}`}>
      <span>{bug.title}</span>
      <span>{bug.description}</span>
      <span>{bug.status}</span>
      <button onClick={() => onDelete(bug._id)}>Delete</button>
      <select onChange={(e) => onStatusChange(bug._id, e.target.value)} value={bug.status}>
        <option value="open">Open</option>
        <option value="in-progress">In Progress</option>
        <option value="resolved">Resolved</option>
      </select>
    </div>
  )
}));

describe('BugList Component', () => {
  const mockOnDelete = vi.fn();
  const mockOnStatusChange = vi.fn();
  const defaultProps = {
    bugs: [],
    onDelete: mockOnDelete,
    onStatusChange: mockOnStatusChange,
    loading: false,
    error: null
  };

  beforeEach(() => {
    mockOnDelete.mockClear();
    mockOnStatusChange.mockClear();
  });

  describe('Rendering', () => {
    it('should render the list title', () => {
      render(<BugList {...defaultProps} />);
      
      expect(screen.getByText('Reported Bugs')).toBeInTheDocument();
    });

    it('should render bug items when bugs exist', () => {
      const bugs = [
        { _id: '1', title: 'Bug 1', description: 'Description 1', status: 'open', createdAt: new Date() },
        { _id: '2', title: 'Bug 2', description: 'Description 2', status: 'resolved', createdAt: new Date() }
      ];
      
      render(<BugList {...defaultProps} bugs={bugs} />);
      
      expect(screen.getByTestId('bug-item-1')).toBeInTheDocument();
      expect(screen.getByTestId('bug-item-2')).toBeInTheDocument();
      expect(screen.getByText('Bug 1')).toBeInTheDocument();
      expect(screen.getByText('Bug 2')).toBeInTheDocument();
    });

    it('should render empty state when no bugs exist', () => {
      render(<BugList {...defaultProps} />);
      
      expect(screen.getByText('No bugs reported yet.')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading message when loading', () => {
      render(<BugList {...defaultProps} loading={true} />);
      
      expect(screen.getByText('Loading bugs...')).toBeInTheDocument();
    });

    it('should not show bug items when loading', () => {
      const bugs = [
        { _id: '1', title: 'Bug 1', description: 'Description 1', status: 'open', createdAt: new Date() }
      ];
      
      render(<BugList {...defaultProps} bugs={bugs} loading={true} />);
      
      expect(screen.queryByTestId('bug-item-1')).not.toBeInTheDocument();
      expect(screen.queryByText('Bug 1')).not.toBeInTheDocument();
    });

    it('should not show empty state when loading', () => {
      render(<BugList {...defaultProps} loading={true} />);
      
      expect(screen.queryByText('No bugs reported yet.')).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should show error message when error exists', () => {
      const errorMessage = 'Failed to fetch bugs';
      render(<BugList {...defaultProps} error={errorMessage} />);
      
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('should not show bug items when error exists', () => {
      const bugs = [
        { _id: '1', title: 'Bug 1', description: 'Description 1', status: 'open', createdAt: new Date() }
      ];
      const errorMessage = 'Failed to fetch bugs';
      
      render(<BugList {...defaultProps} bugs={bugs} error={errorMessage} />);
      
      expect(screen.queryByTestId('bug-item-1')).not.toBeInTheDocument();
      expect(screen.queryByText('Bug 1')).not.toBeInTheDocument();
    });

    it('should not show empty state when error exists', () => {
      const errorMessage = 'Failed to fetch bugs';
      render(<BugList {...defaultProps} error={errorMessage} />);
      
      expect(screen.queryByText('No bugs reported yet.')).not.toBeInTheDocument();
    });

    it('should not show loading state when error exists', () => {
      const errorMessage = 'Failed to fetch bugs';
      render(<BugList {...defaultProps} loading={true} error={errorMessage} />);
      
      expect(screen.queryByText('Loading bugs...')).not.toBeInTheDocument();
    });
  });

  describe('Interaction with Child Components', () => {
    it('should pass correct props to BugItem components', () => {
      const bugs = [
        { _id: '1', title: 'Bug 1', description: 'Description 1', status: 'open', createdAt: new Date() }
      ];
      
      render(<BugList {...defaultProps} bugs={bugs} />);
      
      const bugItem = screen.getByTestId('bug-item-1');
      expect(bugItem).toBeInTheDocument();
    });

    it('should handle delete action from child component', () => {
      const bugs = [
        { _id: '1', title: 'Bug 1', description: 'Description 1', status: 'open', createdAt: new Date() }
      ];
      
      render(<BugList {...defaultProps} bugs={bugs} />);
      
      const deleteButton = screen.getByText('Delete');
      fireEvent.click(deleteButton);
      
      expect(mockOnDelete).toHaveBeenCalledWith('1');
    });

    it('should handle status change from child component', () => {
      const bugs = [
        { _id: '1', title: 'Bug 1', description: 'Description 1', status: 'open', createdAt: new Date() }
      ];
      
      render(<BugList {...defaultProps} bugs={bugs} />);
      
      const statusSelect = screen.getByDisplayValue('open');
      fireEvent.change(statusSelect, { target: { value: 'resolved' } });
      
      expect(mockOnStatusChange).toHaveBeenCalledWith('1', 'resolved');
    });
  });

  describe('Multiple Bugs', () => {
    it('should render multiple bug items correctly', () => {
      const bugs = [
        { _id: '1', title: 'Bug 1', description: 'Description 1', status: 'open', createdAt: new Date() },
        { _id: '2', title: 'Bug 2', description: 'Description 2', status: 'in-progress', createdAt: new Date() },
        { _id: '3', title: 'Bug 3', description: 'Description 3', status: 'resolved', createdAt: new Date() }
      ];
      
      render(<BugList {...defaultProps} bugs={bugs} />);
      
      expect(screen.getByTestId('bug-item-1')).toBeInTheDocument();
      expect(screen.getByTestId('bug-item-2')).toBeInTheDocument();
      expect(screen.getByTestId('bug-item-3')).toBeInTheDocument();
      expect(screen.getByText('Bug 1')).toBeInTheDocument();
      expect(screen.getByText('Bug 2')).toBeInTheDocument();
      expect(screen.getByText('Bug 3')).toBeInTheDocument();
    });

    it('should handle actions for multiple bugs', () => {
      const bugs = [
        { _id: '1', title: 'Bug 1', description: 'Description 1', status: 'open', createdAt: new Date() },
        { _id: '2', title: 'Bug 2', description: 'Description 2', status: 'in-progress', createdAt: new Date() }
      ];
      
      render(<BugList {...defaultProps} bugs={bugs} />);
      
      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);
      
      expect(mockOnDelete).toHaveBeenCalledWith('1');
    });
  });

  describe('Edge Cases', () => {
    it('should handle bugs with missing optional fields', () => {
      const bugs = [
        { _id: '1', title: 'Bug 1', description: 'Description 1', status: 'open' }
      ];
      
      render(<BugList {...defaultProps} bugs={bugs} />);
      
      expect(screen.getByTestId('bug-item-1')).toBeInTheDocument();
      expect(screen.getByText('Bug 1')).toBeInTheDocument();
    });

    it('should handle very long bug titles and descriptions', () => {
      const longTitle = 'A'.repeat(200);
      const longDescription = 'B'.repeat(500);
      const bugs = [
        { _id: '1', title: longTitle, description: longDescription, status: 'open', createdAt: new Date() }
      ];
      
      render(<BugList {...defaultProps} bugs={bugs} />);
      
      expect(screen.getByTestId('bug-item-1')).toBeInTheDocument();
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('should handle special characters in bug data', () => {
      const bugs = [
        { _id: '1', title: 'Bug with <script>alert("xss")</script>', description: 'Description with "quotes" and \'apostrophes\'', status: 'open', createdAt: new Date() }
      ];
      
      render(<BugList {...defaultProps} bugs={bugs} />);
      
      expect(screen.getByTestId('bug-item-1')).toBeInTheDocument();
      expect(screen.getByText('Bug with <script>alert("xss")</script>')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(<BugList {...defaultProps} />);
      
      const heading = screen.getByRole('heading', { name: 'Reported Bugs' });
      expect(heading).toBeInTheDocument();
    });

    it('should have proper list structure', () => {
      const bugs = [
        { _id: '1', title: 'Bug 1', description: 'Description 1', status: 'open', createdAt: new Date() }
      ];
      
      render(<BugList {...defaultProps} bugs={bugs} />);
      
      const list = screen.getByRole('list');
      expect(list).toBeInTheDocument();
    });

    it('should have proper error message role', () => {
      const errorMessage = 'Failed to fetch bugs';
      render(<BugList {...defaultProps} error={errorMessage} />);
      
      const errorElement = screen.getByText(errorMessage);
      expect(errorElement).toHaveAttribute('role', 'alert');
    });
  });

  describe('Performance', () => {
    it('should render large lists efficiently', () => {
      const bugs = Array.from({ length: 100 }, (_, i) => ({
        _id: i.toString(),
        title: `Bug ${i}`,
        description: `Description ${i}`,
        status: 'open',
        createdAt: new Date()
      }));
      
      const startTime = performance.now();
      render(<BugList {...defaultProps} bugs={bugs} />);
      const endTime = performance.now();
      
      // Should render within reasonable time (adjust threshold as needed)
      expect(endTime - startTime).toBeLessThan(1000);
      expect(screen.getByTestId('bug-item-0')).toBeInTheDocument();
      expect(screen.getByTestId('bug-item-99')).toBeInTheDocument();
    });
  });
}); 