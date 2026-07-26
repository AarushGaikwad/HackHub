import { Link } from "react-router-dom";
import {
  Moon,
  Sun,
  ArrowRight,
  Users,
  Trophy,
  Award,
  Shield,
  Zap,
  CheckCircle,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const LandingPage = () => {
  const { isDark, toggleTheme } = useTheme();

  const steps = [
    {
      step: "01",
      title: "Register",
      desc: "Sign up as a participant, organizer, or judge in under a minute.",
      icon: Users,
    },
    {
      step: "02",
      title: "Form a team",
      desc: "Create a team or join one with a shareable 6-character invite code.",
      icon: Zap,
    },
    {
      step: "03",
      title: "Build & submit",
      desc: "Share progress updates and submit your final project on GitHub.",
      icon: Trophy,
    },
    {
      step: "04",
      title: "Get certified",
      desc: "Receive your certificate by email and download it any time.",
      icon: Award,
    },
  ];

  const roles = [
    {
      role: "Participant",
      icon: Users,
      desc: "Browse hackathons, form teams with invite codes, submit your project, and collect certificates.",
      features: [
        "Team formation via invite code",
        "Progress + final submissions",
        "Certificate download anytime",
      ],
      accent: "#4F46E5",
    },
    {
      role: "Organizer",
      icon: Trophy,
      desc: "Create and manage hackathons, track registered teams, and issue batch certificates when done.",
      features: [
        "Full hackathon lifecycle management",
        "Team and submission tracking",
        "Batch certificate generation",
      ],
      accent: "#0891B2",
    },
    {
      role: "Judge",
      icon: Award,
      desc: "Review submissions assigned to you, score on 0–100, give feedback, and watch the leaderboard live.",
      features: [
        "Assigned hackathons only",
        "Score + written feedback",
        "Live leaderboard updates",
      ],
      accent: "#D97706",
    },
    {
      role: "Admin",
      icon: Shield,
      desc: "Approve organizers, manage all users, and monitor platform-wide stats from one dashboard.",
      features: [
        "Organizer approval workflow",
        "Platform-wide user management",
        "System overview and stats",
      ],
      accent: "#DC2626",
    },
  ];

  return (
    <div style={{ backgroundColor: "var(--bg)", minHeight: "100vh" }}>
      {/* ── NAVBAR ── */}
      <nav
        style={{
          backgroundColor: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "0 40px",
            height: "64px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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

            <Link
              to="/login"
              style={{
                color: "var(--text-secondary)",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: "500",
                padding: "9px 18px",
                borderRadius: "9px",
                border: "1px solid var(--border)",
              }}
            >
              Log in
            </Link>

            <Link
              to="/login?mode=register"
              style={{
                backgroundColor: "var(--brand)",
                color: "white",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: "600",
                padding: "9px 20px",
                borderRadius: "9px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              Get started <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "120px 40px 96px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            backgroundColor: "var(--brand-bg)",
            color: "var(--brand)",
            padding: "6px 14px",
            borderRadius: "100px",
            fontSize: "12px",
            fontWeight: "700",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            marginBottom: "32px",
          }}
        >
          <Zap size={12} /> Built for college hackathons
        </div>

        <h1
          style={{
            fontSize: "clamp(44px, 6vw, 72px)",
            fontWeight: "800",
            lineHeight: "1.08",
            letterSpacing: "-2px",
            color: "var(--text)",
            marginBottom: "16px",
            maxWidth: "800px",
            margin: "0 auto 16px",
          }}
        >
          Run better hackathons.
          <br />
          <span style={{ color: "var(--brand)" }}>
            From idea to certificate.
          </span>
        </h1>

        <p
          style={{
            fontSize: "19px",
            color: "var(--text-secondary)",
            lineHeight: "1.7",
            maxWidth: "540px",
            margin: "32px auto 52px",
          }}
        >
          HackHub handles team formation, submissions, judging, and certificates
          — so everyone can focus on building great things.
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "14px",
            flexWrap: "wrap",
          }}
        >
          <Link
            to="/login?mode=register"
            style={{
              backgroundColor: "var(--brand)",
              color: "white",
              textDecoration: "none",
              padding: "14px 32px",
              borderRadius: "12px",
              fontWeight: "700",
              fontSize: "15px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              letterSpacing: "-0.2px",
            }}
          >
            Start participating <ArrowRight size={16} />
          </Link>
          <Link
            to="/login?mode=register"
            style={{
              backgroundColor: "transparent",
              color: "var(--text)",
              textDecoration: "none",
              padding: "14px 32px",
              borderRadius: "12px",
              fontWeight: "600",
              fontSize: "15px",
              border: "1.5px solid var(--border)",
            }}
          >
            Organize a hackathon
          </Link>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "104px 40px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <h2
            style={{
              fontSize: "36px",
              fontWeight: "800",
              color: "var(--text)",
              letterSpacing: "-0.8px",
              marginBottom: "14px",
            }}
          >
            How HackHub works
          </h2>
          <p
            style={{
              fontSize: "16px",
              color: "var(--text-secondary)",
              lineHeight: "1.6",
            }}
          >
            From registration to recognition in four simple steps
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "20px",
          }}
        >
          {steps.map(({ step, title, desc, icon: Icon }) => (
            <div
              key={step}
              style={{
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "20px",
                padding: "32px 28px",
                transition: "all 0.2s ease",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  backgroundColor: "var(--brand-bg)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "20px",
                }}
              >
                <Icon size={20} color="var(--brand)" />
              </div>

              <div
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  color: "var(--brand)",
                  letterSpacing: "0.1em",
                  marginBottom: "10px",
                  opacity: 0.7,
                }}
              >
                STEP {step}
              </div>

              <h3
                style={{
                  fontSize: "17px",
                  fontWeight: "700",
                  color: "var(--text)",
                  marginBottom: "10px",
                  letterSpacing: "-0.3px",
                }}
              >
                {title}
              </h3>
              <p
                style={{
                  fontSize: "14px",
                  color: "var(--text-secondary)",
                  lineHeight: "1.65",
                }}
              >
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "104px 40px",
        }}
      >
        <div
          style={{
            backgroundColor: "var(--brand-bg)",
            border: "1px solid var(--border)",
            borderRadius: "28px",
            padding: "72px 48px",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontSize: "40px",
              fontWeight: "800",
              color: "var(--text)",
              letterSpacing: "-1px",
              marginBottom: "16px",
            }}
          >
            Ready to join HackHub?
          </h2>
          <p
            style={{
              fontSize: "16px",
              color: "var(--text-secondary)",
              marginBottom: "40px",
              lineHeight: "1.6",
            }}
          >
            Register today. It takes less than a minute.
          </p>
          <div
            style={{
              display: "flex",
              gap: "14px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link
              to="/login?mode=register"
              style={{
                backgroundColor: "var(--brand)",
                color: "white",
                textDecoration: "none",
                padding: "15px 36px",
                borderRadius: "12px",
                fontWeight: "700",
                fontSize: "15px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              Register now <ArrowRight size={16} />
            </Link>
            <Link
              to="/login"
              style={{
                backgroundColor: "var(--surface)",
                color: "var(--text)",
                textDecoration: "none",
                padding: "15px 36px",
                borderRadius: "12px",
                fontWeight: "600",
                fontSize: "15px",
                border: "1.5px solid var(--border)",
              }}
            >
              Log in
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        style={{
          backgroundColor: "var(--surface)",
          borderTop: "1px solid var(--border)",
          padding: "32px 40px",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "7px",
                backgroundColor: "var(--brand)",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "700",
                fontSize: "13px",
              }}
            >
              H
            </div>
            <span
              style={{
                color: "var(--text-secondary)",
                fontSize: "13px",
                fontWeight: "500",
              }}
            >
              HackHub © 2026
            </span>
          </div>
          <span style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
            Empowering college hackathons across India
          </span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
