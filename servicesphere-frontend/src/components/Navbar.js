import { Link } from "react-router-dom";
import shared from "../styles/shared.module.css";

function Navbar({ links = [] }) {
  return (
    <nav className={shared.navbar} aria-label="Primary navigation">
      <Link to="/" className={shared.logo}>
        service<span className={shared.logoStrong}>sphere</span>
        <sup className={shared.trademark} aria-label="registered trademark">®</sup>
      </Link>

      {links.length > 0 && (
        <ul className={shared.navLinks}>
          {links.map((link) => (
            <li key={link.label}>
              {link.onClick ? (
                <button
                  className={
                    link.danger
                      ? `${shared.navBtn} ${shared.navBtnDanger}`
                      : shared.navBtn
                  }
                  onClick={link.onClick}
                >
                  {link.label}
                </button>
              ) : (
                <Link to={link.to} className={shared.navLink}>{link.label}</Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}

export default Navbar;
