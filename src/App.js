// src/app.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import UserHome from "./components/UserHome";
import AdminDashboard from "./components/AdminDashboard";
import Cart from "./components/Cart";
import Payment from "./components/Payment";  // Import Payment component

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<UserHome />} />
        <Route path="/management" element={<AdminDashboard />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/payment" element={<Payment />} />  {/* Payment route */}
      </Routes>
    </Router>
  );
};

export default App;
