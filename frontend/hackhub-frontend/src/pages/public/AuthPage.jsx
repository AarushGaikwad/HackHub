import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Phone, Building, Briefcase, ArrowRight, ArrowLeft, Sun, Moon, Eye, EyeOff, User2, Building2, Scale } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import api from "../../api/axiosConfig";

const roles = [
  {
    role: "PARTICIPANT",
    label: "Participant",
    icon: User2,
    desc: "Join hackathons, form teams, and submit projects",
    color: "#4F46E5",
  },
  {
    role: "ORGANIZER",
    label: "Organizer",
    icon: Building2,
    desc: "Create and manage hackathons for your college",
    color: "#0891B2",
  },
  {
    role: "JUDGE",
    label: "Judge",
    icon: Scale,
    desc: "Evaluate submissions and score projects",
    color: "#D97706",
  },
];

const InputField = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  icon: Icon,
  required = true,
}) => {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: "13px",
          fontWeight: "600",
          color: "var(--text)",
          marginBottom: "8px",
        }}
      >
        {label}
      </label>
      <div style={{ position: "relative" }}>
        {Icon && (
          <div
            style={{
              position: "absolute",
              left: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Icon size={15} />
          </div>
        )}
        <input
          type={isPassword ? (show ? "text" : "password") : type}
          required={required}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{
            width: "100%",
            height: "46px",
            paddingLeft: Icon ? "40px" : "14px",
            paddingRight: isPassword ? "44px" : "14px",
            backgroundColor: "var(--bg)",
            border: "1.5px solid var(--border)",
            borderRadius: "10px",
            fontSize: "14px",
            color: "var(--text)",
            outline: "none",
            boxSizing: "border-box",
            transition: "border-color 0.15s ease",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--brand)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((p) => !p)}
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              padding: "0",
            }}
          >
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
    </div>
  );
};

const AuthPage = () => {
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("login");
  const [selectedRole, setSelectedRole] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    collegeName: "",
    organizationName: "",
    contactNo: "",
    designation: "",
  });

  const getDashboard = (role) =>
    ({
      ADMIN: "/admin/dashboard",
      ORGANIZER: "/organizer/dashboard",
      JUDGE: "/judge/dashboard",
      PARTICIPANT: "/participant/dashboard",
    })[role] || "/";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/login", loginForm);
      login(res.data.data);
      navigate(getDashboard(res.data.data.role));
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (registerForm.password !== registerForm.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (registerForm.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const endpoints = {
        PARTICIPANT: "/user/register/participant",
        ORGANIZER: "/user/register/organizer",
        JUDGE: "/user/register/judge",
      };

      const payloads = {
        PARTICIPANT: {
          name: registerForm.name,
          email: registerForm.email,
          password: registerForm.password,
          confirmPassword: registerForm.confirmPassword,
          collegeName: registerForm.collegeName,
        },
        ORGANIZER: {
          name: registerForm.name,
          email: registerForm.email,
          password: registerForm.password,
          confirmPassword: registerForm.confirmPassword,
          organizationName: registerForm.organizationName,
          contactNo: registerForm.contactNo,
        },
        JUDGE: {
          name: registerForm.name,
          email: registerForm.email,
          password: registerForm.password,
          confirmPassword: registerForm.confirmPassword,
          designation: registerForm.designation,
        },
      };

      await api.post(endpoints[selectedRole], payloads[selectedRole]);

      setSuccess(
        selectedRole === "ORGANIZER"
          ? "Account created! Wait for admin approval before logging in."
          : "Account created! You can now log in.",
      );
      setRegisterForm({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        collegeName: "",
        organizationName: "",
        contactNo: "",
        designation: "",
      });
      setTimeout(() => {
        setActiveTab("login");
        setSelectedRole(null);
        setSuccess("");
      }, 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const update = (key) => (e) =>
    setRegisterForm((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bg)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Navbar */}
      <nav
        style={{
          backgroundColor: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 40px",
        }}
      >
        <Link
          to="/"
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "9px",
              backgroundColor: "var(--brand)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "800",
              fontSize: "16px",
            }}
          >
            H
          </div>
          <span
            style={{
              color: "var(--text)",
              fontWeight: "700",
              fontSize: "18px",
              letterSpacing: "-0.4px",
            }}
          >
            HackHub
          </span>
        </Link>

        <button
          onClick={toggleTheme}
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "9px",
            backgroundColor: "var(--bg)",
            border: "1px solid var(--border)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-secondary)",
          }}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </nav>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 24px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth:
              activeTab === "register" && selectedRole ? "480px" : "440px",
            transition: "max-width 0.2s ease",
          }}
        >
          {/* Card */}
          <div
            style={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "24px",
              padding: "40px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
            }}
          >
            {/* Header */}
            <div style={{ marginBottom: "32px", textAlign: "center" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "14px",
                  backgroundColor: "var(--brand-bg)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <span
                  style={{
                    fontSize: "22px",
                    fontWeight: "700",
                    color: "var(--brand)",
                  }}
                >
                  H
                </span>
              </div>
              <h1
                style={{
                  fontSize: "22px",
                  fontWeight: "800",
                  color: "var(--text)",
                  letterSpacing: "-0.5px",
                  marginBottom: "6px",
                }}
              >
                {activeTab === "login"
                  ? "Welcome back"
                  : selectedRole
                    ? `Register as ${selectedRole.charAt(0) + selectedRole.slice(1).toLowerCase()}`
                    : "Create an account"}
              </h1>
              <p
                style={{
                  fontSize: "14px",
                  color: "var(--text-secondary)",
                }}
              >
                {activeTab === "login"
                  ? "Sign in to your HackHub account"
                  : selectedRole
                    ? "Fill in your details to get started"
                    : "Choose your role to get started"}
              </p>
            </div>

            {/* Tab switcher */}
            <div
              style={{
                display: "flex",
                backgroundColor: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                padding: "4px",
                marginBottom: "28px",
              }}
            >
              {["login", "register"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setSelectedRole(null);
                    setError("");
                    setSuccess("");
                  }}
                  style={{
                    flex: 1,
                    padding: "9px",
                    borderRadius: "9px",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: "600",
                    textTransform: "capitalize",
                    backgroundColor:
                      activeTab === tab ? "var(--brand)" : "transparent",
                    color:
                      activeTab === tab ? "white" : "var(--text-secondary)",
                    transition: "all 0.15s ease",
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div
                style={{
                  backgroundColor: "var(--danger-bg)",
                  color: "var(--danger-text)",
                  border: "1px solid var(--danger-text)",
                  borderRadius: "10px",
                  padding: "12px 16px",
                  fontSize: "13px",
                  fontWeight: "500",
                  marginBottom: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                ⚠️ {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div
                style={{
                  backgroundColor: "var(--success-bg)",
                  color: "var(--success-text)",
                  border: "1px solid var(--success-text)",
                  borderRadius: "10px",
                  padding: "12px 16px",
                  fontSize: "13px",
                  fontWeight: "500",
                  marginBottom: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                ✓ {success}
              </div>
            )}

            {/* ── LOGIN FORM ── */}
            {activeTab === "login" && (
              <form
                onSubmit={handleLogin}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >
                <InputField
                  label="Email address"
                  type="email"
                  value={loginForm.email}
                  onChange={(e) =>
                    setLoginForm((p) => ({ ...p, email: e.target.value }))
                  }
                  placeholder="you@example.com"
                  icon={Mail}
                />
                <InputField
                  label="Password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm((p) => ({ ...p, password: e.target.value }))
                  }
                  placeholder="Enter your password"
                  icon={Lock}
                />
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    height: "46px",
                    backgroundColor: "var(--brand)",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontWeight: "700",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.7 : 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    marginTop: "4px",
                  }}
                >
                  {loading ? (
                    "Signing in..."
                  ) : (
                    <>
                      Sign in <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* ── REGISTER — Role selector ── */}
            {activeTab === "register" && !selectedRole && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <p
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "var(--text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: "4px",
                  }}
                >
                  I want to register as
                </p>
                {roles.map(({ role, label, icon: Icon, desc, color }) => (
                  <button
                    key={role}
                    onClick={() => {
                      setSelectedRole(role);
                      setError("");
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      padding: "16px 18px",
                      backgroundColor: "var(--bg)",
                      border: "1.5px solid var(--border)",
                      borderRadius: "12px",
                      cursor: "pointer",
                      textAlign: "left",
                      width: "100%",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = color;
                      e.currentTarget.style.backgroundColor = `${color}08`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--border)";
                      e.currentTarget.style.backgroundColor = "var(--bg)";
                    }}
                  >
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "12px",
                        backgroundColor: `${color}15`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "20px",
                        flexShrink: 0,
                      }}
                    >
                      <Icon
                        size={22}
                        strokeWidth={2}
                        color={color} 
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: "700",
                          color: "var(--text)",
                          marginBottom: "3px",
                        }}
                      >
                        {label}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {desc}
                      </div>
                    </div>
                    <ArrowRight size={16} color="var(--text-secondary)" />
                  </button>
                ))}
              </div>
            )}

            {/* ── REGISTER FORM ── */}
            {activeTab === "register" && selectedRole && (
              <form
                onSubmit={handleRegister}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "18px",
                }}
              >
                {/* Back */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole(null);
                    setError("");
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "none",
                    border: "none",
                    color: "var(--brand)",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: "600",
                    padding: "0",
                    marginBottom: "4px",
                  }}
                >
                  <ArrowLeft size={14} /> Back to role selection
                </button>

                {/* Common fields */}
                <InputField
                  label="Full name"
                  value={registerForm.name}
                  onChange={update("name")}
                  placeholder="John Doe"
                  icon={User}
                />
                <InputField
                  label="Email address"
                  type="email"
                  value={registerForm.email}
                  onChange={update("email")}
                  placeholder="you@example.com"
                  icon={Mail}
                />

                {/* Role specific */}
                {selectedRole === "PARTICIPANT" && (
                  <InputField
                    label="College name"
                    value={registerForm.collegeName}
                    onChange={update("collegeName")}
                    placeholder="MIT College"
                    icon={Building}
                  />
                )}

                {selectedRole === "ORGANIZER" && (
                  <>
                    <InputField
                      label="Organization name"
                      value={registerForm.organizationName}
                      onChange={update("organizationName")}
                      placeholder="MIT College"
                      icon={Building}
                    />
                    <InputField
                      label="Contact number"
                      value={registerForm.contactNo}
                      onChange={update("contactNo")}
                      placeholder="9876543210"
                      icon={Phone}
                    />
                  </>
                )}

                {selectedRole === "JUDGE" && (
                  <InputField
                    label="Occupation"
                    value={registerForm.designation}
                    onChange={update("designation")}
                    placeholder="Software Engineer"
                    icon={Briefcase}
                  />
                )}

                {/* Password */}
                <InputField
                  label="Password"
                  type="password"
                  value={registerForm.password}
                  onChange={update("password")}
                  placeholder="Min. 6 characters"
                  icon={Lock}
                />
                <InputField
                  label="Confirm password"
                  type="password"
                  value={registerForm.confirmPassword}
                  onChange={update("confirmPassword")}
                  placeholder="Repeat password"
                  icon={Lock}
                />

                {/* Organizer warning */}
                {selectedRole === "ORGANIZER" && (
                  <div
                    style={{
                      backgroundColor: "var(--warning-bg)",
                      color: "var(--warning-text)",
                      borderRadius: "10px",
                      padding: "12px 14px",
                      fontSize: "12px",
                      fontWeight: "500",
                      lineHeight: "1.5",
                    }}
                  >
                    ⚠️ Organizer accounts require admin approval before you can
                    log in.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    height: "46px",
                    backgroundColor: "var(--brand)",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontWeight: "700",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.7 : 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    marginTop: "4px",
                  }}
                >
                  {loading ? (
                    "Creating account..."
                  ) : (
                    <>
                      Create account <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Footer note */}
          <p
            style={{
              textAlign: "center",
              fontSize: "13px",
              color: "var(--text-secondary)",
              marginTop: "20px",
            }}
          >
            {activeTab === "login" ? (
              <>
                Don't have an account?{" "}
                <button
                  onClick={() => setActiveTab("register")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--brand)",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "13px",
                  }}
                >
                  Register here
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => {
                    setActiveTab("login");
                    setSelectedRole(null);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--brand)",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "13px",
                  }}
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
