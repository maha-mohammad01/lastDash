// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import moment from 'moment'; // تأكد من تثبيت مكتبة moment باستخدام npm install moment أو yarn add moment
// import GroundTable from './GroundTable';

// const Bookingground = () => {
//   const [formBookingData, setFormBookingData] = useState([]);

//   // useEffect(() => {
//   //   // Fetch data from the API endpoint
//     // axios.get('http://localhost:2000/bookings-info')
//   //     .then(response => {
//   //       // Assuming the response data is an array
//   //       setFormBookingData(response.data);
//   //     })
//   //     .catch(error => console.error('Error fetching data:', error));
//   // }, []);


//   const fetchData = async () => {
//     try {
//       const authToken = getAuthToken();
//       console.log('Authentication Token:', authToken); // Log the token to the console
  
//       const response = await axios.get('http://localhost:2000/bookings-info', {
//         headers: {
//           Authorization: `${authToken}`,
//         },
//       });
  
//       setUsersData(response.data.users); // تحديث usersData بدلاً من userData
//     } catch (error) {
//       console.error('Error fetching user data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };




//   return (
//     <div className="-my-2 py-2 overflow-x-auto pr-10 lg:px-8 ml-52">
//         <h1 className='font-bold text-2xl'>User Booking playground</h1>
//       <div className="align-middle rounded-tl-lg rounded-tr-lg inline-block w-full py-4 overflow-hidden bg-white shadow-lg px-12">

//       </div>
//       <div className="align-middle inline-block min-w-full shadow overflow-hidden bg-white shadow-dashboard pl-11 pt-3 rounded-bl-lg rounded-br-lg">
//         <table className="min-w-full">
//           <thead>
//             <tr>
//               <th className="pl-16 py-5 border-b-2 border-gray-300 text-left text-sm leading-4 text-emerald-500 tracking-wider">Full Name</th>
//               <th className="pl-16 py-5 border-b-2 border-gray-300 text-left text-sm leading-4 text-emerald-500 tracking-wider">Phone</th>
//               <th className="px-16 py-5 border-b-2 border-gray-300 text-left text-sm leading-4 text-emerald-500 tracking-wider">Start Time</th>
//               <th className="px-16 py-5 border-b-2 border-gray-300 text-left text-sm leading-4 text-emerald-500 tracking-wider">End Time</th>
//               <th className="px-16 py-5 border-b-2 border-gray-300 text-left text-sm leading-4 text-emerald-500 tracking-wider">Notice</th>
//               <th className="px-16 py-5 border-b-2 border-gray-300 text-left text-sm leading-4 text-emerald-500 tracking-wider">Status</th>
//               <th className="px-16 py-5 border-b-2 border-gray-300 text-left text-sm leading-4 text-emerald-500 tracking-wider">Total Hours</th>
//             </tr>
//           </thead>
//           <tbody className="bg-white">
//             {formBookingData.map((booking) => (
//               <tr key={booking.id}>
//                 <td className="px- py-3 whitespace-no-wrap border-b border-gray-500">
//                   <div className="text-sm leading-5 text-emerald-900">{booking.fullName}</div>
//                 </td>
//                 <td className="px-2 py-3 whitespace-no-wrap border-b border-gray-500">
//                   <div className="text-sm leading-5 text-emerald-900">{booking.phone}</div>
//                 </td>
//                 <td className="px-2 py-4 whitespace-no-wrap border-b text-emerald-900 border-gray-500 text-sm leading-5">{booking.startTime}</td>
//                 <td className="px-2 py-4 whitespace-no-wrap border-b text-emerald-900 border-gray-500 text-sm leading-5">{booking.endTime}</td>
//                 <td className="px-6 py-4 whitespace-no-wrap border-b text-emerald-900 border-gray-500 text-sm leading-5">{booking.notice}</td>
//                 <td className="px-2 py-4 whitespace-no-wrap border-b text-emerald-900 border-gray-500 text-sm leading-5">
//                   <span className={`relative inline-block px-3 py-1 font-semibold text-${booking.status === 'active' ? 'green' : 'red'}-900 leading-tight`}>
//                     <span aria-hidden className={`absolute inset-0 bg-${booking.status === 'active' ? 'green' : 'red'}-200 opacity-50 rounded-full`}></span>
//                     <span className="relative text-xs">{booking.status}</span>
//                   </span>
//                 </td>
//                 <td className="px-2 py-4 whitespace-no-wrap border-b text-emerald-900 border-gray-500 text-sm leading-5">
//                 {calculateTotalHours(booking.startTime, booking.endTime)} hours
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//       <GroundTable/>
//     </div>
    
//   );
// };

// const calculateTotalHours = (startTime, endTime) => {
//     const format = 'hh:mm A';
    
//     const start = moment(startTime, format);
//     const end = moment(endTime, format);
  
//     const diffInMinutes = end.diff(start, 'minutes');
//     const diffInHours = diffInMinutes / 60;
  
//     return diffInHours.toFixed(2);
//   };

// export default Bookingground;



import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import Cookies from 'js-cookie';
import ReactPaginate from 'react-paginate';
import GroundTable from './GroundTable';
import SideBar from './Sidebar';

const Bookingground = () => {
  const [formBookingData, setFormBookingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 6;

  const getAuthToken = () => {
    const tokenFromCookie = Cookies.get('auToken');
    return tokenFromCookie || null;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authToken = getAuthToken();
        console.log('Authentication Token:', authToken);

        const response = await axios.get('http://localhost:2000/bookings-info', {
          headers: {
            Authorization: authToken,
          },
        });

        setFormBookingData(response.data.bookings);
      } catch (error) {
        console.error('Error fetching booking data:', error); 
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateTotalHours = (startTime, endTime) => {
    const format = 'hh:mm A';
    const start = moment(startTime, format);
    const end = moment(endTime, format);
    const diffInMinutes = end.diff(start, 'minutes');
    const diffInHours = diffInMinutes / 60;
    return diffInHours.toFixed(2);
  };

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };
  const pageCount = Math.ceil(formBookingData.length / itemsPerPage);

  const displayData = formBookingData.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  return (
    <>
      <SideBar />
      <div className="-my-2 py-2 overflow-x-auto pr-10 lg:px-8 ml-52">
        <h1 className="font-bold text-3xl mb-4 text-emerald-500">User Booking Playground</h1>
        <div className="bg-white overflow-hidden shadow-md ml-40 rounded-lg w-[80%] ">
          <table className="w-full divide-y divide-emerald-700 ">
            <thead className="bg-emerald-600 mr-10">
              <tr>
                <th className="py-3 pl-4 text-left text-xs font-medium text-white uppercase tracking-wider">Stadium Id</th>
                <th className="py-3 pl-4 text-left text-xs font-medium text-white uppercase tracking-wider">Full Name</th>
                <th className="py-3 pl-4 text-left text-xs font-medium text-white uppercase tracking-wider">Phone</th>
                <th className="py-3 pl-4 text-left text-xs font-medium text-white uppercase tracking-wider">Start Time</th>
                <th className="py-3 pl-4 text-left text-xs font-medium text-white uppercase tracking-wider">End Time</th>
                <th className="py-3 pl-4 text-left text-xs font-medium text-white uppercase tracking-wider">Notice</th>
                <th className="py-3 pl-4 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
                <th className="py-3 pl-4 text-left text-xs font-medium text-white uppercase tracking-wider">Total Hours</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayData.map((booking) => (
                <tr key={booking.booking_id} className="hover:bg-gray-100 transition duration-300">
                  <td className="py-4 pl-4 whitespace-nowrap">{booking.booking_id}</td>
                  <td className="py-4 pl-4 whitespace-nowrap">{booking.full_name}</td>
                  <td className="py-4 pl-4 whitespace-nowrap">{booking.phone}</td>
                  <td className="py-4 pl-4 whitespace-nowrap">{booking.start_time}</td>
                  <td className="py-4 pl-4 whitespace-nowrap">{booking.end_time}</td>
                  <td className="py-4 pl-4 whitespace-nowrap">{booking.note}</td>
                  <td className="py-4 pl-4 whitespace-nowrap">
                    <span className={`text-${booking.status === 'active' ? 'green' : 'red'}-600 font-semibold`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="py-4 pl-4 whitespace-nowrap">
                    {calculateTotalHours(booking.start_time, booking.end_time)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-5">
            <ReactPaginate
              previousLabel={'Previous'}
              nextLabel={'Next'}
              breakLabel={'...'}
              breakClassName={'break-me'}
              pageCount={pageCount}
              marginPagesDisplayed={2}
              pageRangeDisplayed={5}
              onPageChange={handlePageClick}
              containerClassName={'pagination mt-4 flex justify-end'}
              subContainerClassName={'pages pagination'}
              activeClassName={'active'}
              previousClassName={
                'text-emerald-500 hover:text-emerald-700 px-3 py-1 border rounded-md border-emerald-500'
              }
              nextClassName={
                'text-emerald-500 hover:text-emerald-700 px-3 py-1 border rounded-md border-emerald-500 ml-2'
              }
              pageClassName={'mx-1 px-3 py-1 border rounded-md border-gray-300 hover:bg-gray-100'}
              // breakClassName={'mx-1 px-3 py-1 border rounded-md border-gray-300'}
            />
          </div>
        </div>
        <GroundTable />
      </div>
    </>
  );
};

export default Bookingground;

