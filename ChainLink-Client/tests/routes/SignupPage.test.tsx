import React from 'react';
import '@testing-library/jest-dom';
import { describe, test, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter } from 'react-router-dom';
import SignupPage from '../../src/routes/SignupPage';

describe('SignupPage', () => {
  test('renders four inputs and continue button disabled initially', () => {
    const { container } = render(
      <MockedProvider mocks={[]} addTypename={false}>
        <BrowserRouter>
          <SignupPage />
        </BrowserRouter>
      </MockedProvider>
    );

    // Should have 4 inputs: username, email, password, re-type password
    const inputs = container.querySelectorAll('input');
    expect(inputs.length).toBe(4);

    const continueButton = screen.getByRole('button', { name: /Continue/i });
    expect(continueButton).toBeDisabled();
  });

  test('enables Continue button when all first-page fields valid and passwords match', () => {
    const { container } = render(
      <MockedProvider mocks={[]} addTypename={false}>
        <BrowserRouter>
          <SignupPage />
        </BrowserRouter>
      </MockedProvider>
    );

    const inputs = container.querySelectorAll('input');
    const usernameInput = inputs[0];
    const emailInput = inputs[1];
    const passwordInput = inputs[2];
    const confirmInput = inputs[3];
    const continueButton = screen.getByRole('button', { name: /Continue/i });

    fireEvent.change(usernameInput, { target: { value: 'user123' } });
    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password1!' } });
    fireEvent.change(confirmInput, { target: { value: 'Password1!' } });

    expect(continueButton).toBeEnabled();
  });

  test('keeps Continue disabled when passwords do not match', () => {
    const { container } = render(
      <MockedProvider mocks={[]} addTypename={false}>
        <BrowserRouter>
          <SignupPage />
        </BrowserRouter>
      </MockedProvider>
    );

    const inputs = container.querySelectorAll('input');
    const passwordInput = inputs[2];
    const confirmInput = inputs[3];
    const continueButton = screen.getByRole('button', { name: /Continue/i });

    fireEvent.change(passwordInput, { target: { value: 'Password1!' } });
    fireEvent.change(confirmInput, { target: { value: 'Password2?' } });

    expect(continueButton).toBeDisabled();
  });
});
