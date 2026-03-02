import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import shared from "../styles/shared.module.css";
import AppNavbar from "../components/AppNavbar";
import PageLoader from "../components/PageLoader";

function BookService() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [service, setService] = useState(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (user?.role === "provider") {
      navigate("/services", { replace: true });
      return;
    }

    const fetchService = async () => {
      try {
        const res = await api.get(`/services/${id}`);
        setService(res.data?.service || res.data);
      } catch (err) {
        setError("Failed to load service");
      }
    };
    fetchService();
  }, [id, navigate, user?.role]);

  const handleBooking = async (e) => {
    e.preventDefault();
    try {
      setProcessing(true);
      setError("");

      const bookingRes = await api.post("/bookings", { serviceId: id, date, time });
      const bookingId = bookingRes.data?.booking?._id;
      if (!bookingId) {
        throw new Error("Booking created but booking id is missing");
      }

      const paymentRes = await api.post("/payments/stripe", { bookingId });
      const checkoutUrl = paymentRes.data?.url;
      if (!checkoutUrl) {
        throw new Error("Could not start payment checkout");
      }

      window.location.href = checkoutUrl;
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Booking failed");
      setProcessing(false);
    }
  };

  if (!service) {
    return (
      <div className={shared.page}>
        <AppNavbar />
        <main className={shared.mainCenter}>
          {error ? <p className={shared.error}>{error}</p> : <PageLoader label="Loading service details..." />}
        </main>
      </div>
    );
  }

  return (
    <div className={shared.page}>
      <AppNavbar />

      <main className={shared.mainCenter}>
        <p className={shared.heroSubtitle}>Confirm your appointment</p>
        <h1 className={shared.heroHeading}>
          <span className={shared.heroItalic}>Book a</span>
          <span className={shared.heroBold}>service.</span>
        </h1>

        <form
          className={shared.glassCard}
          onSubmit={handleBooking}
          noValidate
          style={{ maxWidth: 420 }}
        >
          <div>
            <h3
              style={{
                color: "var(--color-text-light)",
                fontSize: "1.05rem",
                fontWeight: 700,
                marginBottom: 6,
              }}
            >
              {service.title}
            </h3>
            <p
              style={{
                color: "var(--color-text-muted)",
                fontSize: "0.82rem",
                lineHeight: 1.55,
              }}
            >
              {service.description}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {service.category && (
              <span className={shared.badge}>{service.category}</span>
            )}
            <span className={shared.priceTag} style={{ fontSize: "1.05rem" }}>
              Rs {service.price}
            </span>
            <span className={shared.dataCardMeta} style={{ marginLeft: "auto" }}>
              {service.location}
            </span>
          </div>

          <hr className={shared.divider} />

          {error && <p className={shared.error}>{error}</p>}

          <div className={shared.inputGroup}>
            <label className={shared.inputLabel} htmlFor="book-date">
              Date
            </label>
            <input
              id="book-date"
              className={shared.input}
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className={shared.inputGroup}>
            <label className={shared.inputLabel} htmlFor="book-time">
              Time
            </label>
            <input
              id="book-time"
              className={shared.input}
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>

          <button type="submit" className={shared.btnPrimary} disabled={processing}>
            {processing ? "Redirecting to payment..." : "Continue to Payment ->"}
          </button>
        </form>
      </main>

      <footer className={shared.footer}>
        <span className={shared.footerTag}>
          {"\u00A9"} {new Date().getFullYear()} ServiceSphere
        </span>
      </footer>
    </div>
  );
}

export default BookService;
