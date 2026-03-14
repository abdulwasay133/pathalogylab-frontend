import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Form,
  FormGroup,
  Input,
  Row,
} from "reactstrap";
import UserHeader from "components/Headers/UserHeader.js";
import api from "api/axios";
import { toast } from "react-toastify";

/* ─── tiny toggle switch ─────────────────────────────── */
function Toggle({ checked, onChange, label }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", marginBottom: 0 }}>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: 44, height: 24, borderRadius: 999,
          background: checked ? "#2dce89" : "#cbd3da",
          position: "relative", transition: "background .2s",
          flexShrink: 0,
        }}
      >
        <div style={{
          width: 18, height: 18, borderRadius: "50%", background: "#fff",
          position: "absolute", top: 3,
          left: checked ? 23 : 3,
          transition: "left .2s",
          boxShadow: "0 1px 4px rgba(0,0,0,.25)",
        }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 600, color: checked ? "#2dce89" : "#8898aa" }}>
        {checked ? "Enabled" : "Disabled"}
      </span>
    </label>
  );
}

/* ─── image upload box ───────────────────────────────── */
function ImageUploadBox({ label, hint, preview, onFile, enabled, onToggle }) {
  const ref = useRef();
  return (
    <div style={{
      border: "2px dashed #e9ecef", borderRadius: 12,
      padding: 16, background: "#fafbff",
    }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <span style={{ fontWeight: 700, fontSize: 13, color: "#32325d" }}>{label}</span>
        <Toggle checked={enabled} onChange={onToggle} />
      </div>

      <div
        onClick={() => ref.current.click()}
        style={{
          height: 110, borderRadius: 8, overflow: "hidden",
          background: preview ? "transparent" : "#f0f4ff",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", border: "1px solid #e0e6ed",
          transition: "box-shadow .15s",
        }}
        onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 14px rgba(94,114,228,.2)"}
        onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
      >
        {preview
          ? <img src={preview} alt={label} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          : <div style={{ textAlign: "center", color: "#8898aa" }}>
              <div style={{ fontSize: 28 }}>🖼️</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Click to upload</div>
              <div style={{ fontSize: 11, color: "#adb5bd" }}>{hint}</div>
            </div>
        }
      </div>

      <input ref={ref} type="file" accept="image/*" hidden onChange={e => onFile(e.target.files[0])} />

      {preview && (
        <button
          className="btn btn-sm btn-outline-danger mt-2"
          style={{ fontSize: 11, borderRadius: 6, padding: "3px 10px" }}
          onClick={() => onFile(null)}
        >
          Remove
        </button>
      )}
    </div>
  );
}

/* ─── section heading ────────────────────────────────── */
function SectionHeading({ icon, title }) {
  return (
    <div className="d-flex align-items-center mb-3" style={{ gap: 8 }}>
      <span style={{
        width: 32, height: 32, borderRadius: 8,
        background: "linear-gradient(135deg,#5e72e4,#825ee4)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 15, flexShrink: 0,
      }}>{icon}</span>
      <h6 className="heading-small text-muted mb-0" style={{ letterSpacing: 1 }}>{title}</h6>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════ */
export default function Profile() {
  /* lab info */
  const [lab, setLab] = useState({
    lab_name: "",
    lab_address: "",
    contact_number: "",
    email: "",
    city: "",
    country: "",
    tagline: "",
    license_number: "",
    website: "",
  });

  /* password */
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [showPass, setShowPass]   = useState({ current: false, new: false, confirm: false });

  /* images */
  const [headerImage,   setHeaderImage]   = useState(null);   // File | null
  const [footerImage,   setFooterImage]   = useState(null);
  const [headerPreview, setHeaderPreview] = useState(null);   // data URL
  const [footerPreview, setFooterPreview] = useState(null);
  const [headerEnabled, setHeaderEnabled] = useState(true);
  const [footerEnabled, setFooterEnabled] = useState(true);

  /* loading */
  const [savingLab,  setSavingLab]  = useState(false);
  const [savingPass, setSavingPass] = useState(false);
  const [savingImg,  setSavingImg]  = useState(false);

  /* ── fetch existing settings ── */
  useEffect(() => {
    api.get("/lab-settings").then(res => {
      const d = res.data;
      setLab({
        lab_name:       d.lab_name       || "",
        lab_address:    d.lab_address    || "",
        contact_number: d.contact_number || "",
        email:          d.email          || "",
        city:           d.city           || "",
        country:        d.country        || "",
        tagline:        d.tagline        || "",
        license_number: d.license_number || "",
        website:        d.website        || "",
      });
      setHeaderEnabled(d.header_enabled ?? true);
      setFooterEnabled(d.footer_enabled ?? true);
      if (d.header_image_url) setHeaderPreview(d.header_image_url);
      if (d.footer_image_url) setFooterPreview(d.footer_image_url);
      console.log(d);
    }).catch(() => {});
  }, []);

  /* ── image file → preview ── */
  const handleHeaderFile = (file) => {
    setHeaderImage(file);
    setHeaderPreview(file ? URL.createObjectURL(file) : null);
  };
  const handleFooterFile = (file) => {
    setFooterImage(file);
    setFooterPreview(file ? URL.createObjectURL(file) : null);
  };

  /* ── save lab info ── */
  const saveLab = async () => {
    setSavingLab(true);
    try {
      await api.post("/lab-settings", lab);
      toast.success("Laboratory info saved!");
    } catch {
      toast.error("Failed to save lab info.");
    }
    setSavingLab(false);
  };

  /* ── save password ── */
  const savePassword = async () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      toast.warning("Please fill all password fields.");
      return;
    }
    if (passwords.new !== passwords.confirm) {
      toast.error("New passwords do not match.");
      return;
    }
    if (passwords.new.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setSavingPass(true);
    try {
      await api.post("/change-password", {
        current_password:      passwords.current,
        new_password:          passwords.new,
        new_password_confirmation: passwords.confirm,
      });
      toast.success("Password changed successfully!");
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to change password.");
    }
    setSavingPass(false);
  };

  /* ── save images + toggles ── */
  const saveImages = async () => {
    setSavingImg(true);
    try {
      const fd = new FormData();
      fd.append("header_enabled", headerEnabled ? 1 : 0);
      fd.append("footer_enabled", footerEnabled ? 1 : 0);
      if (headerImage) fd.append("header_image", headerImage);
      if (footerImage) fd.append("footer_image", footerImage);
      await api.post("/lab-settings/images", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Images & settings saved!");
    } catch {
      toast.error("Failed to save images.");
    }
    setSavingImg(false);
  };

  /* ─────────────── render ─────────────── */
  return (
    <>
      <UserHeader />

      <Container className="mt--7" fluid>

        {/* ══════════ ROW 1 — Lab Info + Password ══════════ */}
        <Row className="mb-4">

          {/* ── LAB INFO ── */}
          <Col xl="8" className="mb-4 mb-xl-0">
            <Card className="shadow border-0" style={{ borderRadius: 16 }}>
              <CardHeader
                className="bg-white border-0"
                style={{ borderRadius: "16px 16px 0 0", padding: "1.25rem 1.5rem" }}
              >
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center" style={{ gap: 10 }}>
                    <span style={{
                      width: 38, height: 38, borderRadius: 10,
                      background: "linear-gradient(135deg,#11cdef,#1171ef)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 18,
                    }}>🏥</span>
                    <div>
                      <h3 className="mb-0">Laboratory Settings</h3>
                      <p className="text-muted mb-0" style={{ fontSize: 12 }}>
                        Manage your lab profile & branding
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardBody style={{ padding: "1.5rem" }}>
                <Form>
                  {/* ─ Basic Info ─ */}
                  <SectionHeading icon="🔬" title="LABORATORY INFORMATION" />
                  <div className="pl-lg-3 mb-4">
                    <Row>
                      <Col lg="6">
                        <FormGroup>
                          <label className="form-control-label">Laboratory Name</label>
                          <Input
                            className="form-control-alternative"
                            placeholder="e.g. City Diagnostic Lab"
                            value={lab.lab_name}
                            onChange={e => setLab({ ...lab, lab_name: e.target.value })}
                          />
                        </FormGroup>
                      </Col>
                      <Col lg="6">
                        <FormGroup>
                          <label className="form-control-label">Tagline / Slogan</label>
                          <Input
                            className="form-control-alternative"
                            placeholder="e.g. Precision in every test"
                            value={lab.tagline}
                            onChange={e => setLab({ ...lab, tagline: e.target.value })}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col lg="6">
                        <FormGroup>
                          <label className="form-control-label">License / Reg. Number</label>
                          <Input
                            className="form-control-alternative"
                            placeholder="e.g. LAB-2024-00123"
                            value={lab.license_number}
                            onChange={e => setLab({ ...lab, license_number: e.target.value })}
                          />
                        </FormGroup>
                      </Col>
                      <Col lg="6">
                        <FormGroup>
                          <label className="form-control-label">Website</label>
                          <Input
                            className="form-control-alternative"
                            placeholder="https://yourlab.com"
                            value={lab.website}
                            onChange={e => setLab({ ...lab, website: e.target.value })}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                  </div>

                  <hr className="my-3" />

                  {/* ─ Contact ─ */}
                  <SectionHeading icon="📞" title="CONTACT INFORMATION" />
                  <div className="pl-lg-3 mb-4">
                    <Row>
                      <Col lg="6">
                        <FormGroup>
                          <label className="form-control-label">Contact Number</label>
                          <Input
                            className="form-control-alternative"
                            placeholder="+92 300 0000000"
                            value={lab.contact_number}
                            onChange={e => setLab({ ...lab, contact_number: e.target.value })}
                          />
                        </FormGroup>
                      </Col>
                      <Col lg="6">
                        <FormGroup>
                          <label className="form-control-label">Email Address</label>
                          <Input
                            className="form-control-alternative"
                            type="email"
                            placeholder="info@lab.com"
                            value={lab.email}
                            onChange={e => setLab({ ...lab, email: e.target.value })}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col lg="12">
                        <FormGroup>
                          <label className="form-control-label">Full Address</label>
                          <Input
                            className="form-control-alternative"
                            placeholder="Street, Building No."
                            value={lab.lab_address}
                            onChange={e => setLab({ ...lab, lab_address: e.target.value })}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col lg="6">
                        <FormGroup>
                          <label className="form-control-label">City</label>
                          <Input
                            className="form-control-alternative"
                            placeholder="Lahore"
                            value={lab.city}
                            onChange={e => setLab({ ...lab, city: e.target.value })}
                          />
                        </FormGroup>
                      </Col>
                      <Col lg="6">
                        <FormGroup>
                          <label className="form-control-label">Country</label>
                          <Input
                            className="form-control-alternative"
                            placeholder="Pakistan"
                            value={lab.country}
                            onChange={e => setLab({ ...lab, country: e.target.value })}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                  </div>

                  <div className="text-right">
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{
                        borderRadius: 8, fontWeight: 600,
                        background: "linear-gradient(135deg,#5e72e4,#825ee4)",
                        border: "none", minWidth: 140,
                        boxShadow: "0 4px 12px rgba(94,114,228,.35)",
                      }}
                      onClick={saveLab}
                      disabled={savingLab}
                    >
                      {savingLab ? "Saving…" : "💾 Save Lab Info"}
                    </button>
                  </div>
                </Form>
              </CardBody>
            </Card>
          </Col>

          {/* ── PASSWORD ── */}
          <Col xl="4">
            <Card className="shadow border-0 h-100" style={{ borderRadius: 16 }}>
              <CardHeader
                className="bg-white border-0"
                style={{ borderRadius: "16px 16px 0 0", padding: "1.25rem 1.5rem" }}
              >
                <div className="d-flex align-items-center" style={{ gap: 10 }}>
                  <span style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: "linear-gradient(135deg,#f5365c,#f56036)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18,
                  }}>🔐</span>
                  <div>
                    <h3 className="mb-0">Reset Password</h3>
                    <p className="text-muted mb-0" style={{ fontSize: 12 }}>
                      Update your account password
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardBody style={{ padding: "1.5rem" }}>
                {[
                  { key: "current", label: "Current Password",  placeholder: "Enter current password" },
                  { key: "new",     label: "New Password",       placeholder: "Min. 8 characters" },
                  { key: "confirm", label: "Confirm New Password", placeholder: "Repeat new password" },
                ].map(({ key, label, placeholder }) => (
                  <FormGroup key={key}>
                    <label className="form-control-label">{label}</label>
                    <div style={{ position: "relative" }}>
                      <Input
                        className="form-control-alternative"
                        type={showPass[key] ? "text" : "password"}
                        placeholder={placeholder}
                        value={passwords[key]}
                        onChange={e => setPasswords({ ...passwords, [key]: e.target.value })}
                        style={{ paddingRight: 38 }}
                      />
                      <span
                        onClick={() => setShowPass({ ...showPass, [key]: !showPass[key] })}
                        style={{
                          position: "absolute", right: 12, top: "50%",
                          transform: "translateY(-50%)", cursor: "pointer",
                          fontSize: 16, userSelect: "none",
                        }}
                      >
                        {showPass[key] ? "🙈" : "👁️"}
                      </span>
                    </div>
                  </FormGroup>
                ))}

                {/* password strength hint */}
                {passwords.new && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 11, color: "#8898aa", marginBottom: 4 }}>Password strength</div>
                    <div style={{ display: "flex", gap: 4 }}>
                      {[
                        passwords.new.length >= 8,
                        /[A-Z]/.test(passwords.new),
                        /[0-9]/.test(passwords.new),
                        /[^A-Za-z0-9]/.test(passwords.new),
                      ].map((ok, i) => (
                        <div key={i} style={{
                          flex: 1, height: 4, borderRadius: 99,
                          background: ok ? (i < 2 ? "#ffd600" : "#2dce89") : "#e9ecef",
                          transition: "background .2s",
                        }} />
                      ))}
                    </div>
                    <div style={{ fontSize: 10, color: "#8898aa", marginTop: 4 }}>
                      Use 8+ chars, uppercase, number & symbol for a strong password
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  className="btn btn-danger btn-block"
                  style={{
                    borderRadius: 8, fontWeight: 600,
                    background: "linear-gradient(135deg,#f5365c,#f56036)",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(245,54,92,.3)",
                  }}
                  onClick={savePassword}
                  disabled={savingPass}
                >
                  {savingPass ? "Updating…" : "🔑 Update Password"}
                </button>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* ══════════ ROW 2 — Report Images ══════════ */}
        <Row className="mb-4">
          <Col xl="12">
            <Card className="shadow border-0" style={{ borderRadius: 16 }}>
              <CardHeader
                className="bg-white border-0"
                style={{ borderRadius: "16px 16px 0 0", padding: "1.25rem 1.5rem" }}
              >
                <div className="d-flex align-items-center justify-content-between flex-wrap" style={{ gap: 12 }}>
                  <div className="d-flex align-items-center" style={{ gap: 10 }}>
                    <span style={{
                      width: 38, height: 38, borderRadius: 10,
                      background: "linear-gradient(135deg,#2dce89,#2dcecc)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 18,
                    }}>📄</span>
                    <div>
                      <h3 className="mb-0">Report Header & Footer</h3>
                      <p className="text-muted mb-0" style={{ fontSize: 12 }}>
                        Upload images for printed lab reports
                      </p>
                    </div>
                  </div>

                  {/* preview badge */}
                  <div style={{
                    padding: "6px 14px", borderRadius: 8,
                    background: "#f0faf5", border: "1px solid #b7ebd9",
                    fontSize: 12, color: "#1aae6f", fontWeight: 600,
                  }}>
                    {headerEnabled && footerEnabled ? "✅ Both enabled" :
                     headerEnabled ? "⚠️ Header only" :
                     footerEnabled ? "⚠️ Footer only" : "❌ Both disabled"}
                  </div>
                </div>
              </CardHeader>

              <CardBody style={{ padding: "1.5rem" }}>
                {/* Report preview strip */}
                <div style={{
                  background: "#f8f9fe", border: "1px solid #e9ecef",
                  borderRadius: 12, padding: 16, marginBottom: 24,
                }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#8898aa", marginBottom: 10, letterSpacing: 1 }}>
                    REPORT PREVIEW
                  </p>
                  <div style={{
                    border: "1px solid #dee2e6", borderRadius: 8,
                    overflow: "hidden", background: "#fff",
                    minHeight: 180,
                  }}>
                    {/* header strip */}
                    <div style={{
                      height: 60, background: headerEnabled && headerPreview ? "transparent" : "#f0f4ff",
                      borderBottom: "1px dashed #dee2e6",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      overflow: "hidden",
                    }}>
                      {headerEnabled && headerPreview
                        ? <img src={headerPreview} alt="header" style={{ height: "100%", width: "100%", objectFit: "contain" }} />
                        : <span style={{ fontSize: 12, color: "#adb5bd" }}>
                            {headerEnabled ? "Header image not set" : "Header disabled"}
                          </span>
                      }
                    </div>
                    {/* content placeholder */}
                    <div style={{ padding: "12px 16px" }}>
                      {[80, 60, 70, 50].map((w, i) => (
                        <div key={i} style={{
                          height: 8, width: `${w}%`, borderRadius: 4,
                          background: "#f0f0f0", marginBottom: 8,
                        }} />
                      ))}
                    </div>
                    {/* footer strip */}
                    <div style={{
                      height: 50, background: footerEnabled && footerPreview ? "transparent" : "#fff8f0",
                      borderTop: "1px dashed #dee2e6",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      overflow: "hidden",
                    }}>
                      {footerEnabled && footerPreview
                        ? <img src={footerPreview} alt="footer" style={{ height: "100%", width: "100%", objectFit: "contain" }} />
                        : <span style={{ fontSize: 12, color: "#adb5bd" }}>
                            {footerEnabled ? "Footer image not set" : "Footer disabled"}
                          </span>
                      }
                    </div>
                  </div>
                </div>

                <Row>
                  <Col lg="6" className="mb-4 mb-lg-0">
                    <ImageUploadBox
                      label="Header Image"
                      hint="Recommended: 1200×150 px · PNG/JPG"
                      preview={headerPreview}
                      onFile={handleHeaderFile}
                      enabled={headerEnabled}
                      onToggle={setHeaderEnabled}
                    />
                  </Col>
                  <Col lg="6">
                    <ImageUploadBox
                      label="Footer Image"
                      hint="Recommended: 1200×100 px · PNG/JPG"
                      preview={footerPreview}
                      onFile={handleFooterFile}
                      enabled={footerEnabled}
                      onToggle={setFooterEnabled}
                    />
                  </Col>
                </Row>

                <div className="text-right mt-4">
                  <button
                    type="button"
                    className="btn btn-success"
                    style={{
                      borderRadius: 8, fontWeight: 600,
                      background: "linear-gradient(135deg,#2dce89,#2dcecc)",
                      border: "none", minWidth: 160,
                      boxShadow: "0 4px 12px rgba(45,206,137,.3)",
                    }}
                    onClick={saveImages}
                    disabled={savingImg}
                  >
                    {savingImg ? "Saving…" : "🖼️ Save Images & Settings"}
                  </button>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

      </Container>
    </>
  );
}