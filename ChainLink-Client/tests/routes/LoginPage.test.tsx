import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../../src/routes/LoginPage';
import { AuthContext } from '../../src/context/auth';
import { LOGIN_USER } from '../../src/graphql/mutations/userMutations';
import '@testing-library/jest-dom';

const mockUserContext = { login: vi.fn(), logout: vi.fn(), user: null };

describe('LoginPage', () => {
  test('renders username and password inputs and login button disabled initially', () => {
    render(
      <AuthContext.Provider value={mockUserContext}>
        <MockedProvider mocks={[]} addTypename={false}>
          <BrowserRouter>
            <LoginPage />
          </BrowserRouter>
        </MockedProvider>
      </AuthContext.Provider>
    );
    expect(screen.getByLabelText(/Username or email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeDisabled();
  });
});
