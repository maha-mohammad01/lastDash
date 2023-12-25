
import React from 'react'
// import logo from '../img/footboolia.png';
import { Link } from 'react-router-dom';
import HomeD from './HomeD';
function SideBar() {
  

const fakeToken = 'authToken';

const isLoggedIn = () => {
  const token = localStorage.getItem('isLoggedIn'); 
  return !!token;
};

// دالة لمعالجة عملية الخروج
const handleLogout = () => {
  localStorage.removeItem('authToken'); 
};


  return (
    
    <div>
        <HomeD/>
        <aside className="ml-[-100%] fixed z-10 top-0 pb-3 px-6 w-full flex flex-col justify-between h-screen overflow-scroll border-r bg-emerald-2 transition duration-300 md:w-1/12 lg:ml-0 lg:w-[25%] xl:w-[20%] 2xl:w-[15%]">
    <div>
      <div className="-mx-6 px-6 py-4">
        <a href="#" title="home">
        {/* <img src={logo} alt="Logo" className="h-20" /> */}
        </a>
      </div>
      <div className="mt-8 text-center">
        <img
          src="https://i.pinimg.com/280x280_RS/39/d4/77/39d47758fc973887b276f5464df10d53.jpg"
          alt=""
          className="w-10 h-10 m-auto rounded-full object-cover lg:w-28 lg:h-28"
        />
        <h5 className="hidden mt-4 text-xl font-semibold text-gray-600 lg:block">
          Nidal Raed
        </h5>
        <span className="hidden text-gray-400 lg:block">Admin</span>
      </div>
      <ul className="space-y-2 tracking-wide mt-8">
        <li>
          <Link
            to="/dashboarda"
            aria-label="dashboard"
            className="relative px-4 py-3 flex items-center space-x-4 rounded-xl text-white bg-gradient-to-r from-emerald-600 to-emerald-400"
          >
            <svg className="-ml-1 h-6 w-6" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8ZM6 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-1Z"
                className="fill-current text-emerald-400 dark:fill-slate-600"
              />
              <path
                d="M13 8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2V8Z"
                className="fill-current text-emerald-200 group-hover:text-emerald-300"
              />
              <path
                d="M13 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-1Z"
                className="fill-current group-hover:text-emerald-300"
              />
            </svg>
            <span className="-mr-1 font-medium">Dashboard</span>
          </Link>
        </li>
        <li>
          <a
            href="#"
            className="px-4 py-3 flex items-center space-x-4 rounded-md text-gray-600 group"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                className="fill-current text-gray-300 group-hover:text-emerald-300"
                fillRule="evenodd"
                d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1H8a3 3 0 00-3 3v1.5a1.5 1.5 0 01-3 0V6z"
                clipRule="evenodd"
              />
              <path
                className="fill-current text-gray-600 group-hover:text-emerald-600"
                d="M6 12a2 2 0 012-2h8a2 2 0 012 2v2a2 2 0 01-2 2H2h2a2 2 0 002-2v-2z"
              />
            </svg>
            <span className="group-hover:text-gray-700">Categories</span>
          </a>
        </li>
        <li>
          <Link to="/users"
            
            className="px-4 py-3 flex items-center space-x-4 rounded-md text-gray-600 group"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                className="fill-current text-gray-300 group-hover:text-emerald-300 active:bg-gradient-to-r from-emerald-600 to-emerald-400"
                fillRule="evenodd"
                d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1H8a3 3 0 00-3 3v1.5a1.5 1.5 0 01-3 0V6z"
                clipRule="evenodd"
              />
              <path
                className="fill-current text-gray-600 group-hover:text-emerald-600"
                d="M6 12a2 2 0 012-2h8a2 2 0 012 2v2a2 2 0 01-2 2H2h2a2 2 0 002-2v-2z"
              />
            </svg>
            <span className="group-hover:text-gray-700">Users</span>
          </Link>
        </li>
        <li>
          <a
            href="#"
            className="px-4 py-3 flex items-center space-x-4 rounded-md text-gray-600 group"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                className="fill-current text-gray-300 group-hover:text-emerald-300"
                fillRule="evenodd"
                d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1H8a3 3 0 00-3 3v1.5a1.5 1.5 0 01-3 0V6z"
                clipRule="evenodd"
              />
              <path
                className="fill-current text-gray-600 group-hover:text-emerald-600"
                d="M6 12a2 2 0 012-2h8a2 2 0 012 2v2a2 2 0 01-2 2H2h2a2 2 0 002-2v-2z"
              />
            </svg>
            <span className="group-hover:text-gray-700">Product</span>
          </a>
        </li>
        <li>
          <Link
            to="/bookingground"
            className="px-4 py-3 flex items-center space-x-4 rounded-md text-gray-600 group"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                className="fill-current text-gray-300 group-hover:text-emerald-300"
                fillRule="evenodd"
                d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1H8a3 3 0 00-3 3v1.5a1.5 1.5 0 01-3 0V6z"
                clipRule="evenodd"
              />
              <path
                className="fill-current text-gray-600 group-hover:text-emerald-600"
                d="M6 12a2 2 0 012-2h8a2 2 0 012 2v2a2 2 0 01-2 2H2h2a2 2 0 002-2v-2z"
              />
            </svg>
            <span className="group-hover:text-gray-700">Book playgrounds</span>
          </Link>
        </li>
        <li>
          <a
            href="#"
            className="px-4 py-3 flex items-center space-x-4 rounded-md text-gray-600 group"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                className="fill-current text-gray-600 group-hover:text-emerald-600"
                fillRule="evenodd"
                d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z"
                clipRule="evenodd"
              />
              <path
                className="fill-current text-gray-300 group-hover:text-emerald-300"
                d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z"
              />
            </svg>
            <span className="group-hover:text-emerald-700">FAQs</span>
          </a>
        </li>
        <li>
          <a
            href="#"
            className="px-4 py-3 flex items-center space-x-4 rounded-md text-gray-600 group"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                className="fill-current text-gray-600 group-hover:text-emerald-600"
                d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"
              />
              <path
                className="fill-current text-gray-300 group-hover:text-emerald-300"
                d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"
              />
            </svg>
            <span className="group-hover:text-gray-700">Massege</span>
          </a>
        </li>
        <li>
          <a
            href="#"
            className="px-4 py-3 flex items-center space-x-4 rounded-md text-gray-600 group"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                className="fill-current text-gray-300 group-hover:text-emerald-300"
                d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"
              />
              <path
                className="fill-current text-gray-600 group-hover:text-emerald-600"
                fillRule="evenodd"
                d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                clipRule="evenodd"
              />
            </svg>
            <span className="group-hover:text-gray-700">Finance</span>
          </a>
        </li>
      </ul>
    </div>

<div className="px-6 -mx-6 pt-4 flex justify-between items-center border-t">
    <Link to="/">
      {isLoggedIn() ? (
        <button 
          onClick={handleLogout} 
          className="px-4 py-3 flex items-center space-x-4 rounded-md text-gray-600 group"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {/* رمز الخروج */}
          </svg>
          <span className="group-hover:text-gray-700">Logout</span>
        </button>
      ) : (
        <button className="px-4 py-3 flex items-center space-x-4 rounded-md text-gray-600 group">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {/* رمز الدخول */}
          </svg>
          <span className="group-hover:text-gray-700">Login</span>
        </button>
      )}
    </Link>
</div>


  </aside>
    </div>
  )
}

export default SideBar
