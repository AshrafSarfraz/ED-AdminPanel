// 📁 pages/paymentRecords/Rider/RiderPayModal.jsx
// Shared "Confirm Payment" modal — Months list aur Detail screen dono use karte hain
const fmtAmt = (n) => n != null ? `QAR ${Number(n).toLocaleString("en", { minimumFractionDigits: 2 })}` : "—";

export default function RiderPayModal({ payModal, setPayModal, payNote, setPayNote, payRef, setPayRef, paying, onConfirm }) {
  if (!payModal) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] px-4">
      <div className="bg-white rounded-[20px] p-6 w-full max-w-[440px] shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
        <h3 className="text-[16px] font-bold text-brand-dark m-0 mb-1">Confirm Rider Payment</h3>
        <p className="text-[12px] text-brand-gray mb-1">{payModal.label}</p>
        <p className="text-[20px] font-extrabold text-brand-primary mb-4">{fmtAmt(payModal.amount)}</p>
        <div className="flex flex-col gap-3 mb-4">
          <input placeholder="Transaction Ref / Cheque No (optional)" value={payRef} onChange={e => setPayRef(e.target.value)}
            className="w-full px-4 py-[10px] border border-brand-border rounded-[8px] text-[12px] outline-none focus:border-brand-primary transition-all" />
          <input placeholder="Note (optional)" value={payNote} onChange={e => setPayNote(e.target.value)}
            className="w-full px-4 py-[10px] border border-brand-border rounded-[8px] text-[12px] outline-none focus:border-brand-primary transition-all" />
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-[8px] p-3 mb-4">
          <p className="text-[11px] text-amber-700 m-0">⚠️ This marks this month's earnings and debts for this rider company as settled.</p>
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={() => { setPayModal(null); setPayNote(""); setPayRef(""); }}
            className="px-4 py-2 bg-gray-100 text-brand-gray border-none rounded-[8px] text-[12px] cursor-pointer">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={paying}
            className="px-4 py-2 bg-brand-primary text-white border-none rounded-[8px] text-[12px] font-bold cursor-pointer disabled:opacity-60">
            {paying ? "Processing…" : "Confirm Payment"}
          </button>
        </div>
      </div>
    </div>
  );
}
