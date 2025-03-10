import React from 'react';
import { describe, test, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import ShareRide from './ShareRide';
import { MockedProvider } from '@apollo/client/testing';
import { INVITE_TO_EVENT } from '../graphql/mutations/eventMutations';
import '@testing-library/jest-dom';

const mocks = [
  {
    request: {
      query: INVITE_TO_EVENT,
      variables: { eventID: '1', invitees: ['testUser1'] },
    },
    result: {
      data: {
        inviteToEvent: {
          _id: '1',
          name: 'testRide',
          invited: ['testUser1']
        },
      },
    },
  },
];

const testEvent = {
  _id: '1',
  invitees: ['testUser1']
};

describe('ShareRide Component', () => {
  test('calls INVITE_TO_EVENT mutation correctly given correct props', async () => {
    render(
      <MockedProvider mocks={mocks}>
          <ShareRide event={testEvent} onClose={vi.fn()}></ShareRide>
      </MockedProvider>
    );
    const buttons = screen.getAllByRole('button');
    const shareRideButton = buttons[0];
    fireEvent.click(shareRideButton);

    await waitFor(() => {
      expect(mocks[0].request.variables).toEqual({
        eventID: "1",
        invitees: ["testUser1"],
      });
    });
  });

  test('onClose is triggered when button is clicked', async () => {
    const mockFunction = vi.fn();
    render(
      <MockedProvider mocks={mocks}>
          <ShareRide event={testEvent} onClose={mockFunction}></ShareRide>
      </MockedProvider>
    );
    const buttons = screen.getAllByRole('button');
    const closeButton = buttons[1];
    fireEvent.click(closeButton);
    expect(mockFunction).toHaveBeenCalledTimes(1);
  });
});