import { useEffect, useState } from "react";
import api from "../services/api";
import shared from "../styles/shared.module.css";
import AppNavbar from "../components/AppNavbar";
import PageLoader from "../components/PageLoader";

function ProviderServices() {
  const [services, setServices] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingService, setSavingService] = useState(false);
  const [deletingById, setDeletingById] = useState({});
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    price: "",
    location: "",
  });

  const fetchMyServices = async ({ silent = false } = {}) => {
    try {
      setError("");
      if (silent) {
        setRefreshing(true);
      } else {
        setInitialLoading(true);
      }

      const res = await api.get("/services/provider/me");
      const nextServices = Array.isArray(res.data.services) ? res.data.services : [];
      setServices(nextServices);
    } catch (err) {
      console.error(err);
      setError("Failed to load services");
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMyServices();
  }, []);

  const handleChange = (e) => {
    if (error) setError("");
    if (notice) setNotice("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const createService = async (e) => {
    e.preventDefault();
    try {
      setSavingService(true);
      setError("");
      setNotice("");
      await api.post("/services", form);
      setForm({
        title: "",
        category: "",
        description: "",
        price: "",
        location: "",
      });
      setNotice("Service created successfully");
      await fetchMyServices({ silent: true });
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.message || "Error creating service");
    } finally {
      setSavingService(false);
    }
  };

  const deleteService = async (id) => {
    try {
      setError("");
      setNotice("");
      setDeletingById((prev) => ({ ...prev, [id]: true }));
      await api.delete(`/services/${id}`);
      setServices((prev) => prev.filter((service) => service._id !== id));
      setNotice("Service deleted successfully");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to delete service");
    } finally {
      setDeletingById((prev) => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className={shared.page}>
      <AppNavbar />

      <main className={shared.mainDash}>
        <div className={shared.sectionHeader}>
          <h2 className={shared.pageTitle}>
            <span className={shared.pageTitleItalic}>My</span>
            <span className={shared.pageTitleBold}>Services</span>
          </h2>
          {refreshing && (
            <span className={shared.chipStatus}>Syncing services...</span>
          )}
        </div>

        <form
          onSubmit={createService}
          className={shared.glassCard}
          style={{ maxWidth: 640, marginBottom: 36 }}
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
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className={shared.inputGroup}>
              <label className={shared.inputLabel}>Price (INR)</label>
              <input
                name="price"
                className={shared.input}
                placeholder="500"
                value={form.price}
                onChange={handleChange}
                type="number"
                min="0"
                required
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
              placeholder="Describe your service..."
              value={form.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          {error && <p className={shared.error}>{error}</p>}
          {notice && <p className={shared.success}>{notice}</p>}

          <button type="submit" className={shared.btnPrimary} disabled={savingService}>
            {savingService ? "Creating..." : "Create Service ->"}
          </button>
        </form>

        {initialLoading ? (
          <PageLoader label="Loading your services..." />
        ) : services.length === 0 ? (
          <p className={shared.emptyState}>You have not added any services yet.</p>
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
                <button
                  className={shared.btnDanger}
                  onClick={() => deleteService(service._id)}
                  disabled={Boolean(deletingById[service._id])}
                >
                  {deletingById[service._id] ? "Deleting..." : "Delete Service"}
                </button>
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

export default ProviderServices;
