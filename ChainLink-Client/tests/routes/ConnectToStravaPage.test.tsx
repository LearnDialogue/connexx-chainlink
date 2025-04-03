import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ConnectToStravaPage from '../../src/routes/ConnectToStravaPage';
import { useLazyQuery } from '@apollo/client';

vi.mock('../assets/btn_strava_connectwith_light.png', () => ({
    default: 'connectWithStrava.png',
}));

vi.mock('@apollo/client', async () => {
    const actual = await vi.importActual('@apollo/client');
    return {
        ...actual,
        useLazyQuery: vi.fn(),
    };
});

describe('ConnectToStravaPage', () => {
    let requestStravaAuthorizationMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        vi.clearAllMocks();
        requestStravaAuthorizationMock = vi.fn();
    });

    it('renders loading state', () => {
        (useLazyQuery as vi.Mock).mockReturnValue([
            requestStravaAuthorizationMock,
            { loading: true, error: undefined, data: undefined },
        ]);

        const { container } = render(
            <MemoryRouter>
                <ConnectToStravaPage />
            </MemoryRouter>
        );

        expect(requestStravaAuthorizationMock).toHaveBeenCalled();

        const button = container.querySelector('button');
        expect(button).toBeInTheDocument();
        expect(button).toBeDisabled();
    });

    it('renders error state', async () => {
        const errorMessage = 'Test Error';
        (useLazyQuery as vi.Mock).mockReturnValue([
            requestStravaAuthorizationMock,
            { loading: false, error: { message: errorMessage }, data: undefined },
        ]);

        render(
            <MemoryRouter>
                <ConnectToStravaPage />
            </MemoryRouter>
        );

        expect(await screen.findByText(`Error: ${errorMessage}`)).toBeInTheDocument();
    });

    it('renders success state with data (without triggering onCompleted)', async () => {
        const testURL = 'http://example.com';
        (useLazyQuery as vi.Mock).mockReturnValue([
            requestStravaAuthorizationMock,
            {
                loading: false,
                error: undefined,
                data: { requestStravaAuthorization: testURL },
            },
        ]);

        const { container } = render(
            <MemoryRouter>
                <ConnectToStravaPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            const link = container.querySelector('a.button.button-transparent');
            expect(link).toBeInTheDocument();
            expect(link).toHaveAttribute('href', '');
        });
    });
});
