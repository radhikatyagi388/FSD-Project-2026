import { useEffect, useState } from "react";
import {
  ClipboardCheck, Building2, MapPin, CalendarDays, RefreshCw
} from "lucide-react";
import api from "../../services/api";

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

const statusClass = (status) =>
  (status || "Applied").toLowerCase().replaceAll(" ", "-");

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadApplications = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/applications/my");
      setApplications(response.data.applications || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load your applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  return (
    <div className="applications-page">
      <div className="jobs-heading">
        <div>
          <span className="section-kicker">YOUR PLACEMENT JOURNEY</span>
          <h1>My Applications</h1>
          <p>Track the progress of every opportunity you've applied for.</p>
        </div>
        <button className="jobs-refresh" onClick={loadApplications}>
          <RefreshCw size={17} /> Refresh
        </button>
      </div>

      <div className="application-summary">
        <div>
          <span>Total applications</span>
          <strong>{applications.length}</strong>
        </div>
        <div>
          <span>Under review</span>
          <strong>{applications.filter((a) => a.status === "Under Review").length}</strong>
        </div>
        <div>
          <span>Shortlisted</span>
          <strong>{applications.filter((a) => a.status === "Shortlisted").length}</strong>
        </div>
        <div>
          <span>Selected</span>
          <strong>{applications.filter((a) => a.status === "Selected").length}</strong>
        </div>
      </div>

      {loading ? (
        <div className="jobs-empty">Loading your applications...</div>
      ) : error ? (
        <div className="jobs-empty">
          <p>{error}</p>
          <button className="jobs-primary-btn" onClick={loadApplications}>Try again</button>
        </div>
      ) : applications.length === 0 ? (
        <div className="jobs-empty">
          <ClipboardCheck size={34} />
          <h3>No applications yet</h3>
          <p>When you apply to a placement drive, it will appear here.</p>
        </div>
      ) : (
        <div className="applications-list">
          {applications.map((application) => {
            const job = application.opportunity || {};
            return (
              <article className="application-card" key={application._id}>
                <div className="application-company-icon">
                  <Building2 size={22} />
                </div>

                <div className="application-main">
                  <div className="application-title-row">
                    <div>
                      <h3>{job.role || "Opportunity no longer available"}</h3>
                      <p>{job.company || "Company details unavailable"}</p>
                    </div>
                    <span className={`application-status status-${statusClass(application.status)}`}>
                      {application.status}
                    </span>
                  </div>

                  <div className="application-meta">
                    <span><MapPin size={14} /> {job.location || "—"}</span>
                    <span><CalendarDays size={14} /> Applied {formatDate(application.createdAt)}</span>
                  </div>

                  <div className="application-history">
                    <strong>Status history</strong>
                    <div className="application-history-items">
                      {(application.statusHistory || []).map((item, index) => (
                        <div key={`${item.status}-${index}`}>
                          <span className="history-dot" />
                          <span>{item.status}</span>
                          <small>{formatDate(item.changedAt)}</small>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Applications;
