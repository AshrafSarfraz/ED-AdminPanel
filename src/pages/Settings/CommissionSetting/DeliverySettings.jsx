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
  pickupStartHour:     10,
  pickupEndHour:       12,
  deliverDeadlineHour: 20,
  graceHour:           21,
};

const pad   = (n) => String(n).padStart(2, "0");
const to12h = (h) => {
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:00 ${period}`;
};

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function DeliverySettings() {
  const [settings, setSettings] = useState(DEFAULTS);
  const [original, setOriginal] = useState(DEFAULTS);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState(null);
  const [success,  setSuccess]  = useState(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res  = await apiFetch("/api/admin/delivery-settings");
      const data = { ...DEFAULTS, ...(res.data || {}) };
      setSettings(data); setOriginal(data);
    } catch { setError("Failed to load settings."); }
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
      const res = await apiFetch("/api/admin/delivery-settings", {
        method: "PUT",
        body:   JSON.stringify(settings),
      });
      if (!res.success) { setError(res.message || "Failed to update settings."); return; }
      const data = { ...DEFAULTS, ...(res.data || {}) };
      setSettings(data); setOriginal(data);
      setSuccess("Delivery settings updated successfully ✅");
    } catch { setError("Failed to update settings."); }
    finally  { setSaving(false); }
  };

  const isDirty = JSON.stringify(settings) !== JSON.stringify(original);

  if (loading) return <Loader />;

  const Row = ({ label, hint, children }) => (
    <div className="flex items-start justify-between gap-4 flex-wrap py-5 border-b border-brand-border last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-bold text-brand-dark m-0">{label}</p>
        {hint && <p className="text-[12px] text-brand-muted mt-1 m-0">{hint}</p>}
      </div>
      <div className="flex items-center gap-3 shrink-0">{children}</div>
    </div>
  );

  const HourSelect = ({ value, onChange }) => (
    <div className="flex items-center gap-2">
      <select
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="px-3 py-[9px] border border-brand-border rounded-[8px] text-[14px] outline-none bg-white focus:border-brand-primary transition-all"
      >
        {HOURS.map(h => <option key={h} value={h}>{pad(h)}:00</option>)}
      </select>
      <span className="text-[13px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-[5px] rounded-[8px] whitespace-nowrap">
        {to12h(value)}
      </span>
    </div>
  );

  return (
    <div className="max-w-[1500px]">

      {/* Header */}
      <div className="mb-5">
        <h1 className="text-[20px] md:text-[22px] ml-3 font-extrabold text-brand-dark m-0">Delivery Settings</h1>
        <p className="text-[13px] text-brand-muted ml-3 mt-1">Control pickup window and delivery deadlines <b>(Qatar time / UTC+3)</b></p>
      </div>

      {/* Alerts */}
      {error   && <div className="px-4 py-3 rounded-[10px] text-[13px] font-semibold mb-4 bg-red-50 text-red-700 border border-red-200">{error}</div>}
      {success && <div className="px-4 py-3 rounded-[10px] text-[13px] font-semibold mb-4 bg-green-50 text-green-700 border border-green-200">{success}</div>}

      {/* Main Card */}
      <div className="bg-white border border-brand-border rounded-[20px] p-5 md:p-6">

        {/* Supplier Window */}
        <p className="text-[11px] font-bold text-brand-muted uppercase tracking-widest mb-1">Supplier Pickup Window</p>

        <Row
          label="Pickup Start Hour"
          hint="Rider starts picking up orders from suppliers at this time."
        >
          <HourSelect value={settings.pickupStartHour} onChange={v => update("pickupStartHour", v)} />
        </Row>

        <Row
          label="Pickup End Hour (Supplier Deadline)"
          hint="Supplier must mark order ready before this time. After this = marked as LATE."
        >
          <HourSelect value={settings.pickupEndHour} onChange={v => update("pickupEndHour", v)} />
        </Row>

        {/* Timeline preview */}
        <div className="flex items-center gap-2 px-4 py-3 bg-brand-lighter rounded-[10px] mb-2 mt-1 flex-wrap">
          <span className="text-[12px] text-brand-gray">Supplier pickup window:</span>
          <span className="text-[13px] font-extrabold text-brand-primary">{to12h(settings.pickupStartHour)} → {to12h(settings.pickupEndHour)}</span>
        </div>

        {/* Rider Window */}
        <p className="text-[11px] font-bold text-brand-muted uppercase tracking-widest mt-5 mb-1">Rider Delivery Window</p>

        <Row
          label="Delivery Deadline Hour"
          hint="Rider must complete all deliveries by this time. After this = rider marked as late."
        >
          <HourSelect value={settings.deliverDeadlineHour} onChange={v => update("deliverDeadlineHour", v)} />
        </Row>

        <Row
          label="Grace Hour"
          hint="Final cutoff — after this time the delivery day is considered closed."
        >
          <HourSelect value={settings.graceHour} onChange={v => update("graceHour", v)} />
        </Row>

        {/* Timeline preview */}
        <div className="flex items-center gap-2 px-4 py-3 bg-brand-lighter rounded-[10px] mb-2 mt-1 flex-wrap">
          <span className="text-[12px] text-brand-gray">Rider delivery window:</span>
          <span className="text-[13px] font-extrabold text-brand-primary">{to12h(settings.pickupEndHour)} → {to12h(settings.deliverDeadlineHour)}</span>
          <span className="text-[12px] text-brand-gray ml-2">Grace until:</span>
          <span className="text-[13px] font-semibold text-amber-700">{to12h(settings.graceHour)}</span>
        </div>

        {/* Full day timeline */}
        <div className="mt-4 px-4 py-3 bg-gray-50 border border-brand-border rounded-[10px]">
          <p className="text-[11px] font-bold text-brand-muted uppercase tracking-widest mb-3">Full Day Timeline</p>
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { label: "Pickup Start",  value: to12h(settings.pickupStartHour),     color: "bg-blue-100 text-blue-700"   },
              { label: "→", value: null, color: "text-brand-muted text-[16px]"      },
              { label: "Supplier Deadline", value: to12h(settings.pickupEndHour),   color: "bg-amber-100 text-amber-700" },
              { label: "→", value: null, color: "text-brand-muted text-[16px]"      },
              { label: "Delivery Deadline", value: to12h(settings.deliverDeadlineHour), color: "bg-orange-100 text-orange-700" },
              { label: "→", value: null, color: "text-brand-muted text-[16px]"      },
              { label: "Grace End",    value: to12h(settings.graceHour),            color: "bg-red-100 text-red-700"     },
            ].map((item, i) => (
              item.value === null
                ? <span key={i} className={item.color}>→</span>
                : <div key={i} className={`px-3 py-[5px] rounded-[8px] text-[11px] font-semibold ${item.color}`}>
                    <span className="block text-[10px] opacity-70">{item.label}</span>
                    {item.value}
                  </div>
            ))}
          </div>
        </div>

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
