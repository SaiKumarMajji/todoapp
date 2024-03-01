import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

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

    axios
      .post("http://localhost:3000/login", {
        email: formData.email,
        password: formData.password,
      })
      .then((result) => {
        console.log(result);
        if (result.data === "Success") {
          navigate("/todo");
        }
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="login-container">
      <div className="login">
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />{" "}
          <br />
          <input
            type="password"
            name="password"
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
