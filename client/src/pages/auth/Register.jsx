import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ArrowRight, BriefcaseBusiness, LockKeyhole, Mail, UserRound } from "lucide-react";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      await register(form.name, form.email, form.password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
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
          <span className="eyebrow">YOUR CAREER. YOUR NEXT CHAPTER.</span>
          <h1>Build skills.<br />Find opportunities.<br /><span>Get hired.</span></h1>
          <p>Join your campus placement ecosystem and take control of your career journey with AI-powered preparation.</p>
          <div className="visual-bottom">
            <span className="status-dot" /> Start building your future today.
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
            <span className="eyebrow">GET STARTED</span>
            <h2>Create your account</h2>
            <p>Register as a student to access PlacementNex.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <label htmlFor="name">Full name</label>
            <div className="input-wrap">
              <UserRound size={18} />
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Your full name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

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
                placeholder="Minimum 8 characters"
                value={form.password}
                onChange={handleChange}
                minLength={8}
                required
              />
            </div>

            <label htmlFor="confirmPassword">Confirm password</label>
            <div className="input-wrap">
              <LockKeyhole size={18} />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            {error && <div className="form-error">{error}</div>}

            <button className="primary-btn" disabled={submitting}>
              {submitting ? "Creating account..." : "Create account"}
              {!submitting && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="switch-auth">
            Already registered? <Link to="/login">Sign in</Link>
          </p>

          <p className="form-footer">© 2026 PlacementNex. All rights reserved.</p>
        </div>
      </section>
    </main>
  );
};

export default Register;
