import React from 'react';
import { describe, test, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import UpcomingRides from '../../src/components/UpcomingRides';
import { MockedProvider } from '@apollo/client/testing';
import '@testing-library/jest-dom';

// Not sure how else to test this component
describe('UpcomingRides Component', () => {
  test('renders three RideLists', async () => {
    render(
      <MockedProvider>
        <UpcomingRides onSelectEvent={vi.fn()}></UpcomingRides>
      </MockedProvider>
    );
    const rideLists = screen.getByTestId('ride-lists');
    expect(rideLists.children.length).toBe(3);
  });
});