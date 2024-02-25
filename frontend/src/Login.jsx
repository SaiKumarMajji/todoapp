import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const storedEmail = "";
    const storedPassword = "";

    if (
      formData.email === storedEmail &&
      formData.password === storedPassword
    ) {
      navigate.push("/todo");
    } else {
      alert("Invalid email or password");
    }
  };
  return (
    <div className="login-container">
      <div className="login">
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />{" "}
          <br />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />{" "}
          <br />
          <button>Login</button>
        </form>
        <p>
          Don't have an account? <Link to="/signup">SignUp</Link>{" "}
        </p>
      </div>
    </div>
  );
}
