import { useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { FiCheck, FiEye, FiEyeOff, FiArrowLeft } from "react-icons/fi";

export function Header({ children }) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="brand"><span className="brand-icon"><FiCheck /></span>TodoApp</Link>
        {children && <nav aria-label="Main navigation">{children}</nav>}
      </div>
    </header>
  );
}

export function AuthLayout({ title, description, children }) {
  return (
    <>
      <Header />
      <main className="auth-page">
        <div className="auth-wrap">
          <Link to="/" className="back-link"><FiArrowLeft /> Home</Link>
          <section className="auth-card" aria-labelledby="auth-title">
            <h1 id="auth-title">{title}</h1>
            <p className="muted">{description}</p>
            {children}
          </section>
        </div>
      </main>
    </>
  );
}

export function Field({ label, hint, id, ...props }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} aria-describedby={hint ? id + "-hint" : undefined} {...props} />
      {hint && <small id={id + "-hint"}>{hint}</small>}
    </div>
  );
}

export function PasswordField({ id, label = "Password", hint, autoComplete }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="password-input">
        <input id={id} name={id} type={visible ? "text" : "password"} autoComplete={autoComplete}
          aria-describedby={hint ? id + "-hint" : undefined} required />
        <button className="icon-button" type="button" aria-label={visible ? "Hide " + label.toLowerCase() : "Show " + label.toLowerCase()}
          onClick={() => setVisible(!visible)}>{visible ? <FiEyeOff /> : <FiEye />}</button>
      </div>
      {hint && <small id={id + "-hint"}>{hint}</small>}
    </div>
  );
}

export function FormError({ message }) {
  return message ? <p className="form-error" role="alert">{message}</p> : null;
}

Header.propTypes = { children: PropTypes.node };
AuthLayout.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};
Field.propTypes = {
  label: PropTypes.string.isRequired,
  hint: PropTypes.string,
  id: PropTypes.string.isRequired,
};
PasswordField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  hint: PropTypes.string,
  autoComplete: PropTypes.string,
};
FormError.propTypes = { message: PropTypes.string };
