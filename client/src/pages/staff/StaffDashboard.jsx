import { useEffect, useState } from "react";
import {
  BriefcaseBusiness, Users, Plus, RefreshCw, X,
  MapPin, CalendarDays, Building2, ClipboardList, LogOut
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const initialForm = {
  company: "",
  role: "",
  description: "",
  location: "",
  jobType: "Full-time",
  workMode: "On-site",
  salary: "",
  applicationDeadline: "",
  minimumCgpa: "0",
  eligibleBranches: "",
  graduationYears: "",
  maximumBacklogs: "0",
  requiredSkills: "",
};

const dateLabel = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

const StaffDashboard = () => {
  const { user, logout } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("drives");

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [driveResponse, applicationResponse] = await Promise.all([
        api.get("/opportunities/manage/mine"),
        api.get("/applications"),
      ]);

      setOpportunities(driveResponse.data.opportunities || []);
      setApplications(applicationResponse.data.applications || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load recruiter data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const createDrive = async (event) => {
    event.preventDefault();
    setSaving(true);
    setNotice("");
    setError("");

    const payload = {
      company: form.company.trim(),
      role: form.role.trim(),
      description: form.description.trim(),
      location: form.location.trim(),
      jobType: form.jobType,
      workMode: form.workMode,
      salary: form.salary.trim() || "Not disclosed",
      applicationDeadline: form.applicationDeadline,
      eligibility: {
        minimumCgpa: Number(form.minimumCgpa || 0),
        eligibleBranches: form.eligibleBranches
          .split(",").map((item) => item.trim()).filter(Boolean),
        graduationYears: form.graduationYears
          .split(",").map((item) => Number(item.trim())).filter(Number.isFinite),
        maximumBacklogs: Number(form.maximumBacklogs || 0),
      },
      requiredSkills: form.requiredSkills
        .split(",").map((item) => item.trim()).filter(Boolean),
      status: "Active",
    };

    try {
      const response = await api.post("/opportunities", payload);
      setNotice(response.data.message || "Placement drive published.");
      setForm(initialForm);
      setShowForm(false);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to publish placement drive.");
    } finally {
      setSaving(false);
    }
  };

  const closeDrive = async (id) => {
    const confirmed = window.confirm("Close this placement drive?");
    if (!confirmed) return;

    try {
      await api.delete(`/opportunities/${id}`);
      setNotice("Placement drive closed.");
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to close placement drive.");
    }
  };

  const changeStatus = async (applicationId, status) => {
    try {
      await api.patch(`/applications/${applicationId}/status`, { status });
      setNotice(`Candidate status updated to ${status}.`);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update candidate status.");
    }
  };

  const activeDrives = opportunities.filter((item) => item.status === "Active").length;
  const totalApplications = applications.length;
  const shortlisted = applications.filter((item) => item.status === "Shortlisted").length;
  const selected = applications.filter((item) => item.status === "Selected").length;

  return (
    <div className="staff-shell">
      <header className="staff-topbar">
        <div className="staff-brand">
          <div className="staff-brand-icon"><BriefcaseBusiness size={21} /></div>
          <span>Placement<span>Nex</span></span>
          <small>RECRUITER PORTAL</small>
        </div>
        <div className="staff-account">
          <div className="staff-avatar">{user?.name?.charAt(0)?.toUpperCase() || "R"}</div>
          <div>
            <strong>{user?.name || "Recruiter"}</strong>
            <span>{user?.role === "officer" ? "Placement Officer" : user?.role}</span>
          </div>
          <button onClick={logout} title="Sign out"><LogOut size={18} /></button>
        </div>
      </header>

      <main className="staff-content">
        <div className="staff-welcome">
          <div>
            <span className="section-kicker">PLACEMENT MANAGEMENT</span>
            <h1>Welcome, {user?.name?.split(" ")[0] || "Recruiter"}!</h1>
            <p>Manage placement drives and review student applications.</p>
          </div>
          <button className="staff-create-btn" onClick={() => setShowForm(true)}>
            <Plus size={17} /> Create placement drive
          </button>
        </div>

        {notice && (
          <div className="staff-notice">
            {notice}
            <button onClick={() => setNotice("")}><X size={15} /></button>
          </div>
        )}
        {error && (
          <div className="staff-error">
            {error}
            <button onClick={() => setError("")}><X size={15} /></button>
          </div>
        )}

        <section className="staff-stats">
          <div><span><BriefcaseBusiness size={18} /> Active drives</span><strong>{activeDrives}</strong></div>
          <div><span><ClipboardList size={18} /> Applications</span><strong>{totalApplications}</strong></div>
          <div><span><Users size={18} /> Shortlisted</span><strong>{shortlisted}</strong></div>
          <div><span><Building2 size={18} /> Selected</span><strong>{selected}</strong></div>
        </section>

        <div className="staff-tabs">
          <button className={activeTab === "drives" ? "active" : ""} onClick={() => setActiveTab("drives")}>
            Placement drives
          </button>
          <button className={activeTab === "applications" ? "active" : ""} onClick={() => setActiveTab("applications")}>
            Candidate applications
          </button>
          <button className="staff-refresh" onClick={loadData}><RefreshCw size={15} /> Refresh</button>
        </div>

        {loading ? (
          <div className="staff-empty">Loading placement data...</div>
        ) : activeTab === "drives" ? (
          <section className="staff-list">
            {opportunities.length === 0 ? (
              <div className="staff-empty">
                <BriefcaseBusiness size={32} />
                <h3>No placement drives yet</h3>
                <p>Create your first drive to make it visible to eligible students.</p>
                <button className="staff-create-btn" onClick={() => setShowForm(true)}>
                  <Plus size={16} /> Create first drive
                </button>
              </div>
            ) : opportunities.map((drive) => (
              <article className="staff-drive-card" key={drive._id}>
                <div className="staff-drive-icon"><Building2 size={22} /></div>
                <div className="staff-drive-info">
                  <div className="staff-drive-title">
                    <h3>{drive.role}</h3>
                    <span className={`drive-status drive-${(drive.status || "").toLowerCase()}`}>{drive.status}</span>
                  </div>
                  <p>{drive.company}</p>
                  <div className="staff-drive-meta">
                    <span><MapPin size={13} /> {drive.location}</span>
                    <span><CalendarDays size={13} /> Deadline: {dateLabel(drive.applicationDeadline)}</span>
                    <span>{drive.jobType} · {drive.workMode}</span>
                  </div>
                </div>
                {drive.status !== "Closed" && (
                  <button className="staff-close-drive" onClick={() => closeDrive(drive._id)}>
                    Close drive
                  </button>
                )}
              </article>
            ))}
          </section>
        ) : (
          <section className="staff-list">
            {applications.length === 0 ? (
              <div className="staff-empty">
                <Users size={32} />
                <h3>No applications received</h3>
                <p>Applications submitted by students for your drives will appear here.</p>
              </div>
            ) : applications.map((application) => (
              <article className="staff-application-card" key={application._id}>
                <div className="staff-avatar staff-candidate-avatar">
                  {application.student?.name?.charAt(0)?.toUpperCase() || "S"}
                </div>
                <div className="staff-candidate-info">
                  <h3>{application.student?.name || application.studentSnapshot?.name || "Student"}</h3>
                  <p>{application.student?.email || application.studentSnapshot?.email || ""}</p>
                  <span>{application.opportunity?.company} · {application.opportunity?.role}</span>
                  <small>Applied: {dateLabel(application.createdAt)}</small>
                </div>
                <div className="staff-candidate-actions">
                  <span className={`application-status status-${(application.status || "Applied").toLowerCase().replaceAll(" ", "-")}`}>
                    {application.status}
                  </span>
                  <select
                    value={application.status}
                    onChange={(event) => changeStatus(application._id, event.target.value)}
                    aria-label="Update candidate status"
                  >
                    <option>Applied</option>
                    <option>Under Review</option>
                    <option>Shortlisted</option>
                    <option>Rejected</option>
                    <option>Selected</option>
                  </select>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>

      {showForm && (
        <div className="staff-modal-backdrop" onClick={() => setShowForm(false)}>
          <form className="staff-drive-form" onSubmit={createDrive} onClick={(event) => event.stopPropagation()}>
            <div className="staff-form-heading">
              <div>
                <span className="section-kicker">NEW OPPORTUNITY</span>
                <h2>Create placement drive</h2>
                <p>Enter the role and eligibility details for students.</p>
              </div>
              <button type="button" onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>

            <div className="staff-form-grid">
              <label>Company name<input name="company" value={form.company} onChange={handleFormChange} required /></label>
              <label>Job role<input name="role" value={form.role} onChange={handleFormChange} required /></label>
              <label>Location<input name="location" value={form.location} onChange={handleFormChange} required /></label>
              <label>Salary / stipend<input name="salary" value={form.salary} onChange={handleFormChange} placeholder="e.g. 8 LPA / ₹25,000 per month" /></label>
              <label>Job type<select name="jobType" value={form.jobType} onChange={handleFormChange}><option>Full-time</option><option>Internship</option><option>Part-time</option><option>Contract</option></select></label>
              <label>Work mode<select name="workMode" value={form.workMode} onChange={handleFormChange}><option>On-site</option><option>Remote</option><option>Hybrid</option></select></label>
              <label>Application deadline<input type="date" name="applicationDeadline" value={form.applicationDeadline} onChange={handleFormChange} min={new Date().toISOString().slice(0, 10)} required /></label>
              <label>Minimum CGPA<input type="number" name="minimumCgpa" min="0" max="10" step="0.1" value={form.minimumCgpa} onChange={handleFormChange} /></label>
              <label>Eligible branches<input name="eligibleBranches" value={form.eligibleBranches} onChange={handleFormChange} placeholder="CSE, IT, ECE (comma separated)" /></label>
              <label>Graduation years<input name="graduationYears" value={form.graduationYears} onChange={handleFormChange} placeholder="2027, 2028" /></label>
              <label>Maximum active backlogs<input type="number" min="0" name="maximumBacklogs" value={form.maximumBacklogs} onChange={handleFormChange} /></label>
              <label>Required skills<input name="requiredSkills" value={form.requiredSkills} onChange={handleFormChange} placeholder="Java, SQL, React (comma separated)" /></label>
            </div>

            <label className="staff-description-label">Job description
              <textarea name="description" rows="5" value={form.description} onChange={handleFormChange} required placeholder="Describe the role, responsibilities and selection process..." />
            </label>

            <div className="staff-form-footer">
              <span>Drive will be published immediately.</span>
              <button className="staff-create-btn" type="submit" disabled={saving}>
                {saving ? "Publishing..." : "Publish placement drive"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;
