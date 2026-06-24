import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LoginForm } from './LoginForm';
import { MemoryRouter } from 'react-router-dom';

const mockSetError = vi.fn();
const mockSignin = vi.fn();
const mockSignup = vi.fn();
const mockLogout = vi.fn();

vi.mock('../../../entities/user/model/store', () => {
  return {
    useAuthStore: () => ({
      user: null,
      loading: false,
      signin: mockSignin,
      signup: mockSignup,
      logout: mockLogout,
      error: null,
      setError: mockSetError,
    }),
  };
});

describe('LoginForm Component', () => {
  it('renders sign in screen', () => {
    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: /To-Do List/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Sign In/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Sign Up/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('email@example.com')).toBeInTheDocument();
  });

  it('shows error if password length is less than 6 characters', () => {
    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );
    const emailInput = screen.getByPlaceholderText('email@example.com');
    const passwordInput = screen.getByLabelText('Password');
    const submitBtn = screen.getByRole('button', { name: /Sign In/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.click(submitBtn);

    expect(screen.getByText('Password must be at least 6 characters long')).toBeInTheDocument();
  });
});
