import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const GroundTable = () => {
  const initialNewGroundState = {
    name: '',
    phone: '',
    location: '',
    city: '',
    size: '',
    hourly_rate: '',
    start_time: '',
    end_time: '',
    description: '',
    payment: false,
  };

  const [groundData, setGroundData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGround, setNewGround] = useState({
    name: '',
    phone: '',
    location: '',
    city: '',
    size: '',
    hourly_rate: '',
    start_time: '',
    end_time: '',
    description: '',
    payment: false,
  });

  const getAuthToken = () => {
    const tokenFromCookie = Cookies.get('auToken');
    return tokenFromCookie || null;
  };

  useEffect(() => {
    const fetchData = async () => {
      const authToken = getAuthToken();
      // console.log('Authentication Token:', authToken);

      try {
        const response = await axios.get('http://localhost:2000/stadiums', {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        setGroundData(response.data);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEdit = (index) => {
    console.log(`Edit: ${groundData[index].fullName}`);
    // Add logic for handling edit action
  };

  const handleDelete = async (index, stadiumId) => {
    console.log(`Delete: ${groundData[index].name}`);
    // قم بدعوة دالة حذف هنا
    await handleDeleteGround(stadiumId);
  };
  

  const handleAddGround = async () => {
    try {
      const authToken = getAuthToken();
      // console.log('Authentication Token:', authToken);

      const formData = new FormData();
      formData.append('name', newGround.name);
      formData.append('phone', newGround.phone);
      formData.append('location', newGround.location);
      formData.append('city', newGround.city);
      formData.append('size', newGround.size);
      formData.append('hourly_rate', newGround.hourly_rate);
      formData.append('start_time', newGround.start_time);
      formData.append('end_time', newGround.end_time);
      formData.append('description', newGround.description);
      formData.append('payment', newGround.payment);

      // إضافة الصور إلى الـ FormData
      if (newGround.images_url) {
        for (let i = 0; i < newGround.images_url.length; i++) {
          formData.append('images_url', newGround.images_url[i]);
        }
      }

      await axios.post('http://localhost:2000/add-stadium', formData, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'multipart/form-data', // ضروري لرفع الصور
        },
      });

      const response = await axios.get('http://localhost:2000/all-stadiums', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      setGroundData(response.data);
      setIsModalOpen(false);
      setNewGround(initialNewGroundState);

      // استخدمي toast.success لعرض رسالة نجاح
      toast.success('Playground added successfully');
    } catch (error) {
      console.error('Error adding ground:', error);
      // استخدمي toast.error لعرض رسالة خطأ
      toast.error('Failed to add playground');
    }
  };
  
  const handleDeleteGround = async (stadiumId) => {
    try {
      const authToken = getAuthToken();
      const response = await axios.delete(`http://localhost:2000/delete-stadium/${stadiumId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
  
      // تحديث حالة البيانات المحلية بعد الحذف
      setGroundData(response.data);
  
      // استخدم toast.success لعرض رسالة نجاح
      toast.success('Playground deleted successfully');
    } catch (error) {
      console.error('Error deleting ground:', error);
  
      // استخدم toast.error لعرض رسالة خطأ
      toast.error('Failed to delete playground');
    }
  };
  
  if (loading) return <p>Loading...</p> 
  if (error) return <p>Error: {error.message}</p>;

  const handleChange = (e) => {
    if (e.target.name === 'images_url') {
      const files = e.target.files;
      setNewGround({
        ...newGround,
        images_url: files,
      });
    } else {
      setNewGround({
        ...newGround,
        [e.target.name]: e.target.value,
      });
    }
  };
  

  return (
    <div className="container mx-auto mt-8 p-4">
      <h1 className="text-3xl font-bold mb-6 text-emerald-600 ml-2 sm:ml-10">All Playgrounds</h1>

      <button
        className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700"
        onClick={() => setIsModalOpen(true)}
      >
        <FaPlus className="mr-2" /> Add Playground
      </button>

      <table className="min-w-full bg-white border border-gray-300 shadow-md rounded-md overflow-hidden mt-4">
        <thead className="bg-emerald-600 text-white">
          <tr>
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Phone</th>
            <th className="py-2 px-4 border-b">Location</th>
            <th className="py-2 px-4 border-b">City</th>
            <th className="py-2 px-4 border-b">Size</th>
            <th className="py-2 px-4 border-b">Price</th>
            <th className="py-2 px-4 border-b">Start Time</th>
            <th className="py-2 px-4 border-b">End Time</th>
            <th className="py-2 px-4 border-b">Description</th>
            <th className="py-2 px-4 border-b">Payment</th>
            <th className="py-2 px-4 border-b">Action</th>
          </tr>
        </thead>
        <tbody>
          {groundData.map((ground, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}>
              <td className="py-2 px-4 border-b">{ground.name}</td>
              <td className="py-2 px-4 border-b">{ground.phone}</td>
              <td className="py-2 px-4 border-b">{ground.location}</td>
              <td className="py-2 px-4 border-b">{ground.city}</td>
              <td className="py-2 px-4 border-b">{ground.size}</td>
              <td className="py-2 px-4 border-b">{ground.hourly_rate}</td>
              <td className="py-2 px-4 border-b">{ground.start_time}</td>
              <td className="py-2 px-4 border-b">{ground.end_time}</td>
              <td className="py-2 px-4 border-b">{ground.description}</td>
              <td className="py-2 px-4 border-b">{ground.payment ? 'Yes' : 'No'}</td>
              <td className="py-2 px-4 border-b">
                <button
                  className="text-blue-500 hover:text-blue-700 ml-2"
                  onClick={() => handleEdit(index)}
                >
                  <FaEdit />
                </button>
                <button
    className="text-red-500 hover:text-red-700"
    onClick={() => handleDelete(index, ground.stadium_id)}
  >
    <FaTrash />
  </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>





      {isModalOpen && (
  <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
    <div className="bg-white p-8 rounded-md w-96">
      <h2 className="text-2xl font-bold mb-4">Add Playground</h2>

      <div className="grid grid-cols-2 gap-4">
        {/* Name */}
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-semibold text-gray-600">
            Name:
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={newGround.name}
            onChange={(e) => setNewGround({ ...newGround, name: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        {/* Phone */}
        <div className="mb-4">
          <label htmlFor="phone" className="block text-sm font-semibold text-gray-600">
            Phone:
          </label>
          <input
            type="text"
            id="phone"
            name="phone"
            value={newGround.phone}
            onChange={(e) => setNewGround({ ...newGround, phone: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        {/* Location */}
        <div className="mb-4">
          <label htmlFor="location" className="block text-sm font-semibold text-gray-600">
            Location:
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={newGround.location}
            onChange={(e) => setNewGround({ ...newGround, location: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        {/* City */}
        <div className="mb-4">
          <label htmlFor="city" className="block text-sm font-semibold text-gray-600">
            City:
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={newGround.city}
            onChange={(e) => setNewGround({ ...newGround, city: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        {/* Size */}
        <div className="mb-4">
          <label htmlFor="size" className="block text-sm font-semibold text-gray-600">
            Size:
          </label>
          <input
            type="text"
            id="size"
            name="size"
            value={newGround.size}
            onChange={(e) => setNewGround({ ...newGround, size: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        {/* Hourly Rate */}
        <div className="mb-4">
          <label htmlFor="hourlyRate" className="block text-sm font-semibold text-gray-600">
            Hourly Rate:
          </label>
          <input
            type="text"
            id="hourlyRate"
            name="hourlyRate"
            value={newGround.hourly_rate}
            onChange={(e) => setNewGround({ ...newGround, hourly_rate: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        {/* Start Time */}
        <div className="mb-4">
          <label htmlFor="startTime" className="block text-sm font-semibold text-gray-600">
            Start Time:
          </label>
          <input
            type="time"
            id="startTime"
            name="startTime"
            value={newGround.start_time}
            onChange={(e) => setNewGround({ ...newGround, start_time: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        {/* End Time */}
        <div className="mb-4">
          <label htmlFor="endTime" className="block text-sm font-semibold text-gray-600">
            End Time:
          </label>
          <input
            type="time"
            id="endTime"
            name="endTime"
            value={newGround.end_time}
            onChange={(e) => setNewGround({ ...newGround, end_time: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-semibold text-gray-600">
            Description:
          </label>
          <input
            type="text"
            id="description"
            name="description"
            value={newGround.description}
            onChange={(e) => setNewGround({ ...newGround, description: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        {/* Payment */}
        <div className="mb-4">
          <label htmlFor="payment" className="block text-sm font-semibold text-gray-600">
            Payment:
          </label>
          <select
            id="payment"
            name="payment"
            value={newGround.payment}
            onChange={(e) => setNewGround({ ...newGround, payment: e.target.value == 'yes' })}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        <div className="mb-5">
  <label
    htmlFor="images_url" // Corrected htmlFor
    className="mb-3 block text-base font-medium text-[#07074D]"
  >
    Upload Images
  </label>
  <input
    type="file"
    name="images_url" // Corrected name
    id="images"
    accept="image/*"
    multiple
    onChange={handleChange}
  />
</div>
      </div>

      <button
        className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700"
        onClick={handleAddGround}
      >
        Add
      </button>
      <button
        className="ml-2 text-gray-500 hover:text-gray-700"
        onClick={() => setIsModalOpen(false)}
      >
        Cancel
      </button>
    </div>
  </div>
)}



    </div>
  );
};

export default GroundTable;


