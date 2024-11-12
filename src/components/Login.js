// src/components/Login.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Container, Typography, Box } from "@mui/material";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      const token = response.data.token;
      const userRole = response.data.role;

      // Save token in localStorage
      localStorage.setItem("token", token);

      // Redirect based on role
      if (userRole === "admin") {
        navigate("/management");
      } else {
        navigate("/home");
      }
    } catch (error) {
      alert("Error logging in: " + error.response?.data?.error || error.message);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 8 }}>
        <Typography variant="h5">Login</Typography>
        <form onSubmit={handleLogin} style={{ width: "100%", marginTop: "1rem" }}>
          <TextField
            variant="outlined"
            fullWidth
            label="Email"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            variant="outlined"
            fullWidth
            label="Password"
            type="password"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mt: 3 }}>
            Login
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default Login;
