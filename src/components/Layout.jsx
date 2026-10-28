import React from "react";

export default function Layout({ activeTab, setTab, children, searchQuery, setSearchQuery }) {
  const tabs = [
    { id: "today", label: "Dashboard", icon: "🏠" },
    { id: "loans", label: "Loans", icon: "💰" },
    { id: "borrowers", label: "Customers", icon: "👥" },
    { id: "collateral", label: "Collateral", icon: "📦" },
    { id: "cashbook", label: "Cashbook", icon: "📒" },
  ];

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img src="/logo.jpeg" alt="FirstLink" style={{ maxWidth: "160px", borderRadius: "6px" }} />
        </div>
        <nav className="sidebar-nav">
          {tabs.map((t) => (
            <button
              key={t.id}
              className={"nav-item " + (activeTab === t.id ? "active" : "")}
              onClick={() => setTab(t.id)}
            >
              <span className="nav-icon">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div style={{ fontWeight: 600, color: "#fff" }}>FirstLink</div>
          <div style={{ fontSize: "11px", color: "#94a3b8" }}>Collateral Loan Register<br/>v2.0.0</div>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-header">
          <div className="search-bar">
            <span style={{ color: "#94a3b8" }}>🔍</span>
            <input type="text" placeholder="Search loans, customers..." value={searchQuery || ""} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          
          <div className="header-actions">
            <div className="header-date">
              <div style={{ fontSize: "12px", fontWeight: 600 }}>Today</div>
              <div style={{ fontSize: "11px", color: "#64748b" }}>Live</div>
            </div>
            <button className="icon-btn">
              🔔 <span className="badge">2</span>
            </button>
            <div className="user-profile">
              <div className="avatar">E</div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 600 }}>Edina</div>
                <div style={{ fontSize: "11px", color: "#64748b" }}>Admin</div>
              </div>
            </div>
          </div>
        </header>
        <div className="page-content">{children}</div>
      </main>

      <nav className="mobile-nav">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={"mobile-nav-item " + (activeTab === t.id ? "active" : "")}
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
