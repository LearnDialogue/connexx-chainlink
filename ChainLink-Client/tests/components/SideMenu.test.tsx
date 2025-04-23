import React from 'react';
import { describe, test, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import SideMenu from '../../src/components/SideMenu';
import { MockedProvider } from '@apollo/client/testing';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';

describe('SideMenu Component', () => {
    test('renders SideMenu links', async () => {
        render(
            <MemoryRouter>
                <SideMenu isOpen={true} onClose={vi.fn()}></SideMenu>
            </MemoryRouter>
        );
        await waitFor(() => {
            const sideMenuLinks = screen.getAllByRole('link');
            expect(sideMenuLinks.length).toBeGreaterThan(0);
        });
    });

    test('renders nothing when closed', () => {
        const { container } = render(
            <MemoryRouter>
                <SideMenu isOpen={false} onClose={vi.fn()}></SideMenu>
            </MemoryRouter>
        );
        expect(container.firstChild).toBeNull();
    });

    test('onClose is triggered when overlay clicked', () => {
        const mockFunction = vi.fn();
        render(
            <MemoryRouter>
                <SideMenu isOpen={true} onClose={mockFunction}></SideMenu>
            </MemoryRouter>
        );
        const overlay = screen.getByTestId('side-menu-overlay');
        fireEvent.click(overlay);
        expect(mockFunction).toHaveBeenCalledTimes(1);
      });
});