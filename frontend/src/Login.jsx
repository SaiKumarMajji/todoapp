import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const navigate = useNavigate();

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

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
    console.log("Handle Submit function called");

    axios
      .post("http://localhost:3000/login", {
        email: formData.email,
        password: formData.password,
      })
      .then((result) => {
        console.log(result);
        if (result.data.message === "Success") navigate("/todo");
        localStorage.setItem("userId", result.data.userId);
        localStorage.setItem("username", result.data.username);
        console.log("username: ", result.data.username);

        console.log("User ID:", result.data.userId);
      })
      .catch((error) => {
        if (error.response && error.response.data) {
          const { data } = error.response;
          if (data === "password is incorrect") {
            setPasswordError(data);
          } else if (data === "this email is not registered") {
            setEmailError(data);
          } else {
            setErrorMessage(data);
          }
        }
        console.log("error caught:", error);
      });
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
          <p style={{ color: "red" }}>{emailError}</p>
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />{" "}
          <br />
          <p style={{ color: "red" }}>{passwordError}</p>
          <button>Login</button>
          {errorMessage && <p className="error">{errorMessage}</p>}
        </form>

        <p>
          Don't have an account? <Link to="/signup">SignUp</Link>{" "}
        </p>
      </div>
    </div>
  );
}
