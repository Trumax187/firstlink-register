import React, { useState } from "react";

export default function NewBorrower({ db, onCancel, onSave }) {
  const [v, setV] = useState({ name: "", phone: "", area: "", nrc: "" });
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value });
  const digits = normNrc(v.nrc).length;
  const clash = db.borrowers.find((b) => sameNrc(b.nrc, v.nrc));
  const ok = v.name.trim() && v.phone.trim() && digits === 9 && !clash;

  return (
    <Shell title="Register New Customer" onCancel={onCancel} saveLabel="Save and continue"
      ok={ok} onSave={() => onSave({ ...v, nrc: fmtNrc(v.nrc) })}>
      <Field label="Full name" id="bn" value={v.name} onChange={set("name")} />
      <div className="pb-two">
        <Field label="Phone" id="bp" value={v.phone} onChange={set("phone")} inputMode="tel" />
        <Field label="Area" id="ba" value={v.area} onChange={set("area")} />
      </div>
      <Field label="NRC number" id="bnrc" value={v.nrc} onChange={set("nrc")}
        inputMode="numeric" placeholder="284119/61/1" />
      {clash ? (
        <p className="pb-note pb-late">{clash.name} is already on the register with this NRC.</p>
      ) : digits > 0 && digits !== 9 ? (
        <p className="pb-note">An NRC has nine digits — {digits} entered so far.</p>
      ) : (
        <p className="pb-note">
          Checked against everyone already on the register, so the same person can't be entered twice.
        </p>
      )}
      <p className="pb-note">
        Saving takes you to their page, where you take in the item before the loan is issued.
      </p>
    </Shell>
  );
}

