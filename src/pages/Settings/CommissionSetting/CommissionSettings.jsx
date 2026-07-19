import { useEffect, useState, useCallback } from "react";
import Loader from "../../../components/Loader";

const BASE  = "https://el-distibutor-backend.onrender.com";
const token = () => localStorage.getItem("adminToken");
const apiFetch = (path, opts = {}) =>
  fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
    ...opts,
  }).then(r => r.json());

const DEFAULTS = {
  platformCommission:  2,
  deliveryFee:         1,
  supplierPenalty:     2,
  buyerPaymentDays:    30,
  supplierPaymentDays: 60,
};

export default function CommissionSettings() {
  const [settings, setSettings] = useState(DEFAULTS);
  const [original, setOriginal] = useState(DEFAULTS);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState(null);
  const [success,  setSuccess]  = useState(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res  = await apiFetch("/api/admin/commission-settings");
      const data = { ...DEFAULTS, ...(res.data || {}) };
      setSettings(data); setOriginal(data);
    } catch { setError("Settings load nahi ho saki."); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const update = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSuccess(null); setError(null);
  };

  const handleSave = async () => {
    try {
      setSaving(true); setError(null);
      const res = await apiFetch("/api/admin/commission-settings", {
        method: "PUT",
        body:   JSON.stringify(settings),
      });
      if (!res.success) { setError(res.message || "Update fail ho gaya."); return; }
      const data = { ...DEFAULTS, ...(res.data || {}) };
      setSettings(data); setOriginal(data);
      setSuccess("Commission settings update ho gayi ✅");
    } catch (e) { setError("Update fail ho gaya."); }
    finally     { setSaving(false); }
  };

  const isDirty = JSON.stringify(settings) !== JSON.stringify(original);

  if (loading) return <Loader />;

  // ─── Reusable Row ────────────────────────────────────
  const Row = ({ label, hint, children }) => (
    <div className="flex items-start justify-between gap-4 flex-wrap py-5 border-b border-brand-border last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-bold text-brand-dark m-0">{label}</p>
        {hint && <p className="text-[12px] text-brand-muted mt-1 m-0">{hint}</p>}
      </div>
      <div className="flex items-center gap-3 shrink-0">{children}</div>
    </div>
  );

  // ─── Percent input ───────────────────────────────────
  const PercentInput = ({ value, onChange }) => (
    <div className="flex items-center gap-2">
      <input
        type="number" min="0" max="100" step="0.1"
        value={value}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        className="w-[90px] px-3 py-[9px] border border-brand-border rounded-[8px] text-[14px] outline-none bg-white focus:border-brand-primary transition-all text-center font-semibold"
      />
      <span className="text-[14px] font-bold text-brand-muted">%</span>
      <span className="text-[13px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-[5px] rounded-[8px] whitespace-nowrap">
        {value}% per order
      </span>
    </div>
  );

  // ─── Days input ──────────────────────────────────────
  const DaysInput = ({ value, onChange }) => (
    <div className="flex items-center gap-2">
      <input
        type="number" min="1" max="365" step="1"
        value={value}
        onChange={e => onChange(parseInt(e.target.value) || 1)}
        className="w-[90px] px-3 py-[9px] border border-brand-border rounded-[8px] text-[14px] outline-none bg-white focus:border-brand-primary transition-all text-center font-semibold"
      />
      <span className="text-[14px] font-bold text-brand-muted">days</span>
      <span className="text-[13px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-[5px] rounded-[8px] whitespace-nowrap">
        {value} din
      </span>
    </div>
  );

  // ─── Total buyer fee preview ─────────────────────────
  const totalBuyerFee = (settings.platformCommission + settings.deliveryFee).toFixed(1);

  return (
    <div className="max-w-[1500px]">

      {/* Header */}
      <div className="mb-5">
        <h1 className="text-[20px] md:text-[22px] ml-3 font-extrabold text-brand-dark m-0">Commission Settings</h1>
        <p className="text-[13px] text-brand-muted ml-3 mt-1">Platform fees, penalties aur payment windows control karein</p>
      </div>

      {/* Alerts */}
      {error   && <div className="px-4 py-3 rounded-[10px] text-[13px] font-semibold mb-4 bg-red-50 text-red-700 border border-red-200">{error}</div>}
      {success && <div className="px-4 py-3 rounded-[10px] text-[13px] font-semibold mb-4 bg-green-50 text-green-700 border border-green-200">{success}</div>}

      {/* Main Card */}
      <div className="bg-white border border-brand-border rounded-[20px] p-5 md:p-6">

        {/* Section heading */}
        <p className="text-[11px] font-bold text-brand-muted uppercase tracking-widest mb-1">Buyer Charges</p>

        <Row
          label="Platform Commission"
          hint="Har order pe buyer se liya jata hai — platform ka profit. Supplier ko yeh nahi milta."
        >
          <PercentInput value={settings.platformCommission} onChange={v => update("platformCommission", v)} />
        </Row>

        <Row
          label="Delivery Fee"
          hint="Har order pe buyer se liya jata hai — rider/delivery cost ke liye."
        >
          <PercentInput value={settings.deliveryFee} onChange={v => update("deliveryFee", v)} />
        </Row>

        {/* Total preview */}
        <div className="flex items-center justify-between px-4 py-3 bg-brand-lighter rounded-[10px] mb-2 mt-1">
          <p className="text-[13px] text-brand-gray m-0">Total buyer pe add hoga (Commission + Delivery)</p>
          <span className="text-[14px] font-extrabold text-brand-primary">{totalBuyerFee}% per order</span>
        </div>

        {/* Section heading */}
        <p className="text-[11px] font-bold text-brand-muted uppercase tracking-widest mt-5 mb-1">Return Penalty</p>

        <Row
          label="Supplier Late Penalty"
          hint="Jab return order supplier ki galti se hota hai — supplier ke invoice se yeh % kata jata hai."
        >
          <PercentInput value={settings.supplierPenalty} onChange={v => update("supplierPenalty", v)} />
        </Row>

        {/* Section heading */}
        <p className="text-[11px] font-bold text-brand-muted uppercase tracking-widest mt-5 mb-1">Payment Windows</p>

        <Row
          label="Buyer Payment Days"
          hint="Buyer ke paas invoice milne ke baad kitne din mein payment karni hai."
        >
          <DaysInput value={settings.buyerPaymentDays} onChange={v => update("buyerPaymentDays", v)} />
        </Row>

        <Row
          label="Supplier Payment Days"
          hint="Admin ko supplier ko kitne din mein payment release karni hai (buyer payment ke baad)."
        >
          <DaysInput value={settings.supplierPaymentDays} onChange={v => update("supplierPaymentDays", v)} />
        </Row>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-5">
          <button
            onClick={() => { setSettings(original); setError(null); setSuccess(null); }}
            disabled={!isDirty || saving}
            className="px-5 py-2 bg-white text-brand-gray border border-brand-border rounded-[8px] text-[14px] font-semibold cursor-pointer disabled:opacity-50"
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={!isDirty || saving}
            className="px-5 py-2 bg-brand-primary text-white rounded-[8px] text-[14px] font-bold border-none cursor-pointer shadow-[0_4px_12px_rgba(241,90,33,0.3)] disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
