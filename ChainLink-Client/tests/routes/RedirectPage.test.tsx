import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { describe, it, expect, beforeEach } from 'vitest';
import RedirectPage from '../../src/routes/RedirectPage';
import { useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import '@testing-library/jest-dom';

vi.mock('@apollo/client', async () => {
    const actual = await vi.importActual('@apollo/client');
    return {
        ...actual,
        useMutation: vi.fn(),
    };
});

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: vi.fn(),
    };
});

describe('RedirectPage', () => {
    let navigateMock: ReturnType<typeof vi.fn>;
    let exchangeStravaMock: ReturnType<typeof vi.fn>;
    let onCompletedCallback: (() => void) | undefined;
    let onErrorCallback: ((error: Error) => void) | undefined;

    beforeEach(() => {
        navigateMock = vi.fn();
        (useNavigate as vi.Mock).mockReturnValue(navigateMock);

        onCompletedCallback = undefined;
        onErrorCallback = undefined;

        exchangeStravaMock = vi.fn();

        (useMutation as vi.Mock).mockImplementation((mutation, options) => {
            onCompletedCallback = options.onCompleted;
            onErrorCallback = options.onError;
            return [exchangeStravaMock, {}];
        });

        delete (window as any).location;
        (window as any).location = new URL('http://localhost/?code=testcode&scope=testscopec');

        localStorage.setItem('jwtToken', 'dummyToken');
    });

    it('calls exchangeStrava with correct variables and navigates on success', async () => {
        render(<RedirectPage />);

        await waitFor(() => {
            expect(exchangeStravaMock).toHaveBeenCalledWith({
                variables: { code: 'testcode', scope: 'testscopec' },
            });
        });

        onCompletedCallback && onCompletedCallback();

        await waitFor(() => {
            expect(navigateMock).toHaveBeenCalledWith('/app/profile');
        });
    });

    it('calls exchangeStrava and navigates on error', async () => {
        render(<RedirectPage />);

        await waitFor(() => {
            expect(exchangeStravaMock).toHaveBeenCalledWith({
                variables: { code: 'testcode', scope: 'testscopec' },
            });
        });

        onErrorCallback && onErrorCallback(new Error('Test error'));

        await waitFor(() => {
            expect(navigateMock).toHaveBeenCalledWith('/');
        });
    });
});
