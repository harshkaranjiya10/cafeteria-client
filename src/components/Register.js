// src/components/register.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { TextField, Button, FormControlLabel, Checkbox, Container, Typography, Box } from "@mui/material";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/register", {
        username,
        email,
        password,
        role,
      });
      alert("Registration successful");
      navigate("/login"); // Redirect to login after registration
    } catch (error) {
      alert("Error registering: " + error.response?.data?.error || error.message);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 8 }}>
        <Typography variant="h5">Register</Typography>
        <form onSubmit={handleRegister} style={{ width: "100%", marginTop: "1rem" }}>
          <TextField
            variant="outlined"
            fullWidth
            label="Username"
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
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
          <FormControlLabel
            control={
              <Checkbox
                checked={role === "admin"}
                onChange={(e) => setRole(e.target.checked ? "admin" : "user")}
              />
            }
            label="Admin"
          />
          <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mt: 3 }}>
            Register
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default Register;
