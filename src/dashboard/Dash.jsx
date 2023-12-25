import React from 'react';
import { Routes, Route,Router } from 'react-router-dom'; // Note: No Router import here

import Users from './Users';
import Bookingground from './Bookingground';
import DashboardA from './DashboardA';
import SideBar from './Sidebar';

function Dash() {
  return (
    <div>
      {/* <Router> */}
      <SideBar />
      <DashboardA/>
      {/* <Routes>
        <Route path="/users" element={<Users />} />
        <Route path="/bookingground" element={<Bookingground />} />
        <Route path="/dashboarda" element={<DashboardA />} />
      </Routes></Router> */}
    </div>
  );
}

export default Dash;
