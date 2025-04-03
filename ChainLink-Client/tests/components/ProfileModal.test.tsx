import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useQuery } from '@apollo/client';
import { ProfileModal } from '../../src/components/ProfileModal';
import featureFlags from '../../src/featureFlags';

vi.mock('@apollo/client', async () => {
    const actual = await vi.importActual('@apollo/client');
    return {
        ...actual,
        useQuery: vi.fn(),
    };
});

vi.mock('react-tooltip', () => ({
    __esModule: true,
    Tooltip: ({ children }: { children?: React.ReactNode }) => (
        <div data-testid="tooltip">{children}</div>
    ),
}));

vi.mock('./FriendButton', () => ({
    __esModule: true,
    default: ({ username, friendStatus }: any) => (
        <div data-testid="friend-button">
            FriendButton: {username} - {friendStatus}
        </div>
    ),
}));

vi.mock('./UserAvatar', () => ({
    __esModule: true,
    default: ({ username, hasProfileImage }: any) => (
        <div data-testid="user-avatar">{username}</div>
    ),
}));

const mockUserData = {
    getUser: {
        id: '1',
        username: 'TestUser',
        firstName: 'Test',
        lastName: 'User',
        isPrivate: false,
        birthday: '1990-01-01',
        locationName: 'Testville',
        experience: 'Intermediate',
        eventsHosted: [{ id: '1' }],
        hasProfileImage: true,
    },
};

describe('ProfileModal', () => {
    const mockUsername = 'TestUser';

    it('renders loading state', () => {
        (useQuery as vi.Mock).mockReturnValue({
            loading: true,
            error: undefined,
            data: undefined,
        });

        render(<ProfileModal user={mockUsername} friendStatus="" />);
        expect(screen.getByText('Loading User Profile')).toBeInTheDocument();
    });

    it('renders nothing when error exists', () => {
        (useQuery as vi.Mock).mockReturnValue({
            loading: false,
            error: new Error('Test error'),
            data: undefined,
        });

        const { container } = render(
            <ProfileModal user={mockUsername} friendStatus="" />
        );
        expect(container).toBeEmptyDOMElement();
    });
});
