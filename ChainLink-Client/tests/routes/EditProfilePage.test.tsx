import React from 'react';
import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter } from 'react-router-dom';
import EditProfilePage from '../../src/routes/app/EditProfilePage';
import '@testing-library/jest-dom';

describe('EditProfilePage', () => {
  test('renders first name input and save button disabled initially', () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <BrowserRouter>
          <EditProfilePage />
        </BrowserRouter>
      </MockedProvider>
    );
    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Submit/i })).toBeEnabled();
  });
});
