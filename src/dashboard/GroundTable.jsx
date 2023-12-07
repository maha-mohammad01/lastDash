import React, { useState, useEffect } from 'react';
import axios from 'axios';

const GroundTable = () => {
  const [groundData, setGroundData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3100/Addground');
        setGroundData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []); // Empty dependency array means this effect runs once after the initial render

  const handleAccept = (index) => {
    // Handle accept action, you can update the data or perform other actions
    console.log(`Accepted: ${groundData[index].fullName}`);
  };

  const handleReject = (index) => {
    // Handle reject action, you can update the data or perform other actions
    console.log(`Rejected: ${groundData[index].fullName}`);
  };

  return (
    <div className="mt-5">
        <h1 className='font-bold mt-28  text-2xl'> Add playground </h1>
      <table className="min-w-full bg-white border border-gray-300 ml-10 mt-16">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Full Name</th>
            <th className="py-2 px-4 border-b">Phone</th>
            <th className="py-2 px-4 border-b">Location</th>
            <th className="py-2 px-4 border-b">City</th>
            <th className="py-2 px-4 border-b">Size</th>
            <th className="py-2 px-4 border-b">Price</th>
            <th className="py-2 px-4 border-b">Start Time</th>
            <th className="py-2 px-4 border-b">End Time</th>
            <th className="py-2 px-4 border-b">Notice</th>
            <th className="py-2 px-4 border-b">Payment</th>
            <th className="py-2 px-4 border-b">Images</th>
            <th className="py-2 px-4 border-b">Action</th>
          </tr>
        </thead>
        <tbody>
          {groundData.map((ground, index) => (
            <tr key={index}>
              <td className="py-2 px-4 border-b">{ground.fullName}</td>
              <td className="py-2 px-4 border-b">{ground.phone}</td>
              <td className="py-2 px-4 border-b">{ground.location}</td>
              <td className="py-2 px-4 border-b">{ground.city}</td>
              <td className="py-2 px-4 border-b">{ground.size}</td>
              <td className="py-2 px-4 border-b">{ground.price}</td>
              <td className="py-2 px-4 border-b">{ground.startTime}</td>
              <td className="py-2 px-4 border-b">{ground.endTime}</td>
              <td className="py-2 px-4 border-b">{ground.notice}</td>
              <td className="py-2 px-4 border-b">{ground.payment ? 'Yes' : 'No'}</td>
              <td className="py-2 px-4 border-b">{ground.images.join(', ')}</td>
              <td className="py-2 px-4 border-b">
                <button
                  className="bg-green-500 text-white py-1 px-2 mr-2 rounded"
                  onClick={() => handleAccept(index)}
                >
                  Accept
                </button>
                <button
                  className="bg-red-500 text-white py-1 px-2 rounded"
                  onClick={() => handleReject(index)}
                >
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GroundTable;
