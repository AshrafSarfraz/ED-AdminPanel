// 📁 pages/Rider/RiderNavTabs.jsx
// Sirf navigation buttons — "Monthly Earnings" aur "All Debts" dono APNI ALAG route hain.
// Ye component koi screen import/render nahi karta, sirf active-route highlight karke
// navigate() karta hai. Har screen (Months, Debts) apne upar isko render karti hai.
import { useNavigate, useLocation } from "react-router-dom";

export default function RiderNavTabs() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { label: "Monthly Earnings", path: "/payments/rider-earnings" },
    { label: "All Debts",        path: "/payments/rider-earnings/debts" },
  ];

  return (
    <div className="flex gap-2 mb-4">
      {tabs.map(t => {
        const active = location.pathname === t.path;
        return (
          <button key={t.path} onClick={() => navigate(t.path)}
            className={`px-4 py-[8px] rounded-[8px] text-[12px] font-semibold border cursor-pointer transition-all
              ${active ? "bg-brand-primary text-white border-brand-primary" : "bg-white text-brand-gray border-brand-border"}`}>
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
