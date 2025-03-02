import { useState } from 'react';
import { describe, test, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EventModal from './EventModal';
import '@testing-library/jest-dom';

const [event, setEvent] = useState<any | null>(null);
const handleModalClose = (nullEvent: any | null) => {
    setEvent(nullEvent);
  };

describe('EventModal Component', () => {
    test('render event modal', () => {
        render(<EventModal event={event} setEvent={handleModalClose} />);
        const eModal = screen.getByRole("")
    })
})