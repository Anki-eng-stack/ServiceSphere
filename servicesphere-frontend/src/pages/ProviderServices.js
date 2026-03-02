import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import shared from "../styles/shared.module.css";
import Navbar from "../components/Navbar";

function ProviderServices() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    price: "",
    location: "",
  });

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const navLinks = [
    { label: "My Bookings", onClick: () => navigate("/provider/bookings") },
    { label: "Logout", onClick: logout, danger: true },
  ];

  const fetchMyServices = async () => {
    try {
      const res = await api.get("/services/provider/me");
      setServices(Array.isArray(res.data.services) ? res.data.services : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load services");
    }
  };

  useEffect(() => {
    fetchMyServices();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const createService = async (e) => {
    e.preventDefault();
    try {
      await api.post("/services", form);
      setForm({
        title: "",
        category: "",
        description: "",
        price: "",
        location: "",
      });
      fetchMyServices();
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert(err.response?.data?.message || "Error creating service");
    }
  };

  const deleteService = async (id) => {
    try {
      await api.delete(`/services/${id}`);
      fetchMyServices();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={shared.page}>
      <Navbar links={navLinks} />

      <main className={shared.mainDash}>
        <div className={shared.sectionHeader}>
          <h2 className={shared.pageTitle}>
            <span className={shared.pageTitleItalic}>My</span>
            <span className={shared.pageTitleBold}>Services</span>
          </h2>
        </div>

        {/* ---- Create form ---- */}
        <form
          onSubmit={createService}
          className={shared.glassCard}
          style={{ maxWidth: 480, marginBottom: 36 }}
        >
          <p
            className={shared.heroSubtitle}
            style={{ textAlign: "left", marginBottom: 4 }}
          >
            Add a new service
          </p>

          <div className={shared.inputGroup}>
            <label className={shared.inputLabel}>Title</label>
            <input
              name="title"
              className={shared.input}
              placeholder="e.g. House Cleaning"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className={shared.inputGroup}>
            <label className={shared.inputLabel}>Category</label>
            <input
              name="category"
              className={shared.input}
              placeholder="e.g. Cleaning"
              value={form.category}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className={shared.inputGroup}>
              <label className={shared.inputLabel}>Price (₹)</label>
              <input
                name="price"
                className={shared.input}
                placeholder="500"
                value={form.price}
                onChange={handleChange}
                type="number"
                min="0"
              />
            </div>
            <div className={shared.inputGroup}>
              <label className={shared.inputLabel}>Location</label>
              <input
                name="location"
                className={shared.input}
                placeholder="City"
                value={form.location}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={shared.inputGroup}>
            <label className={shared.inputLabel}>Description</label>
            <textarea
              name="description"
              className={shared.textarea}
              placeholder="Describe your service…"
              value={form.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          {error && <p className={shared.error}>{error}</p>}

          <button type="submit" className={shared.btnPrimary}>
            Create Service →
          </button>
        </form>

        {/* ---- Services grid ---- */}
        {services.length === 0 ? (
          <p className={shared.emptyState}>
            You haven't added any services yet.
          </p>
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
                <div className={shared.priceTag}>₹{service.price}</div>
                <p className={shared.dataCardMeta}>
                  <b>Location:</b> {service.location}
                </p>
                <button
                  className={shared.btnDanger}
                  onClick={() => deleteService(service._id)}
                >
                  Delete Service
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className={shared.footer}>
        <span className={shared.footerTag}>© 2025 ServiceSphere</span>
        <span className={shared.footerTag}>Photo by Yusuf P on Pexels</span>
      </footer>
    </div>
  );
}

export default ProviderServices;
