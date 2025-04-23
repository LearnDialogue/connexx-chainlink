import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import EventModal from "../../src/components/EventModal";
import { AuthContext } from "../../src/context/auth";
import { FETCH_ROUTE } from "../../src/graphql/queries/eventQueries";
import { GET_FRIEND_STATUSES } from "../../src/graphql/queries/friendshipQueries";
import { describe, test, expect } from "vitest";
import { renderWithProviders } from "../../src/test-utils";
import { FETCH_USER_BY_NAME } from "../../src/graphql/queries/userQueries";
import { MemoryRouter } from "react-router-dom";

import { vi } from "vitest";
import Button from "../../src/components/Button";
import RsvpButton from "../../src/components/RsvpButton";
import "@testing-library/jest-dom";
import { within } from "@testing-library/dom";

// Mock Leaflet Map Components
vi.mock("react-leaflet", () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  TileLayer: () => <div>TileLayer</div>,
  Marker: () => <div>Marker</div>,
  Polyline: () => <div>Polyline</div>,
  Popup: () => <div>Popup</div>,
}));

const mockUser = {
  username: "testUser",
  loginToken: "testToken123",
};

const mockEvent = {
  _id: "1",
  name: "Test Event",
  host: "testUser",
  participants: ["testUser", "friend1"],
  startTime: "2025-05-27 18:30:00.000",
  bikeType: ["Road"],
  difficulty: "Moderate",
  route: "route123",
  description: "~~~Test event description.~~~",
};

const routeMock = {
  request: { query: FETCH_ROUTE, variables: { routeID: "route123" } },
  result: {
    data: {
      getRoute: {
        startCoordinates: [51.505, -0.09],
        endCoordinates: [51.515, -10.09],
        points: [
          [51.505, -0.09],
          [51.515, -0.1],
        ],
        distance: 10,
        elevation: [100, 200],
      },
    },
  },
};

const friendStatusesMock = {
  request: {
    query: GET_FRIEND_STATUSES,
    variables: {
      currentUsername: "testUser",
      usernameList: ["testUser", "friend1"],
    },
  },
  result: {
    data: { getFriendStatuses: [{ otherUser: "friend1", status: "friend" }] },
  },
};

describe("EventModal Component", () => {
  test("renders correctly with event data and routeData", async () => {
    const setEventMock = vi.fn();

    render(
      <MockedProvider
        mocks={[routeMock, friendStatusesMock]}
        addTypename={false}
      >
        <MemoryRouter>
          <AuthContext.Provider
            value={{ user: mockUser, login: vi.fn(), logout: vi.fn() }}
          >
            <EventModal event={mockEvent} setEvent={setEventMock} />
          </AuthContext.Provider>
        </MemoryRouter>
      </MockedProvider>
    );

    await waitFor(() =>
      expect(screen.getByText("Test Event")).toBeInTheDocument()
    );
    await waitFor(() => {
      const createdByElement = screen.getByText(/Created by/i);
      expect(
        within(createdByElement).getByText("testUser")
      ).toBeInTheDocument();
    });
    await waitFor(() =>
      expect(
        screen.getByText("~~~Test event description.~~~")
      ).toBeInTheDocument()
    );
    await waitFor(() => expect(screen.getByText(/0 mi/)).toBeInTheDocument());
    await waitFor(() => {
      const startsAt = screen.getByText(/Starts at/i);
      expect(within(startsAt).getByText("6:30 pm")).toBeInTheDocument();
      expect(within(startsAt).getByText("Tue, May 27")).toBeInTheDocument();
    });
  });

  test("calls setEvent when close button is clicked", async () => {
    const setEventMock = vi.fn();

    render(
      <MockedProvider
        mocks={[routeMock, friendStatusesMock]}
        addTypename={false}
      >
        <MemoryRouter>
          <AuthContext.Provider
            value={{ user: mockUser, login: vi.fn(), logout: vi.fn() }}
          >
            <EventModal event={mockEvent} setEvent={setEventMock} />
          </AuthContext.Provider>
        </MemoryRouter>
      </MockedProvider>
    );

    await waitFor(() =>
      expect(
        document.querySelector(".ride-card-close-modal")
      ).toBeInTheDocument()
    );
    fireEvent.click(document.querySelector(".ride-card-close-modal")!);
    await waitFor(() => expect(setEventMock).toHaveBeenCalledWith(null));
  });

  test("does not render if event is null", () => {
    const { container } = render(
      <MockedProvider mocks={[]} addTypename={false}>
        <MemoryRouter>
          <AuthContext.Provider
            value={{ user: mockUser, login: vi.fn(), logout: vi.fn() }}
          >
            <EventModal event={null} setEvent={() => {}} />
          </AuthContext.Provider>
        </MemoryRouter>
      </MockedProvider>
    );

    expect(container.firstChild).toBeNull();
  });
});
