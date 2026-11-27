import {
  LayoutDashboard,
  UserRound,
  BriefcaseBusiness,
  ClipboardList,
  BrainCircuit,
  BookOpen,
  ChartNoAxesCombined,
  Settings,
  LogOut,
  GraduationCap,
  X
} from "lucide-react";

const navigation = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "My Profile", icon: UserRound },
  { label: "Opportunities", icon: BriefcaseBusiness },
  { label: "My Applications", icon: ClipboardList },
  { label: "AI Career Assistant", icon: BrainCircuit },
  { label: "Preparation Arena", icon: BookOpen },
  { label: "My Analytics", icon: ChartNoAxesCombined },
];

const Sidebar = ({ active, setActive, logout, mobileOpen, setMobileOpen }) => {
  return (
    <>
      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`dashboard-sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-icon">
            <BriefcaseBusiness size={22} />
          </div>
          <span>Placement<span className="brand-highlight">Nex</span></span>
          <button
            className="sidebar-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X size={19} />
          </button>
        </div>

        <div className="sidebar-workspace">
          <div className="workspace-icon">
            <GraduationCap size={18} />
          </div>
          <div>
            <strong>Student Workspace</strong>
            <span>Campus account</span>
          </div>
        </div>

        <div className="sidebar-section-label">WORKSPACE</div>

        <nav className="sidebar-navigation">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                className={`sidebar-link ${active === item.label ? "active" : ""}`}
                onClick={() => {
                  setActive(item.label);
                  setMobileOpen(false);
                }}
              >
                <Icon size={19} />
                <span>{item.label}</span>
                {item.label === "AI Career Assistant" && (
                  <span className="sidebar-ai-tag">AI</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-section-label">PREFERENCES</div>

          <button
            className={`sidebar-link ${active === "Settings" ? "active" : ""}`}
            onClick={() => {
              setActive("Settings");
              setMobileOpen(false);
            }}
          >
            <Settings size={19} />
            <span>Settings</span>
          </button>

          <button className="sidebar-logout" onClick={logout}>
            <LogOut size={19} />
            <span>Sign out</span>
          </button>

          <div className="sidebar-version">
            PlacementNex · Student Portal
            <span>Version 1.0.0</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
