import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../src/context/auth';
import { FETCH_ROUTE } from '../../src/graphql/queries/eventQueries';
import EditRide from '../../src/routes/app/EditRidePage';
import '@testing-library/jest-dom';

// Stub react-router hooks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({
      state: {
        event: {
          _id: 'event1',
          host: 'user',
          name: 'Test Ride',
          startTime: '2025-03-05T12:00:00.000Z',
          description: 'A fun ride',
          bikeType: ['Road'],
          difficulty: 'Medium',
          wattsPerKilo: 2,
          intensity: 'n/a',
          route: 'route1',
          match: 'good',
          participants: [],
        },
      },
    }),
  };
});

// Stub react-leaflet components
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: any) => <div>{children}</div>,
  TileLayer: () => null,
  Polyline: () => null,
  Marker: () => null,
  Popup: () => null,
}));

// Stub react-toastify
vi.mock('react-toastify', () => ({
  ToastContainer: () => <div />, toast: { success: vi.fn(), error: vi.fn(), warn: vi.fn() },
}));

const routeMock = {
  request: { query: FETCH_ROUTE, variables: { routeID: 'route1' } },
  result: {
    data: {
      getRoute: {
        points: [[0, 0]],
        elevation: [0],
        grade: [],
        terrain: [],
        distance: 0,
        maxElevation: 0,
        minElevation: 0,
        totalElevationGain: 0,
        startCoordinates: [0, 0],
        endCoordinates: [0, 0],
        __typename: 'Route',
      },
    },
  },
};

describe('EditRidePage', () => {
  test('enables edit button when ride name changes', async () => {
    const mockAuth = { user: { username: 'user', loginToken: 'token' }, login: vi.fn(), logout: vi.fn() };
    const { container } = render(
      <AuthContext.Provider value={mockAuth}>
        <MockedProvider mocks={[routeMock]} addTypename={false}>
          <MemoryRouter>
            <EditRide />
          </MemoryRouter>
        </MockedProvider>
      </AuthContext.Provider>
    );

    // Scope within the form
    const formContainer = container.querySelector<HTMLElement>('.create-ride-form-container')!;
    const form = within(formContainer);

    // Get inputs and buttons
    const nameInput = await form.findByLabelText(/Ride name/i) as HTMLInputElement;
    const editBtn = form.getByRole('button', { name: /Edit ride/i });

    // Change value and assert
    fireEvent.change(nameInput, { target: { value: 'New Ride Name' } });
    await waitFor(() => expect(nameInput.value).toBe('New Ride Name'));
    expect(editBtn).toBeEnabled();
  });
});
