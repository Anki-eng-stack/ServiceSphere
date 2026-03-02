import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import shared from "../styles/shared.module.css";
import AppNavbar from "../components/AppNavbar";

function CustomerBookings() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoadingById, setActionLoadingById] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await api.get("/bookings/my");
        const allBookings = Array.isArray(res.data.bookings) ? res.data.bookings : [];
        const myBookings = allBookings.filter(
          (booking) =>
            booking?.customer?._id &&
            user?.id &&
            booking.customer._id.toString() === user.id.toString() &&
            booking.status !== "cancelled"
        );
        setBookings(myBookings);
      } catch (err) {
        setError("Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [user?.id]);

  const getStatusClass = (status) => {
    if (status === "accepted") return shared.badgeSuccess;
    if (status === "completed") return shared.badgeSuccess;
    if (status === "pending") return shared.badgePending;
    if (status === "cancelled") return shared.badgeDanger;
    return shared.badge;
  };

  const cancelBooking = async (bookingId) => {
    try {
      setError("");
      setActionLoadingById((prev) => ({ ...prev, [bookingId]: true }));
      const res = await api.patch(`/bookings/${bookingId}/cancel`);
      if (res.data?.booking) {
        setBookings((prev) => prev.filter((booking) => booking._id !== bookingId));
      }
    } catch (err) {
      setError(err.response?.data?.message || "Could not cancel booking");
    } finally {
      setActionLoadingById((prev) => ({ ...prev, [bookingId]: false }));
    }
  };

  return (
    <div className={shared.page}>
      <AppNavbar />

      <main className={shared.mainDash}>
        <div className={shared.sectionHeader}>
          <h2 className={shared.pageTitle}>
            <span className={shared.pageTitleItalic}>My</span>
            <span className={shared.pageTitleBold}>Bookings</span>
          </h2>
        </div>

        {error && <p className={shared.error}>{error}</p>}

        {loading ? (
          <p className={shared.emptyState}>Loading bookings...</p>
        ) : bookings.length === 0 ? (
          <p className={shared.emptyState}>No bookings yet.</p>
        ) : (
          <div className={shared.grid}>
            {bookings.map((booking) => {
              const isActionLoading = Boolean(actionLoadingById[booking._id]);
              return (
                <div key={booking._id} className={shared.dataCard}>
                  <span className={getStatusClass(booking.status)}>
                    {booking.status}
                  </span>
                  <h3 className={shared.dataCardTitle}>{booking.service?.title}</h3>
                  <p className={shared.dataCardMeta}>
                    <b>Provider:</b> {booking.provider?.name}
                  </p>
                  {booking.provider?.email && (
                    <p className={shared.dataCardMeta}>
                      <b>Email:</b> {booking.provider.email}
                    </p>
                  )}
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
                  {booking.time && (
                    <p className={shared.dataCardMeta}>
                      <b>Time:</b> {booking.time}
                    </p>
                  )}
                  <hr className={shared.divider} />

                  <div className={shared.actionsRow}>
                    <button
                      className={shared.btnSuccess}
                      onClick={() => navigate(`/chat/${booking._id}`)}
                    >
                      Open Chat ->
                    </button>

                    {booking.status === "pending" && (
                      <button
                        className={shared.btnDanger}
                        onClick={() => cancelBooking(booking._id)}
                        disabled={isActionLoading}
                      >
                        {isActionLoading ? "Updating..." : "Cancel Booking"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <footer className={shared.footer}>
        <span className={shared.footerTag}>
          {"\u00A9"} {new Date().getFullYear()} ServiceSphere
        </span>
        <span className={shared.footerTag}>Photo by Yusuf P on Pexels</span>
      </footer>
    </div>
  );
}

export default CustomerBookings;
