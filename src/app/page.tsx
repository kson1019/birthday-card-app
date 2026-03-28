"use client";

import { useState } from "react";

const modules = [
  {
    id: "birthday",
    title: "Birthday Cards",
    subtitle: "Create & send beautiful cards",
    emoji: "🎂",
    href: "/cards",
    gradient: "linear-gradient(135deg, #FFE4EC 0%, #FFB8D0 40%, #FFA0C0 100%)",
    accentColor: "#E8457A",
    shadowColor: "rgba(232, 69, 122, 0.2)",
    description:
      "Design personalized birthday cards and send them to your loved ones",
  },
  {
    id: "dibotrip",
    title: "Trip Planner",
    subtitle: "Plan & organize family trips",
    emoji: "✈️",
    href: "/dibotrip",
    gradient: "linear-gradient(135deg, #E0F0FF 0%, #B8DCFF 40%, #90C8FF 100%)",
    accentColor: "#2E86DE",
    shadowColor: "rgba(46, 134, 222, 0.2)",
    description:
      "Itineraries, bookings, and everything your family needs in one place",
  },
];

interface Module {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  href: string;
  gradient: string;
  accentColor: string;
  shadowColor: string;
  description: string;
}

function ModuleCard({ module, index }: { module: Module; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={module.href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#FFFFFF",
        borderRadius: "20px",
        padding: "0",
        textDecoration: "none",
        color: "inherit",
        overflow: "hidden",
        boxShadow: hovered
          ? `0 12px 40px ${module.shadowColor}, 0 4px 12px rgba(0,0,0,0.06)`
          : "0 2px 12px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "pointer",
        animation: `cardEntrance 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.12 + 0.3}s both`,
      }}
    >
      <div
        style={{
          background: module.gradient,
          padding: "36px 28px 28px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-20px",
            right: "-20px",
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.2)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-30px",
            right: "40px",
            width: "70px",
            height: "70px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.15)",
          }}
        />

        <div
          style={{
            fontSize: "40px",
            marginBottom: "12px",
            transform: hovered ? "scale(1.1)" : "scale(1)",
            transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {module.emoji}
        </div>
        <h2
          style={{
            fontFamily: "'DM Sans', 'Avenir', sans-serif",
            fontSize: "22px",
            fontWeight: 700,
            margin: "0 0 4px",
            color: "#1a1a2e",
            letterSpacing: "-0.3px",
          }}
        >
          {module.title}
        </h2>
        <p
          style={{
            fontFamily: "'DM Sans', 'Avenir', sans-serif",
            fontSize: "14px",
            fontWeight: 500,
            margin: 0,
            color: "rgba(26, 26, 46, 0.6)",
          }}
        >
          {module.subtitle}
        </p>
      </div>

      <div style={{ padding: "20px 28px 24px" }}>
        <p
          style={{
            fontFamily: "'DM Sans', 'Avenir', sans-serif",
            fontSize: "14px",
            lineHeight: "1.5",
            color: "#6B7280",
            margin: "0 0 20px",
          }}
        >
          {module.description}
        </p>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: hovered ? "10px" : "6px",
            fontFamily: "'DM Sans', 'Avenir', sans-serif",
            fontSize: "13px",
            fontWeight: 600,
            color: module.accentColor,
            transition: "gap 0.3s ease",
          }}
        >
          Open
          <span
            style={{
              display: "inline-block",
              transition: "transform 0.3s ease",
              transform: hovered ? "translateX(3px)" : "translateX(0)",
            }}
          >
            →
          </span>
        </div>
      </div>
    </a>
  );
}

export default function LaunchpadHome() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #FAFBFE 0%, #F0F2F8 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,500;0,9..40,700&display=swap');

        @keyframes cardEntrance {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div
        style={{
          textAlign: "center",
          marginBottom: "48px",
          animation: "fadeIn 0.5s ease both",
        }}
      >
        <div
          style={{
            width: "52px",
            height: "52px",
            borderRadius: "14px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            boxShadow: "0 4px 16px rgba(102, 126, 234, 0.3)",
          }}
        >
          <span style={{ fontSize: "24px" }}>🚀</span>
        </div>

        <h1
          style={{
            fontFamily: "'DM Sans', 'Avenir', sans-serif",
            fontSize: "28px",
            fontWeight: 700,
            color: "#1a1a2e",
            letterSpacing: "-0.5px",
            marginBottom: "8px",
          }}
        >
          Family Launchpad
        </h1>
        <p
          style={{
            fontFamily: "'DM Sans', 'Avenir', sans-serif",
            fontSize: "15px",
            color: "#9CA3AF",
            fontWeight: 400,
          }}
        >
          Everything your family needs, in one place
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "24px",
          maxWidth: "640px",
          width: "100%",
        }}
      >
        {modules.map((mod, i) => (
          <ModuleCard key={mod.id} module={mod} index={i} />
        ))}
      </div>

      <p
        style={{
          fontFamily: "'DM Sans', 'Avenir', sans-serif",
          fontSize: "12px",
          color: "#D1D5DB",
          marginTop: "56px",
          animation: "fadeIn 0.5s ease 0.8s both",
        }}
      >
        familylaunchpad.com
      </p>
    </div>
  );
}
