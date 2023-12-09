import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DeleteConfirmationModal from './DeleteConfirmationModal'; // استبدل بالمسار الصحيح لملف DeleteConfirmationModal
import Cookies from 'js-cookie';

const Users = () => {
  const [usersData, setUsersData] = useState([]);
  const [newUser, setNewUser] = useState({ full_name: '', email: '', user_role: '1' });
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const getAuthToken = () => {
    let token = Cookies.get('authToken');

    if (!token) {
      token = localStorage.getItem('isLoggedIn');
    }

    return token;
  };

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:2000/allusers', {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      console.log('Response data:', response.data);
      setUsersData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error.response);
      // إضافة منطق إدارة الخطأ إذا لزم الأمر
    }
  };

  const handleAddUser = async () => {
    try {
      await axios.post('http://localhost:2000/allusers', newUser, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      setNewUser({ full_name: '', email: '', user_role: '1' });
      fetchData();
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  const handleUpdateUser = async (id, updatedUser) => {
    try {
      await axios.put(`http://localhost:2000/allusers/${id}`, updatedUser);
      fetchData();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = (id) => {
    setDeletingUserId(id);
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteUser = async () => {
    try {
      await axios.delete(`http://localhost:2000/allusers/${deletingUserId}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      fetchData();
      setShowDeleteConfirmation(false);
      setDeletingUserId(null);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const cancelDeleteUser = () => {
    setShowDeleteConfirmation(false);
    setDeletingUserId(null);
  };

  const handleRoleChange = (userId, event) => {
    const updatedRole = event.target.value;
    const updatedUsers = usersData.map((user) =>
      user.user_id === userId ? { ...user, user_role: updatedRole } : user
    );
    setUsersData(updatedUsers);
  };

  const handleNameChange = (userId, event) => {
    const updatedName = event.target.value;
    const updatedUsers = usersData.map((user) =>
      user.user_id === userId ? { ...user, full_name: updatedName } : user
    );
    setUsersData(updatedUsers);
  };

  const handleEmailChange = (userId, event) => {
    const updatedEmail = event.target.value;
    const updatedUsers = usersData.map((user) =>
      user.user_id === userId ? { ...user, email: updatedEmail } : user
    );
    setUsersData(updatedUsers);
  };

  return (
    <div className="ml-80">
      <div className="flex">
        <h1 className="text-3xl font-bold mt-2">Users</h1>
      </div>
      <div className="p-3">
        <h2 className="text-xl mb-2 font-bold">Add New User</h2>
        <input
          type="text"
          placeholder="Name"
          value={newUser.full_name}
          onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
          className="mr-2 mb-2 px-2 py-1 border border-gray-300 "
        />
        <input
          type="text"
          placeholder="Email"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          className="mr-2 mb-2 px-2 py-1 border border-gray-300"
        />
        <select
          value={newUser.user_role}
          onChange={(e) => setNewUser({ ...newUser, user_role: e.target.value })}
          className="mr-2 mb-2 px-2 py-1 border border-gray-300"
        >
          <option value="1">User</option>
          {/* Adjust role values based on your actual data */}
          <option value="2">Super User</option>
          <option value="3">Admin</option>
        </select>
        <button
          onClick={handleAddUser}
          className="bg-green-500 hover:bg-gradient-to-r from-green-600 to-green-400 text-white py-1 px-2 rounded focus:outline-none focus:shadow-outline"
        >
          Add User
        </button>
      </div>
      <div className="px-3 py-4 flex justify-center">
        <table className="w-full text-md bg-white shadow-md rounded mb-4">
          <thead>
            <tr className="border-b">
              <th className="p-3 px-5">Name</th>
              <th className="p-3 px-5">Email</th>
              <th className="p-3 px-5">Role</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {usersData.map((user) => (
              <tr key={user.user_id} className="border-b hover:bg-emerald-100">
                <td className="p-3 px-5">
                  <input type="text" defaultValue={user.full_name} className="bg-transparent border-b-2 border-gray-300 py-2" onChange={(e) => handleNameChange(user.user_id, e)} />
                </td>
                <td className="p-3 px-5">
                  <input type="text" defaultValue={user.email} className="bg-transparent border-b-2 border-gray-300 py-2" onChange={(e) => handleEmailChange(user.user_id, e)} />
                </td>
                <td className="p-3 px-5">
                  <select
                    value={user.user_role}
                    onChange={(e) => handleRoleChange(user.user_id, e)}
                    className="bg-transparent border-b-2 border-gray-300 py-2"
                  >
                    <option value="1">User</option>
                    {/* Adjust role values based on your actual data */}
                    <option value="2">Super User</option>
                    <option value="3">Admin</option>
                  </select>
                </td>
                <td className="p-3 px-5 flex justify-end">
                  <button
                    onClick={() => handleUpdateUser(user.user_id, { full_name: user.full_name, email: user.email, user_role: user.user_role })}
                    className="mr-3 text-sm bg-blue-500 hover:bg-gradient-to-r from-blue-600 to-blue-400 text-white py-1 px-2 rounded focus:outline-none focus:shadow-outline"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.user_id)}
                    className="text-sm bg-emerald-500 hover:bg-gradient-to-r from-emerald-700 to-emerald-400 text-white py-1 px-2 rounded focus:outline-none focus:shadow-outline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showDeleteConfirmation && (
        <DeleteConfirmationModal
          onConfirm={confirmDeleteUser}
          onCancel={cancelDeleteUser}
        />
      )}
    </div>
  );
};

export default Users;
