// Account.test.js
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import axiosMock from 'axios-mock-adapter';
import { AuthData } from "../../auth/AuthWrapper";
import { Account } from './Account';
import '@testing-library/jest-dom/extend-expect';

// Mocking the AuthData
jest.mock("../../auth/AuthWrapper", () => ({
  AuthData: () => ({
    user: { name: "testuser" },
  }),
}));

const mock = new axiosMock(axios);

describe('Account Component', () => {
  beforeEach(() => {
    mock.reset();
  });

  it('displays the correct number of records based on fetched user data', async () => {
    const userData = [
      { id: 1, openCount: 2 },
      { id: 2, openCount: 1 }
    ];

    mock.onGet("http://localhost:8000/api/userData/testuser").reply(200, userData);

    render(<Account />);

    await waitFor(() => {
      expect(screen.getByText('Total Records')).toBeInTheDocument();
    });

    const totalRecords = screen.getByText(userData.length.toString());
    expect(totalRecords).toBeInTheDocument();
  });
});
