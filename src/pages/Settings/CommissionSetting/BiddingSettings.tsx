

// import React, { useEffect, useState, useCallback } from "react";
// import API from "../../../api/axios";
// import Loader from "../../../components/Loader";

// const DEFAULTS = {
//   BIDDING_START_HOUR:  15,
//   BIDDING_START_MIN:   45,
//   WINNER_HOUR:         15,
//   WINNER_MIN:          58,
//   BIDDING_CUTOFF_HOUR: 18,
// };

// const pad   = (n) => String(n).padStart(2, "0");
// const to12h = (h, m = 0) => {
//   const period = h >= 12 ? "PM" : "AM";
//   const hour12 = h % 12 === 0 ? 12 : h % 12;
//   return `${hour12}:${pad(m)} ${period}`;
// };

// const HOURS   = Array.from({ length: 24 }, (_, i) => i);
// const MINUTES = Array.from({ length: 60 }, (_, i) => i);

// export default function BiddingSettings() {
//   const [settings, setSettings] = useState(DEFAULTS);
//   const [original, setOriginal] = useState(DEFAULTS);
//   const [loading,  setLoading]  = useState(true);
//   const [saving,   setSaving]   = useState(false);
//   const [error,    setError]    = useState(null);
//   const [success,  setSuccess]  = useState(null);

//   const fetchSettings = useCallback(async () => {
//     try {
//       setLoading(true);
//       const res  = await API.get("/admin/bidding-settings");
//       const data = { ...DEFAULTS, ...(res.data?.data || {}) };
//       setSettings(data); setOriginal(data);
//     } catch { setError("Failed to load settings."); }
//     finally  { setLoading(false); }
//   }, []);

//   useEffect(() => { fetchSettings(); }, [fetchSettings]);

//   const update = (key, value) => {
//     setSettings(prev => ({ ...prev, [key]: value }));
//     setSuccess(null); setError(null);
//   };

//   const validate = () => {
//     const startMins  = settings.BIDDING_START_HOUR * 60 + settings.BIDDING_START_MIN;
//     const winnerMins = settings.WINNER_HOUR * 60 + settings.WINNER_MIN;
//     if (winnerMins <= startMins) return "Winner time bidding start time ke baad honi chahiye.";
//     if (settings.BIDDING_CUTOFF_HOUR > settings.BIDDING_START_HOUR)
//       return "Order cutoff hour bidding start hour se zyada nahi ho sakta.";
//     return null;
//   };

//   const handleSave = async () => {
//     const err = validate();
//     if (err) { setError(err); setSuccess(null); return; }
//     try {
//       setSaving(true); setError(null);
//       const res  = await API.put("/admin/bidding-settings", settings);
//       const data = { ...DEFAULTS, ...(res.data?.data || {}) };
//       setSettings(data); setOriginal(data);
//       setSuccess("Bidding schedule updated successfully");
//     } catch (e) { setError(e?.response?.data?.message || "Failed to update settings."); }
//     finally     { setSaving(false); }
//   };

//   const isDirty    = JSON.stringify(settings) !== JSON.stringify(original);
//   const startCron  = `${settings.BIDDING_START_MIN} ${settings.BIDDING_START_HOUR} * * *`;
//   const winnerCron = `${settings.WINNER_MIN} ${settings.WINNER_HOUR} * * *`;

//   if (loading) return <Loader />;

//   const Row = ({ label, hint, children }) => (
//     <div className="flex items-start justify-between gap-4 flex-wrap py-5 border-b border-brand-border last:border-0">
//       <div className="flex-1 min-w-0">
//         <p className="text-[14px] font-bold text-brand-dark m-0">{label}</p>
//         {hint && <p className="text-[12px] text-brand-muted mt-1 m-0">{hint}</p>}
//       </div>
//       <div className="flex items-center gap-3 shrink-0">{children}</div>
//     </div>
//   );

//   const TimeSelect = ({ hour, minute, onHour, onMinute, preview }) => (
//     <>
//       <div className="flex items-center gap-2">
//         <select value={hour} onChange={e => onHour(Number(e.target.value))}
//           className="px-3 py-[9px] border border-brand-border rounded-[8px] text-[14px] outline-none bg-white focus:border-brand-primary transition-all">
//           {HOURS.map(h => <option key={h} value={h}>{pad(h)}</option>)}
//         </select>
//         <span className="text-brand-muted font-bold">:</span>
//         <select value={minute} onChange={e => onMinute(Number(e.target.value))}
//           className="px-3 py-[9px] border border-brand-border rounded-[8px] text-[14px] outline-none bg-white focus:border-brand-primary transition-all">
//           {MINUTES.map(m => <option key={m} value={m}>{pad(m)}</option>)}
//         </select>
//       </div>
//       <span className="text-[13px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-[5px] rounded-[8px] whitespace-nowrap">
//         {preview}
//       </span>
//     </>
//   );

//   return (
//     <div className="max-w-[1500px] ">

//       {/* Header */}
//       <div className="mb-5">
//         <h1 className="text-[20px] md:text-[22px] ml-3  font-extrabold text-brand-dark m-0">Bidding Settings</h1>
//         <p className="text-[13px] text-brand-muted ml-3 mt-1"><b>Qatar time (AST / UTC+3)</b></p>
//       </div>

//       {/* Alerts */}
//       {error   && <div className="px-4 py-3 rounded-[10px] text-[13px] font-semibold mb-4 bg-red-50 text-red-700 border border-red-200">{error}</div>}
//       {success && <div className="px-4 py-3 rounded-[10px] text-[13px] font-semibold mb-4 bg-green-50 text-green-700 border border-green-200">{success}</div>}

//       {/* Single Container */}
//       <div className="bg-white border border-brand-border rounded-[20px] p-5 md:p-6 ">

//         {/* Bidding Start */}
//         <Row label="Bidding Start Time" hint="Is waqt pending orders group ho kar bidding mein chale jate hain.">
//           <TimeSelect
//             hour={settings.BIDDING_START_HOUR} minute={settings.BIDDING_START_MIN}
//             onHour={v => update("BIDDING_START_HOUR", v)} onMinute={v => update("BIDDING_START_MIN", v)}
//             preview={to12h(settings.BIDDING_START_HOUR, settings.BIDDING_START_MIN)}
//           />
//         </Row>

//         {/* Winner Select */}
//         <Row label="Winner Select Time" hint="Is waqt lowest bid jeet jati hai aur invoices ban jati hain.">
//           <TimeSelect
//             hour={settings.WINNER_HOUR} minute={settings.WINNER_MIN}
//             onHour={v => update("WINNER_HOUR", v)} onMinute={v => update("WINNER_MIN", v)}
//             preview={to12h(settings.WINNER_HOUR, settings.WINNER_MIN)}
//           />
//         </Row>

//         {/* Order Cutoff */}
//         <Row label="Order Cutoff Hour" hint="Is hour se pehle place hua order aaj ki bidding mein jata hai, baad wala kal ki.">
//           <select
//             value={settings.BIDDING_CUTOFF_HOUR}
//             onChange={e => update("BIDDING_CUTOFF_HOUR", Number(e.target.value))}
//             className="px-3 py-[9px] border border-brand-border rounded-[8px] text-[14px] outline-none bg-white focus:border-brand-primary transition-all"
//           >
//             {HOURS.map(h => <option key={h} value={h}>{to12h(h)}</option>)}
//           </select>
//         </Row>

//         {/* Cron Preview */}
//         <Row label="Cron Preview" hint="Backend pe yeh cron expressions schedule honge.">
//           <div className="flex flex-col gap-2">
//             {[["Start cron", startCron], ["Winner cron", winnerCron]].map(([lbl, val]) => (
//               <div key={lbl} className="flex items-center gap-3">
//                 <span className="text-[12px] text-brand-muted w-[80px]">{lbl}</span>
//                 <code className="text-[13px] font-mono text-brand-dark bg-gray-100 px-3 py-[4px] rounded-[6px]">{val}</code>
//               </div>
//             ))}
//           </div>
//         </Row>

//         {/* Actions */}
//         <div className="flex justify-end gap-3 pt-5">
//           <button
//             onClick={() => { setSettings(original); setError(null); setSuccess(null); }}
//             disabled={!isDirty || saving}
//             className="px-5 py-2 bg-white text-brand-gray border border-brand-border rounded-[8px] text-[14px] font-semibold cursor-pointer "
//           >
//             Reset
//           </button>
//           <button
//             onClick={handleSave}
//             disabled={!isDirty || saving}
//             className="px-5 py-2 bg-brand-primary text-white rounded-[8px] text-[14px] font-bold border-none cursor-pointer shadow-[0_4px_12px_rgba(241,90,33,0.3)]"
//           >
//             {saving ? "Saving…" : "Save Changes"}
//           </button>
//         </div>

//       </div>
//     </div>
//   );
// }




import React, { useEffect, useState, useCallback } from "react";
import API from "../../../api/axios";
import Loader from "../../../components/Loader";

const DEFAULTS = {
  BIDDING_START_HOUR:  15,
  BIDDING_START_MIN:   45,
  WINNER_HOUR:         15,
  WINNER_MIN:          58,
  BIDDING_CUTOFF_HOUR: 18,
};

const pad   = (n) => String(n).padStart(2, "0");
const to12h = (h, m = 0) => {
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${pad(m)} ${period}`;
};

const HOURS   = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

export default function BiddingSettings() {
  const [settings, setSettings] = useState(DEFAULTS);
  const [original, setOriginal] = useState(DEFAULTS);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState(null);
  const [success,  setSuccess]  = useState(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res  = await API.get("/admin/bidding-settings");
      const data = { ...DEFAULTS, ...(res.data?.data || {}) };
      setSettings(data); setOriginal(data);
    } catch { setError("Failed to load settings."); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const update = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSuccess(null); setError(null);
  };

  const validate = () => {
    const startMins  = settings.BIDDING_START_HOUR * 60 + settings.BIDDING_START_MIN;
    const winnerMins = settings.WINNER_HOUR * 60 + settings.WINNER_MIN;
    if (winnerMins <= startMins) return "Winner time bidding start time ke baad honi chahiye.";
    if (settings.BIDDING_CUTOFF_HOUR > settings.BIDDING_START_HOUR)
      return "Order cutoff hour bidding start hour se zyada nahi ho sakta.";
    return null;
  };

  const handleSave = async () => {
    const err = validate();
    if (err) { setError(err); setSuccess(null); return; }
    try {
      setSaving(true); setError(null);
      const res  = await API.put("/admin/bidding-settings", settings);
      const data = { ...DEFAULTS, ...(res.data?.data || {}) };
      setSettings(data); setOriginal(data);
      setSuccess("Bidding schedule updated successfully");
    } catch (e) { setError(e?.response?.data?.message || "Failed to update settings."); }
    finally     { setSaving(false); }
  };

  const isDirty    = JSON.stringify(settings) !== JSON.stringify(original);
  const startCron  = `${settings.BIDDING_START_MIN} ${settings.BIDDING_START_HOUR} * * *`;
  const winnerCron = `${settings.WINNER_MIN} ${settings.WINNER_HOUR} * * *`;

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

  const TimeSelect = ({ hour, minute, onHour, onMinute, preview }) => (
    <>
      <div className="flex items-center gap-2">
        <select value={hour} onChange={e => onHour(Number(e.target.value))}
          className="px-3 py-[9px] border border-brand-border rounded-[8px] text-[14px] outline-none bg-white focus:border-brand-primary transition-all">
          {HOURS.map(h => <option key={h} value={h}>{pad(h)}</option>)}
        </select>
        <span className="text-brand-muted font-bold">:</span>
        <select value={minute} onChange={e => onMinute(Number(e.target.value))}
          className="px-3 py-[9px] border border-brand-border rounded-[8px] text-[14px] outline-none bg-white focus:border-brand-primary transition-all">
          {MINUTES.map(m => <option key={m} value={m}>{pad(m)}</option>)}
        </select>
      </div>
      <span className="text-[13px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-[5px] rounded-[8px] whitespace-nowrap">
        {preview}
      </span>
    </>
  );

  return (
    <div className="max-w-[1500px] ">

      {/* Header */}
      <div className="mb-5">
        <h1 className="text-[20px] md:text-[22px] ml-3  font-extrabold text-brand-dark m-0">Bidding Settings</h1>
        <p className="text-[13px] text-brand-muted ml-3 mt-1"><b>Qatar time (AST / UTC+3)</b></p>
      </div>

      {/* Alerts */}
      {error   && <div className="px-4 py-3 rounded-[10px] text-[13px] font-semibold mb-4 bg-red-50 text-red-700 border border-red-200">{error}</div>}
      {success && <div className="px-4 py-3 rounded-[10px] text-[13px] font-semibold mb-4 bg-green-50 text-green-700 border border-green-200">{success}</div>}

      {/* Single Container */}
      <div className="bg-white border border-brand-border rounded-[20px] p-5 md:p-6 ">

        {/* Bidding Start */}
        <Row label="Bidding Start Time" hint="At this time, pending orders are grouped and moved into bidding.">
          <TimeSelect
            hour={settings.BIDDING_START_HOUR} minute={settings.BIDDING_START_MIN}
            onHour={v => update("BIDDING_START_HOUR", v)} onMinute={v => update("BIDDING_START_MIN", v)}
            preview={to12h(settings.BIDDING_START_HOUR, settings.BIDDING_START_MIN)}
          />
        </Row>

        {/* Winner Select */}
        <Row label="Winner Select Time" hint="At this time, the lowest bid wins and invoices are generated.">
          <TimeSelect
            hour={settings.WINNER_HOUR} minute={settings.WINNER_MIN}
            onHour={v => update("WINNER_HOUR", v)} onMinute={v => update("WINNER_MIN", v)}
            preview={to12h(settings.WINNER_HOUR, settings.WINNER_MIN)}
          />
        </Row>

        {/* Order Cutoff */}
        <Row label="Order Cutoff Hour" hint="Orders placed before this hour are included in today's bidding; orders placed after this hour are included in tomorrow's bidding.">
          <select
            value={settings.BIDDING_CUTOFF_HOUR}
            onChange={e => update("BIDDING_CUTOFF_HOUR", Number(e.target.value))}
            className="px-3 py-[9px] border border-brand-border rounded-[8px] text-[14px] outline-none bg-white focus:border-brand-primary transition-all"
          >
            {HOURS.map(h => <option key={h} value={h}>{to12h(h)}</option>)}
          </select>
        </Row>

        {/* Cron Preview */}
        <Row label="Cron Preview" hint="These cron expressions will be scheduled on the backend.">
          <div className="flex flex-col gap-2">
            {[["Start cron", startCron], ["Winner cron", winnerCron]].map(([lbl, val]) => (
              <div key={lbl} className="flex items-center gap-3">
                <span className="text-[12px] text-brand-muted w-[80px]">{lbl}</span>
                <code className="text-[13px] font-mono text-brand-dark bg-gray-100 px-3 py-[4px] rounded-[6px]">{val}</code>
              </div>
            ))}
          </div>
        </Row>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-5">
          <button
            onClick={() => { setSettings(original); setError(null); setSuccess(null); }}
            disabled={!isDirty || saving}
            className="px-5 py-2 bg-white text-brand-gray border border-brand-border rounded-[8px] text-[14px] font-semibold cursor-pointer "
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={!isDirty || saving}
            className="px-5 py-2 bg-brand-primary text-white rounded-[8px] text-[14px] font-bold border-none cursor-pointer shadow-[0_4px_12px_rgba(241,90,33,0.3)]"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>

      </div>
    </div>
  );
}