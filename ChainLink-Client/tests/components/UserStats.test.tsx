import React from 'react';
import { describe, test, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import UserStats from '../../src/components/UserStats';
import { FETCH_USER_BY_NAME } from '../../src/graphql/queries/userQueries';
import { GET_HOSTED_EVENTS, GET_JOINED_EVENTS } from '../../src/graphql/queries/eventQueries';
import { MockedProvider } from '@apollo/client/testing';
import '@testing-library/jest-dom';

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
          hasProfileImage: true
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
  }
];

describe('UpcomingRides Component', () => {
  test('correctly renders UserStats based on mock events', async () => {
    render(
      <MockedProvider mocks={mocks}>
        <UserStats></UserStats>
      </MockedProvider>
    );

    await waitFor(() => {
      const ridesHosted = screen.getByTestId('rides-hosted');
      const ridesJoined = screen.getByTestId('rides-joined');
      expect(ridesHosted.children.length).toBe(2);
      expect(ridesJoined.children.length).toBe(2);
    });
  });
});