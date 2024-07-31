import React, { useEffect, useState } from 'react';
import axios from 'axios'; // Import axios for making HTTP requests
import { AuthData } from "../../auth/AuthWrapper";
import Table from '../userRecoard';
import '../style/account.css';
import { Card, CardContent, Typography, Button } from '@mui/material';

export const Account = () => {
  const { user } = AuthData();
  const [userData, setUserData] = useState([]); // State for storing user data
  const [openCount, setOpenCount] = useState(0); // State for storing open count
  const [isDeleting, setIsDeleting] = useState(false); // State to handle the deletion process

  useEffect(() => {
    fetchUserData(user.name);
  }, [user.name]); // Include user.name in the dependency array to trigger the effect when it changes

  useEffect(() => {
    // Calculate open count when userData changes
    const count = userData.reduce((total, data) => total + data.openCount, 0);
    setOpenCount(count);
  }, [userData]);

  const fetchUserData = async (userEmail) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/userData/${userEmail}`);
      setUserData(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      setIsDeleting(true);
      try {
        await axios.delete(`http://localhost:8000/api/deleteAccount/${user.name}`);
        // Optionally, redirect the user or show a success message
        window.location.href = "/login"; // Redirect to login or home page
      } catch (error) {
        console.error("Error deleting account:", error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Calculate the number of records
  const numRecords = userData.length;

  return (
    <div>
      <h2 className="mb-4 text">Dashboard</h2>
      <div className="dashboard-container">
        <Card className="record-card">
          <CardContent>
            <Typography variant="h6" component="div">
              Total Records
            </Typography>
            <Typography variant="h4" component="div">
              {numRecords}
            </Typography>
          </CardContent>
        </Card>
        <Button
          variant="contained"
          color="error"
          onClick={handleDeleteAccount}
          disabled={isDeleting}
        >
          {isDeleting ? 'Deleting...' : 'Delete Account'}
        </Button>
      </div>
      <Table userData={userData} />
    </div>
  );
};
