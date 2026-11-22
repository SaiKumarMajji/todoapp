import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, errorMessage } from "./api";
import { AuthLayout, Field, FormError, PasswordField } from "./Layout";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [deadline, setDeadline] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (step !== "code") return;
    const timer = setInterval(() => setSeconds(Math.max(0, Math.ceil((deadline - Date.now()) / 1000))), 1000);
    return () => clearInterval(timer);
  }, [deadline, step]);

  async function sendCode(address) {
    await api.post("/send-otp", { email: address });
    setEmail(address);
    setDeadline(Date.now() + 300000);
    setSeconds(300);
    setStep("code");
  }

  async function submit(event) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    setError("");
    setPending(true);
    try {
      if (step === "email") {
        await sendCode(values.email.trim());
      } else if (step === "code") {
        if (Date.now() >= deadline) {
          setError("The code has expired. Request a new one.");
          return;
        }
        await api.post("/verify-otp", { email, otp: values.otp });
        setStep("password");
      } else {
        if (values.password !== values.confirmPassword) {
          setError("Passwords do not match.");
          return;
        }
        await api.post("/reset-password", { email, newPassword: values.password });
        navigate("/login", { replace: true, state: { notice: "Password updated. Sign in with your new password." } });
      }
    } catch (error) {
      setError(errorMessage(error, "Something went wrong. Please try again."));
    } finally {
      setPending(false);
    }
  }

  async function resend(event) {
    const form = event.currentTarget.form;
    setError("");
    setPending(true);
    try {
      await sendCode(email);
      form.reset();
    } catch (error) {
      setError(errorMessage(error, "Couldn’t send a new code. Please try again."));
    } finally {
      setPending(false);
    }
  }

  const titles = { email: "Reset your password", code: "Check your email", password: "Choose a new password" };
  const descriptions = { email: "Enter your email address to get a reset code.", code: "Enter the four-digit code sent to " + email + ".", password: "Choose a password for your TodoApp account." };
  const actions = { email: "Send reset code", code: "Verify code", password: "Update password" };

  return (
    <AuthLayout title={titles[step]} description={descriptions[step]}>
      <form className="auth-form" key={step} onSubmit={submit}>
        {step === "email" && <Field id="email" name="email" label="Email address" type="email" autoComplete="email" required />}
        {step === "code" && (
          <>
            <Field id="otp" name="otp" label="Verification code" inputMode="numeric" pattern="[0-9]{4}" maxLength={4} autoComplete="one-time-code" required />
            <div className="code-actions">
              <small>{seconds ? "Expires in " + Math.floor(seconds / 60) + ":" + String(seconds % 60).padStart(2, "0") : "Code expired"}</small>
              {!seconds && <button type="button" className="text-button" onClick={resend} disabled={pending}>Resend code</button>}
            </div>
          </>
        )}
        {step === "password" && (
          <>
            <PasswordField id="password" label="New password" autoComplete="new-password" hint="Use at least one special character." />
            <PasswordField id="confirmPassword" label="Confirm password" autoComplete="new-password" />
          </>
        )}
        <FormError message={error} />
        <button className="button button-primary" disabled={pending || (step === "code" && !seconds)}>{pending ? "Please wait…" : actions[step]}</button>
      </form>
      <p className="auth-footer"><Link to="/login">Back to sign in</Link></p>
    </AuthLayout>
  );
}
