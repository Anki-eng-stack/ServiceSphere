import { Link } from "react-router-dom";
import shared from "../styles/shared.module.css";

/**
 * Shared Navbar component.
 * links: Array of { label, to?, onClick?, danger? }
 *   - If `to` is provided → renders a <Link>
 *   - If `onClick` is provided → renders a pill <button>
 *   - `danger` flag adds red tint to pill buttons
 */
function Navbar({ links = [] }) {
  return (
    <nav className={shared.navbar}>
      <Link to="/" className={shared.logo}>
        service<span className={shared.logoStrong}>sphere</span>
        <sup style={{ fontSize: "0.44em", marginLeft: "1px", opacity: 0.65 }}>®</sup>
      </Link>

      {links.length > 0 && (
        <ul className={shared.navLinks}>
          {links.map((link, i) => (
            <li key={i}>
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
                <Link to={link.to}>{link.label}</Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}

export default Navbar;
