import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import shared from "../styles/shared.module.css";
import Navbar from "../components/Navbar";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Forgot Password", to: "/forgot-password" }
];

function ResetPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      setNotice("");
      const res = await api.post("/auth/reset-password", { email, otp, password });
      setNotice(res.data?.message || "Password reset successful");
      setTimeout(() => navigate("/"), 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
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
          <span className={shared.heroItalic}>Reset your</span>
          <span className={shared.heroBold}>password.</span>
        </h1>

        <form className={shared.glassCard} onSubmit={submit} noValidate>
          {error && <p className={shared.error}>{error}</p>}
          {notice && <p className={shared.success}>{notice}</p>}

          <div className={shared.inputGroup}>
            <label className={shared.inputLabel} htmlFor="reset-email">
              Email
            </label>
            <input
              id="reset-email"
              className={shared.input}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={shared.inputGroup}>
            <label className={shared.inputLabel} htmlFor="reset-otp">
              OTP
            </label>
            <input
              id="reset-otp"
              className={shared.input}
              type="text"
              placeholder="6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>

          <div className={shared.inputGroup}>
            <label className={shared.inputLabel} htmlFor="reset-password">
              New Password
            </label>
            <input
              id="reset-password"
              className={shared.input}
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className={shared.btnPrimary} disabled={loading}>
            {loading ? "Updating..." : "Reset Password ->"}
          </button>

          <p className={shared.footNote}>
            Back to <Link to="/">Sign in</Link>
          </p>
        </form>
      </main>
    </div>
  );
}

export default ResetPassword;
