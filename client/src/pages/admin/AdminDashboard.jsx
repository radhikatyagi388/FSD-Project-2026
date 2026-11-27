import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
  UserCheck,
  UserX,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const StatCard = ({ icon: Icon, label, value, detail }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between">
      <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
        <Icon size={21} />
      </div>
      <span className="text-xs font-medium text-slate-400">LIVE DATA</span>
    </div>
    <p className="mt-5 text-3xl font-bold text-slate-900">{value ?? "—"}</p>
    <p className="mt-1 font-medium text-slate-700">{label}</p>
    <p className="mt-1 text-sm text-slate-500">{detail}</p>
  </div>
);

const statusClass = (active) =>
  active
    ? "bg-emerald-50 text-emerald-700"
    : "bg-rose-50 text-rose-700";

export default function AdminDashboard() {
  const { user, logout } = useAuth();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    limit: 10,
  });

  const [activeTab, setActiveTab] = useState("overview");

  const [opportunities, setOpportunities] = useState([]);
  const [applications, setApplications] = useState([]);

  const [opportunitiesLoading, setOpportunitiesLoading] = useState(false);
  const [applicationsLoading, setApplicationsLoading] = useState(false);

  const [driveSearch, setDriveSearch] = useState("");
  const [driveStatus, setDriveStatus] = useState("");

  const [applicationSearch, setApplicationSearch] = useState("");
  const [applicationStatus, setApplicationStatus] = useState("");

  const fetchOpportunities = useCallback(async () => {
    try {
      setOpportunitiesLoading(true);
      setActionError("");

      const response = await api.get("/admin/opportunities", {
        params: {
          search: driveSearch,
          status: driveStatus,
          page: 1,
          limit: 10,
        },
      });

      setOpportunities(response.data.opportunities || []);
    } catch (err) {
      setActionError(
        err.response?.data?.message || "Unable to load placement drives."
      );
    } finally {
      setOpportunitiesLoading(false);
    }
  }, [driveSearch, driveStatus]);

  const fetchApplications = useCallback(async () => {
    try {
      setApplicationsLoading(true);
      setActionError("");

      const response = await api.get("/admin/applications", {
        params: {
          search: applicationSearch,
          status: applicationStatus,
          page: 1,
          limit: 10,
        },
      });

      setApplications(response.data.applications || []);
    } catch (err) {
      setActionError(
        err.response?.data?.message || "Unable to load applications."
      );
    } finally {
      setApplicationsLoading(false);
    }
  }, [applicationSearch, applicationStatus]);

  const fetchStats = useCallback(async () => {
    try {
      setError("");
      const response = await api.get("/admin/stats");
      setStats(response.data.stats);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load platform statistics."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      setActionError("");

      const response = await api.get("/admin/users", {
        params: { search, role, status, page, limit: 10 },
      });

      setUsers(response.data.users || []);
      setPagination(
        response.data.pagination || {
          total: 0,
          totalPages: 0,
          limit: 10,
        }
      );
    } catch (err) {
      setActionError(
        err.response?.data?.message || "Unable to load user directory."
      );
    } finally {
      setUsersLoading(false);
    }
  }, [search, role, status, page]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (activeTab === "drives") {
      fetchOpportunities();
    }
  }, [activeTab, fetchOpportunities]);

  useEffect(() => {
    if (activeTab === "applications") {
      fetchApplications();
    }
  }, [activeTab, fetchApplications]);

  const handleStatusChange = async (targetUser) => {
    const nextStatus = !targetUser.isActive;
    const action = nextStatus ? "activate" : "deactivate";

    if (
      !window.confirm(
        `Are you sure you want to ${action} ${targetUser.name}'s account?`
      )
    ) {
      return;
    }

    try {
      setActionError("");

      await api.patch(`/admin/users/${targetUser._id}/status`, {
        isActive: nextStatus,
      });

      await Promise.all([fetchUsers(), fetchStats()]);
    } catch (err) {
      setActionError(
        err.response?.data?.message || "Unable to update account status."
      );
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const applicationStats = stats?.applications?.byStatus || {};

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-600 p-2.5 text-white">
              <ShieldCheck size={23} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">
                PlacementNex
              </h1>
              <p className="text-xs text-slate-500">Platform Administration</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">{user?.name || "Admin"}</p>
              <p className="text-xs capitalize text-slate-500">
                {user?.role || "Administrator"}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-5 py-8 lg:px-8">
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
              <LayoutDashboard size={15} />
              Admin control center
            </div>
            <h2 className="text-3xl font-bold tracking-tight">
              Platform overview
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Monitor users, placement drives and application activity.
            </p>
          </div>

          <button
            onClick={() => Promise.all([fetchStats(), fetchUsers()])}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold shadow-sm hover:bg-slate-100"
          >
            <RefreshCw size={16} />
            Refresh data
          </button>
        </section>

        <nav className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          {[
            { id: "overview", label: "Overview", icon: LayoutDashboard },
            { id: "users", label: "Users", icon: Users },
            { id: "drives", label: "Placement Drives", icon: BriefcaseBusiness },
            { id: "applications", label: "Applications", icon: ClipboardList },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                activeTab === id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        )}

        {activeTab === "overview" && (
          <>
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Users size={19} className="text-indigo-600" />
            <h3 className="font-semibold">User statistics</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={Users}
              label="Total users"
              value={loading ? "…" : stats?.users?.total}
              detail="All registered accounts"
            />
            <StatCard
              icon={GraduationCap}
              label="Students"
              value={loading ? "…" : stats?.users?.students}
              detail="Student accounts"
            />
            <StatCard
              icon={UserCheck}
              label="Recruiters"
              value={loading ? "…" : stats?.users?.recruiters}
              detail="Recruiter accounts"
            />
            <StatCard
              icon={ShieldCheck}
              label="Placement officers"
              value={loading ? "…" : stats?.users?.officers}
              detail="Officer accounts"
            />
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center gap-2">
            <Activity size={19} className="text-indigo-600" />
            <h3 className="font-semibold">Placement activity</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={BriefcaseBusiness}
              label="Total drives"
              value={loading ? "…" : stats?.opportunities?.total}
              detail={`${stats?.opportunities?.active ?? 0} active drives`}
            />
            <StatCard
              icon={ClipboardList}
              label="Applications"
              value={loading ? "…" : stats?.applications?.total}
              detail="Total submitted applications"
            />
            <StatCard
              icon={CheckCircle2}
              label="Shortlisted"
              value={loading ? "…" : applicationStats.Shortlisted ?? 0}
              detail="Candidates shortlisted"
            />
            <StatCard
              icon={GraduationCap}
              label="Selected"
              value={loading ? "…" : applicationStats.Selected ?? 0}
              detail="Candidates selected"
            />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-lg font-bold">Application overview</h3>
              <p className="mt-1 text-sm text-slate-500">
                Current application pipeline by status.
              </p>
            </div>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              {stats?.applications?.total ?? 0} total
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {Object.entries({
              Applied: applicationStats.Applied ?? 0,
              "Under Review": applicationStats["Under Review"] ?? 0,
              Shortlisted: applicationStats.Shortlisted ?? 0,
              Selected: applicationStats.Selected ?? 0,
              Rejected: applicationStats.Rejected ?? 0,
            }).map(([label, value]) => (
              <div key={label} className="rounded-xl bg-slate-50 p-4">
                <p className="text-2xl font-bold">{value}</p>
                <p className="mt-1 text-xs text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </section>

          </>
        )}

        {activeTab === "users" && (
          <>
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5 sm:p-6">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-lg font-bold">User management</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Search accounts and manage their access.
                </p>
              </div>
              <span className="text-sm text-slate-500">
                {pagination.total} accounts
              </span>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-[1fr_180px_160px]">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3">
                <Search size={17} className="shrink-0 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search by name or email..."
                  className="w-full bg-transparent py-3 text-sm outline-none"
                />
              </div>

              <select
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  setPage(1);
                }}
                className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none"
              >
                <option value="">All roles</option>
                <option value="student">Students</option>
                <option value="recruiter">Recruiters</option>
                <option value="officer">Officers</option>
                <option value="admin">Admins</option>
              </select>

              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none"
              >
                <option value="">All accounts</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {actionError && (
            <div className="mx-5 mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 sm:mx-6">
              {actionError}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 font-semibold">Account status</th>
                  <th className="px-6 py-4 font-semibold">Joined</th>
                  <th className="px-6 py-4 text-right font-semibold">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {usersLoading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                      No users match your filters.
                    </td>
                  </tr>
                ) : (
                  users.map((person) => (
                    <tr key={person._id} className="hover:bg-slate-50/70">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800">
                          {person.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {person.email}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-700">
                          {person.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(person.isActive)}`}>
                          {person.isActive ? "Active" : "Inactive"}
                        </span>
                        {person.isVerified && (
                          <span className="ml-2 text-xs text-indigo-600">
                            Verified
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {person.createdAt
                          ? new Date(person.createdAt).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {person._id === user?._id ? (
                          <span className="text-xs text-slate-400">You</span>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(person)}
                            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                              person.isActive
                                ? "bg-rose-50 text-rose-700 hover:bg-rose-100"
                                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            }`}
                          >
                            {person.isActive ? (
                              <><UserX size={14} /> Deactivate</>
                            ) : (
                              <><UserCheck size={14} /> Activate</>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 sm:px-6">
            <p className="text-xs text-slate-500">
              Page {page} of {Math.max(1, pagination.totalPages)}
            </p>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((current) => current - 1)}
                className="rounded-lg border border-slate-200 p-2 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft size={17} />
              </button>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((current) => current + 1)}
                className="rounded-lg border border-slate-200 p-2 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        </section>

          </>
        )}

        {activeTab === "drives" && (
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5 sm:p-6">
              <h3 className="text-lg font-bold">Placement Drives</h3>
              <p className="mt-1 text-sm text-slate-500">
                Monitor all placement opportunities across PlacementNex.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <input
                  value={driveSearch}
                  onChange={(e) => setDriveSearch(e.target.value)}
                  placeholder="Search company or role..."
                  className="rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-indigo-400"
                />
                <select
                  value={driveStatus}
                  onChange={(e) => setDriveStatus(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none"
                >
                  <option value="">All drive statuses</option>
                  <option value="Draft">Draft</option>
                  <option value="Active">Active</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Company</th>
                    <th className="px-5 py-4">Role</th>
                    <th className="px-5 py-4">Location</th>
                    <th className="px-5 py-4">Applications</th>
                    <th className="px-5 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {opportunitiesLoading ? (
                    <tr><td colSpan="5" className="px-5 py-10 text-center text-slate-500">Loading placement drives...</td></tr>
                  ) : opportunities.length === 0 ? (
                    <tr><td colSpan="5" className="px-5 py-10 text-center text-slate-500">No placement drives found.</td></tr>
                  ) : opportunities.map((drive) => (
                    <tr key={drive._id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 font-semibold">{drive.company || "—"}</td>
                      <td className="px-5 py-4">{drive.role || "—"}</td>
                      <td className="px-5 py-4">{drive.location || "—"}</td>
                      <td className="px-5 py-4">{drive.applicationCount ?? drive.applicationsCount ?? 0}</td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                          {drive.status || "—"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-slate-100 p-4">
              <button onClick={fetchOpportunities} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50">
                Refresh drives
              </button>
            </div>
          </section>
        )}

        {activeTab === "applications" && (
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5 sm:p-6">
              <h3 className="text-lg font-bold">Application Management</h3>
              <p className="mt-1 text-sm text-slate-500">
                Monitor candidate applications across all placement drives.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <input
                  value={applicationSearch}
                  onChange={(e) => setApplicationSearch(e.target.value)}
                  placeholder="Search student, email or company..."
                  className="rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-indigo-400"
                />
                <select
                  value={applicationStatus}
                  onChange={(e) => setApplicationStatus(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none"
                >
                  <option value="">All application statuses</option>
                  <option value="Applied">Applied</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Selected">Selected</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Student</th>
                    <th className="px-5 py-4">Company</th>
                    <th className="px-5 py-4">Position</th>
                    <th className="px-5 py-4">Applied on</th>
                    <th className="px-5 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applicationsLoading ? (
                    <tr><td colSpan="5" className="px-5 py-10 text-center text-slate-500">Loading applications...</td></tr>
                  ) : applications.length === 0 ? (
                    <tr><td colSpan="5" className="px-5 py-10 text-center text-slate-500">No applications found.</td></tr>
                  ) : applications.map((application) => {
                    const studentName = application.studentSnapshot?.name || application.student?.name || "Unknown student";
                    const studentEmail = application.studentSnapshot?.email || application.student?.email || "";
                    const opportunity = application.opportunity || {};

                    return (
                      <tr key={application._id} className="hover:bg-slate-50">
                        <td className="px-5 py-4">
                          <p className="font-semibold">{studentName}</p>
                          <p className="mt-1 text-xs text-slate-500">{studentEmail}</p>
                        </td>
                        <td className="px-5 py-4">{opportunity.company || "—"}</td>
                        <td className="px-5 py-4">{opportunity.role || "—"}</td>
                        <td className="px-5 py-4 text-slate-500">
                          {application.createdAt ? new Date(application.createdAt).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-5 py-4">
                          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                            {application.status || "—"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="border-t border-slate-100 p-4">
              <button onClick={fetchApplications} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50">
                Refresh applications
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
