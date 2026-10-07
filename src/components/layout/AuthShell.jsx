import { Link } from "react-router-dom";

const copyByVariant = {
  customer: {
    eyebrow: "TIGERMILES",
    headline: "Your next journey starts here.",
    description:
      "Keep your travel details close, find your trips in one place, and get back to the moments that matter.",
    note: "Thoughtful journeys, from booking to boarding.",
  },
  operations: {
    eyebrow: "OPERATIONS",
    headline: "Clarity for every flight.",
    description:
      "A focused workspace for the people coordinating aircraft, schedules, passengers, and the day ahead.",
    note: "One network. One clear view.",
  },
};

const AuthShell = ({ children, variant = "customer" }) => {
  const copy = copyByVariant[variant] || copyByVariant.customer;

  return (
    <div className="auth-shell">
      <aside className="auth-shell__visual" aria-label="Tiger Airlines">
        <img
          src="/tiger-airlines-hero.png"
          alt=""
          className="auth-shell__visual-image"
          decoding="async"
        />
        <div className="auth-shell__scrim" aria-hidden="true" />
        <div className="auth-shell__visual-content">
          <Link to="/" className="auth-shell__brand" aria-label="Tiger Airlines home">
            <span className="auth-shell__mark">
              <img src="/logo.svg" alt="" />
            </span>
            <span>
              Tiger<span className="auth-shell__brand-light">Airlines</span>
            </span>
          </Link>
          <div className="auth-shell__message">
            <p className="auth-shell__eyebrow">{copy.eyebrow}</p>
            <h2>{copy.headline}</h2>
            <p className="auth-shell__description">{copy.description}</p>
          </div>
          <p className="auth-shell__note">{copy.note}</p>
        </div>
      </aside>
      <section className="auth-shell__content">
        <div className="auth-shell__content-inner">{children}</div>
      </section>
    </div>
  );
};

export { AuthShell };
export default AuthShell;
