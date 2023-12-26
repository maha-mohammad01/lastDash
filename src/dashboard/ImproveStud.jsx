import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';


function ImproveStud() {
  const [students, setStudents] = useState([]);
  const getAuthToken = () => {
    const tokenFromCookie = Cookies.get('auToken');
    return tokenFromCookie || null;
  };

  useEffect(() => {
    // Fetch data from the server when the component mounts
    fetchData();
  }, []);

  const fetchData = async () => {
    const authToken = getAuthToken();
    try {
      // Replace 'YOUR_API_ENDPOINT' with the actual API endpoint
      const response = await axios.get('http://localhost:2000/stadiums', {
        headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
 

      setStudents(response.data); // Assuming the response data is an array of student objects
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // You can add functions for other CRUD operations (create, update, delete) here

  return (
    <div className="container mx-auto mt-8 p-4 ml-96">
      <h1 className="text-3xl font-bold mb-6 text-emerald-600">Accept Sta Information</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 shadow-md rounded-md overflow-hidden">
          <thead className="bg-emerald-600 text-white">
            <tr>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Phone</th>
              <th className="py-2 px-4 border-b">Location</th>
              <th className="py-2 px-4 border-b">Hourly Rate</th>
              <th className="py-2 px-4 border-b">Payment</th>
              <th className="py-2 px-4 border-b">Approval Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="bg-gray-100">
                <td className="py-2 px-4 border-b">{student.name}</td>
                <td className="py-2 px-4 border-b">{student.phone}</td>
                <td className="py-2 px-4 border-b">{student.location}</td>
                <td className="py-2 px-4 border-b">{`$${student.hourly_rate}`}</td>
                <td className="py-2 px-4 border-b">{student.payment ? 'Yes' : 'No'}</td>
                <td className="py-2 px-4 border-b">{student.approval_status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ImproveStud;
