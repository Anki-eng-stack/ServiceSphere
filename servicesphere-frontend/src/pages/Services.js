import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import shared from "../styles/shared.module.css";
import AppNavbar from "../components/AppNavbar";

function Services() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isProvider = user?.role === "provider";
  const [services, setServices] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get("/services");
        if (Array.isArray(res.data)) {
          setServices(res.data);
        } else if (Array.isArray(res.data.services)) {
          setServices(res.data.services);
        } else {
          setServices([]);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load services");
      }
    };
    fetchServices();
  }, []);

  return (
    <div className={shared.page}>
      <AppNavbar />

      <main className={shared.mainDash}>
        <div className={shared.sectionHeader}>
          <h2 className={shared.pageTitle}>
            <span className={shared.pageTitleItalic}>Available</span>
            <span className={shared.pageTitleBold}>Services</span>
          </h2>
        </div>

        {error && <p className={shared.error}>{error}</p>}

        {services.length === 0 && !error ? (
          <p className={shared.emptyState}>No services available yet.</p>
        ) : (
          <div className={shared.grid}>
            {services.map((service) => (
              <div key={service._id} className={shared.dataCard}>
                {service.category && (
                  <span className={shared.badge}>{service.category}</span>
                )}
                <h3 className={shared.dataCardTitle}>{service.title}</h3>
                <p className={shared.dataCardMeta}>{service.description}</p>
                <hr className={shared.divider} />
                <div className={shared.priceTag}>Rs {service.price}</div>
                <p className={shared.dataCardMeta}>
                  <b>Location:</b> {service.location}
                </p>

                {isProvider ? (
                  <p className={shared.dataCardMeta}>Marketplace preview mode</p>
                ) : (
                  <button
                    className={shared.btnPrimary}
                    onClick={() => navigate(`/book/${service._id}`)}
                  >
                    Book Service ->
                  </button>
                )}
              </div>
            ))}
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

export default Services;
