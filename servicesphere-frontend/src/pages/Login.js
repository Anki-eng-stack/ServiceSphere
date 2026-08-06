import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import AuthLayout from "../components/AuthLayout";
import styles from "./Auth.module.css";
import shared from "../styles/shared.module.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      setError("");
      const response = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      navigate(response.data.user?.role === "provider" ? "/provider/dashboard" : "/services");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "We could not sign you in. Check your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={shared.page}>
      <Navbar links={[{ label: "Home", to: "/" }, { label: "Marketplace", to: "/services" }, { label: "Create account", to: "/register" }]} />
      <AuthLayout mode="login" title="Sign in to your account" subtitle="Use the email and password connected to your ServiceSphere account.">
        <form className={styles.form} onSubmit={handleLogin}>
          {error && <div className={styles.error} role="alert">{error}</div>}
          <div className={styles.field}><label htmlFor="email">Email address</label><input id="email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
          <div className={styles.field}><label htmlFor="password">Password</label><div className={styles.passwordWrap}><input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} required /><button type="button" onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? "Hide" : "Show"}</button></div></div>
          <div className={styles.formLinks}><span>Secure account access</span><Link to="/forgot-password">Forgot password?</Link></div>
          <button className={styles.submit} type="submit" disabled={loading}>{loading ? "Signing you in..." : "Sign in →"}</button>
          <p className={styles.accountSwitch}>New to ServiceSphere? <Link to="/register">Create an account</Link></p>
        </form>
      </AuthLayout>
    </div>
  );
}

export default Login;
