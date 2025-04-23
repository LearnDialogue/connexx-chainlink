import React from 'react';
import { describe, test, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import FriendRequest from '../../src/components/FriendRequest';
import { AuthContext } from '../../src/context/auth';
import { REQUEST_FRIEND } from '../../src/graphql/mutations/friendshipMutations';
import '@testing-library/jest-dom';

const mockUser = { username: 'currentUser', loginToken: 'token' };

const successMock = [
  {
    request: {
      query: REQUEST_FRIEND,
      variables: { sender: 'currentUser', receiver: 'bob' },
    },
    result: {
      data: {
        sendFriendRequest: {
          _id: '1',
          status: 'pending',
          sender: 'currentUser',
          receiver: 'bob',
          createdAt: '2025-01-01T00:00:00Z',
          __typename: 'FriendRequest',
        },
      },
    },
  },
];

const errorMock = [
  {
    request: {
      query: REQUEST_FRIEND,
      variables: { sender: 'currentUser', receiver: 'bob' },
    },
    error: new Error('Network error'),
  },
];

describe('FriendRequest Component', () => {
  test('renders input and button', () => {
    render(
      <AuthContext.Provider value={{ user: mockUser, login: () => {}, logout: () => {} }}>
        <MockedProvider mocks={[]} addTypename={false}>
          <FriendRequest />
        </MockedProvider>
      </AuthContext.Provider>
    );

    expect(screen.getByPlaceholderText('Enter username...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Friend' })).toBeInTheDocument();
  });

  test('input remains empty when submitted without value', () => {
    render(
      <AuthContext.Provider value={{ user: mockUser, login: () => {}, logout: () => {} }}>
        <MockedProvider mocks={[]} addTypename={false}>
          <FriendRequest />
        </MockedProvider>
      </AuthContext.Provider>
    );

    const input = screen.getByPlaceholderText('Enter username...');
    fireEvent.click(screen.getByRole('button', { name: 'Add Friend' }));
    expect(input).toHaveValue('');
  });

  test('clears input on successful mutation', async () => {
    render(
      <AuthContext.Provider value={{ user: mockUser, login: () => {}, logout: () => {} }}>
        <MockedProvider mocks={successMock} addTypename={false}>
          <FriendRequest />
        </MockedProvider>
      </AuthContext.Provider>
    );

    const input = screen.getByPlaceholderText('Enter username...');
    fireEvent.change(input, { target: { value: 'bob' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add Friend' }));

    await waitFor(() => expect(input).toHaveValue(''));
  });

  test('does not clear input on mutation error', async () => {
    render(
      <AuthContext.Provider value={{ user: mockUser, login: () => {}, logout: () => {} }}>
        <MockedProvider mocks={errorMock} addTypename={false}>
          <FriendRequest />
        </MockedProvider>
      </AuthContext.Provider>
    );

    const input = screen.getByPlaceholderText('Enter username...');
    fireEvent.change(input, { target: { value: 'bob' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add Friend' }));

    await waitFor(() => expect(input).toHaveValue('bob'));
  });
});
