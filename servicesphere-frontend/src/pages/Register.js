import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import shared from "../styles/shared.module.css";
import Navbar from "../components/Navbar";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Services", to: "/services" },
];

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/register", {
        name,
        email,
        password,
        role,
        location,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate(
        res.data.user?.role === "provider"
          ? "/provider/dashboard"
          : "/services"
      );
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className={shared.page}>
      <Navbar links={NAV_LINKS} />

      <main className={shared.mainCenter}>
        <p className={shared.heroSubtitle}>Start your journey today</p>
        <h1 className={shared.heroHeading}>
          <span className={shared.heroItalic}>Create your</span>
          <span className={shared.heroBold}>account.</span>
        </h1>

        <form className={shared.glassCard} onSubmit={handleRegister} noValidate>
          {error && <p className={shared.error}>{error}</p>}

          <div className={shared.inputGroup}>
            <label className={shared.inputLabel} htmlFor="reg-name">
              Full Name
            </label>
            <input
              id="reg-name"
              className={shared.input}
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className={shared.inputGroup}>
            <label className={shared.inputLabel} htmlFor="reg-email">
              Email
            </label>
            <input
              id="reg-email"
              className={shared.input}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={shared.inputGroup}>
            <label className={shared.inputLabel} htmlFor="reg-password">
              Password
            </label>
            <input
              id="reg-password"
              className={shared.input}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className={shared.inputGroup}>
            <label className={shared.inputLabel} htmlFor="reg-role">
              I am a
            </label>
            <select
              id="reg-role"
              className={shared.select}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="customer">Customer</option>
              <option value="provider">Service Provider</option>
            </select>
          </div>

          <div className={shared.inputGroup}>
            <label className={shared.inputLabel} htmlFor="reg-location">
              Location
            </label>
            <input
              id="reg-location"
              className={shared.input}
              type="text"
              placeholder="City, Country"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <button type="submit" className={shared.btnPrimary}>
            Create Account →
          </button>

          <p className={shared.footNote}>
            Already have an account?{" "}
            <Link to="/">Sign in</Link>
          </p>
        </form>
      </main>

      <footer className={shared.footer}>
        <span className={shared.footerTag}>© 2025 ServiceSphere</span>
      </footer>
    </div>
  );
}
// test change

export default Register;
