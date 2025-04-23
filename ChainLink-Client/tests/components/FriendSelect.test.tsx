import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import FriendSelect from '../../src/components/FriendSelect';
import { GET_INVITABLE_FRIENDS } from '../../src/graphql/queries/friendshipQueries';
import '@testing-library/jest-dom';

const mockUsername = 'currentUser';
const mockEventID = 'event123';
const friendsList = ['alice', 'bob', 'charlie'];

const emptyMocks = [
  {
    request: {
      query: GET_INVITABLE_FRIENDS,
      variables: { username: mockUsername, eventID: mockEventID },
    },
    result: { data: { getInvitableFriends: [] } },
  },
];

const friendsMocks = [
  {
    request: {
      query: GET_INVITABLE_FRIENDS,
      variables: { username: mockUsername, eventID: mockEventID },
    },
    result: { data: { getInvitableFriends: friendsList } },
  },
];

const errorMocks = [
  {
    request: {
      query: GET_INVITABLE_FRIENDS,
      variables: { username: mockUsername, eventID: mockEventID },
    },
    error: new Error('Network error'),
  },
];

describe('FriendSelect Component', () => {
  test('shows loading state initially', () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <FriendSelect
          username={mockUsername}
          eventID={mockEventID}
          onSelect={vi.fn()}
          onSelectAll={vi.fn()}
        />
      </MockedProvider>
    );
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('shows error message on query failure', async () => {
    render(
      <MockedProvider mocks={errorMocks} addTypename={false}>
        <FriendSelect
          username={mockUsername}
          eventID={mockEventID}
          onSelect={vi.fn()}
          onSelectAll={vi.fn()}
        />
      </MockedProvider>
    );
    await waitFor(() => expect(screen.getByText('Error loading friends')).toBeInTheDocument());
  });

  test('renders no friends when list empty', async () => {
    render(
      <MockedProvider mocks={emptyMocks} addTypename={false}>
        <FriendSelect
          username={mockUsername}
          eventID={mockEventID}
          onSelect={vi.fn()}
          onSelectAll={vi.fn()}
        />
      </MockedProvider>
    );
    await waitFor(() => {
      expect(screen.getByText('Select All')).toBeInTheDocument();
      // Only the select-all checkbox should exist
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(1);
    });
  });

  test('renders list of friends with checkboxes', async () => {
    render(
      <MockedProvider mocks={friendsMocks} addTypename={false}>
        <FriendSelect
          username={mockUsername}
          eventID={mockEventID}
          onSelect={vi.fn()}
          onSelectAll={vi.fn()}
        />
      </MockedProvider>
    );
    await waitFor(() => {
      friendsList.forEach((friend) => {
        expect(screen.getByText(friend)).toBeInTheDocument();
      });
      const checkboxes = screen.getAllByRole('checkbox');
      // one for select-all and one per friend
      expect(checkboxes).toHaveLength(friendsList.length + 1);
    });
  });

  test('selecting a friend toggles checkbox and calls onSelect', async () => {
    const onSelect = vi.fn();
    render(
      <MockedProvider mocks={friendsMocks} addTypename={false}>
        <FriendSelect
          username={mockUsername}
          eventID={mockEventID}
          onSelect={onSelect}
          onSelectAll={vi.fn()}
        />
      </MockedProvider>
    );
    await waitFor(() => expect(screen.getByText('alice')).toBeInTheDocument());
    const aliceCheckbox = screen.getAllByRole('checkbox')[1];
    fireEvent.click(aliceCheckbox);
    expect(aliceCheckbox).toBeChecked();
    expect(onSelect).toHaveBeenCalledWith('alice');
    fireEvent.click(aliceCheckbox);
    expect(aliceCheckbox).not.toBeChecked();
    expect(onSelect).toHaveBeenCalledWith('alice');
  });

  test('select-all toggles all checkboxes and calls onSelectAll', async () => {
    const onSelectAll = vi.fn();
    render(
      <MockedProvider mocks={friendsMocks} addTypename={false}>
        <FriendSelect
          username={mockUsername}
          eventID={mockEventID}
          onSelect={vi.fn()}
          onSelectAll={onSelectAll}
        />
      </MockedProvider>
    );
    await waitFor(() => expect(screen.getByText('Select All')).toBeInTheDocument());
    const checkboxes = screen.getAllByRole('checkbox');
    const selectAllBox = checkboxes[0];

    // Select all
    fireEvent.click(selectAllBox);
    expect(onSelectAll).toHaveBeenCalledWith(friendsList);
    checkboxes.slice(1).forEach((cb) => expect(cb).toBeChecked());

    // Deselect all
    fireEvent.click(selectAllBox);
    expect(onSelectAll).toHaveBeenCalledWith([]);
    checkboxes.slice(1).forEach((cb) => expect(cb).not.toBeChecked());
  });
});
