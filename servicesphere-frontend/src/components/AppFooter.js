import { Link } from "react-router-dom";
import shared from "../styles/shared.module.css";

function AppFooter() {
  return (
    <footer className={shared.appFooter}>
      <div className={shared.appFooterInner}>
        <div>
          <Link to="/" className={shared.appFooterBrand}><b>S</b> ServiceSphere</Link>
          <p>Find dependable local help, manage bookings, and keep every service conversation in one trusted place.</p>
        </div>
        <div>
          <p className={shared.appFooterTitle}>Explore</p>
          <nav className={shared.appFooterLinks} aria-label="Explore ServiceSphere">
            <Link to="/services">Find services</Link>
            <Link to="/my-bookings">My bookings</Link>
            <Link to="/register">Become a provider</Link>
          </nav>
        </div>
        <div>
          <p className={shared.appFooterTitle}>Account</p>
          <nav className={shared.appFooterLinks} aria-label="Account links">
            <Link to="/login">Sign in</Link>
            <Link to="/register">Create account</Link>
            <Link to="/forgot-password">Reset password</Link>
          </nav>
        </div>
      </div>
      <div className={shared.appFooterBottom}>© {new Date().getFullYear()} ServiceSphere. Local services, clearly managed.</div>
    </footer>
  );
}

export default AppFooter;
