import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [type, setType] = useState("password");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleToggle = () => {
    if (type === "password") {
      setType("text");
    } else {
      setType("password");
    }
  };

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
        if (result.data.message === "Success") navigate("/todo");
        localStorage.setItem("userId", result.data.userId);
        localStorage.setItem("username", result.data.username);
        console.log("username: ", result.data.username);

        console.log("User ID:", result.data.userId);
      })
      .catch((error) => {
        console.log("error caught:", error);
        if (
          error.response &&
          error.response.data &&
          error.response.data.error
        ) {
          const errorMessage = error.response.data.error;
          if (errorMessage.includes("Email")) {
            setEmailError(errorMessage);
          } else if (errorMessage.includes("Password")) {
            setPasswordError(errorMessage);
          }
        }
      });
  };

  return (
    <div className="login-container">
      <div className="login">
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {emailError && (
              <p style={{ color: "red", marginLeft: "25px", marginTop: "0px" }}>
                {emailError}
              </p>
            )}
          </div>
          <div className="password-container">
            <input
              type={type}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            {type === "password" ? (
              <IoMdEyeOff onClick={handleToggle} className="eye-on-off-icon" />
            ) : (
              <IoMdEye onClick={handleToggle} className="eye-on-off-icon" />
            )}
            {passwordError && (
              <p style={{ color: "red", marginLeft: "25px", marginTop: "0px" }}>
                {passwordError}
              </p>
            )}
          </div>

          <button>Login</button>
          <Link to="/resetPassword" className="forgot">
            Forgot Password?
          </Link>
        </form>

        <p>
          Don't have an account? <Link to="/signup">SignUp</Link>{" "}
        </p>
      </div>
    </div>
  );
}
