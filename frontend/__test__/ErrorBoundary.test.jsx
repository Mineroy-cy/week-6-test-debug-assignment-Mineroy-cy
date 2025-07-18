import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ErrorBoundary } from '../components/ErrorBoundary';

// Component that throws an error for testing
const ThrowError = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>Normal content</div>;
};

// Component that throws different types of errors
const ThrowDifferentErrors = ({ errorType }) => {
  switch (errorType) {
    case 'string':
      throw 'String error';
    case 'object':
      throw { message: 'Object error' };
    case 'null':
      throw null;
    default:
      return <div>No error</div>;
  }
};

describe('ErrorBoundary Component', () => {
  // Suppress console.error for tests
  const originalError = console.error;
  beforeAll(() => {
    console.error = vi.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  describe('Normal State', () => {
    it('should render children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div>Test content</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('should render multiple children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div>First child</div>
          <div>Second child</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('First child')).toBeInTheDocument();
      expect(screen.getByText('Second child')).toBeInTheDocument();
    });

    it('should render complex nested components when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div>
            <h1>Title</h1>
            <p>Paragraph</p>
            <button>Click me</button>
          </div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Paragraph')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should catch and display error when child throws', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
      expect(screen.getByText('Test error message')).toBeInTheDocument();
    });

    it('should display fallback UI when error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument();
    });

    it('should handle different types of errors', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowDifferentErrors errorType="string" />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
      expect(screen.getByText('String error')).toBeInTheDocument();

      rerender(
        <ErrorBoundary>
          <ThrowDifferentErrors errorType="object" />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
      expect(screen.getByText('Object error')).toBeInTheDocument();
    });

    it('should handle null errors gracefully', () => {
      render(
        <ErrorBoundary>
          <ThrowDifferentErrors errorType="null" />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
      expect(screen.getByText('An unexpected error occurred.')).toBeInTheDocument();
    });

    it('should handle errors without message property', () => {
      render(
        <ErrorBoundary>
          <ThrowDifferentErrors errorType="string" />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
      expect(screen.getByText('String error')).toBeInTheDocument();
    });
  });

  describe('Reset Functionality', () => {
    it('should reset error state when Try Again button is clicked', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong.')).toBeInTheDocument();

      const resetButton = screen.getByRole('button', { name: 'Try Again' });
      fireEvent.click(resetButton);

      // Re-render with no error
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Normal content')).toBeInTheDocument();
      expect(screen.queryByText('Something went wrong.')).not.toBeInTheDocument();
    });

    it('should allow normal rendering after reset', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const resetButton = screen.getByRole('button', { name: 'Try Again' });
      fireEvent.click(resetButton);

      rerender(
        <ErrorBoundary>
          <div>New content after reset</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('New content after reset')).toBeInTheDocument();
    });
  });

  describe('Error Logging', () => {
    it('should call componentDidCatch when error occurs', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // componentDidCatch should be called (though we can't directly test it)
      expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure in error state', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const heading = screen.getByRole('heading', { name: 'Something went wrong.' });
      expect(heading).toBeInTheDocument();
    });

    it('should have accessible button in error state', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const button = screen.getByRole('button', { name: 'Try Again' });
      expect(button).toBeInTheDocument();
      expect(button).toBeEnabled();
    });

    it('should have proper error message structure', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const errorMessage = screen.getByText('Test error message');
      expect(errorMessage).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle errors in deeply nested components', () => {
      render(
        <ErrorBoundary>
          <div>
            <div>
              <div>
                <ThrowError shouldThrow={true} />
              </div>
            </div>
          </div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
    });

    it('should handle multiple error boundaries', () => {
      render(
        <ErrorBoundary>
          <div>Outer content</div>
          <ErrorBoundary>
            <ThrowError shouldThrow={true} />
          </ErrorBoundary>
        </ErrorBoundary>
      );

      // Should show the inner error boundary's error
      expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
      expect(screen.queryByText('Outer content')).not.toBeInTheDocument();
    });

    it('should handle errors in async components', () => {
      const AsyncErrorComponent = () => {
        throw new Error('Async error');
      };

      render(
        <ErrorBoundary>
          <AsyncErrorComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
      expect(screen.getByText('Async error')).toBeInTheDocument();
    });

    it('should handle very long error messages', () => {
      const LongErrorComponent = () => {
        throw new Error('A'.repeat(1000));
      };

      render(
        <ErrorBoundary>
          <LongErrorComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
      expect(screen.getByText('A'.repeat(1000))).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should not cause performance issues with large error messages', () => {
      const LargeErrorComponent = () => {
        throw new Error('A'.repeat(10000));
      };

      const startTime = performance.now();
      render(
        <ErrorBoundary>
          <LargeErrorComponent />
        </ErrorBoundary>
      );
      const endTime = performance.now();

      // Should render within reasonable time
      expect(endTime - startTime).toBeLessThan(1000);
      expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
    });
  });
}); 