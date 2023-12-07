import React from 'react';
import { Routes, Route } from 'react-router-dom'; // Note: No Router import here

import Users from './Users';
import Bookingground from './Bookingground';
import DashboardA from './DashboardA';
import SideBar from './Sidebar';

function Dash() {
  return (
    <div>
      <SideBar />
      <Routes>
        <Route path="/users" element={<Users />} />
        <Route path="/bookingground" element={<Bookingground />} />
        <Route path="/dashboarda" element={<DashboardA />} />
      </Routes>
    </div>
  );
}

export default Dash;
