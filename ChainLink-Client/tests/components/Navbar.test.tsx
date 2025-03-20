import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import Navbar from './Navbar';
import { renderWithProviders } from '../test-utils';
import { FETCH_USER_BY_NAME } from '../graphql/queries/userQueries';

//Mock data structure
const mocks = [
  {
    request: {
      query: FETCH_USER_BY_NAME,
      variables: { username: 'testuser' },
    },
    result: {
      data: {
        user: {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
        }
      }
    }
  }
];

describe('Navbar Component', () => {
  test('renders navigation links', async () => {
    renderWithProviders(<Navbar />, { mocks });

    await waitFor(() => {
      const navLinks = screen.getAllByRole('link');
      expect(navLinks.length).toBeGreaterThan(0);
    });
  });
});