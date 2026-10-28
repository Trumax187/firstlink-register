import React from "react";

export default function Layout({ activeTab, setTab, children }) {
  const tabs = [
    { id: "today", label: "Dashboard", icon: "📊" },
    { id: "loans", label: "Loans", icon: "💰" },
    { id: "borrowers", label: "Customers", icon: "👥" },
    { id: "collateral", label: "Collateral", icon: "📦" },
    { id: "cashbook", label: "Cashbook", icon: "📒" },
  ];

  return (
    <div className="app-layout">
      {/* DESKTOP SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img src="/logo.jpeg" alt="FirstLink" />
        </div>
        <nav className="sidebar-nav">
          {tabs.map((t) => (
            <button
              key={t.id}
              className={`nav-item ${activeTab === t.id ? "active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              <span className="nav-icon">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="main-content">
        <header className="top-header">
          <h1>FirstLink Financial Solutions</h1>
          <div className="user-profile">Staff</div>
        </header>
        <div className="page-content">{children}</div>
      </main>

      {/* MOBILE BOTTOM NAV */}
      <nav className="mobile-nav">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`mobile-nav-item ${activeTab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            <span className="nav-icon">{t.icon}</span>
            <span className="nav-label">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
