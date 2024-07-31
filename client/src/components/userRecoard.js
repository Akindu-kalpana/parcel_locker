import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, Typography, Button } from '@mui/material';
import './style/account.css';

const UserDataTable = ({ userData }) => {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [open, setOpen] = useState(false);

  // Function to open the modal with detailed information
  const handleClick = (record) => {
    setSelectedRecord(record);
    setOpen(true);
  };

  // Function to close the modal
  const handleClose = () => {
    setOpen(false);
    setSelectedRecord(null);
  };

  // Function to extract the last 4 digits from the parcelID
  const getLastFourDigits = (parcelId) => {
    return parcelId ? parcelId.slice(-4) : 'N/A';
  };

  return (
    <div>
      <h3 className="table-header">Your All History Records</h3>
      <TableContainer component={Paper} className="custom-table-container">
        <Table aria-label="user data table" className="custom-table">
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Parcel ID</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Retrieve Code</TableCell>
              <TableCell>Ready to Pick Up</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {userData.map((data, index) => (
              <TableRow key={index} hover onClick={() => handleClick(data)} style={{ cursor: 'pointer' }}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{data.parcelId}</TableCell>
                <TableCell>{data.status}</TableCell>
                <TableCell>{data.retrieveCode}</TableCell>
                <TableCell>{data.readyToPickUp ? 'Yes' : 'No'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal for displaying detailed information */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Shipment Details</DialogTitle>
        <DialogContent>
          {selectedRecord && (
            <div>
              <Typography variant="h6">Parcel ID: {selectedRecord.parcelId}</Typography>
              <Typography>Status: {selectedRecord.status}</Typography>
              <Typography>Retrieve Code: {selectedRecord.retrieveCode}</Typography>
              <Typography>Ready to Pick Up: {selectedRecord.readyToPickUp ? 'Yes' : 'No'}</Typography>
              {/* Add more detailed information as needed */}
              <Typography>Parcel Width: {selectedRecord.parcelWidth}</Typography>
              <Typography>Parcel Height: {selectedRecord.parcelHeight}</Typography>
              <Typography>Parcel Depth: {selectedRecord.parcelDepth}</Typography>
              <Typography>Recipient Name: {selectedRecord.recipientName}</Typography>
              <Typography>Recipient Address: {selectedRecord.recipientAddress}</Typography>
              <Typography>Recipient Mobile Number: {selectedRecord.recipientMobileNumber}</Typography>
              <Typography>Sender Name: {selectedRecord.senderName}</Typography>
              <Typography>Sender Address: {selectedRecord.senderAddress}</Typography>
              <Typography>Sender Phone Number: {selectedRecord.senderPhoneNumber}</Typography>
              <Typography>Sender Email: {selectedRecord.senderEmail}</Typography>
            </div>
          )}
          <Button onClick={handleClose} color="primary">Close</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserDataTable;
