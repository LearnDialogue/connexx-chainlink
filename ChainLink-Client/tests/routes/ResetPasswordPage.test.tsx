import React from 'react';
import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter } from 'react-router-dom';
import ResetPasswordPage from '../../src/routes/ResetPasswordPage';
import '@testing-library/jest-dom';

describe('ResetPasswordPage', () => {
  test('renders input and reset button disabled initially', () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <BrowserRouter>
          <ResetPasswordPage />
        </BrowserRouter>
      </MockedProvider>
    );
    expect(screen.getByPlaceholderText(/Enter your username or email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reset Password/i })).toBeDisabled();
  });
});
