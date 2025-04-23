import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { describe, test, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import CreateRide from '../../src/routes/app/CreateRide';
import { AuthContext } from '../../src/context/auth';
import { useQuery, useMutation } from '@apollo/client';
import { extractRouteInfo } from '../../src/util/GpxHandler';
import '@testing-library/jest-dom';

vi.mock('@apollo/client', async () => {
  const actual = await vi.importActual<any>('@apollo/client');
  return {
    ...actual,
    useQuery: vi.fn(),
    useMutation: vi.fn(),
  };
});

vi.mock('../../src/util/GpxHandler', async () => {
  const actual = await vi.importActual<any>('../../src/util/GpxHandler');
  return {
    ...actual,
    extractRouteInfo: vi.fn(),
  };
});

const mockUser = {
  username: 'testUser',
  loginToken: 'token123',
};

function renderWithMocks() {
  (useQuery as vi.Mock).mockReturnValue({
    loading: false,
    error: null,
    data: {
      getUser: {
        sex: 'gender-man',
      },
    },
  });

  const mockAddEvent = vi.fn();
  const mockJoinRide = vi.fn();

  (useMutation as vi.Mock)
    .mockReturnValueOnce([mockAddEvent, { loading: false }])
    .mockReturnValueOnce([mockJoinRide, {}]);

  (extractRouteInfo as vi.Mock).mockResolvedValue({
    points: [[0, 0], [1, 1]],
    elevation: [0, 1],
    distance: 5,
    max_elevation: 10,
    min_elevation: 0,
    total_elevation_gain: 10,
    startCoordinates: [0, 0],
    endCoordinates: [1, 1],
  });

  return render(
    <MockedProvider mocks={[]} addTypename={false}>
      <MemoryRouter>
        <AuthContext.Provider value={{ user: mockUser, login: vi.fn(), logout: vi.fn() }}>
          <CreateRide />
        </AuthContext.Provider>
      </MemoryRouter>
    </MockedProvider>
  );
}

describe('CreateRide Page', () => {
  test('renders correctly with form elements', async () => {
    renderWithMocks();

    await waitFor(() => {
      const heading = document.querySelector('h2');
      expect(heading?.textContent).toMatch(/Create a ride/i);
    });

    expect(document.getElementById('ride-name')).not.toBeNull();
    expect(document.getElementById('ride-date')).not.toBeNull();
    expect(document.getElementById('ride-start-time')).not.toBeNull();
    expect(document.getElementById('ride-difficulty')).not.toBeNull();
    expect(document.getElementById('ride-average-speed')).not.toBeNull();
    expect(document.getElementById('input-gpx-file')).not.toBeNull();
  });
});
