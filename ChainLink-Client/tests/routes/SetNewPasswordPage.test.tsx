import React from 'react';
import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter } from 'react-router-dom';
import SetNewPasswordPage from '../../src/routes/SetNewPasswordPage';
import '@testing-library/jest-dom';

describe('SetNewPasswordPage', () => {
  test('disables inputs and button when token missing', () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <BrowserRouter>
          <SetNewPasswordPage />
        </BrowserRouter>
      </MockedProvider>
    );
    expect(screen.getByPlaceholderText(/Enter your new password/i)).toBeDisabled();
    expect(screen.getByPlaceholderText(/Confirm your new password/i)).toBeDisabled();
    expect(screen.getByRole('button', { name: /Set New Password/i })).toBeDisabled();
  });
});
