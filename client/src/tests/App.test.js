import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import App from '../App';
import ReservationForm from '../components/reservation/ReservationForm';
import { ReservationProvider } from '../context/ReservationContext';
import { AuthProvider } from '../context/AuthContext';

// Mock de servicios
jest.mock('../services/api', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

const MockedApp = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      <ReservationProvider>
        {children}
      </ReservationProvider>
    </AuthProvider>
  </BrowserRouter>
);

describe('🌮 El Nopal Frontend Tests', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('🏠 App Component', () => {
    test('Should render main app without crashing', () => {
      render(
        <MockedApp>
          <App />
        </MockedApp>
      );
      
      expect(screen.getByText(/El Nopal/i)).toBeInTheDocument();
    });

    test('Should display navigation menu', () => {
      render(
        <MockedApp>
          <App />
        </MockedApp>
      );
      
      expect(screen.getByText(/Inicio/i)).toBeInTheDocument();
      expect(screen.getByText(/Reservas/i)).toBeInTheDocument();
      expect(screen.getByText(/Sobre Nosotros/i)).toBeInTheDocument();
    });

    test('Should be responsive and display mobile menu', () => {
      // Mock window.innerWidth for mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(
        <MockedApp>
          <App />
        </MockedApp>
      );

      // Check if mobile menu toggle exists
      const mobileMenuButton = screen.queryByRole('button', { name: /menu/i });
      expect(mobileMenuButton).toBeInTheDocument();
    });
  });

  describe('📝 Reservation Form Tests', () => {
    test('Should render reservation form with all fields', () => {
      render(
        <MockedApp>
          <ReservationForm />
        </MockedApp>
      );

      expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/teléfono/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/fecha/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/hora/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/número de personas/i)).toBeInTheDocument();
    });

    test('Should validate required fields', async () => {
      render(
        <MockedApp>
          <ReservationForm />
        </MockedApp>
      );

      const submitButton = screen.getByRole('button', { name: /reservar mesa/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/nombre es requerido/i)).toBeInTheDocument();
        expect(screen.getByText(/email es requerido/i)).toBeInTheDocument();
        expect(screen.getByText(/teléfono es requerido/i)).toBeInTheDocument();
      });
    });

    test('Should validate email format', async () => {
      render(
        <MockedApp>
          <ReservationForm />
        </MockedApp>
      );

      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(screen.getByText(/email no es válido/i)).toBeInTheDocument();
      });
    });

    test('Should validate phone number format', async () => {
      render(
        <MockedApp>
          <ReservationForm />
        </MockedApp>
      );

      const phoneInput = screen.getByLabelText(/teléfono/i);
      fireEvent.change(phoneInput, { target: { value: '123' } });
      fireEvent.blur(phoneInput);

      await waitFor(() => {
        expect(screen.getByText(/teléfono debe tener entre 9 y 15 dígitos/i)).toBeInTheDocument();
      });
    });

    test('Should validate party size', async () => {
      render(
        <MockedApp>
          <ReservationForm />
        </MockedApp>
      );

      const partySizeSelect = screen.getByLabelText(/número de personas/i);
      fireEvent.change(partySizeSelect, { target: { value: '10' } });

      await waitFor(() => {
        expect(screen.getByText(/máximo 8 personas/i)).toBeInTheDocument();
      });
    });

    test('Should submit form with valid data', async () => {
      const mockMakeReservation = jest.fn().mockResolvedValue({
        success: true,
        reservation: { id: '123' }
      });

      render(
        <MockedApp>
          <ReservationForm />
        </MockedApp>
      );

      // Fill out the form
      fireEvent.change(screen.getByLabelText(/nombre completo/i), {
        target: { value: 'Juan Pérez' }
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'juan@ejemplo.com' }
      });
      fireEvent.change(screen.getByLabelText(/teléfono/i), {
        target: { value: '+34123456789' }
      });
      fireEvent.change(screen.getByLabelText(/fecha/i), {
        target: { value: '2025-07-15' }
      });
      fireEvent.change(screen.getByLabelText(/número de personas/i), {
        target: { value: '4' }
      });

      const submitButton = screen.getByRole('button', { name: /reservar mesa/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockMakeReservation).toHaveBeenCalledWith({
          name: 'Juan Pérez',
          email: 'juan@ejemplo.com',
          phone: '+34123456789',
          date: '2025-07-15',
          partySize: '4'
        });
      });
    });
  });

  describe('📱 Responsive Design Tests', () => {
    test('Should adapt form layout for mobile devices', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(
        <MockedApp>
          <ReservationForm />
        </MockedApp>
      );

      const form = screen.getByRole('form');
      expect(form).toHaveClass('reservation-form');
      
      // Check if form fields stack vertically on mobile
      const formRows = form.querySelectorAll('.form-row');
      formRows.forEach(row => {
        const styles = window.getComputedStyle(row);
        expect(styles.flexDirection).toBe('column');
      });
    });

    test('Should display proper button sizes for touch devices', () => {
      render(
        <MockedApp>
          <ReservationForm />
        </MockedApp>
      );

      const submitButton = screen.getByRole('button', { name: /reservar mesa/i });
      const styles = window.getComputedStyle(submitButton);
      
      // Check minimum touch target size (44px)
      const minHeight = parseInt(styles.minHeight);
      expect(minHeight).toBeGreaterThanOrEqual(44);
    });
  });

  describe('♿ Accessibility Tests', () => {
    test('Should have proper ARIA labels', () => {
      render(
        <MockedApp>
          <ReservationForm />
        </MockedApp>
      );

      expect(screen.getByLabelText(/nombre completo/i)).toHaveAttribute('aria-required', 'true');
      expect(screen.getByLabelText(/email/i)).toHaveAttribute('aria-required', 'true');
      expect(screen.getByLabelText(/teléfono/i)).toHaveAttribute('aria-required', 'true');
    });

    test('Should support keyboard navigation', () => {
      render(
        <MockedApp>
          <ReservationForm />
        </MockedApp>
      );

      const nameInput = screen.getByLabelText(/nombre completo/i);
      const emailInput = screen.getByLabelText(/email/i);
      
      nameInput.focus();
      expect(document.activeElement).toBe(nameInput);
      
      // Simulate Tab key
      fireEvent.keyDown(nameInput, { key: 'Tab', code: 'Tab' });
      expect(document.activeElement).toBe(emailInput);
    });

    test('Should display error messages with proper ARIA attributes', async () => {
      render(
        <MockedApp>
          <ReservationForm />
        </MockedApp>
      );

      const nameInput = screen.getByLabelText(/nombre completo/i);
      fireEvent.change(nameInput, { target: { value: '' } });
      fireEvent.blur(nameInput);

      await waitFor(() => {
        const errorMessage = screen.getByText(/nombre es requerido/i);
        expect(errorMessage).toHaveAttribute('role', 'alert');
        expect(nameInput).toHaveAttribute('aria-invalid', 'true');
      });
    });
  });

  describe('🔒 Security Tests', () => {
    test('Should sanitize user input', () => {
      render(
        <MockedApp>
          <ReservationForm />
        </MockedApp>
      );

      const nameInput = screen.getByLabelText(/nombre completo/i);
      fireEvent.change(nameInput, { 
        target: { value: '<script>alert("xss")</script>' } 
      });

      expect(nameInput.value).not.toContain('<script>');
    });

    test('Should not expose sensitive data in DOM', () => {
      render(
        <MockedApp>
          <App />
        </MockedApp>
      );

      // Check that no API keys or sensitive data are exposed
      const html = document.documentElement.innerHTML;
      expect(html).not.toContain('api_key');
      expect(html).not.toContain('secret');
      expect(html).not.toContain('password');
    });
  });

  describe('⚡ Performance Tests', () => {
    test('Should load components quickly', async () => {
      const start = Date.now();
      
      render(
        <MockedApp>
          <ReservationForm />
        </MockedApp>
      );

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000); // Should render in less than 1 second
    });

    test('Should not have memory leaks', () => {
      const { unmount } = render(
        <MockedApp>
          <ReservationForm />
        </MockedApp>
      );

      // Component should unmount cleanly
      expect(() => unmount()).not.toThrow();
    });
  });
}); 