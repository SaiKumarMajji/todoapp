import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { api, errorMessage } from "./api";
import { AuthLayout, Field, FormError, PasswordField } from "./Layout";

export default function Login() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  if (localStorage.getItem("userId")) return <Navigate to="/todo" replace />;

  async function submit(event) {
    event.preventDefault();
    const { email, password } = Object.fromEntries(new FormData(event.currentTarget));
    setError("");
    setPending(true);
    try {
      const { data } = await api.post("/login", { email: email.trim(), password });
      if (!data.userId) throw new Error("Missing user ID");
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("username", data.username || "");
      navigate("/todo", { replace: true });
    } catch (error) {
      setError(errorMessage(error, "Couldn’t sign in. Please try again."));
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthLayout title="Welcome back" description="Sign in to open your task list.">
      {state?.notice && <p className="notice" role="status">{state.notice}</p>}
      <form className="auth-form" onSubmit={submit}>
        <Field id="email" name="email" label="Email address" type="email" autoComplete="email" required />
        <PasswordField id="password" autoComplete="current-password" />
        <Link className="form-link" to="/resetPassword">Forgot password?</Link>
        <FormError message={error} />
        <button className="button button-primary" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
      </form>
      <p className="auth-footer">New to TodoApp? <Link to="/signup">Create an account</Link></p>
    </AuthLayout>
  );
}
