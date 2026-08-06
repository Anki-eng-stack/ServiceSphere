import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import AppNavbar from "../components/AppNavbar";
import PageLoader from "../components/PageLoader";
import { ArrowLeft, ArrowRight, CalendarDays, Check, Clock3, MapPin, ShieldCheck, UserRound } from "lucide-react";
import styles from "./Marketplace.module.css";
import shared from "../styles/shared.module.css";

function BookService() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token");
  const [service, setService] = useState(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (user?.role === "provider") {
      navigate("/services", { replace: true });
      return;
    }
    const fetchService = async () => {
      try {
        const response = await api.get(`/services/${id}`);
        setService(response.data?.service || response.data);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "We could not load this service.");
      }
    };
    fetchService();
  }, [id, navigate, user?.role]);

  const handleBooking = async (event) => {
    event.preventDefault();
    if (!token) return;
    try {
      setProcessing(true);
      setError("");
      const bookingResponse = await api.post("/bookings", { serviceId: id, date, time });
      const bookingId = bookingResponse.data?.booking?._id;
      if (!bookingId) throw new Error("The booking was created without a reference number.");
      const paymentResponse = await api.post("/payments/stripe", { bookingId });
      if (!paymentResponse.data?.url) throw new Error("Payment checkout could not be started.");
      window.location.href = paymentResponse.data.url;
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || "Booking failed. Please try again.");
      setProcessing(false);
    }
  };

  if (!service) {
    return <div className={shared.page}><AppNavbar /><main className={shared.mainCenter}>{error ? <div className={styles.state}><h3>Service unavailable</h3><p>{error}</p><Link to="/services">Return to marketplace</Link></div> : <PageLoader label="Loading service details..." />}</main></div>;
  }

  return (
    <div className={shared.page}>
      <AppNavbar />
      <main className={styles.bookMain}>
        <Link to="/services" className={styles.backLink}><ArrowLeft size={15} /> Back to marketplace</Link>
        <div className={styles.bookLayout}>
          <section className={styles.servicePanel}>
            <div className={styles.serviceCover}>
              <span className={styles.badge}>{service.category || "Professional service"}</span>
              <h1>{service.title}</h1>
              <p>{service.description || "Discuss your requirements directly with the provider after booking."}</p>
            </div>
            <div className={styles.details}>
              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}><span>Price</span><strong>₹{service.price}</strong></div>
                <div className={styles.detailItem}><span><MapPin size={12} /> Location</span><strong>{service.location || "Flexible"}</strong></div>
                <div className={styles.detailItem}><span><UserRound size={12} /> Provider</span><strong>{service.provider?.name || "Service professional"}</strong></div>
              </div>
              <h2 className={styles.howTitle}>What happens next</h2>
              <div className={styles.timeline}>
                <div className={styles.timelineItem}><span className={styles.timelineDot}><CalendarDays size={13} /></span><div><h3>Choose your preferred time</h3><p>Select a date and time that works for your schedule.</p></div></div>
                <div className={styles.timelineItem}><span className={styles.timelineDot}><ShieldCheck size={13} /></span><div><h3>Complete secure checkout</h3><p>Your booking reference is created before payment.</p></div></div>
                <div className={styles.timelineItem}><span className={styles.timelineDot}><Check size={13} /></span><div><h3>Coordinate in booking chat</h3><p>Keep details and updates together after confirmation.</p></div></div>
              </div>
            </div>
          </section>

          <aside className={styles.bookingCard}>
            <div className={styles.bookingHead}><div><h2>Schedule this service</h2><p>Pick your preferred appointment.</p></div><div className={styles.bookingPrice}><span>Total</span><strong>₹{service.price}</strong></div></div>
            {!token ? (
              <div className={styles.authNotice}>You need an account before you can book and pay for a service.<br /><Link to="/login">Sign in to continue →</Link></div>
            ) : (
              <form className={styles.bookingForm} onSubmit={handleBooking}>
                {error && <div className={styles.bookError} role="alert">{error}</div>}
                <div className={styles.bookingField}><label htmlFor="book-date"><CalendarDays size={14} /> Preferred date</label><input id="book-date" type="date" min={today} value={date} onChange={(event) => setDate(event.target.value)} required /></div>
                <div className={styles.bookingField}><label htmlFor="book-time"><Clock3 size={14} /> Preferred time</label><input id="book-time" type="time" value={time} onChange={(event) => setTime(event.target.value)} required /></div>
                <div className={styles.secureNote}><ShieldCheck size={17} /><span>Your booking details are saved securely and you will review payment in checkout.</span></div>
                <button className={styles.submitButton} type="submit" disabled={processing || !date || !time}>{processing ? "Opening secure checkout..." : <span>Continue to payment <ArrowRight size={15} /></span>}</button>
              </form>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}

export default BookService;
