import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Col, Row } from "reactstrap";
import { useAuth } from "context/AuthContext";

/* ── input style ── */
const iS = {
  borderRadius: 10, border: "1px solid #e0e6ed",
  padding: "12px 14px", fontSize: 14, color: "#32325d",
  background: "#fff", width: "100%", outline: "none",
  transition: "border .15s, box-shadow .15s",
  boxSizing: "border-box",
};
const onFocus = (e) => {
  e.target.style.border = "1px solid #5e72e4";
  e.target.style.boxShadow = "0 0 0 3px rgba(94,114,228,.12)";
};
const onBlur = (e) => {
  e.target.style.border = "1px solid #e0e6ed";
  e.target.style.boxShadow = "none";
};
const iErr = { border: "1px solid #f5365c" };

/* ══════════════════════════════════════════════════════════ */

const Login = () => {
  const navigate  = useNavigate();
  const { login } = useAuth();
  const [showPass, setShowPass] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm({ mode: "onChange", reValidateMode: "onChange" });

  /* ── submit — uses AuthContext.login which fetches /me ── */
  const onSubmit = async (data) => {
    try {
      const user = await login(data.email, data.password);
      toast.success(`Welcome back, ${user.name}! 👋`);

      /* role-based redirect */
      const role = user.roles?.[0];
      if (role === "admin")        navigate("/admin/index");
      else if (role === "lab")     navigate("/admin/patients/pending-patient");
      else if (role === "doctor")  navigate("/admin/patients/completed-patient");
      else                         navigate("/admin/index");

    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid credentials. Please try again.");
    }
  };

  return (
    <Col lg="5" md="7">

      {/* ── Card ── */}
      <div style={{
        background: "#fff",
        borderRadius: 20,
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0,0,0,.12)",
      }}>

        {/* gradient header */}
        <div style={{
          background: "linear-gradient(135deg,#5e72e4 0%,#825ee4 100%)",
          padding: "32px 36px 28px",
          textAlign: "center",
        }}>
          {/* logo badge */}
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: "rgba(255,255,255,.2)",
            border: "2px solid rgba(255,255,255,.35)",
            display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 26,
            margin: "0 auto 14px",
            boxShadow: "0 8px 20px rgba(0,0,0,.15)",
          }}>🔬</div>

          <h2 style={{ color: "#fff", fontWeight: 800, fontSize: 22, margin: "0 0 4px" }}>
            LIMS Portal
          </h2>
          <p style={{ color: "rgba(255,255,255,.7)", fontSize: 13, margin: 0 }}>
            Laboratory Information Management System
          </p>
        </div>

        {/* form body */}
        <div style={{ padding: "28px 32px 24px" }}>
          <p style={{ textAlign: "center", color: "#8898aa", fontSize: 13, marginBottom: 24, fontWeight: 500 }}>
            Sign in to your account
          </p>

          <form onSubmit={handleSubmit(onSubmit)}>

            {/* ── Email ── */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#525f7f", marginBottom: 6, display: "block", letterSpacing: 0.3 }}>
                EMAIL ADDRESS
              </label>
              <div style={{ position: "relative" }}>
                <span style={{
                  position: "absolute", left: 13, top: "50%",
                  transform: "translateY(-50%)",
                  color: errors.email ? "#f5365c" : "#8898aa",
                  fontSize: 15, pointerEvents: "none",
                }}>
                  ✉️
                </span>
                <input
                  type="email"
                  placeholder="you@lims.com"
                  autoComplete="email"
                  style={errors.email ? { ...iS, ...iErr, paddingLeft: 38 } : { ...iS, paddingLeft: 38 }}
                  onFocus={onFocus} onBlur={onBlur}
                  {...register("email", {
                    required: "Email is required",
                    pattern: { value: /^\S+@\S+$/i, message: "Enter a valid email" },
                  })}
                />
              </div>
              {errors.email && (
                <small style={{ color: "#f5365c", fontSize: 11, marginTop: 4, display: "block" }}>
                  ⚠ {errors.email.message}
                </small>
              )}
            </div>

            {/* ── Password ── */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#525f7f", marginBottom: 6, display: "block", letterSpacing: 0.3 }}>
                PASSWORD
              </label>
              <div style={{ position: "relative" }}>
                <span style={{
                  position: "absolute", left: 13, top: "50%",
                  transform: "translateY(-50%)",
                  color: errors.password ? "#f5365c" : "#8898aa",
                  fontSize: 15, pointerEvents: "none",
                }}>
                  🔒
                </span>
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  style={errors.password
                    ? { ...iS, ...iErr, paddingLeft: 38, paddingRight: 44 }
                    : { ...iS, paddingLeft: 38, paddingRight: 44 }}
                  onFocus={onFocus} onBlur={onBlur}
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "Minimum 6 characters" },
                  })}
                />
                {/* show / hide */}
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  style={{
                    position: "absolute", right: 12, top: "50%",
                    transform: "translateY(-50%)",
                    background: "none", border: "none",
                    cursor: "pointer", fontSize: 16, padding: 0,
                    color: "#8898aa",
                  }}
                >
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
              {errors.password && (
                <small style={{ color: "#f5365c", fontSize: 11, marginTop: 4, display: "block" }}>
                  ⚠ {errors.password.message}
                </small>
              )}
            </div>

            {/* ── Remember me ── */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", margin: 0 }}>
                <input
                  type="checkbox"
                  style={{ accentColor: "#5e72e4", width: 15, height: 15 }}
                  {...register("remember")}
                />
                <span style={{ fontSize: 13, color: "#525f7f", fontWeight: 500 }}>Remember me</span>
              </label>
              <a
                href="#pablo"
                onClick={e => e.preventDefault()}
                style={{ fontSize: 13, color: "#5e72e4", fontWeight: 600, textDecoration: "none" }}
              >
                Forgot password?
              </a>
            </div>

            {/* ── Submit ── */}
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              style={{
                width: "100%", borderRadius: 10, border: "none",
                padding: "13px 0", fontSize: 15, fontWeight: 700,
                cursor: (!isValid || isSubmitting) ? "not-allowed" : "pointer",
                background: (!isValid || isSubmitting)
                  ? "#e0e6ed"
                  : "linear-gradient(135deg,#5e72e4,#825ee4)",
                color: (!isValid || isSubmitting) ? "#adb5bd" : "#fff",
                boxShadow: (!isValid || isSubmitting)
                  ? "none"
                  : "0 6px 20px rgba(94,114,228,.4)",
                transition: "all .2s",
                display: "flex", alignItems: "center",
                justifyContent: "center", gap: 8,
              }}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" />
                  Signing in…
                </>
              ) : (
                "Sign In →"
              )}
            </button>

          </form>
        </div>

        {/* ── Role hint strip ── */}
        <div style={{
          background: "#f8f9fe", borderTop: "1px solid #e9ecf3",
          padding: "12px 32px",
          display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 8,
        }}>
          {[
            { role: "admin",        icon: "🛡️", label: "Admin"        },
            { role: "lab",          icon: "🧪", label: "Lab Tech"     },
            { role: "doctor",       icon: "👨‍⚕️", label: "Doctor"       },
            { role: "receptionist", icon: "📋", label: "Receptionist" },
          ].map(({ role, icon, label }) => (
            <span key={role} style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              fontSize: 11, color: "#8898aa", fontWeight: 500,
            }}>
              {icon} {label}
            </span>
          ))}
        </div>

      </div>

      {/* ── Bottom links ── */}
      <Row className="mt-4">
        <Col xs="6">
          <span style={{ color: "rgba(255,255,255,.7)", fontSize: 13 }}>
            © {new Date().getFullYear()} LIMS
          </span>
        </Col>
        <Col xs="6" className="text-right">
          <a
            href="#pablo"
            onClick={e => e.preventDefault()}
            style={{ color: "rgba(255,255,255,.7)", fontSize: 13, textDecoration: "none" }}
          >
            Need help?
          </a>
        </Col>
      </Row>

    </Col>
  );
};

export default Login;