import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function SignUp() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        console.log("SignUp Successful");
        navigate("/login");
      } else {
        const errorData = await response.json();
        console.error("SignUp failed", errorData.message);
      }
    } catch (error) {
      console.log("SignUp failed", error.message);
    }
    setFormData({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  return (
    <div className="signup-container">
      <div className="signup">
        <h1>SignUp</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter Username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <br />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <br />
          <input
            type="password"
            placeholder="Create Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <br />
          <input
            type="password"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          <br />
          <button>SignUp</button>
        </form>
        <p>
          Already have an account? <Link to="/login">Login </Link>{" "}
        </p>
      </div>
    </div>
  );
}
