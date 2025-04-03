import React from "react";
import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import FriendButton from "../../src/components/FriendButton";
import { AuthContext } from "../../src/context/auth";
import { GET_FRIEND_STATUSES } from "../../src/graphql/queries/friendshipQueries";
//import { REQUEST_FRIEND } from "../graphql/mutations/friendshipMutations";
import { REQUEST_FRIEND } from "../../src/graphql/mutations/friendshipMutations";
import "@testing-library/jest-dom";

const mockUser = { username: 'currentUser', loginToken: 'testToken1', };

const mockRequest = [
    {
      request: {
        query: REQUEST_FRIEND,
        variables: { sender: "currentUser", receiver: "testUser" },
      },
      result: {
        data: {
          sendFriendRequest: {
            _id: "123",
            status: "pending",
            receiver: "testUser",
            sender: "currentUser",
            createdAt: "2025-03-05T12:00:00Z",
            __typename: "FriendRequest",
          },
        },
      },
    },
  ];

describe("FriendButton Component", () => {
    

  test("Renders correctly with 'Add Friend' button", () => {
    render(
      <AuthContext.Provider value={{ user: mockUser, login: vi.fn(), logout: vi.fn() }}>
        <MockedProvider mocks={mockRequest} addTypename={false}>
          <FriendButton username="testUser" friendStatus="none" />
        </MockedProvider>
      </AuthContext.Provider>
    );

    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("Add Friend");
    expect(button).toHaveClass("friend-button-primary add-friend-button");
  });

  test("renders correctly with 'Pending' state", () => {
    render(
      <AuthContext.Provider value={{ user: mockUser, login: vi.fn(), logout: vi.fn() }}>
        <MockedProvider mocks={mockRequest} addTypename={false}>
          <FriendButton username="testUser" friendStatus="pending" />
        </MockedProvider>
      </AuthContext.Provider>
    );

    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("Pending");
    expect(button).toHaveClass("friend-button-pending");
  });

  test("renders correctly with 'Friended' state", () => {
    render(
      <AuthContext.Provider value={{ user: mockUser, login: vi.fn(), logout: vi.fn() }}>
        <MockedProvider mocks={mockRequest} addTypename={false}>
          <FriendButton username="testUser" friendStatus="accepted" />
        </MockedProvider>
      </AuthContext.Provider>
    );

    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("Friended");
    expect(button).toHaveClass("friend-button-friend");
  });

  test("does not render button when viewing own profile", () => {
    render(
      <AuthContext.Provider value={{ user: mockUser, login: vi.fn(), logout: vi.fn() }}>
        <MockedProvider mocks={mockRequest} addTypename={false}>
          <FriendButton username="currentUser" friendStatus="none" />
        </MockedProvider>
      </AuthContext.Provider>
    );

    const button = screen.queryByRole("button");
    expect(button).not.toBeInTheDocument();
  });

  test("calls mutation when 'Add Friend' is clicked", async () => {
    const mockMutation = vi.fn();
    
    render(
      <AuthContext.Provider value={{ user: mockUser, login: vi.fn(), logout: vi.fn() }}>
        <MockedProvider mocks={mockRequest} addTypename={false}>
          <FriendButton username="testUser" friendStatus="none" />
        </MockedProvider>
      </AuthContext.Provider>
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(button).toHaveTextContent("Pending");
    expect(button).toHaveClass("friend-button-pending");
  });
});
