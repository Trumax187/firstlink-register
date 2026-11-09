import React, { useState } from "react";

export default function NewItem({ db, prefill, onCancel, onSave }) {
  const fixed = prefill && prefill.borrowerId;
  const [v, setV] = useState({
    borrowerId: fixed || db.borrowers[0]?.id || "",
    desc: "", condition: "", value: "", location: "",
  });
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value });
  const who = db.borrowers.find((b) => b.id === v.borrowerId);

  if (db.borrowers.length === 0) {
    return (
      <>
        <button className="pb-back" onClick={onCancel}>? Back</button>
        <div className="pb-card" style={{ padding: 16 }}>
          <div className="pb-name">No borrowers yet.</div>
          <p className="pb-note">Add the borrower first — the item and the loan both hang off a person.</p>
        </div>
      </>
    );
  }

  return (
    <Shell title="Take in an item" onCancel={onCancel} saveLabel="Save and issue a loan"
      ok={v.desc.trim() && Number(v.value) > 0 && v.borrowerId}
      onSave={() => onSave({ ...v, value: Number(v.value) })}>
      {fixed ? (
        <div className="pb-field">
          <label>Brought in by</label>
          <div className="pb-fixed">{who ? who.name : "—"}</div>
        </div>
      ) : (
        <div className="pb-field">
          <label htmlFor="ib">Brought in by</label>
          <select id="ib" value={v.borrowerId} onChange={set("borrowerId")}>
           {db.borrowers.filter((b) => (b.name || "").toLowerCase().includes((searchQuery || "").toLowerCase())).map((b) => {
              return <option key={b.id} value={b.id}>{b.name}</option>;
            })}
          </select>
        </div>
      )}
      <Field label="What it is" id="id1" value={v.desc} onChange={set("desc")} placeholder="Make, model, distinguishing marks" />
      <Field label="Condition on arrival" id="id2" value={v.condition} onChange={set("condition")} />
      <div className="pb-two">
        <Field label="Value (K)" id="id3" value={v.value} onChange={set("value")} inputMode="decimal" />
        <Field label="Where it is kept" id="id4" value={v.location} onChange={set("location")} placeholder="Safe A, shelf 2" />
      </div>
    </Shell>
  );
}

