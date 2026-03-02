import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";
import shared from "../styles/shared.module.css";
import AppNavbar from "../components/AppNavbar";
import PageLoader from "../components/PageLoader";

function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const sessionId = searchParams.get("session_id");
  const [confirming, setConfirming] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const confirmPayment = async () => {
      if (!bookingId) {
        setError("Missing booking reference");
        setConfirming(false);
        return;
      }

      try {
        await api.post("/payments/confirm", { bookingId, sessionId });
      } catch (err) {
        setError(err.response?.data?.message || "Payment confirmation failed");
      } finally {
        setConfirming(false);
      }
    };

    confirmPayment();
  }, [bookingId, sessionId]);

  return (
    <div className={shared.page}>
      <AppNavbar />

      <main className={shared.mainCenter}>
        {confirming ? (
          <PageLoader label="Confirming payment..." />
        ) : (
          <>
            <p className={shared.heroSubtitle}>Transaction complete</p>
            <h1 className={shared.heroHeading}>
              <span className={shared.heroItalic}>Payment</span>
              <span className={shared.heroBold}>
                {error ? "not confirmed" : "successful!"}
              </span>
            </h1>

            <div
              className={shared.glassCard}
              style={{ alignItems: "center", textAlign: "center", maxWidth: 380 }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  border: `2px solid ${error ? "rgba(239,68,68,0.5)" : "rgba(74,222,128,0.5)"}`,
                  background: error ? "rgba(239,68,68,0.12)" : "rgba(34,197,94,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.8rem",
                  color: error ? "#fca5a5" : "#4ade80",
                  flexShrink: 0,
                }}
              >
                {error ? "!" : "✓"}
              </div>

              <p
                style={{
                  color: "var(--color-text-muted)",
                  fontSize: "0.88rem",
                  lineHeight: 1.65,
                }}
              >
                {error
                  ? "We could not auto-confirm your payment. Please check your bookings and try again."
                  : "Your payment is confirmed. Your booking is now marked as paid and waiting for provider acceptance."}
              </p>

              {error && <p className={shared.error}>{error}</p>}

              <hr className={shared.divider} style={{ width: "100%" }} />

              {!error && bookingId && (
                <button
                  className={shared.btnSuccess}
                  onClick={() => navigate(`/chat/${bookingId}`)}
                >
                  Open Booking Chat ->
                </button>
              )}
              <button
                className={shared.btnPrimary}
                onClick={() => navigate("/my-bookings")}
              >
                Go to My Bookings
              </button>
            </div>
          </>
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

export default PaymentSuccess;
