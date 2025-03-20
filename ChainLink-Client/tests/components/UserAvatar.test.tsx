import React from 'react';
import { describe, test, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import UserAvatar from '../../src/components/UserAvatar';
import { MockedProvider } from '@apollo/client/testing';
import { FETCH_USER_BY_NAME } from '../../src/graphql/queries/userQueries';
import AWS from 'aws-sdk';
import '@testing-library/jest-dom';

const mocks = [
  {
    request: {
      query: FETCH_USER_BY_NAME,
      variables: { username: 'testUser' },
    },
    result: {
      data: {
        inviteToEvent: {
          id: '1',
          username: 'testUser',
          hasProfileImage: true
        },
      },
    },
  },
];

describe('UserAvatar Component', () => {
  test('renders correctly with username', async () => {
    const { container } = render(
      <MockedProvider mocks={mocks}>
        <UserAvatar username="testUsername" ></UserAvatar>
      </MockedProvider>
    );

    expect(container.children.length).toBe(1);
  });
  
  test('renders correctly with hasProfileImage', async () => {
    const generatePresignedUrlTest = vi.spyOn(AWS.S3.prototype, "getSignedUrlPromise").mockResolvedValue("https://testURL.com");

    render(
      <MockedProvider mocks={mocks}>
        <UserAvatar username="testUsername" hasProfileImage={true} ></UserAvatar>
      </MockedProvider>
    );
    
    await waitFor(() => {
      const avatarImage = screen.getByRole("img");
      expect(avatarImage).toHaveAttribute("src", expect.stringContaining("https://testURL.com"));
    });

    generatePresignedUrlTest.mockRestore();
  });

  test('renders correct size when useLarge is true', async () => {
    const generatePresignedUrlTest = vi.spyOn(AWS.S3.prototype, "getSignedUrlPromise").mockResolvedValue("https://testURL.com");

    render(
      <MockedProvider mocks={mocks}>
        <UserAvatar username="testUsername" hasProfileImage={true} useLarge={true}></UserAvatar>
      </MockedProvider>
    );

    await waitFor(() => {
      const avatarImage = screen.getByRole("img");
      expect(avatarImage).toHaveStyle('width: 100px');
    });

    generatePresignedUrlTest.mockRestore();
  });

  test('renders correct size when useLarge is false', async () => {
    const generatePresignedUrlTest = vi.spyOn(AWS.S3.prototype, "getSignedUrlPromise").mockResolvedValue("https://testURL.com");

    render(
      <MockedProvider mocks={mocks}>
        <UserAvatar username="testUsername" hasProfileImage={true} useLarge={false}></UserAvatar>
      </MockedProvider>
    );

    await waitFor(() => {
      const avatarImage = screen.getByRole("img");
      expect(avatarImage).toHaveStyle('width: 50px');
    });

    generatePresignedUrlTest.mockRestore();
  });
});