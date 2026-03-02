import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import shared from "../styles/shared.module.css";
import AppNavbar from "../components/AppNavbar";
import PageLoader from "../components/PageLoader";

function ProviderBookings() {
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
        const activeBookings = allBookings.filter((booking) =>
          ["paid", "accepted"].includes(booking.status)
        );
        setBookings(activeBookings);
      } catch (err) {
        setError("Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const getStatusClass = (status) => {
    if (status === "accepted") return shared.badgeSuccess;
    if (status === "completed") return shared.badgeSuccess;
    if (status === "paid") return shared.badgePending;
    if (status === "pending") return shared.badgePending;
    if (status === "cancelled") return shared.badgeDanger;
    return shared.badge;
  };

  const updateBookingInList = (updatedBooking) => {
    setBookings((prev) => {
      if (
        updatedBooking.status === "completed" ||
        updatedBooking.status === "cancelled"
      ) {
        return prev.filter((booking) => booking._id !== updatedBooking._id);
      }

      return prev.map((booking) =>
        booking._id === updatedBooking._id
          ? { ...booking, ...updatedBooking }
          : booking
      );
    });
  };

  const handleStatusAction = async (bookingId, action) => {
    try {
      setError("");
      setActionLoadingById((prev) => ({ ...prev, [bookingId]: true }));
      const res = await api.patch(`/bookings/${bookingId}/${action}`);
      if (res.data?.booking) {
        updateBookingInList(res.data.booking);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Booking action failed");
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
            <span className={shared.pageTitleItalic}>Provider</span>
            <span className={shared.pageTitleBold}>Bookings</span>
          </h2>
        </div>

        {error && <p className={shared.error}>{error}</p>}

        {loading ? (
          <PageLoader label="Loading active bookings..." />
        ) : bookings.length === 0 ? (
          <p className={shared.emptyState}>No active bookings to track.</p>
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
                    <b>Customer:</b> {booking.customer?.name}
                  </p>
                  {booking.customer?.email && (
                    <p className={shared.dataCardMeta}>
                      <b>Email:</b> {booking.customer.email}
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
                    {booking.status === "paid" && (
                      <>
                        <button
                          className={shared.btnSuccess}
                          onClick={() => handleStatusAction(booking._id, "accept")}
                          disabled={isActionLoading}
                        >
                          {isActionLoading ? "Updating..." : "Accept Booking"}
                        </button>
                      </>
                    )}

                    {booking.status === "accepted" && (
                      <button
                        className={shared.btnPrimary}
                        onClick={() => handleStatusAction(booking._id, "complete")}
                        disabled={isActionLoading}
                      >
                        {isActionLoading ? "Updating..." : "Mark Completed"}
                      </button>
                    )}

                    <button
                      className={shared.btnSuccess}
                      onClick={() => navigate(`/chat/${booking._id}`)}
                    >
                      Open Chat ->
                    </button>
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
      </footer>
    </div>
  );
}

export default ProviderBookings;
