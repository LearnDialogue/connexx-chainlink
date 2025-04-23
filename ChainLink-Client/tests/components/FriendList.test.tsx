import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import FriendList from '../../src/components/FriendList';
import { GET_FRIENDS, GET_FRIEND_REQUESTS } from '../../src/graphql/queries/friendshipQueries';
import { FETCH_USER_BY_NAME } from '../../src/graphql/queries/userQueries';
import '@testing-library/jest-dom';

const mockUsername = 'currentUser';

const emptyMocks = [
  {
    request: { query: GET_FRIENDS, variables: { username: mockUsername } },
    result: { data: { getFriends: [] } },
  },
  {
    request: { query: GET_FRIEND_REQUESTS, variables: { username: mockUsername } },
    result: { data: { getFriendRequests: [] } },
  },
];

const friendsMocks = [
  {
    request: { query: GET_FRIENDS, variables: { username: mockUsername } },
    result: { data: { getFriends: ['alice', 'bob'] } },
  },
  {
    request: { query: GET_FRIEND_REQUESTS, variables: { username: mockUsername } },
    result: { data: { getFriendRequests: [] } },
  },
];

const requestsMocks = [
  {
    request: { query: GET_FRIENDS, variables: { username: mockUsername } },
    result: { data: { getFriends: [] } },
  },
  {
    request: { query: GET_FRIEND_REQUESTS, variables: { username: mockUsername } },
    result: { data: { getFriendRequests: [{ sender: 'charlie' }] } },
  },
];

const profileMocks = [
  ...friendsMocks.filter(m => m.request.query === GET_FRIENDS),
  ...friendsMocks.filter(m => m.request.query === GET_FRIEND_REQUESTS),
  {
    request: { query: FETCH_USER_BY_NAME, variables: { username: 'alice' } },
    result: {
      data: {
        getUser: {
          username: 'alice',
          firstName: 'Alice',
          lastName: 'Liddell',
          birthday: '1990-05-04',
          locationName: 'Wonderland',
          hasProfileImage: false,
          experience: 'Explorer',
          eventsHosted: [1, 2],
          __typename: 'User',
        },
      },
    },
  },
];

describe('FriendList Component', () => {
  test('displays loading state', () => {
    render(
      <MockedProvider mocks={emptyMocks} addTypename={false}>
        <FriendList username={mockUsername} />
      </MockedProvider>
    );
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('displays no friends when none', async () => {
    render(
      <MockedProvider mocks={emptyMocks} addTypename={false}>
        <FriendList username={mockUsername} />
      </MockedProvider>
    );
    await waitFor(() => expect(screen.getByText('No friends at this time.')).toBeInTheDocument());
  });

  test('displays friends list', async () => {
    render(
      <MockedProvider mocks={friendsMocks} addTypename={false}>
        <FriendList username={mockUsername} />
      </MockedProvider>
    );
    await waitFor(() => {
      expect(screen.getByText('alice')).toBeInTheDocument();
      expect(screen.getByText('bob')).toBeInTheDocument();
    });
  });

  test('toggles to friend requests and displays requests', async () => {
    render(
      <MockedProvider mocks={requestsMocks} addTypename={false}>
        <FriendList username={mockUsername} />
      </MockedProvider>
    );
    // wait for friends section to settle
    await waitFor(() => expect(screen.getByText('No friends at this time.')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Friend Requests'));
    await waitFor(() => expect(screen.getByText('charlie')).toBeInTheDocument());
  });

  test('clicking friend shows profile panel loading and then content', async () => {
    render(
      <MockedProvider mocks={profileMocks} addTypename={false}>
        <FriendList username={mockUsername} />
      </MockedProvider>
    );
    await waitFor(() => expect(screen.getByText('alice')).toBeInTheDocument());
    fireEvent.click(screen.getByText('alice'));
    expect(screen.getByText('Loading profile...')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Alice Liddell')).toBeInTheDocument());
    expect(screen.getByText(/Explorer/)).toBeInTheDocument();
  });
});
