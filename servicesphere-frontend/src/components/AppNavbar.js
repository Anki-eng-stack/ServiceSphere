import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

function AppNavbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const role = user?.role;

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const providerLinks = [
    { label: "Dashboard", to: "/provider/dashboard" },
    { label: "My Services", to: "/provider/services" },
    { label: "My Bookings", to: "/provider/bookings" },
    { label: "Marketplace", to: "/services" },
    { label: "Logout", onClick: logout, danger: true },
  ];

  const customerLinks = [
    { label: "Marketplace", to: "/services" },
    { label: "My Bookings", to: "/my-bookings" },
    { label: "Logout", onClick: logout, danger: true },
  ];

  const guestLinks = [{ label: "Marketplace", to: "/services" }];
  const links =
    role === "provider"
      ? providerLinks
      : role === "customer"
        ? customerLinks
        : guestLinks;

  return <Navbar links={links} />;
}

export default AppNavbar;
