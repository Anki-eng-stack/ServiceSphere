import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import styles from "./Login.module.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate(
        res.data.user?.role === "provider"
          ? "/provider/dashboard"
          : "/services"
      );
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className={styles.container}>
      {/* Navbar */}
      <nav className={styles.navbar}>
        <div className={styles.logo}>
          service<span className={styles.logoStrong}>sphere</span>
          <sup style={{ fontSize: "0.45em", marginLeft: "1px", opacity: 0.7 }}>®</sup>
        </div>
        <ul className={styles.navLinks}>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/services">Services</Link></li>
          <li><Link to="/register">Register</Link></li>
        </ul>
      </nav>

      {/* Main */}
      <main className={styles.main}>
        <p className={styles.heroSubtitle}>A service marketplace platform</p>

        <h1 className={styles.heroHeading}>
          <span className={styles.heroHeadingItalic}>Welcome</span>
          <span className={styles.heroHeadingBold}>back.</span>
        </h1>

        {/* Login card */}
        <form className={styles.card} onSubmit={handleLogin} noValidate>
          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel} htmlFor="email">Email</label>
            <input
              id="email"
              className={styles.input}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel} htmlFor="password">Password</label>
            <input
              id="password"
              className={styles.input}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className={styles.button}>Sign in →</button>

          <p className={styles.registerText}>
            Don't have an account?{" "}
            <Link to="/register">Create one</Link>
          </p>
        </form>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <span className={styles.footerTag}>© 2025 ServiceSphere</span>
        <span className={styles.footerTag}>Photo by Yusuf P on Pexels</span>
      </footer>
    </div>
  );
}

export default Login;
