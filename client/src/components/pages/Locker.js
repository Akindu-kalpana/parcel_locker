import React, { useState } from 'react';
import axios from 'axios';

const locations = [
  'Location1',
  'Location2',
  'Location3',
  'Location4',
  'Location5'
];

export const Locker = () => {
  const [location, setLocation] = useState("");
  const [openingCode, setOpeningCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [lockerId, setLockerId] = useState("");
  const [parcelId, setParcelId] = useState(""); // Add state to store parcelId
  const [isLockerOpened, setIsLockerOpened] = useState(false); // Track if locker is opened

  const handleCheckLockerCode = async () => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8000/api/check-locker-code", {
        location,
        openingCode
      });

      if (response.data.message === 'DOOR') {
        setResponseMessage(`DOOR ${response.data.lockerId} OPEN FOR PICKUP`);
        setIsLockerOpened(true); // Mark locker as opened
        setLockerId(response.data.lockerId || ""); // Store lockerId
        setParcelId(response.data.parcelId || ""); // Store parcelId
      } else {
        setResponseMessage(response.data.message);
        setIsLockerOpened(false); // Mark locker as not opened
      }
    } catch (error) {
      console.error("Error checking locker code:", error);
      setResponseMessage("Error checking locker code");
    }
    setLoading(false);
  };

  const handleCloseCabinet = async () => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8000/api/close-locker", {
        location,
        openingCode,
        parcelId // Include parcelId in the request body
      });

      setResponseMessage(response.data.message);
      setIsLockerOpened(false); // Mark locker as closed
    } catch (error) {
      console.error("Error closing locker:", error);
      setResponseMessage("Error closing locker");
    }
    setLoading(false);
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Check Locker Code</h2>
      <div className="form-group">
        <label>Location:</label>
        <select
          className="form-control"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        >
          <option value="">Select Location</option>
          {locations.map((loc, index) => (
            <option key={index} value={loc}>{loc}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Enter pickup Code:</label>
        <input
          type="text"
          className="form-control"
          value={openingCode}
          onChange={(e) => setOpeningCode(e.target.value)}
        />
      </div>
      <button
        className="btn btn-secondary mt-3"
        onClick={handleCheckLockerCode}
        disabled={loading}
      >
        {loading ? "Checking..." : "Check Locker Code"}
      </button>
      {responseMessage && (
        <div className="mt-3 alert alert-info">
          {responseMessage}
          {lockerId && <div></div>}
          {isLockerOpened && (
            <button
              className="btn btn-danger mt-3"
              onClick={handleCloseCabinet}
              disabled={loading}
            >
              {loading ? "Closing..." : "Close Cabinet"}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
