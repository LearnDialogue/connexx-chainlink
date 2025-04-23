import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../src/context/auth';
import SupportPage from '../../src/routes/SupportPage'
import '@testing-library/jest-dom';

describe('SupportPage', () => {
    const mockLogout = vi.fn();

    const renderSupportPage = (userValue: boolean) => {
        render(
            <AuthContext.Provider value={{ user: userValue, logout: mockLogout }}>
                <MemoryRouter>
                    <SupportPage />
                </MemoryRouter>
            </AuthContext.Provider>
        );
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('displays brand name and contact information', () => {
        renderSupportPage(false);
        expect(screen.getByText('Connexx ChainLink')).toBeInTheDocument();
        expect(screen.getByText('Contact Us')).toBeInTheDocument();
        const mailtoLink = screen.getByRole('link', { name: 'here' });
        expect(mailtoLink).toHaveAttribute('href', 'mailto:sunny@learndialogue.org');
    });

    test('renders login and sign up when user is logged out', () => {
        renderSupportPage(false);
        expect(screen.getByText('Login')).toBeInTheDocument();
        expect(screen.getByText('Sign up')).toBeInTheDocument();

        expect(screen.queryByText('Logout')).not.toBeInTheDocument();
    });

    test('renders logout button when user is logged in', () => {
        renderSupportPage(true);
        expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument();
        expect(screen.queryByText('Login')).not.toBeInTheDocument();
        expect(screen.queryByText('Sign up')).not.toBeInTheDocument();
    });

    test('calls logout function when logout button is clicked', () => {
        renderSupportPage(true);
        const logoutButton = screen.getByRole('button', { name: 'Logout' });
        fireEvent.click(logoutButton);
        expect(mockLogout).toHaveBeenCalledTimes(1);
    });
});