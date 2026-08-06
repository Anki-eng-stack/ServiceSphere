import styles from "../pages/Auth.module.css";

function AuthLayout({ mode, title, subtitle, children }) {
  const isRegister = mode === "register";
  return (
    <main className={styles.main}>
      <section className={styles.story}>
        <div className={styles.storyContent}>
          <span className={styles.storyLabel}>{isRegister ? "Join the marketplace" : "Welcome to ServiceSphere"}</span>
          <h1>{isRegister ? "One account. More ways to get things done." : "Your services, bookings, and conversations—together."}</h1>
          <p>{isRegister ? "Book trusted local help or grow your service business with tools designed to keep work organised." : "Pick up exactly where you left off and keep every service moving forward."}</p>
          <div className={styles.benefits}>
            <div><span>✓</span><p><strong>Clear booking management</strong><small>Track every request and appointment.</small></p></div>
            <div><span>✓</span><p><strong>Direct provider chat</strong><small>Keep updates in the right conversation.</small></p></div>
            <div><span>✓</span><p><strong>Built for both sides</strong><small>Customer and provider tools in one platform.</small></p></div>
          </div>
        </div>
        <div className={styles.storyMetric}><strong>ServiceSphere</strong><span>Local work, professionally managed.</span></div>
      </section>
      <section className={styles.formSide}>
        <div className={styles.formIntro}><span>{isRegister ? "Create your account" : "Secure account access"}</span><h2>{title}</h2><p>{subtitle}</p></div>
        {children}
      </section>
    </main>
  );
}

export default AuthLayout;
