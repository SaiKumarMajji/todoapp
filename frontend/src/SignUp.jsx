import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    axios
      .post("http://localhost:3000/register", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      })
      .then((result) => {
        console.log(result);
        navigate("/login");
      })
      .catch((err) => console.log(err));

    setFormData({
      username: "",
      email: "",
      password: "",
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
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <br />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <br />
          <input
            type="password"
            name="password"
            placeholder="Create Password"
            value={formData.password}
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
