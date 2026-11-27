import { useEffect, useMemo, useState } from "react";
import {
  UserRound, GraduationCap, Code2, FolderGit2, BriefcaseBusiness,
  Award, FileText, Save, Plus, Trash2, LoaderCircle, CheckCircle2
} from "lucide-react";
import api from "../../services/api";

const emptyProfile = {
  phone: "",
  location: "",
  headline: "",
  bio: "",
  academic: {
    college: "",
    degree: "",
    branch: "",
    graduationYear: "",
    currentSemester: "",
    cgpa: "",
    activeBacklogs: 0,
  },
  skills: [],
  projects: [],
  experience: [],
  certifications: [],
  resumeUrl: "",
  profilePhotoUrl: "",
};

const completionFields = [
  "phone", "location", "headline", "bio",
  "academic.college", "academic.degree", "academic.branch",
  "academic.graduationYear", "academic.currentSemester",
  "academic.cgpa", "skills", "projects", "resumeUrl",
];

const getValue = (object, path) =>
  path.split(".").reduce((value, key) => value?.[key], object);

const Profile = () => {
  const [profile, setProfile] = useState(emptyProfile);
  const [skillInput, setSkillInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await api.get("/profile");
        const data = response.data.profile || {};
        setProfile({
          ...emptyProfile,
          ...data,
          academic: { ...emptyProfile.academic, ...data.academic },
          skills: data.skills || [],
          projects: data.projects || [],
          experience: data.experience || [],
          certifications: data.certifications || [],
        });
      } catch (err) {
        setError(err.response?.data?.message || "Could not load your profile.");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const uploadFile = async (type, file) => {
    if (!file) return;

    const maxSize = type === "resume" ? 5 * 1024 * 1024 : 2 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(type === "resume" ? "Resume must be 5 MB or smaller." : "Photo must be 2 MB or smaller.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(type);
    setError("");
    setMessage("");

    try {
      const response = await api.post(`/uploads/${type}`, formData);
      const fileUrl = type === "resume"
        ? response.data.resumeUrl
        : response.data.profilePhotoUrl;

      updateField(type === "resume" ? "resumeUrl" : "profilePhotoUrl", fileUrl);
      setMessage(response.data.message || "File uploaded successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "File upload failed. Please try again.");
    } finally {
      setUploading("");
    }
  };

  const uploadedFileUrl = (fileUrl) =>
    fileUrl ? `${api.defaults.baseURL.replace("/api", "")}${fileUrl}` : "";

  const completion = useMemo(() => {
    const completed = completionFields.filter((field) => {
      const value = getValue(profile, field);
      return Array.isArray(value) ? value.length > 0 : value !== "" && value != null;
    }).length;
    return Math.round((completed / completionFields.length) * 100);
  }, [profile]);

  const updateField = (field, value) => {
    setProfile((previous) => ({ ...previous, [field]: value }));
  };

  const updateAcademic = (field, value) => {
    setProfile((previous) => ({
      ...previous,
      academic: { ...previous.academic, [field]: value },
    }));
  };

  const addSkill = () => {
    const skill = skillInput.trim();
    if (!skill || profile.skills.some((item) => item.toLowerCase() === skill.toLowerCase())) return;
    updateField("skills", [...profile.skills, skill]);
    setSkillInput("");
  };

  const removeSkill = (skill) =>
    updateField("skills", profile.skills.filter((item) => item !== skill));

  const addItem = (field, template) =>
    updateField(field, [...profile[field], { ...template }]);

  const updateItem = (field, index, key, value) => {
    updateField(
      field,
      profile[field].map((item, i) => i === index ? { ...item, [key]: value } : item)
    );
  };

  const removeItem = (field, index) =>
    updateField(field, profile[field].filter((_, i) => i !== index));

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const payload = {
        ...profile,
        academic: {
          ...profile.academic,
          graduationYear: profile.academic.graduationYear === "" ? null : Number(profile.academic.graduationYear),
          currentSemester: profile.academic.currentSemester === "" ? null : Number(profile.academic.currentSemester),
          cgpa: profile.academic.cgpa === "" ? null : Number(profile.academic.cgpa),
          activeBacklogs: Number(profile.academic.activeBacklogs || 0),
        },
      };

      const response = await api.put("/profile", payload);
      if (response.data.profile) {
        setProfile((previous) => ({
          ...previous,
          ...response.data.profile,
          academic: { ...previous.academic, ...response.data.profile.academic },
        }));
      }
      setMessage("Your profile has been saved successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="profile-loading"><LoaderCircle className="spin" /> Loading your profile...</div>;
  }

  const input = (label, value, onChange, options = {}) => (
    <label className="profile-field">
      <span>{label}</span>
      <input
        type={options.type || "text"}
        value={value ?? ""}
        placeholder={options.placeholder || `Enter ${label.toLowerCase()}`}
        min={options.min}
        max={options.max}
        step={options.step}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );

  const textarea = (label, value, onChange, placeholder) => (
    <label className="profile-field profile-field-full">
      <span>{label}</span>
      <textarea
        rows={4}
        value={value || ""}
        placeholder={placeholder || `Enter ${label.toLowerCase()}`}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );

  return (
    <form className="profile-page" onSubmit={saveProfile}>
      <div className="profile-heading">
        <div>
          <span className="section-kicker">STUDENT WORKSPACE</span>
          <h1>My Profile</h1>
          <p>Build your professional identity and make your profile placement-ready.</p>
        </div>
        <button className="profile-save-btn" type="submit" disabled={saving}>
          {saving ? <LoaderCircle className="spin" size={17} /> : <Save size={17} />}
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>

      <section className="profile-completion-card">
        <div className="completion-top">
          <div>
            <span>PROFILE COMPLETION</span>
            <h2>{completion}% <small>completed</small></h2>
          </div>
          <div className="completion-icon"><CheckCircle2 size={25} /></div>
        </div>
        <div className="completion-track">
          <div className="completion-fill" style={{ width: `${completion}%` }} />
        </div>
        <p>{completion === 100 ? "Your profile looks complete!" : "Complete more sections to improve your placement profile."}</p>
      </section>

      {message && <div className="profile-alert success">{message}</div>}
      {error && <div className="profile-alert error">{error}</div>}

      <section className="profile-card upload-profile-card">
        <div className="profile-section-title">
          <div className="profile-section-icon"><UserRound /></div>
          <div><h2>Profile photo</h2><p>Upload a clear photo for your student identity</p></div>
        </div>
        <div className="upload-photo-row">
          {profile.profilePhotoUrl ? (
            <img className="profile-photo-preview" src={uploadedFileUrl(profile.profilePhotoUrl)} alt="Your profile" />
          ) : (
            <div className="profile-photo-placeholder"><UserRound size={34} /></div>
          )}
          <div className="upload-control">
            <strong>{profile.profilePhotoUrl ? "Update your photo" : "Add a profile photo"}</strong>
            <span>JPEG, PNG or WebP · Maximum 2 MB</span>
            <label className="upload-select-btn">
              {uploading === "photo" ? "Uploading..." : "Choose photo"}
              <input type="file" accept="image/jpeg,image/png,image/webp" disabled={Boolean(uploading)} onChange={(e) => { uploadFile("photo", e.target.files?.[0]); e.target.value = ""; }} />
            </label>
          </div>
        </div>
      </section>

      <section className="profile-card">
        <div className="profile-section-title">
          <div className="profile-section-icon"><UserRound /></div>
          <div><h2>Personal information</h2><p>Your basic contact and professional details</p></div>
        </div>
        <div className="profile-grid">
          {input("Phone number", profile.phone, (v) => updateField("phone", v), { type: "tel" })}
          {input("Location", profile.location, (v) => updateField("location", v), { placeholder: "City, State" })}
          {input("Professional headline", profile.headline, (v) => updateField("headline", v), { placeholder: "e.g. B.Tech CSE Student | Aspiring Software Engineer" })}
          {textarea("About me", profile.bio, (v) => updateField("bio", v), "Write a short introduction about your interests, strengths and career goals.")}
        </div>
      </section>

      <section className="profile-card">
        <div className="profile-section-title">
          <div className="profile-section-icon"><FileText /></div>
          <div><h2>Resume</h2><p>Upload your latest resume in PDF format</p></div>
        </div>
        <div className="resume-upload-row">
          <div className="resume-file-icon"><FileText size={25} /></div>
          <div className="resume-file-info">
            <strong>{profile.resumeUrl ? "Resume uploaded" : "No resume uploaded yet"}</strong>
            <span>{profile.resumeUrl ? "Your resume is saved to your student account." : "PDF format · Maximum 5 MB"}</span>
            {profile.resumeUrl && <a href={uploadedFileUrl(profile.resumeUrl)} target="_blank" rel="noreferrer">View uploaded resume</a>}
          </div>
          <label className="upload-select-btn">
            {uploading === "resume" ? "Uploading..." : profile.resumeUrl ? "Replace PDF" : "Upload PDF"}
            <input type="file" accept="application/pdf,.pdf" disabled={Boolean(uploading)} onChange={(e) => { uploadFile("resume", e.target.files?.[0]); e.target.value = ""; }} />
          </label>
        </div>
      </section>

      <section className="profile-card">
        <div className="profile-section-title">
          <div className="profile-section-icon"><GraduationCap /></div>
          <div><h2>Academic details</h2><p>Your educational background and current academic status</p></div>
        </div>
        <div className="profile-grid">
          {input("College / University", profile.academic.college, (v) => updateAcademic("college", v))}
          {input("Degree", profile.academic.degree, (v) => updateAcademic("degree", v), { placeholder: "e.g. B.Tech" })}
          {input("Branch / Specialization", profile.academic.branch, (v) => updateAcademic("branch", v), { placeholder: "e.g. Computer Science and Engineering" })}
          {input("Graduation year", profile.academic.graduationYear, (v) => updateAcademic("graduationYear", v), { type: "number", min: 2000, max: 2100 })}
          {input("Current semester", profile.academic.currentSemester, (v) => updateAcademic("currentSemester", v), { type: "number", min: 1, max: 12 })}
          {input("CGPA", profile.academic.cgpa, (v) => updateAcademic("cgpa", v), { type: "number", min: 0, max: 10, step: "0.01" })}
          {input("Active backlogs", profile.academic.activeBacklogs, (v) => updateAcademic("activeBacklogs", v), { type: "number", min: 0 })}
        </div>
      </section>

      <section className="profile-card">
        <div className="profile-section-title">
          <div className="profile-section-icon"><Code2 /></div>
          <div><h2>Technical skills</h2><p>Add technologies, tools and areas you are confident in</p></div>
        </div>
        <div className="skill-entry">
          <input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
            placeholder="Type a skill, e.g. C++, React, MongoDB"
          />
          <button type="button" onClick={addSkill}><Plus size={17} /> Add skill</button>
        </div>
        <div className="profile-tags">
          {profile.skills.map((skill) => (
            <span className="profile-tag" key={skill}>
              {skill}<button type="button" onClick={() => removeSkill(skill)} aria-label={`Remove ${skill}`}><Trash2 size={13} /></button>
            </span>
          ))}
          {profile.skills.length === 0 && <p className="profile-empty">No skills added yet.</p>}
        </div>
      </section>

      <section className="profile-card">
        <div className="profile-section-title">
          <div className="profile-section-icon"><FolderGit2 /></div>
          <div><h2>Projects</h2><p>Showcase projects that demonstrate your practical skills</p></div>
        </div>
        {profile.projects.map((project, index) => (
          <div className="profile-repeat-item" key={index}>
            <div className="repeat-item-heading"><strong>Project {index + 1}</strong><button type="button" className="remove-item" onClick={() => removeItem("projects", index)}><Trash2 size={15} /> Remove</button></div>
            <div className="profile-grid">
              {input("Project title", project.title, (v) => updateItem("projects", index, "title", v))}
              {input("Technologies", Array.isArray(project.technologies) ? project.technologies.join(", ") : project.technologies, (v) => updateItem("projects", index, "technologies", v.split(",").map((x) => x.trim()).filter(Boolean)), { placeholder: "React, Node.js, MongoDB" })}
              {input("GitHub URL", project.githubUrl, (v) => updateItem("projects", index, "githubUrl", v))}
              {input("Live project URL", project.liveUrl, (v) => updateItem("projects", index, "liveUrl", v))}
              {textarea("Description", project.description, (v) => updateItem("projects", index, "description", v))}
            </div>
          </div>
        ))}
        <button type="button" className="add-item-btn" onClick={() => addItem("projects", { title: "", description: "", technologies: [], githubUrl: "", liveUrl: "" })}><Plus size={16} /> Add project</button>
      </section>

      <section className="profile-card">
        <div className="profile-section-title">
          <div className="profile-section-icon"><BriefcaseBusiness /></div>
          <div><h2>Experience</h2><p>Add internships, work experience or relevant training</p></div>
        </div>
        {profile.experience.map((item, index) => (
          <div className="profile-repeat-item" key={index}>
            <div className="repeat-item-heading"><strong>Experience {index + 1}</strong><button type="button" className="remove-item" onClick={() => removeItem("experience", index)}><Trash2 size={15} /> Remove</button></div>
            <div className="profile-grid">
              {input("Company / Organization", item.company, (v) => updateItem("experience", index, "company", v))}
              {input("Role", item.role, (v) => updateItem("experience", index, "role", v))}
              {input("Start date", item.startDate, (v) => updateItem("experience", index, "startDate", v), { type: "date" })}
              {input("End date", item.endDate, (v) => updateItem("experience", index, "endDate", v), { type: "date" })}
              {textarea("Description", item.description, (v) => updateItem("experience", index, "description", v))}
            </div>
          </div>
        ))}
        <button type="button" className="add-item-btn" onClick={() => addItem("experience", { company: "", role: "", description: "", startDate: "", endDate: "" })}><Plus size={16} /> Add experience</button>
      </section>

      <section className="profile-card">
        <div className="profile-section-title">
          <div className="profile-section-icon"><Award /></div>
          <div><h2>Certifications</h2><p>Highlight courses and certifications you have completed</p></div>
        </div>
        {profile.certifications.map((item, index) => (
          <div className="profile-repeat-item" key={index}>
            <div className="repeat-item-heading"><strong>Certification {index + 1}</strong><button type="button" className="remove-item" onClick={() => removeItem("certifications", index)}><Trash2 size={15} /> Remove</button></div>
            <div className="profile-grid">
              {input("Certification name", item.name, (v) => updateItem("certifications", index, "name", v))}
              {input("Issuing organization", item.issuer, (v) => updateItem("certifications", index, "issuer", v))}
              {input("Issue date", item.issueDate, (v) => updateItem("certifications", index, "issueDate", v), { type: "date" })}
              {input("Credential URL", item.credentialUrl, (v) => updateItem("certifications", index, "credentialUrl", v))}
            </div>
          </div>
        ))}
        <button type="button" className="add-item-btn" onClick={() => addItem("certifications", { name: "", issuer: "", issueDate: "", credentialUrl: "" })}><Plus size={16} /> Add certification</button>
      </section>

      <div className="profile-bottom-save">
        <span><FileText size={16} /> Your information is saved to your student account.</span>
        <button className="profile-save-btn" type="submit" disabled={saving}>
          {saving ? <LoaderCircle className="spin" size={17} /> : <Save size={17} />}
          {saving ? "Saving..." : "Save profile"}
        </button>
      </div>
    </form>
  );
};

export default Profile;
