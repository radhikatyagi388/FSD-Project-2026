import { useEffect, useMemo, useState } from "react";
import {
  Search, MapPin, BriefcaseBusiness, Clock, Building2,
  X, ArrowUpRight, SlidersHorizontal, RefreshCw
} from "lucide-react";
import api from "../../services/api";

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Not specified";

const Opportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [jobType, setJobType] = useState("All");
  const [workMode, setWorkMode] = useState("All");
  const [selected, setSelected] = useState(null);
  const [applying, setApplying] = useState(false);
  const [notice, setNotice] = useState("");

  const loadOpportunities = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/opportunities");
      setOpportunities(response.data.opportunities || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load opportunities.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOpportunities();
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return opportunities.filter((job) => {
      const matchesSearch =
        !term ||
        [job.company, job.role, job.location, job.description,
          ...(job.requiredSkills || [])]
          .join(" ")
          .toLowerCase()
          .includes(term);

      const matchesType = jobType === "All" || job.jobType === jobType;
      const matchesMode = workMode === "All" || job.workMode === workMode;

      return matchesSearch && matchesType && matchesMode;
    });
  }, [opportunities, search, jobType, workMode]);

  const apply = async (job) => {
    setApplying(true);
    setNotice("");
    try {
      const response = await api.post(`/applications/${job._id}`);
      setNotice(response.data.message || "Application submitted successfully.");
      setSelected(null);
    } catch (err) {
      setNotice(err.response?.data?.message || "Unable to submit application.");
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="jobs-page">
      <div className="jobs-heading">
        <div>
          <span className="section-kicker">CAREER OPPORTUNITIES</span>
          <h1>Find your next opportunity</h1>
          <p>Explore placement drives and discover roles that match your goals.</p>
        </div>
        <button className="jobs-refresh" onClick={loadOpportunities} title="Refresh">
          <RefreshCw size={17} /> Refresh
        </button>
      </div>

      <div className="jobs-toolbar">
        <div className="jobs-search">
          <Search size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company, role, location or skill..."
          />
        </div>

        <div className="jobs-filter">
          <SlidersHorizontal size={16} />
          <select value={jobType} onChange={(e) => setJobType(e.target.value)}>
            <option value="All">All job types</option>
            <option value="Internship">Internship</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
          </select>
        </div>

        <div className="jobs-filter">
          <select value={workMode} onChange={(e) => setWorkMode(e.target.value)}>
            <option value="All">All work modes</option>
            <option value="On-site">On-site</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>
      </div>

      {notice && (
        <div className="jobs-notice" role="status">
          <span>{notice}</span>
          <button onClick={() => setNotice("")} aria-label="Dismiss">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="jobs-results-heading">
        <strong>{loading ? "Loading opportunities..." : `${filtered.length} opportunities found`}</strong>
        <span>Latest placement drives</span>
      </div>

      {loading ? (
        <div className="jobs-empty">Loading opportunities...</div>
      ) : error ? (
        <div className="jobs-empty">
          <p>{error}</p>
          <button className="jobs-primary-btn" onClick={loadOpportunities}>Try again</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="jobs-empty">
          <BriefcaseBusiness size={32} />
          <h3>No opportunities found</h3>
          <p>Try changing your search or filters. New drives will appear here when published.</p>
        </div>
      ) : (
        <div className="jobs-grid">
          {filtered.map((job) => (
            <article className="job-card" key={job._id}>
              <div className="job-card-top">
                <div className="job-company-icon">
                  <Building2 size={22} />
                </div>
                <span className="job-open-badge">Applications open</span>
              </div>

              <h3>{job.role}</h3>
              <p className="job-company">{job.company}</p>

              <div className="job-meta">
                <span><MapPin size={14} /> {job.location}</span>
                <span><BriefcaseBusiness size={14} /> {job.jobType}</span>
                <span><Clock size={14} /> {job.workMode}</span>
              </div>

              <div className="job-salary">{job.salary || "Not disclosed"}</div>

              <div className="job-deadline">
                Deadline: <strong>{formatDate(job.applicationDeadline)}</strong>
              </div>

              <button className="job-details-btn" onClick={() => setSelected(job)}>
                View details <ArrowUpRight size={16} />
              </button>
            </article>
          ))}
        </div>
      )}

      {selected && (
        <div className="job-modal-backdrop" onClick={() => setSelected(null)}>
          <section
            className="job-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="job-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="job-modal-header">
              <div>
                <span className="section-kicker">OPPORTUNITY DETAILS</span>
                <h2 id="job-modal-title">{selected.role}</h2>
                <p>{selected.company}</p>
              </div>
              <button onClick={() => setSelected(null)} aria-label="Close details">
                <X size={20} />
              </button>
            </div>

            <div className="job-modal-meta">
              <span><MapPin size={15} /> {selected.location}</span>
              <span><BriefcaseBusiness size={15} /> {selected.jobType}</span>
              <span><Clock size={15} /> {selected.workMode}</span>
            </div>

            <h3>About this role</h3>
            <p className="job-description">{selected.description}</p>

            <h3>Eligibility criteria</h3>
            <div className="job-eligibility">
              <p>Minimum CGPA: <strong>{selected.eligibility?.minimumCgpa ?? 0}</strong></p>
              <p>Maximum active backlogs: <strong>{selected.eligibility?.maximumBacklogs ?? 0}</strong></p>
              <p>Eligible branches: <strong>{selected.eligibility?.eligibleBranches?.length ? selected.eligibility.eligibleBranches.join(", ") : "All branches"}</strong></p>
              <p>Graduation years: <strong>{selected.eligibility?.graduationYears?.length ? selected.eligibility.graduationYears.join(", ") : "Not specified"}</strong></p>
            </div>

            <h3>Required skills</h3>
            <div className="job-skills">
              {selected.requiredSkills?.length
                ? selected.requiredSkills.map((skill) => <span key={skill}>{skill}</span>)
                : <span>Not specified</span>}
            </div>

            <div className="job-modal-footer">
              <div>
                <small>Application deadline</small>
                <strong>{formatDate(selected.applicationDeadline)}</strong>
              </div>
              <button
                className="jobs-primary-btn"
                disabled={applying}
                onClick={() => apply(selected)}
              >
                {applying ? "Submitting..." : "Apply now"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default Opportunities;
