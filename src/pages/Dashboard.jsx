

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StatCard from "../components/StatCard";
import Loader from "../components/Loader";

const BASE  = "https://el-distibutor-backend.onrender.com";
const token = () => localStorage.getItem("adminToken");

const apiFetch = (path) =>
  fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${token()}` },
  }).then(r => r.json());

// ── Shared panel class ────────────────────────────────────────────────────────
const PANEL = `
  bg-gradient-to-br from-[#FFF1DD] via-[#FFF8EF] to-white
  border border-[#f5dfc7]
  rounded-[20px] p-6
  shadow-[0_4px_20px_rgba(241,90,33,0.06)]
  mb-5
`.trim();

export default function Dashboard() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    apiFetch("/api/admin/dashboard")
      .then(res => { if (res.success) setData(res.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  if (!data) return (
    <div className="flex justify-center items-center h-[60vh] text-brand-orange text-sm">
      Failed to load
    </div>
  );

  const maxOrders = Math.max(...data.chart.map(d => d.orders), 1);
  const maxBranch = Math.max(data.branches.supplier, data.branches.buyer, data.branches.pending, 1);

  return (
    <div className="max-w-[1500px]  ">

      {/* ── Stat Cards: 1col → 2col → 4col ── */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
          <StatCard icon="handshake" value={data.partners.pending.toLocaleString()} label="Partner Requests"
          sub={`${data.partners.total} total partners`} subColor="#8b5cf6"
          onClick={() => navigate("/partners")} />  
        <StatCard icon="building" value={data.companies.total.toLocaleString()} label="Total Companies"
          sub={`${data.companies.pendingDocuments} docs pending`} subColor="#f59e0b"
          onClick={() => navigate("/companies")} />
        <StatCard icon="mappin" value={data.branches.total.toLocaleString()} label="Total Branches"
          sub={`${data.branches.pending} pending approval`} subColor="#f59e0b"
          onClick={() => navigate("/branches")} />
           <StatCard icon="coins" value={`${Number(data.revenue.total).toLocaleString()} QAR`} label="Platform Revenue"
          sub={`${Number(data.revenue.commission).toLocaleString()} QAR commission`} subColor="#16a34a"
          onClick={() => navigate("/payments/revenue")} />
            <StatCard icon="xcircle" value={(data.returns?.pending ?? 0).toLocaleString()} label="Return Requests"
          sub={`${data.returns?.total ?? 0} total returns`} subColor="#dc2626"
          onClick={() => navigate("/return-orders")} />
           <StatCard icon="check" value={(data.receipts?.pending ?? 0).toLocaleString()} label="Pending Approvals"
          sub="Payment receipts awaiting review" subColor="#f59e0b"
          onClick={() => navigate("/payments/ReceiptsApprovalList")} />
        <StatCard icon="cart" value={data.orders.today.toLocaleString()} label="Orders Today"
          sub={`${data.orders.total.toLocaleString()} total orders`} subColor="#16a34a"
          onClick={() => navigate("/AdminOrders")} />
        <StatCard icon="file" value={data.invoices.unpaid.toLocaleString()} label="Unpaid Invoices"
          sub={`${data.invoices.total} total invoices`} subColor="#dc2626"
          onClick={() => navigate("/payments/buyers")} />
       
      </div>

      {/* ── Branch Breakdown + Chart: stack on mobile, side-by-side on desktop ── */}
      <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">

        {/* Branch Breakdown */}
        <div className={`${PANEL} lg:flex-1`}>
          <h3 className="text-[15px] font-bold text-gray-900 mb-5">Branch Breakdown</h3>
          {[
            { label: "Supplier Branches", val: data.branches.supplier, color: "#F15A21" },
            { label: "Buyer Branches",    val: data.branches.buyer,    color: "#F15A21" },
            { label: "Pending Approval",  val: data.branches.pending,  color: "#f59e0b" },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3 mb-[14px]">
              <span className="text-[13px] text-gray-600 w-[130px] shrink-0">{item.label}</span>
              <div className="flex-1 h-[7px] bg-[#f5dfc7] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    background: item.color,
                    width: `${Math.round((item.val / maxBranch) * 100)}%`,
                  }}
                />
              </div>
              <span className="text-[15px] font-extrabold min-w-[24px] text-right" style={{ color: item.color }}>
                {item.val}
              </span>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className={`${PANEL} lg:flex-[2]`}>
          <h3 className="text-[15px] font-bold text-gray-900 mb-5">Orders — Last 7 Days</h3>
          <div className="flex items-end gap-1 sm:gap-[10px] h-[110px]">
            {data.chart.map(d => (
              <div key={d.date} className="flex flex-col items-center flex-1 gap-1 min-w-0">
                <div className="flex-1 w-full flex items-end">
                  <div
                    className="w-full min-h-[4px] rounded-t-md transition-all duration-300"
                    style={{
                      height: `${Math.round((d.orders / maxOrders) * 100)}%`,
                      background: d.orders > 0
                        ? "linear-gradient(180deg, #F15A21, #ff7a3d)"
                        : "#f5dfc7",
                    }}
                  />
                </div>
                <span className="text-[9px] sm:text-[10px] text-gray-400 truncate w-full text-center leading-tight">
                  {d.date}
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold text-brand-orange">
                  {d.orders}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className={PANEL}>
        <h3 className="text-[15px] font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-[10px]">
          {[
            { label: "Approve Branches",  path: "/branches"  },
            { label: "Review Documents",  path: "/companies" },
            { label: "Partner Requests",  path: "/partners"  },
            { label: "View Invoices",     path: "/payments/buyers"  },
            { label: "Manage Admins",     path: "/admins"    },
          ].map(a => (
            <button
              key={a.label}
              onClick={() => navigate(a.path)}
              className="
                px-4 py-[9px]
                bg-white border-[1.5px] border-[#f5dfc7]
                rounded-[10px] text-[12px] sm:text-[13px] font-semibold text-gray-700
                cursor-pointer transition-all duration-150
                hover:border-brand-orange hover:text-brand-orange hover:bg-[#fff7f0]
              "
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
