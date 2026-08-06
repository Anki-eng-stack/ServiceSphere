import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BriefcaseBusiness,
  Check,
  Clock3,
  Hammer,
  HeartHandshake,
  HomeIcon,
  MonitorSmartphone,
  PartyPopper,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import styles from "./Home.module.css";

const slides = [
  { image: "/assets/servicesphere-hero-v1.png", tag: "Home services", title: "A trusted expert, right when you need one.", copy: "From urgent fixes to everyday help, find the right local professional in a few easy steps." },
  { image: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1600", tag: "Business support", title: "Move your next project forward with confidence.", copy: "Discover capable specialists and keep every request, booking, and conversation in one place." },
  { image: "https://images.pexels.com/photos/6195505/pexels-photo-6195505.jpeg?auto=compress&cs=tinysrgb&w=1600", tag: "For providers", title: "Turn great work into a growing business.", copy: "Create your profile, manage bookings, and build lasting customer relationships." },
];

const categories = [
  [HomeIcon, "Home care", "Cleaning, repairs, moving, and more"],
  [Hammer, "Repairs", "Skilled help for everyday fixes"],
  [Sparkles, "Beauty & wellness", "Feel-good services, on your schedule"],
  [BriefcaseBusiness, "Business help", "Support that keeps teams moving"],
  [MonitorSmartphone, "Tech services", "Smart help for your digital life"],
  [PartyPopper, "Events", "Bring your next occasion together"],
];

function Home() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const timer = window.setInterval(() => setActiveSlide((current) => (current + 1) % slides.length), 5200);
    return () => window.clearInterval(timer);
  }, []);

  const searchServices = (event) => {
    event.preventDefault();
    const query = searchTerm.trim();
    navigate(query ? `/services?q=${encodeURIComponent(query)}` : "/services");
  };

  const slide = slides[activeSlide];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.brand} to="/" aria-label="ServiceSphere home"><b>S</b><span>Service<span>Sphere</span></span></Link>
        <nav className={styles.nav} aria-label="Main navigation"><a href="#services">Services</a><a href="#how-it-works">How it works</a><a href="#providers">For providers</a></nav>
        <div className={styles.headerActions}><Link to="/login" className={styles.login}>Sign in</Link><Link to="/register" className={styles.headerCta}>Get started <ArrowRight size={15} /></Link></div>
      </header>

      <main>
        <section className={styles.hero}>
          <div className={styles.heroImageWrap}>
            {slides.map((item, index) => <img key={item.tag} src={item.image} alt="Local service professional helping a customer" className={`${styles.heroImage} ${index === activeSlide ? styles.visible : ""}`} />)}
            <div className={styles.imageShade} />
            <div className={styles.slideControls}><span>0{activeSlide + 1} <i /> 0{slides.length}</span><div>{slides.map((item, index) => <button key={item.tag} aria-label={`Show ${item.tag}`} className={index === activeSlide ? styles.activeDot : ""} onClick={() => setActiveSlide(index)} />)}</div></div>
          </div>
          <div className={styles.heroPanel}>
            <p className={styles.eyebrow}><span /> {slide.tag}</p>
            <h1>{slide.title}</h1>
            <p className={styles.heroCopy}>{slide.copy}</p>
            <div className={styles.heroButtons}><Link className={styles.primaryButton} to="/services">Explore services <ArrowRight size={16} /></Link><Link className={styles.secondaryButton} to="/register">Become a provider</Link></div>
            <form className={styles.quickSearch} onSubmit={searchServices}>
              <Search size={17} className={styles.searchIcon} />
              <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="What do you need help with?" aria-label="Search services" />
              <button type="submit" aria-label="Search"><ArrowRight size={16} /></button>
            </form>
          </div>
        </section>

        <section className={styles.trustBar} aria-label="Platform benefits">
          <div><ShieldCheck size={20} /><strong>One simple place</strong><span>Discover and manage services</span></div>
          <div><HeartHandshake size={20} /><strong>Direct communication</strong><span>Talk with the person doing the work</span></div>
          <div><Clock3 size={20} /><strong>Built for flexibility</strong><span>Book around your life and work</span></div>
        </section>

        <section id="services" className={styles.services}>
          <div className={styles.sectionLead}><p className={styles.eyebrow}><span /> Explore the marketplace</p><h2>Whatever life needs,<br /><em>we help you find it.</em></h2></div>
          <Link className={styles.viewAll} to="/services">View all services <ArrowRight size={15} /></Link>
          <div className={styles.categoryGrid}>{categories.map(([Icon, title, text]) => <Link key={title} to={`/services?q=${encodeURIComponent(title)}`} className={styles.categoryCard}><span className={styles.categoryIcon}><Icon size={20} /></span><h3>{title}</h3><p>{text}</p><b>Explore <ArrowRight size={14} /></b></Link>)}</div>
        </section>

        <section id="how-it-works" className={styles.steps}>
          <div className={styles.stepsIntro}><p className={styles.eyebrow}><span /> Simple from start to finish</p><h2>Less searching.<br /><em>More doing.</em></h2><p>ServiceSphere keeps the details clear so you can focus on the job at hand.</p><Link to="/services" className={styles.textCta}>Find a service <ArrowRight size={15} /></Link></div>
          <div className={styles.stepList}>{[["01", "Browse with purpose", "Explore services that fit your needs, location, and schedule."], ["02", "Book in a few taps", "Send a request and keep the important details together."], ["03", "Stay in the loop", "Chat with your provider and track your booking from one place."]].map(([number, title, text]) => <article key={number}><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div></article>)}</div>
        </section>

        <section id="providers" className={styles.providerSection}>
          <div className={styles.providerImage} />
          <div><p className={styles.eyebrow}><span /> Built for service professionals</p><h2>Your next customer could be <em>one click away.</em></h2><p className={styles.providerCopy}>Put your skills in front of people who are actively looking for help. Create services, organise bookings, and keep every conversation professional.</p><div className={styles.providerBenefits}><span><Check size={15} /> Build a service profile</span><span><Check size={15} /> Manage requests in one dashboard</span><span><Check size={15} /> Keep clients updated with chat</span></div><Link to="/register" className={styles.primaryButton}>Start providing services <ArrowRight size={16} /></Link></div>
        </section>

        <section className={styles.testimonial}><p>“I needed a reliable person for a job at home. With ServiceSphere, I found the right help without the usual back and forth.”</p><div><b>Priya S.</b><span>ServiceSphere customer</span></div><div className={styles.stars}>★★★★★</div></section>
      </main>

      <footer className={styles.footer}><div className={styles.footerTop}><Link className={styles.brand} to="/"><b>S</b><span>Service<span>Sphere</span></span></Link><p>A smarter, simpler way to connect with the local services that keep life moving.</p><Link to="/register" className={styles.footerCta}>Join ServiceSphere <ArrowRight size={15} /></Link></div><div className={styles.footerBottom}><span>© {new Date().getFullYear()} ServiceSphere</span><div><Link to="/services">Services</Link><Link to="/login">Sign in</Link><Link to="/register">Become a provider</Link></div></div></footer>
    </div>
  );
}

export default Home;
