import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BugForm from '../components/BugForm';

describe('BugForm Component', () => {
  const mockOnSubmit = vi.fn();
  const defaultProps = {
    onSubmit: mockOnSubmit,
    loading: false,
    error: null
  };

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  describe('Rendering', () => {
    it('should render the form with all fields', () => {
      render(<BugForm {...defaultProps} />);
      
      expect(screen.getByText('Report a New Bug')).toBeInTheDocument();
      expect(screen.getByLabelText('Bug Title')).toBeInTheDocument();
      expect(screen.getByLabelText('Bug Description')).toBeInTheDocument();
      expect(screen.getByLabelText('Bug Status')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /submit bug/i })).toBeInTheDocument();
    });

    it('should render helper text for fields', () => {
      render(<BugForm {...defaultProps} />);
      
      expect(screen.getByText(/Short, descriptive bug title/)).toBeInTheDocument();
      expect(screen.getByText(/Detailed bug description/)).toBeInTheDocument();
    });

    it('should show character counter for description', () => {
      render(<BugForm {...defaultProps} />);
      
      expect(screen.getByText('0/1000')).toBeInTheDocument();
    });
  });

  describe('Form Interactions', () => {
    it('should update character counter when typing in description', () => {
      render(<BugForm {...defaultProps} />);
      
      const descriptionField = screen.getByLabelText('Bug Description');
      fireEvent.change(descriptionField, { target: { value: 'Test description' } });
      
      expect(screen.getByText('16/1000')).toBeInTheDocument();
    });

    it('should update form values when typing', () => {
      render(<BugForm {...defaultProps} />);
      
      const titleField = screen.getByLabelText('Bug Title');
      const descriptionField = screen.getByLabelText('Bug Description');
      const statusField = screen.getByLabelText('Bug Status');
      
      fireEvent.change(titleField, { target: { value: 'Test Bug' } });
      fireEvent.change(descriptionField, { target: { value: 'Test Description' } });
      fireEvent.change(statusField, { target: { value: 'resolved' } });
      
      expect(titleField.value).toBe('Test Bug');
      expect(descriptionField.value).toBe('Test Description');
      expect(statusField.value).toBe('resolved');
    });

    it('should clear form error when user starts typing', () => {
      render(<BugForm {...defaultProps} error="Test error" />);
      
      expect(screen.getByText('Test error')).toBeInTheDocument();
      
      const titleField = screen.getByLabelText('Bug Title');
      fireEvent.change(titleField, { target: { value: 'Test' } });
      
      expect(screen.queryByText('Test error')).not.toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show error when submitting empty form', async () => {
      render(<BugForm {...defaultProps} />);
      
      const submitButton = screen.getByRole('button', { name: /submit bug/i });
      fireEvent.click(submitButton);
      
      expect(screen.getByText(/Title and description are required/)).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show error when title is empty', async () => {
      render(<BugForm {...defaultProps} />);
      
      const descriptionField = screen.getByLabelText('Bug Description');
      const submitButton = screen.getByRole('button', { name: /submit bug/i });
      
      fireEvent.change(descriptionField, { target: { value: 'Test description' } });
      fireEvent.click(submitButton);
      
      expect(screen.getByText(/Title and description are required/)).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show error when description is empty', async () => {
      render(<BugForm {...defaultProps} />);
      
      const titleField = screen.getByLabelText('Bug Title');
      const submitButton = screen.getByRole('button', { name: /submit bug/i });
      
      fireEvent.change(titleField, { target: { value: 'Test title' } });
      fireEvent.click(submitButton);
      
      expect(screen.getByText(/Title and description are required/)).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show error when only whitespace is entered', async () => {
      render(<BugForm {...defaultProps} />);
      
      const titleField = screen.getByLabelText('Bug Title');
      const descriptionField = screen.getByLabelText('Bug Description');
      const submitButton = screen.getByRole('button', { name: /submit bug/i });
      
      fireEvent.change(titleField, { target: { value: '   ' } });
      fireEvent.change(descriptionField, { target: { value: '   ' } });
      fireEvent.click(submitButton);
      
      expect(screen.getByText(/Title and description are required/)).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Form Submission', () => {
    it('should call onSubmit with form data when valid', async () => {
      render(<BugForm {...defaultProps} />);
      
      const titleField = screen.getByLabelText('Bug Title');
      const descriptionField = screen.getByLabelText('Bug Description');
      const statusField = screen.getByLabelText('Bug Status');
      const submitButton = screen.getByRole('button', { name: /submit bug/i });
      
      fireEvent.change(titleField, { target: { value: 'Test Bug' } });
      fireEvent.change(descriptionField, { target: { value: 'Test Description' } });
      fireEvent.change(statusField, { target: { value: 'in-progress' } });
      fireEvent.click(submitButton);
      
      expect(mockOnSubmit).toHaveBeenCalledWith(
        {
          title: 'Test Bug',
          description: 'Test Description',
          status: 'in-progress'
        },
        expect.any(Function)
      );
    });

    it('should reset form after successful submission', async () => {
      render(<BugForm {...defaultProps} />);
      
      const titleField = screen.getByLabelText('Bug Title');
      const descriptionField = screen.getByLabelText('Bug Description');
      const submitButton = screen.getByRole('button', { name: /submit bug/i });
      
      fireEvent.change(titleField, { target: { value: 'Test Bug' } });
      fireEvent.change(descriptionField, { target: { value: 'Test Description' } });
      fireEvent.click(submitButton);
      
      // Simulate successful submission by calling the reset callback
      const resetCallback = mockOnSubmit.mock.calls[0][1];
      resetCallback();
      
      expect(titleField.value).toBe('');
      expect(descriptionField.value).toBe('');
    });
  });

  describe('Loading State', () => {
    it('should disable submit button when loading', () => {
      render(<BugForm {...defaultProps} loading={true} />);
      
      const submitButton = screen.getByRole('button', { name: /submitting/i });
      expect(submitButton).toBeDisabled();
    });

    it('should show loading text when loading', () => {
      render(<BugForm {...defaultProps} loading={true} />);
      
      expect(screen.getByText('Submitting...')).toBeInTheDocument();
    });

    it('should not call onSubmit when form is disabled', () => {
      render(<BugForm {...defaultProps} loading={true} />);
      
      const titleField = screen.getByLabelText('Bug Title');
      const descriptionField = screen.getByLabelText('Bug Description');
      const submitButton = screen.getByRole('button', { name: /submitting/i });
      
      fireEvent.change(titleField, { target: { value: 'Test Bug' } });
      fireEvent.change(descriptionField, { target: { value: 'Test Description' } });
      fireEvent.click(submitButton);
      
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Error Display', () => {
    it('should display error message when provided', () => {
      const errorMessage = 'Failed to create bug';
      render(<BugForm {...defaultProps} error={errorMessage} />);
      
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('should display form validation errors', () => {
      render(<BugForm {...defaultProps} />);
      
      const submitButton = screen.getByRole('button', { name: /submit bug/i });
      fireEvent.click(submitButton);
      
      expect(screen.getByText(/Title and description are required/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for all form fields', () => {
      render(<BugForm {...defaultProps} />);
      
      expect(screen.getByLabelText('Bug Title')).toBeInTheDocument();
      expect(screen.getByLabelText('Bug Description')).toBeInTheDocument();
      expect(screen.getByLabelText('Bug Status')).toBeInTheDocument();
    });

    it('should have proper ARIA attributes', () => {
      render(<BugForm {...defaultProps} />);
      
      const titleField = screen.getByLabelText('Bug Title');
      const descriptionField = screen.getByLabelText('Bug Description');
      
      expect(titleField).toHaveAttribute('aria-required', 'true');
      expect(descriptionField).toHaveAttribute('aria-required', 'true');
    });

    it('should have proper form structure', () => {
      render(<BugForm {...defaultProps} />);
      
      const form = screen.getByRole('form');
      expect(form).toBeInTheDocument();
      expect(form).toHaveAttribute('aria-labelledby', 'bug-form-title');
    });
  });

  describe('Field Constraints', () => {
    it('should enforce title max length', () => {
      render(<BugForm {...defaultProps} />);
      
      const titleField = screen.getByLabelText('Bug Title');
      expect(titleField).toHaveAttribute('maxLength', '100');
    });

    it('should enforce description max length', () => {
      render(<BugForm {...defaultProps} />);
      
      const descriptionField = screen.getByLabelText('Bug Description');
      expect(descriptionField).toHaveAttribute('maxLength', '1000');
    });

    it('should have correct status options', () => {
      render(<BugForm {...defaultProps} />);
      
      const statusField = screen.getByLabelText('Bug Status');
      const options = statusField.querySelectorAll('option');
      
      expect(options).toHaveLength(3);
      expect(options[0]).toHaveValue('open');
      expect(options[1]).toHaveValue('in-progress');
      expect(options[2]).toHaveValue('resolved');
    });
  });
}); 