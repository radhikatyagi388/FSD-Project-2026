import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ArrowRight, BriefcaseBusiness, LockKeyhole, Mail } from "lucide-react";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(form.email, form.password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to log in. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-layout">
      <section className="auth-visual">
        <Link to="/" className="brand">
          <span className="brand-icon"><BriefcaseBusiness size={23} /></span>
          Placement<span>Nex</span>
        </Link>

        <div className="visual-content">
          <span className="eyebrow">THE FUTURE OF CAMPUS PLACEMENTS</span>
          <h1>One Campus.<br />Every Opportunity.<br /><span>Smarter Placements.</span></h1>
          <p>Your career journey, powered by intelligence. Discover opportunities, prepare smarter and move closer to your dream career.</p>
          <div className="visual-bottom">
            <span className="status-dot" /> Your next opportunity starts here.
          </div>
        </div>

        <div className="visual-orb orb-one" />
        <div className="visual-orb orb-two" />
      </section>

      <section className="auth-panel">
        <div className="auth-form-wrap">
          <div className="mobile-brand">
            <BriefcaseBusiness size={23} /> Placement<span>Nex</span>
          </div>

          <div className="form-heading">
            <span className="eyebrow">WELCOME BACK</span>
            <h2>Sign in to your account</h2>
            <p>Enter your credentials to access your workspace.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <label htmlFor="email">Email address</label>
            <div className="input-wrap">
              <Mail size={18} />
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <label htmlFor="password">Password</label>
            <div className="input-wrap">
              <LockKeyhole size={18} />
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            {error && <div className="form-error">{error}</div>}

            <button className="primary-btn" disabled={submitting}>
              {submitting ? "Signing in..." : "Sign in"}
              {!submitting && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="switch-auth">
            Don't have an account? <Link to="/register">Create account</Link>
          </p>

          <p className="form-footer">© 2026 PlacementNex. All rights reserved.</p>
        </div>
      </section>
    </main>
  );
};

export default Login;
