import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import AuthLayout from "../components/AuthLayout";
import styles from "./Auth.module.css";
import shared from "../styles/shared.module.css";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("customer");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      setError("");
      const response = await api.post("/auth/register", { name, email, password, role, location });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      navigate(response.data.user?.role === "provider" ? "/provider/dashboard" : "/services");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "We could not create your account. Please review your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={shared.page}>
      <Navbar links={[{ label: "Home", to: "/" }, { label: "Marketplace", to: "/services" }, { label: "Sign in", to: "/login" }]} />
      <AuthLayout mode="register" title="Create your ServiceSphere account" subtitle="Choose how you want to use the platform. You can start immediately after signup.">
        <form className={styles.form} onSubmit={handleRegister}>
          {error && <div className={styles.error} role="alert">{error}</div>}
          <div className={styles.fieldRow}>
            <div className={styles.field}><label htmlFor="reg-name">Full name</label><input id="reg-name" autoComplete="name" placeholder="Your full name" value={name} onChange={(event) => setName(event.target.value)} required /></div>
            <div className={styles.field}><label htmlFor="reg-location">Location</label><input id="reg-location" autoComplete="address-level2" placeholder="City or area" value={location} onChange={(event) => setLocation(event.target.value)} /></div>
          </div>
          <div className={styles.field}><label htmlFor="reg-email">Email address</label><input id="reg-email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
          <div className={styles.field}><label htmlFor="reg-password">Password</label><div className={styles.passwordWrap}><input id="reg-password" type={showPassword ? "text" : "password"} autoComplete="new-password" minLength="6" placeholder="At least 6 characters" value={password} onChange={(event) => setPassword(event.target.value)} required /><button type="button" onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? "Hide" : "Show"}</button></div></div>
          <div className={styles.field}><label htmlFor="reg-role">I want to use ServiceSphere as</label><select id="reg-role" value={role} onChange={(event) => setRole(event.target.value)}><option value="customer">A customer booking services</option><option value="provider">A provider offering services</option></select><p className={styles.roleHelp}>{role === "provider" ? "You will get a provider dashboard for listings and booking requests." : "You will be able to discover services and manage your bookings."}</p></div>
          <button className={styles.submit} type="submit" disabled={loading}>{loading ? "Creating your account..." : "Create account →"}</button>
          <p className={styles.accountSwitch}>Already registered? <Link to="/login">Sign in</Link></p>
        </form>
      </AuthLayout>
    </div>
  );
}

export default Register;
