import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Navigation } from '../components/navigation';
import { AuthProvider } from '../contexts/AuthContext';

// Mock the UserMenu component
vi.mock('../components/user-menu', () => ({
  UserMenu: () => <div data-testid="user-menu">User Menu</div>,
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>{children}</AuthProvider>
  </BrowserRouter>
);

describe('Navigation', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders HBnB logo and navigation links', () => {
    render(<Navigation />, { wrapper });

    expect(screen.getByText('HBnB')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Listings')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  it('shows login and signup buttons when not authenticated', async () => {
    localStorage.getItem.mockReturnValue(null);

    render(<Navigation />, { wrapper });

    // Wait for auth to load
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });

  it('shows user menu when authenticated', async () => {
    const mockUser = { email: 'test@example.com', id: '123' };
    localStorage.getItem.mockImplementation((key) => {
      if (key === 'token') return 'fake-token';
      if (key === 'user') return JSON.stringify(mockUser);
      return null;
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockUser,
    });

    render(<Navigation />, { wrapper });

    // Wait for auth to hydrate
    await screen.findByTestId('user-menu');

    expect(screen.getByTestId('user-menu')).toBeInTheDocument();
    expect(screen.queryByText('Login')).not.toBeInTheDocument();
    expect(screen.queryByText('Sign Up')).not.toBeInTheDocument();
  });

  it('displays "Become a Host" link', () => {
    render(<Navigation />, { wrapper });

    expect(screen.getByText('Become a Host')).toBeInTheDocument();
  });
});
