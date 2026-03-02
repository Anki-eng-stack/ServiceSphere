import { useNavigate } from "react-router-dom";
import shared from "../styles/shared.module.css";
import AppNavbar from "../components/AppNavbar";

function PaymentSuccess() {
  const navigate = useNavigate();

  return (
    <div className={shared.page}>
      <AppNavbar />

      <main className={shared.mainCenter}>
        <p className={shared.heroSubtitle}>Transaction complete</p>
        <h1 className={shared.heroHeading}>
          <span className={shared.heroItalic}>Payment</span>
          <span className={shared.heroBold}>successful!</span>
        </h1>

        <div
          className={shared.glassCard}
          style={{ alignItems: "center", textAlign: "center", maxWidth: 360 }}
        >
          {/* Checkmark */}
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              border: "2px solid rgba(74, 222, 128, 0.5)",
              background: "rgba(34, 197, 94, 0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.8rem",
              color: "#4ade80",
              flexShrink: 0,
            }}
          >
            ✓
          </div>

          <p
            style={{
              color: "var(--color-text-muted)",
              fontSize: "0.88rem",
              lineHeight: 1.65,
            }}
          >
            Your payment has been processed successfully. You can now connect
            with your service provider through the chat.
          </p>

          <hr className={shared.divider} style={{ width: "100%" }} />

          <button
            className={shared.btnPrimary}
            onClick={() => navigate("/services")}
          >
            Browse Services →
          </button>
        </div>
      </main>

      <footer className={shared.footer}>
        <span className={shared.footerTag}>© 2025 ServiceSphere</span>
        <span className={shared.footerTag}>Photo by Yusuf P on Pexels</span>
      </footer>
    </div>
  );
}

export default PaymentSuccess;
