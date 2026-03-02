import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import shared from "../styles/shared.module.css";
import AppNavbar from "../components/AppNavbar";
import PageLoader from "../components/PageLoader";

function ProviderDashboard() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

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
    const paid = bookings.filter((b) => b.status === "paid").length;
    const accepted = bookings.filter((b) => b.status === "accepted").length;
    const completed = bookings.filter((b) => b.status === "completed").length;
    const cancelled = bookings.filter((b) => b.status === "cancelled").length;

    return [
      { label: "Active Services", value: services.length },
      { label: "Total Bookings", value: bookings.length },
      { label: "Paid Requests", value: paid },
      { label: "Accepted Jobs", value: accepted },
      { label: "Completed Jobs", value: completed },
      { label: "Cancelled", value: cancelled },
    ];
  }, [services, bookings]);

  return (
    <div className={shared.page}>
      <AppNavbar />

      <main className={shared.mainDash}>
        <div className={shared.sectionHeader}>
          <h2 className={shared.pageTitle}>
            <span className={shared.pageTitleItalic}>Provider</span>
            <span className={shared.pageTitleBold}>Dashboard</span>
          </h2>
        </div>

        {error && <p className={shared.error}>{error}</p>}

        {loading ? (
          <PageLoader label="Loading dashboard..." />
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
                  className={shared.btnSuccess}
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
                  className={shared.btnSuccess}
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
        <span className={shared.footerTag}>
          {"\u00A9"} {new Date().getFullYear()} ServiceSphere
        </span>
      </footer>
    </div>
  );
}

export default ProviderDashboard;
