import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import shared from "../styles/shared.module.css";
import Navbar from "../components/Navbar";

function BookService() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [error, setError] = useState("");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const navLinks = [
    { label: "Services", to: "/services" },
    { label: "Logout", onClick: logout, danger: true },
  ];

  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await api.get(`/services/${id}`);
        setService(res.data);
      } catch (err) {
        setError("Failed to load service");
      }
    };
    fetchService();
  }, [id]);

  const handleBooking = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/bookings", { serviceId: id, date, time });
      console.log("BOOKING RESPONSE:", res.data);
      const bookingId = res.data.booking._id;
      navigate(`/chat/${bookingId}`);
    } catch (err) {
      setError(err.response?.data?.message || "Booking failed");
    }
  };

  /* Loading state */
  if (!service) {
    return (
      <div className={shared.page}>
        <Navbar links={navLinks} />
        <main className={shared.mainCenter}>
          <p className={shared.heroSubtitle}>
            {error || "Loading service details…"}
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className={shared.page}>
      <Navbar links={navLinks} />

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
          {/* Service summary */}
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
            <span
              className={shared.priceTag}
              style={{ fontSize: "1.05rem" }}
            >
              ₹{service.price}
            </span>
            <span
              className={shared.dataCardMeta}
              style={{ marginLeft: "auto" }}
            >
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

          <button type="submit" className={shared.btnPrimary}>
            Confirm Booking →
          </button>
        </form>
      </main>

      <footer className={shared.footer}>
        <span className={shared.footerTag}>© 2025 ServiceSphere</span>
        <span className={shared.footerTag}>Photo by Yusuf P on Pexels</span>
      </footer>
    </div>
  );
}

export default BookService;
