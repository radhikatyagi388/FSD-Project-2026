import Sidebar from "../../components/dashboard/Sidebar";
import Profile from "../profile/Profile";
import StaffDashboard from "../staff/StaffDashboard";
import AdminDashboard from "../admin/AdminDashboard";
import Opportunities from "../opportunities/Opportunities";
import Applications from "../applications/Applications";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import {
  Bell,
  Search,
  Menu,
  ArrowUpRight,
  ArrowRight,
  BriefcaseBusiness,
  ClipboardCheck,
  Target,
  UserRound,
  Sparkles,
  CalendarDays,
  Clock3,
  MapPin,
  ChevronRight,
  FileText,
  BrainCircuit,
  BookOpen,
  Code2,
  Trophy,
  Plus,
  Settings,
} from "lucide-react";


const profileCompletionFields = [
  "phone", "location", "headline", "bio",
  "academic.college", "academic.degree", "academic.branch",
  "academic.graduationYear", "academic.currentSemester",
  "academic.cgpa", "skills", "projects", "resumeUrl",
];

const calculateProfileCompletion = (profile) => {
  if (!profile) return 0;

  const completed = profileCompletionFields.filter((field) => {
    const value = field.split(".").reduce((obj, key) => obj?.[key], profile);
    return Array.isArray(value) ? value.length > 0 : value !== "" && value != null;
  }).length;

  return Math.round((completed / profileCompletionFields.length) * 100);
};

const activities = [
  {
    title: "Welcome to PlacementNex",
    description: "Your student account is ready.",
    time: "Just now",
    icon: UserRound,
  },
  {
    title: "Complete your student profile",
    description: "Add your academic and skill details.",
    time: "Recommended",
    icon: FileText,
  },
  {
    title: "Explore the Preparation Arena",
    description: "Start practicing coding and aptitude.",
    time: "Recommended",
    icon: Code2,
  },
];

const StatCard = ({ icon: Icon, label, value, description }) => (
  <div className="stat-card">
    <div className="stat-top">
      <div className="stat-icon">
        <Icon size={20} />
      </div>
      <span className="stat-neutral">Overview</span>
    </div>
    <h2>{value}</h2>
    <p className="stat-label">{label}</p>
    <span className="stat-description">{description}</span>
  </div>
);

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [active, setActive] = useState("Overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [opportunities, setOpportunities] = useState([]);
  const [applications, setApplications] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadDashboardData = async () => {
      const results = await Promise.allSettled([
        api.get("/opportunities"),
        api.get("/applications/my"),
        api.get("/profile"),
      ]);

      if (cancelled) return;

      const [opportunitiesResult, applicationsResult, profileResult] = results;

      if (opportunitiesResult.status === "fulfilled") {
        setOpportunities(opportunitiesResult.value.data.opportunities || []);
      }

      if (applicationsResult.status === "fulfilled") {
        setApplications(applicationsResult.value.data.applications || []);
      }

      if (profileResult.status === "fulfilled") {
        setProfileData(profileResult.value.data.profile || null);
      }

      if (results.some((result) => result.status === "rejected")) {
        setDashboardError("Some dashboard information could not be loaded. Please refresh.");
      }

      setDashboardLoading(false);
      setProfileLoading(false);
    };

    loadDashboardData();

    return () => {
      cancelled = true;
    };
  }, []);


  const firstName = user?.name?.split(" ")[0] || "Student";
  const profileCompletion = calculateProfileCompletion(profileData);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const filteredOpportunities = opportunities.filter((job) =>
    `${job.company} ${job.role} ${job.location}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const renderOverview = () => (
    <>
      <div className="dashboard-greeting">
        <div>
          <span className="dashboard-eyebrow">
            <Sparkles size={14} /> YOUR PLACEMENT WORKSPACE
          </span>
          <h1>Welcome back, {firstName}!</h1>
          <p>Here's your career progress at a glance.</p>
        </div>

        <button
          className="profile-action"
          onClick={() => setActive("My Profile")}
        >
          <UserRound size={17} />
          View profile
          <ArrowUpRight size={16} />
        </button>
      </div>

      <div className="dashboard-stats">
        <StatCard
          icon={BriefcaseBusiness}
          label="Available opportunities"
          value={dashboardLoading ? "…" : opportunities.length}
          description="Live placement opportunities"
        />
        <StatCard
          icon={ClipboardCheck}
          label="Applications submitted"
          value={dashboardLoading ? "…" : applications.length}
          description="Your submitted applications"
        />
        <StatCard
          icon={Target}
          label="Eligible drives"
          value="—"
          description="Complete your profile first"
        />
        <StatCard
          icon={Trophy}
          label="Offers received"
          value={dashboardLoading ? "…" : applications.filter((item) => item.status === "Selected").length}
          description="Applications marked selected"
        />
      </div>

      <div className="dashboard-main-grid">
        <section className="dashboard-section opportunities-section">
          <div className="section-heading">
            <div>
              <span className="section-kicker">CAREER OPPORTUNITIES</span>
              <h2>Explore opportunities</h2>
            </div>

            <button
              className="text-action"
              onClick={() => setActive("Opportunities")}
            >
              View all <ArrowRight size={16} />
            </button>
          </div>

          <div className="opportunity-search">
            <Search size={17} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search companies or roles..."
            />
          </div>

          <div className="opportunity-list">
            {filteredOpportunities.length > 0 ? (
              filteredOpportunities.map((job) => (
                <div className="opportunity-card" key={job._id}>
                  <div className="company-logo">
                    {(job.company || "C").charAt(0).toUpperCase()}
                  </div>

                  <div className="opportunity-info">
                    <div className="opportunity-title-row">
                      <h3>{job.company}</h3>
                      <span className="open-status">{job.status || "Active"}</span>
                    </div>

                    <p>{job.role}</p>

                    <div className="opportunity-meta">
                      <span><MapPin size={13} /> {job.location}</span>
                      <span><BriefcaseBusiness size={13} /> {job.jobType || "Not specified"}</span>
                    </div>
                  </div>

                  <button
                    className="opportunity-arrow"
                    onClick={() => setActive("Opportunities")}
                    aria-label={`View ${job.company} opportunity`}
                  >
                    <ChevronRight size={19} />
                  </button>
                </div>
              ))
            ) : (
              <div className="empty-state">
                No matching opportunities found.
              </div>
            )}
          </div>

          {dashboardLoading && (
            <p className="demo-note">Loading live placement opportunities...</p>
          )}

          {dashboardError && (
            <p className="demo-note" role="alert">{dashboardError}</p>
          )}

          {!dashboardLoading && !dashboardError && opportunities.length === 0 && (
            <p className="demo-note">No active placement opportunities are currently available.</p>
          )}
        </section>

        <section className="dashboard-section profile-section">
          <div className="section-heading">
            <div>
              <span className="section-kicker">YOUR PROFILE</span>
              <h2>Profile strength</h2>
            </div>
            <UserRound size={19} className="muted-icon" />
          </div>

          <div className="profile-progress">
            <div className="progress-circle">
              <span>{profileLoading ? "…" : `${profileCompletion}%`}</span>
            </div>
            <h3>{profileCompletion === 100 ? "Your profile is complete!" : "Build your student profile"}</h3>
            <p>Add your academic details, skills and resume to improve your placement readiness.</p>
          </div>

          <div className="profile-todo">
            <div><span className="todo-number">01</span> Academic details</div>
            <div><span className="todo-number">02</span> Technical skills</div>
            <div><span className="todo-number">03</span> Upload resume</div>
          </div>

          <button
            className="section-primary-btn"
            onClick={() => setActive("My Profile")}
          >
            Complete profile <ArrowRight size={16} />
          </button>
        </section>
      </div>

      <div className="dashboard-bottom-grid">
        <section className="dashboard-section activity-section">
          <div className="section-heading">
            <div>
              <span className="section-kicker">YOUR JOURNEY</span>
              <h2>Recent activity</h2>
            </div>
            <CalendarDays size={19} className="muted-icon" />
          </div>

          <div className="activity-list">
            {activities.map((activity, index) => {
              const Icon = activity.icon;

              return (
                <div className="activity-item" key={activity.title}>
                  <div className="activity-icon"><Icon size={17} /></div>
                  <div className="activity-info">
                    <h4>{activity.title}</h4>
                    <p>{activity.description}</p>
                  </div>
                  <span>{activity.time}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="ai-promo-card">
          <div className="ai-promo-icon"><BrainCircuit size={25} /></div>
          <span className="section-kicker">POWERED BY AI</span>
          <h2>Your AI career assistant</h2>
          <p>Analyze your resume, identify skill gaps and build a personalized preparation roadmap.</p>
          <button onClick={() => setActive("AI Career Assistant")}>
            Explore AI tools <ArrowUpRight size={16} />
          </button>
          <div className="ai-decoration">AI</div>
        </section>
      </div>
    </>
  );

  const renderPlaceholder = () => {
    const sectionContent = {
      "My Profile": {
        title: "Build your student profile",
        description: "Manage your personal information, education, technical skills and resume.",
        icon: UserRound,
        action: "Profile management is the next module to build.",
      },
      "Opportunities": {
        title: "Placement opportunities",
        description: "Explore company drives, job descriptions and eligibility requirements.",
        icon: BriefcaseBusiness,
        action: "Live company drives will be connected to MongoDB.",
      },
      "My Applications": {
        title: "Track your applications",
        description: "Monitor application status, interview rounds and placement progress.",
        icon: ClipboardCheck,
        action: "Your application tracker is coming next.",
      },
      "AI Career Assistant": {
        title: "Meet your AI career assistant",
        description: "Get resume feedback, job description analysis and skill recommendations.",
        icon: BrainCircuit,
        action: "Gemini AI integration will power these tools.",
      },
      "Preparation Arena": {
        title: "Prepare for your next opportunity",
        description: "Practice DSA, aptitude, technical interviews and mock assessments.",
        icon: BookOpen,
        action: "Practice modules will be added soon.",
      },
      "My Analytics": {
        title: "Your placement analytics",
        description: "Understand your preparation progress and application performance.",
        icon: Target,
        action: "Analytics will use your real application and preparation data.",
      },
      Settings: {
        title: "Account settings",
        description: "Manage your account preferences and profile settings.",
        icon: Settings,
        action: "Account settings are coming soon.",
      },
    };

    const item = sectionContent[active] || sectionContent["My Profile"];
    const Icon = item.icon;

    return (
      <section className="module-placeholder">
        <div className="module-icon"><Icon size={30} /></div>
        <span className="section-kicker">PLACEMENTNEX WORKSPACE</span>
        <h1>{item.title}</h1>
        <p>{item.description}</p>

        <div className="module-coming-card">
          <Sparkles size={19} />
          <span>{item.action}</span>
        </div>

        <button
          className="section-primary-btn"
          onClick={() => setActive("Overview")}
        >
          Back to overview <ArrowRight size={16} />
        </button>
      </section>
    );
  };

  if (user?.role === "admin") return <AdminDashboard />;
  if (user?.role === "recruiter" || user?.role === "officer") {
    return <StaffDashboard />;
  }

  return (
    <div className="dashboard-shell">
      <Sidebar
        active={active}
        setActive={setActive}
        logout={handleLogout}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <main className="dashboard-content-area">
        <header className="dashboard-topbar">
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={21} />
          </button>

          <div className="topbar-breadcrumb">
            Workspace <ChevronRight size={14} /> <strong>{active}</strong>
          </div>

          <div className="topbar-right">
            <button className="notification-btn" aria-label="Notifications">
              <Bell size={19} />
              <span />
            </button>

            <div className="topbar-user">
              <div className="topbar-avatar">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <strong>{user?.name}</strong>
                <span>Student</span>
              </div>
            </div>
          </div>
        </header>

        <div className="dashboard-page-content">
          {active === "Overview"
            ? renderOverview()
            : active === "My Profile"
            ? <Profile />
            : active === "Opportunities"
            ? <Opportunities />
            : active === "My Applications"
            ? <Applications />
            : renderPlaceholder()}
        </div>

        <footer className="dashboard-footer">
          <span>© 2026 PlacementNex</span>
          <span>One Campus. Every Opportunity. Smarter Placements.</span>
        </footer>
      </main>
    </div>
  );
};

export default Dashboard;
