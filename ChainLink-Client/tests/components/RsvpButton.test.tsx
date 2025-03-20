import React from 'react';
import { describe, test, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import RsvpButton from './RsvpButton';
import { MockedProvider } from '@apollo/client/testing';
import '@testing-library/jest-dom';
import { JOIN_RIDE } from '../graphql/mutations/eventMutations';

const mocks = [
  {
    request: {
      query: JOIN_RIDE,
      variables: { eventID: 'testID' },
    },
    result: {
      data: {
        joinEvent: {
          _id: '1',
          host: 'testUser',
          name: 'testRide',
          locationName: 'testLocation',
          locationCoords: 'testCoordinates',
          startTime: 'testStartTime',
          description: 'testDecription',
          bikeType: 'testBikeType',
          difficulty: 'testDifficulty',
          wattsPerKilo: 0,
          intensity: 'testIntensity',
          route: 'testRoute',
          participants: ['testUser'],
          __typename: 'testEvent',
        },
      },
    },
  },
];

describe('RsvpButton Component', () => {
  test('renders with correct default style', () => {
    render(
      <MockedProvider>
          <RsvpButton isJoined={undefined} eventID='testID' type="primary" setJoinedStatus={vi.fn()}></RsvpButton>
      </MockedProvider>
    );
    const rsvpButton = screen.getByRole('button');
    expect(rsvpButton).toHaveClass('button-primary');
  });

  test('renders with correct secondary style', () => {
    render(
      <MockedProvider>
          <RsvpButton isJoined={undefined} eventID='testID' type="secondary" setJoinedStatus={vi.fn()}></RsvpButton>
      </MockedProvider>
    );
    const rsvpButton = screen.getByRole('button');
    expect(rsvpButton).toHaveClass('button-secondary');
  });

  test('renders with correct custom width', () => {
    render(
      <MockedProvider>
          <RsvpButton isJoined={undefined} eventID='testID' type="primary" width={100} setJoinedStatus={vi.fn()}></RsvpButton>
      </MockedProvider>
    );
    const rsvpButton = screen.getByRole('button');
    expect(rsvpButton).toHaveStyle('width: 100%');
  });

  test('RsvpButton is disabled when disabled prop is true', () => {
    render(
      <MockedProvider>
          <RsvpButton isJoined={undefined} eventID='testID' type="primary" disabled={true} setJoinedStatus={vi.fn()}></RsvpButton>
      </MockedProvider>
    );
    const rsvpButton = screen.getByRole('button');
    expect(rsvpButton).toBeDisabled;
  });
    
  test('setJoinedStatus function is activated when clicked', () => {
    const mockFunction = vi.fn();
    render(
      <MockedProvider mocks={mocks}>
          <RsvpButton isJoined={undefined} eventID='testID' type="primary" setJoinedStatus={mockFunction}></RsvpButton>
      </MockedProvider>
    );
    const rsvpButton = screen.getByRole('button');
    fireEvent.click(rsvpButton);
    expect(mockFunction).toHaveBeenCalledTimes(1);
  });
});