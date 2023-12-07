import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

function LoginAdmin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:2000/login', {
        email,
        password,
      });

      if (response.status === 200 || response.status === 201) {
        const token = response.data.token;
        Cookies.set('authToken', token);

        Swal.fire({
          position: 'top',
          icon: 'success',
          title: 'Login successful',
          showConfirmButton: false,
          timer: 1500,
        });

        localStorage.setItem('isLoggedIn', 'true');

        navigate('/dash');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response && error.response.status === 401) {
        setError('Invalid email or password. Please try again.');
      } else {
        setError('An error occurred. Please try again later.');
      }
    }
  };
  
  return (
    <div>
      <div className="bg-white dark:bg-gray-900 ">
  <div className="flex justify-center h-screen">
    <div
      className="hidden bg-cover lg:block lg:w-2/3"
      style={{
        backgroundImage:
          "url(https://janoubia.com/wp-content/uploads/2018/06/Luganiki-Stadium-1.jpg)"
      }}
    >
      <div className="flex items-center h-full px-20 bg-gray-900 bg-opacity-40">
        <div>
          <h2 className="text-2xl font-bold text-white sm:text-3xl align-middle">
           Admin Login
          </h2>
        </div>
      </div>
    </div>
    <div className="flex items-center w-full max-w-md px-6 mx-auto lg:w-2/6">
      <div className="flex-1">
        <div className="text-center">
          <p className="mt-3 text-gray-500 dark:text-gray-300">
            Sign in to access your account
          </p>
        </div>
        <div className="mt-8">
          <form>
            <div>
              <label
                htmlFor="email"
                className="block mb-2 text-sm text-gray-600 dark:text-gray-200"
              >
                Email Address
              </label>
              <input
                type="email"
                name="email"
                id="email"
                placeholder="name@example.com"
                className="block w-full px-4 py-2 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg dark:placeholder-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40"
              />
            </div>
            <div className="mt-6">
              <div className="flex justify-between mb-2">
                <label
                  htmlFor="password"
                  className="text-sm text-gray-600 dark:text-gray-200"
                >
                  Password
                </label>
                <a
                  href="#"
                  className="text-sm text-gray-400 focus:text-emerald-500 hover:text-emerald-500 hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <input
                type="password"
                name="password"
                id="password"
                placeholder="Your Password"
                className="block w-full px-4 py-2 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg dark:placeholder-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 focus:border-emerald-400 dark:focus:border-emerald-400 focus:ring-emerald-400 focus:outline-none focus:ring focus:ring-opacity-40"
              />
            </div>
            <div className="mt-6">
             <Link to ="/dash"> <button className="w-full px-4 py-2 tracking-wide text-white transition-colors duration-300 transform bg-emerald-500 rounded-lg hover:bg-emerald-400 focus:outline-none focus:bg-emerald-400 focus:ring focus:ring-emerald-300 focus:ring-opacity-50">
                Sign in
              </button></Link>
            </div>
          </form>

        </div>
      </div>
    </div>
  </div>
</div>

    </div>
  )
}

export default LoginAdmin
