import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import shared from "../styles/shared.module.css";
import Navbar from "../components/Navbar";

function ProviderDashboard() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const navLinks = [
    { label: "My Services", onClick: () => navigate("/provider/services") },
    { label: "My Bookings", onClick: () => navigate("/provider/bookings") },
    { label: "Logout", onClick: logout, danger: true },
  ];

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError("");

      const [servicesRes, bookingsRes] = await Promise.allSettled([
        api.get("/services/provider/me"),
        api.get("/bookings/my"),
      ]);

      if (servicesRes.status === "fulfilled") {
        setServices(
          Array.isArray(servicesRes.value.data.services)
            ? servicesRes.value.data.services
            : []
        );
      }

      if (bookingsRes.status === "fulfilled") {
        setBookings(
          Array.isArray(bookingsRes.value.data.bookings)
            ? bookingsRes.value.data.bookings
            : []
        );
      }

      if (
        servicesRes.status === "rejected" &&
        bookingsRes.status === "rejected"
      ) {
        setError("Failed to load provider dashboard");
      }

      setLoading(false);
    };

    loadDashboard();
  }, []);

  const stats = useMemo(() => {
    const confirmed = bookings.filter((b) => b.status === "confirmed").length;
    const pending = bookings.filter((b) => b.status === "pending").length;
    const cancelled = bookings.filter((b) => b.status === "cancelled").length;

    return [
      { label: "Active Services", value: services.length },
      { label: "Total Bookings", value: bookings.length },
      { label: "Pending Requests", value: pending },
      { label: "Confirmed Jobs", value: confirmed },
      { label: "Cancelled", value: cancelled },
    ];
  }, [services, bookings]);

  return (
    <div className={shared.page}>
      <Navbar links={navLinks} />

      <main className={shared.mainDash}>
        <div className={shared.sectionHeader}>
          <h2 className={shared.pageTitle}>
            <span className={shared.pageTitleItalic}>Provider</span>
            <span className={shared.pageTitleBold}>Dashboard</span>
          </h2>
        </div>

        {error && <p className={shared.error}>{error}</p>}

        {loading ? (
          <p className={shared.emptyState}>Loading dashboard...</p>
        ) : (
          <>
            <div className={shared.grid} style={{ marginBottom: 22 }}>
              {stats.map((item) => (
                <div key={item.label} className={shared.dataCard}>
                  <p
                    className={shared.dataCardMeta}
                    style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}
                  >
                    {item.label}
                  </p>
                  <p
                    className={shared.pageTitleBold}
                    style={{ fontSize: "2rem", lineHeight: 1 }}
                  >
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <div className={shared.grid}>
              <div className={shared.dataCard}>
                <h3 className={shared.dataCardTitle}>Manage Services</h3>
                <p className={shared.dataCardMeta}>
                  Add, edit, and organize the services visible to customers.
                </p>
                <button
                  className={shared.btnPrimary}
                  onClick={() => navigate("/provider/services")}
                >
                  Open Services
                </button>
              </div>

              <div className={shared.dataCard}>
                <h3 className={shared.dataCardTitle}>Track Bookings</h3>
                <p className={shared.dataCardMeta}>
                  Review incoming requests and continue active conversations.
                </p>
                <button
                  className={shared.btnSuccess}
                  onClick={() => navigate("/provider/bookings")}
                >
                  Open Bookings
                </button>
              </div>

              <div className={shared.dataCard}>
                <h3 className={shared.dataCardTitle}>View Marketplace</h3>
                <p className={shared.dataCardMeta}>
                  Check the customer side of the platform and current listings.
                </p>
                <button
                  className={shared.btnPrimary}
                  onClick={() => navigate("/services")}
                >
                  Browse Services
                </button>
              </div>
            </div>
          </>
        )}
      </main>

      <footer className={shared.footer}>
        <span className={shared.footerTag}>© 2025 ServiceSphere</span>
        <span className={shared.footerTag}>Photo by Yusuf P on Pexels</span>
      </footer>
    </div>
  );
}

export default ProviderDashboard;
