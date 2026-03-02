import shared from "../styles/shared.module.css";

function PageLoader({ label = "Loading..." }) {
  return (
    <div className={shared.loaderWrap} role="status" aria-live="polite">
      <span className={shared.loaderOrb} />
      <p className={shared.loaderText}>{label}</p>
    </div>
  );
}

export default PageLoader;
