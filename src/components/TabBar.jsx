export default function TabBar({ tabs, activeTab, onTabChange }) {
  return (
    <div
      style={{
        padding: "0 32px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        gap: 0,
        overflowX: "auto",
      }}
    >
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onTabChange(t.id)}
          aria-label={t.label}
          aria-selected={activeTab === t.id}
          role="tab"
          style={{
            background: "none",
            border: "none",
            borderBottom:
              activeTab === t.id
                ? "2px solid #0ea5e9"
                : "2px solid transparent",
            color: activeTab === t.id ? "#0ea5e9" : "#64748b",
            padding: "14px 20px",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: activeTab === t.id ? 600 : 400,
            transition: "all 0.2s",
            fontFamily: "inherit",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            whiteSpace: "nowrap",
          }}
        >
          <span>{t.label}</span>
          <span
            style={{ fontSize: 10, opacity: 0.6, direction: "rtl" }}
          >
            {t.arabic}
          </span>
        </button>
      ))}
    </div>
  );
}
