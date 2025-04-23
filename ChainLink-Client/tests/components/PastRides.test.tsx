import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PastRides from "../../src/components/PastRides";
import { AuthContext } from "../../src/context/auth";
import { useQuery } from "@apollo/client";
import '@testing-library/jest-dom';

vi.mock("@apollo/client", async () => {
    const actual = await vi.importActual("@apollo/client");
    return {
        ...actual,
        useQuery: vi.fn(),
    };
});


const mockUser = { username: "testUser" };

const pastHostedRide = {
    _id: "1",
    name: "Past hosted ride",
    host: "testUser",
    locationName: "testLocation",
    locationCoords: "0,0",
    startTime: "2020-01-01",
    description: "testDescription",
    bikeType: "Road",
    difficulty: "Easy",
    wattsPerKilo: 0,
    intensity: "Moderate",
    route: "testRoute",
    participants: ["testUser"],
};

const futureHostedRide = {
    _id: "2",
    name: "Future hosted ride",
    host: "testUser",
    locationName: "testLocation",
    locationCoords: "0,0",
    startTime: "2030-01-01",
    description: "testDescription",
    bikeType: "Road",
    difficulty: "Easy",
    wattsPerKilo: 0,
    intensity: "Moderate",
    route: "testRoute",
    participants: ["testUser"],
};

const mockHostedData = { getHostedEvents: [pastHostedRide, futureHostedRide] };

const pastJoinedRide = {
    _id: "3",
    name: "Past joined ride",
    host: "otherUser",
    locationName: "testLocation",
    locationCoords: "0,0",
    startTime: "2020-01-01",
    description: "testDescription",
    bikeType: "Road",
    difficulty: "Easy",
    wattsPerKilo: 0,
    intensity: "Moderate",
    route: "testRoute",
    participants: ["testUser"],
};

const futureJoinedRide = {
    _id: "4",
    name: "Future joined ride",
    host: "otherUser",
    locationName: "testLocation",
    locationCoords: "0,0",
    startTime: "2030-01-01",
    description: "testDescription",
    bikeType: "Road",
    difficulty: "Easy",
    wattsPerKilo: 0,
    intensity: "Moderate",
    route: "testRoute",
    participants: ["testUser"],
};

const mockJoinedData = { getJoinedEvents: [pastJoinedRide, futureJoinedRide] };

describe("PastRides component", () => {
    beforeEach(() => {
        (useQuery as vi.Mock).mockReset();
    });

    it("renders the heading for past rides", () => {
        (useQuery as vi.Mock)
            .mockReturnValueOnce({ data: {} }) // for GET_HOSTED_EVENTS
            .mockReturnValueOnce({ data: {} }); // for GET_JOINED_EVENTS

        render(
            <AuthContext.Provider value={{ user: mockUser }}>
                <PastRides onSelectEvent={vi.fn()} />
            </AuthContext.Provider>
        );

        expect(screen.getByText("Your past rides")).toBeInTheDocument();
    });

    it("displays and filters hosted past rides", () => {
        (useQuery as vi.Mock)
            .mockReturnValueOnce({ data: mockHostedData }) // GET_HOSTED_EVENTS returns both past and future rides
            .mockReturnValueOnce({ data: {} }); // GET_JOINED_EVENTS (empty)

        render(
            <AuthContext.Provider value={{ user: mockUser }}>
                <PastRides onSelectEvent={vi.fn()} />
            </AuthContext.Provider>
        );

        expect(screen.getByText("Past hosted ride")).toBeInTheDocument();
        expect(screen.queryByText("Future hosted ride")).not.toBeInTheDocument();
    });

    it("displays and filters joined past rides", () => {
        (useQuery as vi.Mock)
            .mockReturnValueOnce({ data: {} }) // GET_HOSTED_EVENTS (empty)
            .mockReturnValueOnce({ data: mockJoinedData }); // GET_JOINED_EVENTS returns both past and future rides

        render(
            <AuthContext.Provider value={{ user: mockUser }}>
                <PastRides onSelectEvent={vi.fn()} />
            </AuthContext.Provider>
        );

        expect(screen.getByText("Past joined ride")).toBeInTheDocument();
        expect(screen.queryByText("Future joined ride")).not.toBeInTheDocument();
    });

    it("shows 'No rides to show' for empty queries", () => {
        (useQuery as vi.Mock)
            .mockReturnValueOnce({ data: { getHostedEvents: undefined } })
            .mockReturnValueOnce({ data: { getJoinedEvents: undefined } });

        render(
            <AuthContext.Provider value={{ user: mockUser }}>
                <PastRides onSelectEvent={vi.fn()} />
            </AuthContext.Provider>
        );

        expect(screen.getAllByText("No rides to show")).toHaveLength(2);
    });


    it("calls onSelectEvent when a hosted event is clicked", () => {
        const onSelectEventMock = vi.fn();

        (useQuery as vi.Mock)
            .mockReturnValueOnce({ data: mockHostedData })
            .mockReturnValueOnce({ data: {} });

        render(
            <AuthContext.Provider value={{ user: mockUser }}>
                <PastRides onSelectEvent={onSelectEventMock} />
            </AuthContext.Provider>
        );

        const rideElement = screen.getByText("Past hosted ride");
        fireEvent.click(rideElement);

        expect(onSelectEventMock).toHaveBeenCalledTimes(1);
        expect(onSelectEventMock).toHaveBeenCalledWith(
            expect.objectContaining({ name: "Past hosted ride" })
        );
    });
});
