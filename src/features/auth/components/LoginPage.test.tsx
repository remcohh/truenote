import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { LoginPage } from './LoginPage';
import * as pocketbaseService from '../../../services/pocketbase';

vi.mock('../../../services/pocketbase', () => ({
  loginWithEmail: vi.fn(),
  registerUser: vi.fn(),
}));

describe('LoginPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Sign In form by default', () => {
    render(<LoginPage />);
    expect(screen.getByRole('heading', { name: /Sign In/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
  });

  it('switches between Sign In and Create Account modes', () => {
    render(<LoginPage />);
    const toggleBtn = screen.getByRole('button', { name: /Don't have an account\? Create one/i });
    fireEvent.click(toggleBtn);

    expect(screen.getByRole('heading', { name: /Create Account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
  });

  it('calls loginWithEmail on form submission', async () => {
    vi.mocked(pocketbaseService.loginWithEmail).mockResolvedValue({
      id: '1',
      email: 'musician@example.com',
      name: 'Test Musician',
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'musician@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });

    const submitBtn = screen.getByRole('button', { name: /^Sign In$/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(pocketbaseService.loginWithEmail).toHaveBeenCalledWith('musician@example.com', 'password123');
    });
  });

  it('displays error message if login fails', async () => {
    vi.mocked(pocketbaseService.loginWithEmail).mockRejectedValue(new Error('Invalid credentials'));

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'wrong@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'wrongpass' } });

    fireEvent.click(screen.getByRole('button', { name: /^Sign In$/i }));

    await waitFor(() => {
      expect(screen.getByText(/Could not sign in/i)).toBeInTheDocument();
    });
  });
});
