import React, { useState } from "react";
import axios from "axios";
import { AuthData } from "../../auth/AuthWrapper";
import '../style/shortner.css';

const ShipmentForm = () => {
  const { user } = AuthData();
  const [parcelWidth, setParcelWidth] = useState("");
  const [parcelHeight, setParcelHeight] = useState("");
  const [parcelDepth, setParcelDepth] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [recipientMobileNumber, setRecipientMobileNumber] = useState("");
  const [senderName, setSenderName] = useState("");
  const [senderAddress, setSenderAddress] = useState("");
  const [senderPhoneNumber, setSenderPhoneNumber] = useState("");
  const [location, setLocation] = useState(""); // State for location
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [lockerOpenCode, setLockerOpenCode] = useState(""); // New state for locker open code

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8000/api/shipment", {
        parcelWidth,
        parcelHeight,
        parcelDepth,
        recipientName,
        recipientAddress,
        recipientMobileNumber,
        senderName,
        senderAddress,
        senderPhoneNumber,
        senderEmail: user.name, // Use the user's email as the sender email
        location, // Include location in the request
      });
      setResponseMessage("Shipment created successfully!");
      setLockerOpenCode(response.data.lockerOpenCode); // Set locker open code from response
    } catch (error) {
      console.error("Error creating shipment:", error);
      setResponseMessage("Error creating shipment");
      setLockerOpenCode(""); // Clear locker open code on error
    }
    setLoading(false);
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Create Shipment</h2>
      <div className="form-group">
        <label>Parcel Width:</label>
        <input
          type="text"
          className="form-control"
          value={parcelWidth}
          onChange={(e) => setParcelWidth(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Parcel Height:</label>
        <input
          type="text"
          className="form-control"
          value={parcelHeight}
          onChange={(e) => setParcelHeight(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Parcel Depth:</label>
        <input
          type="text"
          className="form-control"
          value={parcelDepth}
          onChange={(e) => setParcelDepth(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Recipient Name:</label>
        <input
          type="text"
          className="form-control"
          value={recipientName}
          onChange={(e) => setRecipientName(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Recipient Address:</label>
        <input
          type="text"
          className="form-control"
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Recipient Mobile Number:</label>
        <input
          type="text"
          className="form-control"
          value={recipientMobileNumber}
          onChange={(e) => setRecipientMobileNumber(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Sender Name:</label>
        <input
          type="text"
          className="form-control"
          value={senderName}
          onChange={(e) => setSenderName(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Sender Address:</label>
        <input
          type="text"
          className="form-control"
          value={senderAddress}
          onChange={(e) => setSenderAddress(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Sender Phone Number:</label>
        <input
          type="text"
          className="form-control"
          value={senderPhoneNumber}
          onChange={(e) => setSenderPhoneNumber(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Location:</label>
        <select
          className="form-control"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        >
          <option value="">Select Location</option>
          <option value="Location1">Location 1</option>
          <option value="Location2">Location 2</option>
          <option value="Location3">Location 3</option>
          <option value="Location4">Location 4</option>
          <option value="Location5">Location 5</option>
        </select>
      </div>
      <button
        className="btn btn-primary"
        type="button"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Submitting..." : "Submit"}
      </button>
      {responseMessage && (
        <div className="mt-3 alert alert-info">
          {responseMessage} {lockerOpenCode && `Locker Open Code: ${lockerOpenCode}`}
        </div>
      )}
    </div>
  );
};

export default ShipmentForm;
