import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";

export default function SignUp() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  const [type, setType] = useState("password");

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
      .post("https://todoapp-backend-nrxj.onrender.com/register", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      })
      .then((result) => {
        console.log(result);
        navigate("/login");
      })
      .catch((err) => {
        if (err.response) {
          const { data } = err.response;
          const newErrors = { ...errors };

          if (data.error.includes("Username")) {
            newErrors.username = data.error;
          } else if (data.error.includes("Email")) {
            newErrors.email = data.error;
          } else if (data.error.includes("Password")) {
            newErrors.password = data.error;
          }

          setErrors(newErrors);
        } else {
          console.log(err);
        }
      });
  };

  return (
    <div className="signup-container">
      <div className="signup">
        <h1>SignUp</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <input
              type="text"
              placeholder="Enter Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
            {errors.username && (
              <p style={{ color: "red", marginLeft: "25px", marginTop: "0px" }}>
                {errors.username}
              </p>
            )}
          </div>
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && (
              <p style={{ color: "red", marginLeft: "25px", marginTop: "0px" }}>
                {errors.email}
              </p>
            )}
          </div>
          <div className="password-container">
            <input
              type={type}
              name="password"
              placeholder="Create Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            {errors.password && (
              <p style={{ color: "red", marginLeft: "25px", marginTop: "0px" }}>
                {errors.password}
              </p>
            )}

            {type === "password" ? (
              <IoMdEyeOff onClick={handleToggle} className="eye-on-off-icon" />
            ) : (
              <IoMdEye onClick={handleToggle} className="eye-on-off-icon" />
            )}
          </div>

          <button>SignUp</button>
        </form>
        <p>
          Already have an account? <Link to="/">Login </Link>{" "}
        </p>
      </div>
    </div>
  );
}
