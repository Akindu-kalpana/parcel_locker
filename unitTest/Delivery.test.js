// Delivery.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import axiosMock from 'axios-mock-adapter';
import { Delivery } from './Delivery';
import '@testing-library/jest-dom/extend-expect';

const mock = new axiosMock(axios);

describe('Delivery Component', () => {
  beforeEach(() => {
    mock.reset();
  });

  it('displays the correct list of free lockers based on selected location', async () => {
    const freeLockers = [101, 102, 103];
    const location = 'Location1';

    mock.onGet("http://localhost:8000/api/free-lockers", { params: { location } }).reply(200, { freeLockers });

    render(<Delivery />);

    const select = screen.getByLabelText('Location:');
    fireEvent.change(select, { target: { value: location } });

    await waitFor(() => {
      expect(screen.getByText(`Free lockers at ${location}`)).toBeInTheDocument();
    });

    freeLockers.forEach(lockerId => {
      expect(screen.getByText(`Locker ID: ${lockerId}`)).toBeInTheDocument();
    });
  });
});
