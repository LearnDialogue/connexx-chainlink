import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { test, describe, expect } from 'vitest';
import '@testing-library/jest-dom';

import Footer from '../../src/components/Footer';

describe ('Footer Component', () => {
    test('Renders in footer', () => {
        render(<Footer absolute />);
        const footer = document.querySelector('.footer-main-container');
        expect(footer).toHaveStyle('position: absolute;');
    })
})