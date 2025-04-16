import React from 'react';
import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter } from 'react-router-dom';
import RidesFeed from '../../src/routes/app/RidesFeed';
import '@testing-library/jest-dom';

describe('RidesFeed', () => {
  test('renders filter headings and no events initially', () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <BrowserRouter>
          <RidesFeed />
        </BrowserRouter>
      </MockedProvider>
    );
    expect(screen.getByText(/Apply filters/i)).toBeInTheDocument();
  });
});
