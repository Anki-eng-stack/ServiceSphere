import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import shared from "../styles/shared.module.css";
import Navbar from "../components/Navbar";

function ProviderBookings() {
  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const navLinks = [
    { label: "My Services", onClick: () => navigate("/provider/services") },
    { label: "Logout", onClick: logout, danger: true },
  ];

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get("/bookings/my");
        setBookings(res.data.bookings || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBookings();
  }, []);

  const getStatusClass = (status) => {
    if (status === "confirmed") return shared.badgeSuccess;
    if (status === "pending") return shared.badgePending;
    if (status === "cancelled") return shared.badgeDanger;
    return shared.badge;
  };

  return (
    <div className={shared.page}>
      <Navbar links={navLinks} />

      <main className={shared.mainDash}>
        <div className={shared.sectionHeader}>
          <h2 className={shared.pageTitle}>
            <span className={shared.pageTitleItalic}>Customer</span>
            <span className={shared.pageTitleBold}>Bookings</span>
          </h2>
        </div>

        {bookings.length === 0 ? (
          <p className={shared.emptyState}>No bookings yet.</p>
        ) : (
          <div className={shared.grid}>
            {bookings.map((booking) => (
              <div key={booking._id} className={shared.dataCard}>
                <span className={getStatusClass(booking.status)}>
                  {booking.status}
                </span>
                <h3 className={shared.dataCardTitle}>
                  {booking.service?.title}
                </h3>
                <p className={shared.dataCardMeta}>
                  <b>Customer:</b> {booking.customer?.name}
                </p>
                {booking.date && (
                  <p className={shared.dataCardMeta}>
                    <b>Date:</b>{" "}
                    {new Date(booking.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                )}
                <hr className={shared.divider} />
                <button
                  className={shared.btnSuccess}
                  onClick={() => navigate(`/chat/${booking._id}`)}
                >
                  Open Chat →
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className={shared.footer}>
        <span className={shared.footerTag}>© 2025 ServiceSphere</span>
        <span className={shared.footerTag}>Photo by Yusuf P on Pexels</span>
      </footer>
    </div>
  );
}

export default ProviderBookings;
