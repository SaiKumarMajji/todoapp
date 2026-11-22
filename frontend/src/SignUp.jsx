import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, errorMessage } from "./api";
import { AuthLayout, Field, FormError, PasswordField } from "./Layout";

export default function SignUp() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event) {
    event.preventDefault();
    const { username, email, password } = Object.fromEntries(new FormData(event.currentTarget));
    setError("");
    if (!username.trim()) {
      setError("Enter a username.");
      return;
    }
    setPending(true);
    try {
      await api.post(
        "/register",
        { username: username.trim(), email: email.trim(), password },
        { withCredentials: false },
      );
      navigate("/login", { replace: true, state: { notice: "Account created. Sign in to get started." } });
    } catch (error) {
      setError(errorMessage(error, "Couldn’t create your account. Please try again."));
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthLayout title="Create an account" description="Set up your personal task list.">
      <form className="auth-form" onSubmit={submit}>
        <Field id="username" name="username" label="Username" autoComplete="username" required />
        <Field id="email" name="email" label="Email address" type="email" autoComplete="email" required />
        <PasswordField id="password" autoComplete="new-password" hint="Use at least one special character." />
        <FormError message={error} />
        <button className="button button-primary" disabled={pending}>{pending ? "Creating account…" : "Create account"}</button>
      </form>
      <p className="auth-footer">Already have an account? <Link to="/login">Sign in</Link></p>
    </AuthLayout>
  );
}
