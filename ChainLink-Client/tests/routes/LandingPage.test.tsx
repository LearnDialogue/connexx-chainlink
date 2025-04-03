import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import LandingPage from '../../src/routes/LandingPage';
import { AuthContext } from '../../src/context/auth';

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: vi.fn(),
    };
});

import { useNavigate } from 'react-router-dom';

describe('LandingPage component', () => {
    test('redirects to /app/profile when user is logged in', async () => {
        const navigateMock = vi.fn();
        (useNavigate as vi.Mock).mockReturnValue(navigateMock);

        const user = { username: 'TestUser' };
        const logoutMock = vi.fn();

        render(
            <AuthContext.Provider value={{ user, logout: logoutMock }}>
                <MemoryRouter>
                    <LandingPage />
                </MemoryRouter>
            </AuthContext.Provider>
        );

        await waitFor(() => {
            expect(navigateMock).toHaveBeenCalledWith('/app/profile');
        });
    });

    test('displays login and sign up options when no user is logged in', async () => {
        const navigateMock = vi.fn();
        (useNavigate as vi.Mock).mockReturnValue(navigateMock);

        render(
            <AuthContext.Provider value={{ user: null, logout: () => {} }}>
                <MemoryRouter>
                    <LandingPage />
                </MemoryRouter>
            </AuthContext.Provider>
        );

        expect(screen.getByText(/login/i)).toBeInTheDocument();
        expect(screen.getByText(/sign up/i)).toBeInTheDocument();
        expect(screen.getByText(/get started/i)).toBeInTheDocument();

        expect(navigateMock).not.toHaveBeenCalled();
    });
});
