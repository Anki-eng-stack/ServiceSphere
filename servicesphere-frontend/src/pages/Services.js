import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";
import AppNavbar from "../components/AppNavbar";
import PageLoader from "../components/PageLoader";
import { ArrowRight, BriefcaseBusiness, Clock3, Hammer, HomeIcon, MapPin, MonitorSmartphone, Search, Sparkles, Star } from "lucide-react";
import styles from "./Marketplace.module.css";
import shared from "../styles/shared.module.css";

const getIcon = (category = "") => {
  const value = category.toLowerCase();
  if (value.includes("home") || value.includes("clean")) return HomeIcon;
  if (value.includes("tech") || value.includes("computer")) return MonitorSmartphone;
  if (value.includes("beauty") || value.includes("wellness")) return Sparkles;
  if (value.includes("repair") || value.includes("maintenance")) return Hammer;
  return BriefcaseBusiness;
};

function Services() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isProvider = user?.role === "provider";
  const [services, setServices] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/services");
      const result = Array.isArray(response.data) ? response.data : response.data?.services;
      setServices(Array.isArray(result) ? result : []);
    } catch (requestError) {
      console.error(requestError);
      setError("We could not load the marketplace. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchServices(); }, [fetchServices]);
  useEffect(() => {
    setQuery(searchParams.get("q") || "");
    setCategory(searchParams.get("category") || "all");
  }, [searchParams]);

  const categories = useMemo(() => [...new Set(services.map((service) => service.category).filter(Boolean))], [services]);
  const visibleServices = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return services.filter((service) => {
      const content = [service.title, service.description, service.category, service.location, service.provider?.name].filter(Boolean).join(" ").toLowerCase();
      return (category === "all" || service.category === category) && (!normalized || content.includes(normalized));
    });
  }, [category, query, services]);

  return (
    <div className={shared.page}>
      <AppNavbar />
      <main className={styles.main}>
        <section className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>ServiceSphere marketplace</p>
            <h1>Find local help that <span>fits your day.</span></h1>
            <p className={styles.heroCopy}>Explore services, compare the details that matter, and manage the full booking from one place.</p>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.stat}><strong>{services.length}</strong><span>services available</span></div>
            <div className={styles.stat}><strong>{categories.length}</strong><span>service categories</span></div>
          </div>
        </section>

        {!loading && !error && services.length > 0 && (
          <div className={styles.filterBar} aria-label="Filter services">
            <label className={styles.field}><span>Search the marketplace</span><div className={styles.inputWrap}><b><Search size={17} /></b><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Service, category, provider, or location" /></div></label>
            <label className={styles.field}><span>Category</span><select value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">All categories</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
            <div className={styles.resultCount}>{visibleServices.length} result{visibleServices.length === 1 ? "" : "s"}</div>
          </div>
        )}

        {loading ? <PageLoader label="Loading marketplace..." /> : error ? (
          <div className={styles.state}><h3>Marketplace unavailable</h3><p>{error}</p><button onClick={fetchServices}>Try again</button></div>
        ) : services.length === 0 ? (
          <div className={styles.state}><h3>No services are listed yet</h3><p>Providers can add the first service from their dashboard.</p></div>
        ) : visibleServices.length === 0 ? (
          <div className={styles.state}><h3>No matching services</h3><p>Try a broader search or clear the selected category.</p><button onClick={() => { setQuery(""); setCategory("all"); }}>Clear filters</button></div>
        ) : (
          <div className={styles.serviceGrid}>
            {visibleServices.map((service) => {
              const ServiceIcon = getIcon(service.category);
              return (
              <article key={service._id} className={styles.serviceCard}>
                <div className={styles.serviceIcon} aria-hidden="true"><ServiceIcon size={23} /></div>
                <div className={styles.cardBody}>
                  <div className={styles.cardTop}><span className={styles.badge}>{service.category || "Professional service"}</span><span className={styles.rating}><Star size={13} fill="currentColor" /> New listing</span></div>
                  <h2>{service.title}</h2>
                  <p className={styles.description}>{service.description || "Contact the provider to discuss the service details and your requirements."}</p>
                  <div className={styles.meta}><span><MapPin size={14} />{service.location || "Location flexible"}</span><span><Clock3 size={14} />Flexible scheduling</span>{service.provider?.name && <span><i>●</i>{service.provider.name}</span>}</div>
                  <div className={styles.cardFooter}>
                    <div className={styles.price}><small>Starting from</small><strong>₹{service.price}</strong></div>
                    {isProvider ? <span className={styles.preview}>Provider preview</span> : <button className={styles.bookButton} onClick={() => navigate(`/book/${service._id}`)}>View &amp; book <ArrowRight size={15} /></button>}
                  </div>
                </div>
              </article>
            );})}
          </div>
        )}
      </main>
    </div>
  );
}

export default Services;
