import React, { useState } from 'react';
import axios from 'axios';

const locations = [
  'Location1',
  'Location2',
  'Location3',
  'Location4',
  'Location5'
];

export const Delivery = () => {
  const [location, setLocation] = useState(""); // State for selected location
  const [freeLockers, setFreeLockers] = useState([]); // State for free lockers
  const [responseMessage, setResponseMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLocationChange = async (event) => {
    const selectedLocation = event.target.value;
    setLocation(selectedLocation);

    if (selectedLocation) {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:8000/api/free-lockers", {
          params: { location: selectedLocation }
        });

        setFreeLockers(response.data.freeLockers);
        setResponseMessage(`Free lockers at ${selectedLocation}`);
      } catch (error) {
        console.error("Error fetching free lockers:", error);
        setResponseMessage("Error fetching free lockers");
      }
      setLoading(false);
    } else {
      setFreeLockers([]);
    }
  };

  return (
    <div className="page">
      <h2>Driver</h2>
      <div className="form-group">
        <label>Location:</label>
        <select
          className="form-control"
          value={location}
          onChange={handleLocationChange}
        >
          <option value="">Select Location</option>
          {locations.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </div>
      {loading && <p>Loading...</p>}
      {responseMessage && (
        <div className="mt-3 alert alert-info">
          {responseMessage}
        </div>
      )}
      {freeLockers.length > 0 && (
        <div className="mt-3">
          <h3>Free Lockers:</h3>
          <ul className="list-group">
            {freeLockers.map(lockerId => (
              <li key={lockerId} className="list-group-item">
                Locker ID: {lockerId}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
