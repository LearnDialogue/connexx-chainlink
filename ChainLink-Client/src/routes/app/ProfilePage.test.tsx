import React from 'react';
import { describe, test, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { AuthContext } from "../../context/auth"
import { MemoryRouter } from 'react-router-dom';
import ProfilePage from './ProfilePage';
import { MockedProvider, wait } from '@apollo/client/testing';
import { FETCH_USER_BY_NAME } from '../../graphql/queries/userQueries';
import { GET_FRIENDS, GET_FRIEND_REQUESTS } from '../../graphql/queries/friendshipQueries';
import { GET_HOSTED_EVENTS, GET_INVITED_EVENTS, GET_JOINED_EVENTS } from '../../graphql/queries/eventQueries';
import '@testing-library/jest-dom';

const mockUser = { username: 'testUser', loginToken: 'testToken', }

const mocks = [
  {
    request: {
      query: FETCH_USER_BY_NAME,
      variables: { username: 'testUser' },
    },
    result: {
      data: {
        getUser: {
          id: '1',
          username: 'testUser',
          firstName: 'testFirstName',
          lastName: 'testLastName',
          email: 'testUser@email.com',
          isPrivate: false,
          birthday: '2000-01-01',
          weight: 100,
          locationName: 'testLocation',
          locationCoords: '0,0',
          radius: 100,
          sex: 'Male',
          bikeTypes: ['Road'],
          FTP: 100,
          FTPdate: '2025-01-01',
          experience: 'Intermediate',
          eventsHosted: 0,
          eventsJoined: 1,
          hasProfileImage: true,
        },
      },
    },
  },
  {
    request: {
      query: GET_HOSTED_EVENTS,
    },
    result: {
      data: {
        getHostedEvents: [
          {
            _id: '1',
            name: 'testEvent',
            host: 'testUser',
            locationName: 'testLocation',
            locationCoords: '0,0',
            startTime: '2025',
            description: 'testDescription',
            bikeType: 'Road',
            difficulty: 'Easy',
            wattsPerKilo: 0,
            intensity: 'Moderate',
            route: 'testRoute',
            participants: ['testUser']
          }
        ],
      },
    },
  },
  {
    request: {
      query: GET_JOINED_EVENTS,
    },
    result: {
      data: {
        getJoinedEvents: [
          {
            _id: '1',
            name: 'testEvent',
            host: 'testUser',
            locationName: 'testLocation',
            locationCoords: '0,0',
            startTime: '2025',
            description: 'testDescription',
            bikeType: 'Road',
            difficulty: 'Easy',
            wattsPerKilo: 0,
            intensity: 'Moderate',
            route: 'testRoute',
            participants: ['testUser']
          }
        ],
      },
    },
  },
  {
    request: {
      query: GET_INVITED_EVENTS,
    },
    result: {
      data: {
        getInvitedEvents: [
          {
            _id: '1',
            name: 'testEvent',
            host: 'testUser',
            locationName: 'testLocation',
            locationCoords: '0,0',
            startTime: '2025',
            description: 'testDescription',
            bikeType: 'Road',
            difficulty: 'Easy',
            wattsPerKilo: 0,
            intensity: 'Moderate',
            route: 'testRoute',
            participants: ['testUser']
          }
        ],
      },
    },
  },
  {
    request: {
      query: GET_FRIEND_REQUESTS,
      variables: { username: "testUser" },
    },
    result: {
      data: {
        getFriendRequests: [
          {
            sender: "testUser2",
            receiver: "testUser",
            status: "PENDING",
            createdAt: "2025-01-01",
          }
        ],
      },
    },
  },
  {
    request: {
      query: GET_FRIENDS,
      variables: { username: "testUser" },
    },
    result: {
      data: {
        getFriends: ["testUser2"]
      },
    },
  },
];

describe('ProfilePage', () => {
  test('correctly renders ProfilePage given required Mock queries', async () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={{ user: mockUser, login: vi.fn(), logout: vi.fn()}}>
          <MockedProvider mocks={mocks} addTypename={false}>
            <ProfilePage></ProfilePage>
          </MockedProvider>
        </AuthContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("profile-page-grid").children.length).toBeGreaterThan(3);
    });
  });
});