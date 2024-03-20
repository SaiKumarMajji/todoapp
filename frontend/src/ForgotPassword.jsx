import React, { useState, useEffect } from "react";
import axios from "axios";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [expiryTime, setExpiryTime] = useState(300);
  const [otpError, setOtpError] = useState("");
  const [passwordErr, setPasswordErr] = useState("");
  const [confirmPasswordErr, setConfirmPasswordErr] = useState("");
  const [passwordMatchError, setPasswordMatchError] = useState("");
  const [passwordType, setPasswordType] = useState("password");
  const [confirmPasswordType, setConfirmPasswordType] = useState("password");
  const [specialCharErr, setSpecialCharErr] = useState("");
  const handleTogglePassword = () => {
    if (passwordType === "password") {
      setPasswordType("text");
    } else {
      setPasswordType("password");
    }
  };

  const handleToggleConfirmPassword = () => {
    if (confirmPasswordType === "password") {
      setConfirmPasswordType("text");
    } else {
      setConfirmPasswordType("password");
    }
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);

    setEmailError("");
  };
  const handleOtpChange = (event) => {
    setOtp(event.target.value);
    // Set typingOtp to true when user starts typing
    setOtpError(""); // Clear otpError when user starts typing
  };
  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
    setPasswordMatchError("");
    setPasswordErr("");
    setSpecialCharErr("");
  };

  const handleConfirmPasswordChange = (event) => {
    setConfirmPassword(event.target.value);
    setPasswordMatchError("");
    setConfirmPasswordErr("");
    setSpecialCharErr("");
  };

  useEffect(() => {
    // Start the countdown timer when OTP is sent
    if (otpSent) {
      const timer = setInterval(() => {
        setExpiryTime((prevExpiryTime) => prevExpiryTime - 1);
      }, 1000);

      // Clear the timer when the component unmounts, OTP is verified, or the timer reaches 0
      return () => clearInterval(timer);
    }
  }, [otpSent]);

  const handleSendOTP = async (event) => {
    event.preventDefault();
    try {
      if (!email) {
        setEmailError("Please enter your email");
        return;
      }
      setEmailError(""); // Clear previous error message
      const response = await axios.post("http://localhost:3000/send-otp", {
        email,
      });
      setOtpSent(true);
    } catch (error) {
      console.error("Error sending OTP:", error);
      if (error.response && error.response.data && error.response.data.error) {
        setEmailError(error.response.data.error);
      } else {
        setEmailError("An error occurred while sending OTP");
      }
    }
  };

  const handleVerifyOTP = async (event) => {
    event.preventDefault();
    try {
      if (!otp) {
        setOtpError("Please enter your OTP");
        return;
      }
      setOtpError("");
      const response = await axios.post("http://localhost:3000/verify-otp", {
        email,
        otp,
      });
      if (response.status === 200) {
        setOtpVerified(true);
      } else {
        console.error("Incorrect OTP");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      // Handle error
      if (error.response && error.response.data && error.response.data.error) {
        setOtpError(error.response.data.error);
      } else {
        setOtpError("An error occurred while verifyingOTP");
      }
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    try {
      if (!password) {
        setPasswordErr("Please enter your password");
        return;
      }
      if (!confirmPassword) {
        setConfirmPasswordErr("Please enter your password");
        return;
      }

      if (password !== confirmPassword) {
        setPasswordMatchError("Passwords do not match");
        return;
      }

      const response = await axios.post(
        "http://localhost:3000/reset-password",
        {
          email,
          newPassword: password,
        }
      );
      if (response.status === 200) {
        // Password reset successful, redirect to login page
        window.location.href = "/";
      } else {
        console.error("Error resetting password:", response.data.error);
        // Handle error
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      if (error.response && error.response.data && error.response.data.error) {
        setSpecialCharErr(error.response.data.error);
      } else {
        setSpecialCharErr("Error  resetting password");
      }
    }
  };

  return (
    <div className="reset-page">
      <form onSubmit={handleResetPassword}>
        <div>
          {!otpSent ? (
            <input
              name="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={handleEmailChange}
            />
          ) : !otpVerified ? (
            <div>
              <input
                className="otp-input"
                name="otp"
                type="number"
                placeholder="Enter OTP"
                value={otp}
                onChange={handleOtpChange}
              />
              {expiryTime > 0 && (
                <div style={{ paddingLeft: "24px", color: "red" }}>
                  Expires in {expiryTime} seconds
                </div>
              )}

              {otpError && (
                <div style={{ paddingLeft: "24px", color: "red" }}>
                  {otpError}
                </div>
              )}

              <button onClick={handleVerifyOTP}>Submit</button>
            </div>
          ) : (
            <div className="pass-change">
              <div className="password-input-container">
                <div>
                  <input
                    // type="password"
                    type={passwordType}
                    placeholder="Create New Password"
                    value={password}
                    onChange={handlePasswordChange}
                  />
                  {passwordType === "password" ? (
                    <IoMdEyeOff
                      onClick={handleTogglePassword}
                      className="eye-on-off-icon"
                    />
                  ) : (
                    <IoMdEye
                      onClick={handleTogglePassword}
                      className="eye-on-off-icon"
                    />
                  )}
                  {passwordErr && (
                    <div style={{ paddingLeft: "24px", color: "red" }}>
                      {passwordErr}
                    </div>
                  )}
                  {specialCharErr && (
                    <div style={{ paddingLeft: "24px", color: "red" }}>
                      {specialCharErr}
                    </div>
                  )}
                </div>
              </div>

              <div className="confirm-password-input-container">
                <div>
                  <input
                    // type="password"
                    type={confirmPasswordType}
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                  />
                  {confirmPasswordType === "password" ? (
                    <IoMdEyeOff
                      onClick={handleToggleConfirmPassword}
                      className="eye-on-off-icon"
                    />
                  ) : (
                    <IoMdEye
                      onClick={handleToggleConfirmPassword}
                      className="eye-on-off-icon"
                    />
                  )}
                  {confirmPasswordErr && (
                    <div style={{ paddingLeft: "24px", color: "red" }}>
                      {confirmPasswordErr}
                    </div>
                  )}
                  {passwordMatchError && (
                    <div style={{ paddingLeft: "24px", color: "red" }}>
                      {passwordMatchError}
                    </div>
                  )}
                  {specialCharErr && (
                    <div style={{ paddingLeft: "24px", color: "red" }}>
                      {specialCharErr}
                    </div>
                  )}
                </div>

                <button>Submit</button>
              </div>
            </div>
          )}
        </div>
        {emailError && (
          <span style={{ paddingLeft: "24px", color: "red" }}>
            {emailError}
          </span>
        )}
        {!otpSent ? <button onClick={handleSendOTP}>Send OTP</button> : null}
      </form>
    </div>
  );
}
