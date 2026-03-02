import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import shared from "../styles/shared.module.css";
import Navbar from "../components/Navbar";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Register", to: "/register" }
];

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      setNotice("");
      const res = await api.post("/auth/forgot-password", { email });
      setNotice(res.data?.message || "OTP sent to email");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={shared.page}>
      <Navbar links={NAV_LINKS} />

      <main className={shared.mainCenter}>
        <p className={shared.heroSubtitle}>Account recovery</p>
        <h1 className={shared.heroHeading}>
          <span className={shared.heroItalic}>Forgot your</span>
          <span className={shared.heroBold}>password?</span>
        </h1>

        <form className={shared.glassCard} onSubmit={submit} noValidate>
          {error && <p className={shared.error}>{error}</p>}
          {notice && <p className={shared.success}>{notice}</p>}

          <div className={shared.inputGroup}>
            <label className={shared.inputLabel} htmlFor="forgot-email">
              Email
            </label>
            <input
              id="forgot-email"
              className={shared.input}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className={shared.btnPrimary} disabled={loading}>
            {loading ? "Sending OTP..." : "Send OTP ->"}
          </button>

          <p className={shared.footNote}>
            Already have OTP? <Link to="/reset-password">Reset Password</Link>
          </p>
          <p className={shared.footNote}>
            Back to <Link to="/">Sign in</Link>
          </p>
        </form>
      </main>
    </div>
  );
}

export default ForgotPassword;
