import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import RideList from "../../src/components/RideList";

const mockEvents = [
    {
        name: "First future ride",
        startTime: "2030-03-10",
        locationName: "City Park",
    },
    {
        name: "Second future ride",
        startTime: "2030-04-12",
        locationName: "Mountain Trail",
    },
    {
        name: "Past ride",
        startTime: "2020-03-10",
        locationName: "Old Route",
    },
];

describe("RideList component", () => {
    it("renders correct number of future rides", () => {
        const currDate = new Date("2025-01-01");
        const mockSelectEvent = vi.fn();

        const { container } = render(
            <RideList
                title="Upcoming Rides"
                events={mockEvents}
                onSelectEvent={mockSelectEvent}
                currDate={currDate}
            />
        );

        const rideItems = container.getElementsByClassName("profile-page-user-rides-list-item");
        expect(rideItems).to.have.lengthOf(2);
    });

    it("shows 'No rides to show' if no future rides", () => {
        const currDate = new Date("2050-01-01");
        const mockSelectEvent = vi.fn();

        render(
            <RideList
                title="Upcoming Rides"
                events={mockEvents}
                onSelectEvent={mockSelectEvent}
                currDate={currDate}
            />
        );

        expect(screen.getByText("No rides to show")).to.exist;
    });

    it("calls onSelectEvent when a ride is clicked", () => {
        const currDate = new Date("2025-01-01");
        const mockSelectEvent = vi.fn();

        render(
            <RideList
                title="Upcoming Rides"
                events={mockEvents}
                onSelectEvent={mockSelectEvent}
                currDate={currDate}
            />
        );

        const rideItem = screen.getByText("First future ride");
        fireEvent.click(rideItem);

        expect(mockSelectEvent).toHaveBeenCalledTimes(1);
        expect(mockSelectEvent).toHaveBeenCalledWith(
            expect.objectContaining({ name: "First future ride" })
        );
    });

    it("displays the date in the correct format", () => {
        const currDate = new Date("2025-01-01");
        render(
            <RideList
                title="Upcoming Rides"
                events={mockEvents}
                onSelectEvent={vi.fn()}
                currDate={currDate}
            />
        );

        expect(screen.getByText(/Mar/)).to.exist;
    });
});
