// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import Cookies from 'js-cookie';
// import DeleteConfirmationModal from './DeleteConfirmationModal'; // Replace with the correct path to the DeleteConfirmationModal component
// import SideBar from './Sidebar';

// const Users = () => {
//   const [usersData, setUsersData] = useState([]);
//   const [newUser, setNewUser] = useState({ full_name: '', email: '', user_role: '3' });
//   const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
//   const [deletingUserId, setDeletingUserId] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [usersPerPage] = useState(8);
//   const [filterRole, setFilterRole] = useState('all'); // 'all' by default

//   useEffect(() => {
//     fetchData();
//   }, [currentPage, filterRole]);

//   const getAuthToken = () => {
//     const tokenFromCookie = Cookies.get('auToken');
//     return tokenFromCookie || null;
//   };

//   const fetchData = async () => {
//     try {
//       const authToken = getAuthToken();
//       const response = await axios.get('http://localhost:2000/allusers', {
//         headers: {
//           Authorization: `${authToken}`,
//         },
//       });

//       setUsersData(response.data.users);
//     } catch (error) {
//       console.error('Error fetching user data:', error);
//     }
//   };

//   const handleAddUser = async () => {
//     try {
//       const auToken = getAuthToken();
//       await axios.post('http://localhost:2000/allusers', newUser, {
//         headers: {
//           Authorization: `${auToken}`,
//         },
//       });

//       setNewUser({ full_name: '', email: '', user_role: '3' });
//       fetchData();
//     } catch (error) {
//       console.error('Error adding user:', error.response ? error.response.data : error.message);
//     }
//   };

//   const handleUpdateUser = async (id, updatedUser) => {
//     try {
//       const auToken = getAuthToken();
//       await axios.put(`http://localhost:2000/allusers/${id}`, updatedUser, {
//         headers: {
//           Authorization: `${auToken}`,
//         },
//       });

//       fetchData();
//     } catch (error) {
//       console.error('Error updating user:', error.response ? error.response.data : error.message);
//     }
//   };

//   const handleDeleteUser = (id) => {
//     setDeletingUserId(id);
//     setShowDeleteConfirmation(true);
//   };
  
//   const confirmDeleteUser = async (user_id) => {
//     try {
//       const auToken = getAuthToken();
//       await axios.delete(`http://localhost:2000/users/${deletingUserId}`, {
//         headers: {
//           Authorization: `${auToken}`,
//         },
//       });
  
//       fetchData();
//       setShowDeleteConfirmation(false);
//       setDeletingUserId(null);
//     } catch (error) {
//       console.error('Error deleting user:', error);
//     }
//   };
  

//   const cancelDeleteUser = () => {
//     setShowDeleteConfirmation(false);
//     setDeletingUserId(null);
//   };

//   const handleRoleChange = (userId, event) => {
//     const updatedRole = event.target.value;
//     setUsersData((prevUsersData) => {
//       return prevUsersData.map((user) =>
//         user.user_id === userId ? { ...user, user_role: updatedRole } : user
//       );
//     });
//   };

//   const handleNameChange = (userId, event) => {
//     const updatedName = event.target.value;
//     setUsersData((prevUsersData) => {
//       return prevUsersData.map((user) =>
//         user.user_id === userId ? { ...user, full_name: updatedName } : user
//       );
//     });
//   };

//   const handleEmailChange = (userId, event) => {
//     const updatedEmail = event.target.value;
//     setUsersData((prevUsersData) => {
//       return prevUsersData.map((user) =>
//         user.user_id === userId ? { ...user, email: updatedEmail } : user
//       );
//     });
//   };

//   const indexOfLastUser = currentPage * usersPerPage;
//   const indexOfFirstUser = indexOfLastUser - usersPerPage;
//   const currentUsers = usersData
//     .filter((user) => (filterRole === 'all' ? true : user.user_role.toString() === filterRole))
//     .slice(indexOfFirstUser, indexOfLastUser);

//   return (
//     <div>
//       <SideBar />
//       <div className='ml-80'>
//         <div className="flex">
//           <h1 className="text-3xl font-bold mt-2">Users</h1>
//         </div>
//         <div className="p-3">
//           <h2 className="text-xl mb-2 font-bold">Add New User</h2>
//           <input
//             type="text"
//             placeholder="Name"
//             value={newUser.full_name}
//             onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
//             className="mr-2 mb-2 px-2 py-1 border border-gray-300"
//           />
//           <input
//             type="text"
//             placeholder="Email"
//             value={newUser.email}
//             onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
//             className="mr-2 mb-2 px-2 py-1 border border-gray-300"
//           />
//           <select
//             value={newUser.user_role}
//             onChange={(e) => setNewUser({ ...newUser, user_role: e.target.value })}
//             className="mr-2 mb-2 px-2 py-1 border border-gray-300"
//           >
//             <option value="3">User</option>
//             <option value="2">Super User</option>
//             <option value="1">Admin</option>
//           </select>
//           <button
//             onClick={handleAddUser}
//             className="bg-green-500 hover:bg-gradient-to-r from-green-600 to-green-400 text-white py-1 px-2 rounded focus:outline-none focus:shadow-outline"
//           >
//             Add User
//           </button>
//         </div>
//         <div className="px-3 py-4">
//           <div className="mb-2">
//             <label className="mr-2">Filter by Role:</label>
//             <select
//               value={filterRole}
//               onChange={(e) => setFilterRole(e.target.value)}
//               className="px-2 py-1 border border-gray-300"
//             >
//               <option value="all">All</option>
//               <option value="1">Admin</option>
//               <option value="2">Super User</option>
//               <option value="3">User</option>
//             </select>
//           </div>
//           <table className="w-full text-md bg-white shadow-md rounded mb-4">
//             <thead>
//               <tr className="border-b">
//                 <th className="p-3 px-5">Name</th>
//                 <th className="p-3 px-5">Email</th>
//                 <th className="p-3 px-5">Role</th>
//                 <th />
//               </tr>
//             </thead>
//             <tbody>
//               {currentUsers.map((user) => (
//                 <tr key={user.user_id} className="border-b hover:bg-emerald-100">
//                   <td className="p-3 px-5">
//                     <input
//                       type="text"
//                       value={user.full_name}
//                       onChange={(e) => handleNameChange(user.user_id, e)}
//                       className="bg-transparent border-b-2 border-gray-300 py-2"
//                     />
//                   </td>
//                   <td className="p-3 px-5">
//                     <input
//                       type="text"
//                       value={user.email}
//                       onChange={(e) => handleEmailChange(user.user_id, e)}
//                       className="bg-transparent border-b-2 border-gray-300 py-2"
//                     />
//                   </td>
//                   <td className="p-3 px-5">
//                     <select
//                       value={user.user_role}
//                       onChange={(e) => handleRoleChange(user.user_id, e)}
//                       className="bg-transparent border-b-2 border-gray-300 py-2"
//                     >
//                       <option value="1">Admin</option>
//                       <option value="2">Super User</option>
//                       <option value="3">User</option>
//                     </select>
//                   </td>
//                   <td className="p-3 px-5 flex justify-end">
//                     <button
//                       onClick={() =>
//                         handleUpdateUser(user.user_id, {
//                           full_name: user.full_name,
//                           email: user.email,
//                           user_role: user.user_role,
//                         })
//                       }
//                       className="mr-3 text-sm bg-blue-500 hover:bg-gradient-to-r from-blue-600 to-blue-400 text-white py-1 px-2 rounded focus:outline-none focus:shadow-outline"
//                     >
//                       Save
//                     </button>
//                     <button
//                       onClick={() => handleDeleteUser(user.user_id)}
//                       className="text-sm bg-emerald-500 hover:bg-gradient-to-r from-emerald-700 to-emerald-400 text-white py-1 px-2 rounded focus:outline-none focus:shadow-outline"
//                     >
//                       Delete
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//         <div className="flex justify-center">
//           <div className="pagination">
//             <button
//               onClick={() => setCurrentPage(currentPage - 1)}
//               disabled={currentPage === 1}
//               className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-l"
//             >
//               Previous
//             </button>
//             <button
//               onClick={() => setCurrentPage(currentPage + 1)}
//               disabled={indexOfLastUser >= usersData.length}
//               className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r"
//             >
//               Next
//             </button>
//           </div>
//         </div>
//         {showDeleteConfirmation && (
//           <DeleteConfirmationModal onConfirm={confirmDeleteUser} onCancel={cancelDeleteUser} />
//         )}
//       </div>
//     </div>
//   );
// };

// export default Users;








import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import DeleteConfirmationModal from './DeleteConfirmationModal'; // تأكد من تحديد المسار الصحيح
import SideBar from './Sidebar';

const Users = () => {
  const [usersData, setUsersData] = useState([]);
  const [newUser, setNewUser] = useState({ full_name: '', email: '', user_role: '3' });
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(8);
  const [filterRole, setFilterRole] = useState('all'); // 'all' by default

  useEffect(() => {
    fetchData();
  }, [currentPage, filterRole]);

  const getAuthToken = () => {
    const tokenFromCookie = Cookies.get('auToken');
    return tokenFromCookie || null;
  };

  const fetchData = async () => {
    try {
      const authToken = getAuthToken();
      const response = await axios.get('http://localhost:2000/allusers', {
        headers: {
          Authorization: `${authToken}`,
        },
      });

      setUsersData(response.data.users);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleAddUser = async () => {
    try {
      const auToken = getAuthToken();
      await axios.post('http://localhost:2000/allusers', newUser, {
        headers: {
          Authorization: `${auToken}`,
        },
      });

      setNewUser({ full_name: '', email: '', user_role: '3' });
      fetchData();
    } catch (error) {
      console.error('Error adding user:', error.response ? error.response.data : error.message);
    }
  };

  const handleUpdateUser = async (id, updatedUser) => {
    try {
      const auToken = getAuthToken();
      await axios.post(`http://localhost:2000/allusers`, updatedUser, {
        headers: {
          Authorization: `${auToken}`,
        },
      });

      fetchData();
    } catch (error) {
      console.error('Error updating user:', error.response ? error.response.data : error.message);
    }
  };

  const handleDeleteUser = (id) => {
    setDeletingUserId(id);
    setShowDeleteConfirmation(true);
  };
  const confirmDeleteUser = async () => {
    try {
      const auToken = getAuthToken();
      
      // قم بالاتصال بالخادم لتأكيد الحذف
      await axios.delete(`http://localhost:2000/users/${deletingUserId}`, {
        headers: {
          Authorization: `${auToken}`,
        },
      });
  
      // بعد حذف المستخدم، قم بتحديث البيانات بدون المستخدم المحذوف
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

  const handleRoleChange = async (userId, event) => {
    const updatedRole = event.target.value;
  
    try {
      const auToken = getAuthToken();
      await axios.put(`http://localhost:2000/update-user-role/${userId}`, { new_role: updatedRole }, {
  headers: {
    Authorization: `${auToken}`,
  },
});

  
      setUsersData(prevUsersData => {
        return prevUsersData.map(user =>
          user.user_id === userId ? { ...user, user_role: updatedRole } : user
        );
      });
    } catch (error) {
      console.error('Error updating user role:', error.response ? error.response.data : error.message);
    }
  };
  

  const handleNameChange = (userId, event) => {
    const updatedName = event.target.value;
    setUsersData((prevUsersData) => {
      return prevUsersData.map((user) =>
        user.user_id === userId ? { ...user, full_name: updatedName } : user
      );
    });
  };

  const handleEmailChange = (userId, event) => {
    const updatedEmail = event.target.value;
    setUsersData((prevUsersData) => {
      return prevUsersData.map((user) =>
        user.user_id === userId ? { ...user, email: updatedEmail } : user
      );
    });
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = usersData
    .filter((user) => (filterRole === 'all' ? true : user.user_role.toString() === filterRole))
    .slice(indexOfFirstUser, indexOfLastUser);

  return (
    <div>
      <SideBar />
      <div className='ml-80'>
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
            className="mr-2 mb-2 px-2 py-1 border border-gray-300"
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
            <option value="3">User</option>
            <option value="2">Super User</option>
            <option value="1">Admin</option>
          </select>
          <button
            onClick={handleAddUser}
            className="bg-green-500 hover:bg-gradient-to-r from-green-600 to-green-400 text-white py-1 px-2 rounded focus:outline-none focus:shadow-outline"
          >
            Add User
          </button>
        </div>
        <div className="px-3 py-4">
          <div className="mb-2">
            <label className="mr-2">Filter by Role:</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-2 py-1 border border-gray-300"
            >
              <option value="all">All</option>
              <option value="1">Admin</option>
              <option value="2">Super User</option>
              <option value="3">User</option>
            </select>
          </div>
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
              {currentUsers.map((user) => (
        <tr key={user.user_id} className="border-b hover:bg-emerald-100">
          <td className="p-3 px-5">
            <input
              type="text"
              value={user.full_name}
              onChange={(e) => handleNameChange(user.user_id, e)}
              className="bg-transparent border-b-2 border-gray-300 py-2"
            />
          </td>
          <td className="p-3 px-5">
                    <input
                      type="text"
                      value={user.email}
                      onChange={(e) => handleEmailChange(user.user_id, e)}
                      className="bg-transparent border-b-2 border-gray-300 py-2"
                    />
                  </td>
                  <td className="p-3 px-5">
            <select
              value={user.user_role}
              onChange={(e) => handleRoleChange(user.user_id, e)}
              className="bg-transparent border-b-2 border-gray-300 py-2"
            >
              <option value="1">Admin</option>
              <option value="2">Super User</option>
              <option value="3">User</option>
            </select>
          </td>
          <td className="p-3 px-5 flex justify-end">
            <button
              onClick={() =>
                handleUpdateUser(user.user_id, {
                  full_name: user.full_name,
                  email: user.email,
                  user_role: user.user_role,
                })
              }
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
        <div className="flex justify-center">
          <div className="pagination">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-l"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={indexOfLastUser >= usersData.length}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r"
            >
              Next
            </button>
          </div>
        </div>
        {showDeleteConfirmation && (
          <DeleteConfirmationModal onConfirm={confirmDeleteUser} onCancel={cancelDeleteUser} />
        )}
      </div>
    </div>
  );
};

export default Users;




