import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { render, RenderResult } from '@testing-library/react';

interface RenderOptions {
  mocks?: MockedResponse[];
  route?: string;
}

export const renderWithProviders = (
  ui: React.ReactElement,
  { mocks = [], route = '/' }: RenderOptions = {}
): RenderResult => {
  return render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <MemoryRouter initialEntries={[route]}>
        {ui}
      </MemoryRouter>
    </MockedProvider>
  );
};