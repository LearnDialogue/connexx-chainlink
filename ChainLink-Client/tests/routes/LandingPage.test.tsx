import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import LandingPage from '../../src/routes/LandingPage';
import { AuthContext, User } from '../../src/context/auth';
import { useNavigate } from 'react-router-dom';

// Mock react-router-dom's useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

describe('LandingPage component', () => {
  test('redirects to /app/profile when user is logged in', async () => {
    const navigateMock = vi.fn();
    (useNavigate as vi.Mock).mockReturnValue(navigateMock);

    const mockUser: User = { username: 'TestUser', loginToken: 'dummyToken' };
    const loginMock = vi.fn();
    const logoutMock = vi.fn();

    render(
      <AuthContext.Provider value={{ user: mockUser, login: loginMock, logout: logoutMock }}>
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/app/profile');
    });
  });

  test('displays login and sign up options when no user is logged in', () => {
    const navigateMock = vi.fn();
    (useNavigate as vi.Mock).mockReturnValue(navigateMock);

    const loginMock = vi.fn();
    const logoutMock = vi.fn();

    render(
      <AuthContext.Provider value={{ user: null, login: loginMock, logout: logoutMock }}>
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByText(/login/i)).toBeInTheDocument();
    expect(screen.getByText(/sign up/i)).toBeInTheDocument();
    expect(screen.getByText(/get started/i)).toBeInTheDocument();
    expect(navigateMock).not.toHaveBeenCalled();
  });
});