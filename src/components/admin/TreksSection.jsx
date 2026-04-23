import { useState, useEffect } from "react";
import { treksService } from "../../services/api";
import ImageUpload from "../ui/ImageUpload";

const DIFFICULTIES = ["Easy", "Moderate", "Moderate–Hard", "Hard"];
const REGIONS = ["Khumbu", "Gandaki", "Bagmati", "Eastern Nepal", "Karnali", "Mustang", "Other"];
const COLORS = ["#2D6A4F", "#5E6BAD", "#C05621", "#2E7A8A", "#8B6914", "#7C3D87", "#2D5A8E", "#1E6E8A", "#6B3FA0", "#7A4030", "#4A7A50", "#3D8A68"];

const EMPTY_FORM = {
  name: "", region: "", difficulty: "Moderate", minDays: "", maxDays: "",
  altitude: "", altitudeM: "", season: "", bestMonths: "", guideFrom: "",
  color: "#2D6A4F", restricted: false, desc: "", photo: "",
  tags: "", highlights: ["", "", "", ""],
  permits: [{ name: "", cost: "" }],
};

function Label({ children, required }) {
  return (
    <label className="block text-[11.5px] font-semibold text-stone-500 uppercase tracking-[0.1em] mb-1.5">
      {children}{required && <span className="text-red-400 ml-1">*</span>}
    </label>
  );
}

function Input({ value, onChange, placeholder, type = "text", className = "" }) {
  return (
    <input
      type={type} value={value} onChange={onChange} placeholder={placeholder}
      className={`w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-[13.5px] text-stone-800 outline-none transition-all placeholder:text-stone-400 focus:border-forest-400 focus:ring-2 focus:ring-forest-100 ${className}`}
    />
  );
}

function Select({ value, onChange, options }) {
  return (
    <select
      value={value} onChange={onChange}
      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-[13.5px] text-stone-800 outline-none cursor-pointer focus:border-forest-400 focus:ring-2 focus:ring-forest-100"
    >
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function TrekForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState(() => {
    if (!initial) return EMPTY_FORM;
    return {
      ...initial,
      tags: (initial.tags ?? []).join(", "),
      highlights: [...(initial.highlights ?? []), "", "", "", ""].slice(0, 4),
      permits: initial.permits?.length ? initial.permits.map((p) => ({ name: p.name, cost: String(p.cost) })) : [{ name: "", cost: "" }],
      minDays: String(initial.minDays ?? ""),
      maxDays: String(initial.maxDays ?? ""),
      altitudeM: String(initial.altitudeM ?? ""),
      guideFrom: String(initial.guideFrom ?? ""),
    };
  });

  const set = (field, val) => setForm((f) => ({ ...f, [field]: val }));
  const setHighlight = (i, val) => setForm((f) => { const h = [...f.highlights]; h[i] = val; return { ...f, highlights: h }; });
  const setPermit = (i, field, val) => setForm((f) => { const p = [...f.permits]; p[i] = { ...p[i], [field]: val }; return { ...f, permits: p }; });
  const addPermit = () => setForm((f) => ({ ...f, permits: [...f.permits, { name: "", cost: "" }] }));
  const removePermit = (i) => setForm((f) => ({ ...f, permits: f.permits.filter((_, idx) => idx !== i) }));

  function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      ...form,
      minDays: Number(form.minDays),
      maxDays: Number(form.maxDays),
      altitudeM: Number(form.altitudeM),
      guideFrom: Number(form.guideFrom),
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      highlights: form.highlights.filter(Boolean),
      permits: form.permits.filter((p) => p.name).map((p) => ({ name: p.name, cost: Number(p.cost) })),
    };
    onSave(payload);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Row 1: Name + Region */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label required>Trek Name</Label>
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Everest Base Camp" />
        </div>
        <div>
          <Label required>Region</Label>
          <Select value={form.region || REGIONS[0]} onChange={(e) => set("region", e.target.value)} options={REGIONS} />
        </div>
      </div>

      {/* Row 2: Difficulty + Restricted */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label required>Difficulty</Label>
          <Select value={form.difficulty} onChange={(e) => set("difficulty", e.target.value)} options={DIFFICULTIES} />
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              onClick={() => set("restricted", !form.restricted)}
              className={`w-10 h-5 rounded-full transition-colors relative ${form.restricted ? "bg-forest-500" : "bg-stone-300"}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.restricted ? "translate-x-5" : "translate-x-0.5"}`} />
            </div>
            <span className="text-[13px] font-medium text-stone-700">Restricted Area Permit Required</span>
          </label>
        </div>
      </div>

      {/* Row 3: Days */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <Label required>Min Days</Label>
          <Input type="number" value={form.minDays} onChange={(e) => set("minDays", e.target.value)} placeholder="7" />
        </div>
        <div>
          <Label required>Max Days</Label>
          <Input type="number" value={form.maxDays} onChange={(e) => set("maxDays", e.target.value)} placeholder="10" />
        </div>
        <div>
          <Label required>Altitude (display)</Label>
          <Input value={form.altitude} onChange={(e) => set("altitude", e.target.value)} placeholder="3,870m" />
        </div>
        <div>
          <Label required>Altitude (metres)</Label>
          <Input type="number" value={form.altitudeM} onChange={(e) => set("altitudeM", e.target.value)} placeholder="3870" />
        </div>
      </div>

      {/* Row 4: Season + Best months + Price */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <Label required>Season</Label>
          <Input value={form.season} onChange={(e) => set("season", e.target.value)} placeholder="Oct–Nov, Mar–May" />
        </div>
        <div>
          <Label required>Best Months</Label>
          <Input value={form.bestMonths} onChange={(e) => set("bestMonths", e.target.value)} placeholder="Oct, Apr" />
        </div>
        <div>
          <Label required>Guide From ($)</Label>
          <Input type="number" value={form.guideFrom} onChange={(e) => set("guideFrom", e.target.value)} placeholder="400" />
        </div>
      </div>

      {/* Row 5: Tags + Color */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label>Tags (comma-separated)</Label>
          <Input value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="Classic, Most Popular" />
        </div>
        <div>
          <Label>Accent Color</Label>
          <div className="flex items-center gap-2 flex-wrap">
            {COLORS.map((c) => (
              <button
                key={c} type="button"
                onClick={() => set("color", c)}
                className={`w-7 h-7 rounded-lg border-2 transition-all ${form.color === c ? "border-stone-700 scale-110" : "border-transparent hover:scale-105"}`}
                style={{ background: c }}
              />
            ))}
            <Input value={form.color} onChange={(e) => set("color", e.target.value)} placeholder="#2D6A4F" className="w-28 text-[12px]" />
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <Label required>Description</Label>
        <textarea
          value={form.desc} onChange={(e) => set("desc", e.target.value)}
          rows={3} placeholder="Short description of the trek..."
          className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-[13.5px] text-stone-800 outline-none transition-all placeholder:text-stone-400 focus:border-forest-400 focus:ring-2 focus:ring-forest-100 resize-none"
        />
      </div>

      {/* Trek photo */}
      <div>
        <Label>Trek Photo</Label>
        <ImageUpload
          uploadType="trek"
          accept="image/jpeg,image/png,image/webp"
          maxSizeMB={10}
          value={form.photo}
          onChange={({ url }) => set("photo", url)}
          hint="Hero image shown on the trek card · 1200×800 recommended"
        />
      </div>

      {/* Highlights */}
      <div>
        <Label>Highlights (up to 4)</Label>
        <div className="grid sm:grid-cols-2 gap-2">
          {form.highlights.map((h, i) => (
            <Input key={i} value={h} onChange={(e) => setHighlight(i, e.target.value)} placeholder={`Highlight ${i + 1}`} />
          ))}
        </div>
      </div>

      {/* Permits */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Permits Required</Label>
          <button type="button" onClick={addPermit} className="text-[12px] text-forest-600 hover:text-forest-700 font-semibold flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
            Add permit
          </button>
        </div>
        <div className="space-y-2">
          {form.permits.map((p, i) => (
            <div key={i} className="flex gap-2 items-center">
              <Input value={p.name} onChange={(e) => setPermit(i, "name", e.target.value)} placeholder="Permit name" className="flex-1" />
              <Input type="number" value={p.cost} onChange={(e) => setPermit(i, "cost", e.target.value)} placeholder="$" className="w-20" />
              {form.permits.length > 1 && (
                <button type="button" onClick={() => removePermit(i)} className="text-stone-400 hover:text-red-500 transition-colors shrink-0">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-stone-100">
        <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-xl border border-stone-200 text-[13.5px] text-stone-600 hover:bg-stone-50 transition-all font-medium">
          Cancel
        </button>
        <button
          type="submit" disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-forest-500 text-white text-[13.5px] font-semibold hover:bg-forest-600 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {saving && <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className="animate-spin"><path d="M13 7A6 6 0 1 1 7 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>}
          {initial ? "Save changes" : "Add trek"}
        </button>
      </div>
    </form>
  );
}

const DIFF_BADGE = {
  "Easy":          "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Moderate":      "bg-sky-50 text-sky-700 border-sky-200",
  "Moderate–Hard": "bg-amber-50 text-amber-700 border-amber-200",
  "Hard":          "bg-red-50 text-red-700 border-red-200",
};

export default function TreksSection({ showToast }) {
  const [treks, setTreks]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [mode, setMode]         = useState(null); // "add" | "edit"
  const [editing, setEditing]   = useState(null);
  const [saving, setSaving]     = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const data = await treksService.adminGetTreks();
      setTreks(data.treks ?? []);
    } catch {
      showToast("Failed to load treks.", "error");
    } finally {
      setLoading(false);
    }
  }

  // Load once on mount. `load` is stable because it closes over setters only.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  async function handleSave(payload) {
    setSaving(true);
    try {
      if (mode === "edit") {
        const { trek } = await treksService.updateTrek(editing._id, payload);
        setTreks((prev) => prev.map((t) => t._id === trek._id ? trek : t));
        showToast("Trek updated.");
      } else {
        const { trek } = await treksService.createTrek(payload);
        setTreks((prev) => [...prev, trek]);
        showToast("Trek added.");
      }
      setMode(null); setEditing(null);
    } catch (e) {
      showToast(e?.response?.data?.message ?? "Save failed.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      await treksService.deleteTrek(id);
      setTreks((prev) => prev.filter((t) => t._id !== id));
      showToast("Trek removed.");
    } catch {
      showToast("Delete failed.", "error");
    } finally {
      setDeleteId(null);
    }
  }

  const activeTreks = treks.filter((t) => t.active !== false);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-[1.4rem] font-bold text-stone-900">Trek Routes</h2>
          <p className="text-[13px] text-stone-400 mt-0.5">{activeTreks.length} routes · Add, edit or remove trek listings</p>
        </div>
        {mode === null && (
          <button
            onClick={() => { setMode("add"); setEditing(null); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-forest-500 text-white rounded-xl text-[13.5px] font-semibold hover:bg-forest-600 transition-all"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
            Add Trek
          </button>
        )}
      </div>

      {/* Form panel */}
      {mode !== null && (
        <div className="mb-8 bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
          <h3 className="font-serif text-[1.1rem] font-bold text-stone-900 mb-5">
            {mode === "edit" ? `Editing: ${editing?.name}` : "Add New Trek"}
          </h3>
          <TrekForm
            initial={mode === "edit" ? editing : null}
            onSave={handleSave}
            onCancel={() => { setMode(null); setEditing(null); }}
            saving={saving}
          />
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-4">
          <div className="flex-1 text-[13.5px] text-red-800 font-medium">
            Remove <span className="font-bold">{treks.find((t) => t._id === deleteId)?.name}</span>? This will hide it from the public listing.
          </div>
          <button onClick={() => handleDelete(deleteId)} className="px-4 py-2 rounded-xl bg-red-600 text-white text-[13px] font-semibold hover:bg-red-700 transition-all">
            Remove
          </button>
          <button onClick={() => setDeleteId(null)} className="px-4 py-2 rounded-xl border border-red-200 text-red-600 text-[13px] font-medium hover:bg-red-100 transition-all">
            Cancel
          </button>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-stone-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : activeTreks.length === 0 ? (
        <div className="text-center py-16 text-stone-400 text-[14px]">No treks yet. Click "Add Trek" to create the first one.</div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-[13px]">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200">
                  {["Trek", "Region", "Difficulty", "Days", "Altitude", "Guide From", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10.5px] uppercase tracking-[0.12em] text-stone-400 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeTreks.map((trek, i) => (
                  <tr key={trek._id} className={`border-b border-stone-100 last:border-0 hover:bg-stone-50 transition-colors ${i % 2 === 1 ? "bg-stone-50/40" : ""}`}>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: trek.color }} />
                        <div>
                          <div className="font-semibold text-stone-900">{trek.name}</div>
                          <div className="text-[11px] text-stone-400 flex flex-wrap gap-1 mt-0.5">
                            {trek.tags?.slice(0, 2).map((t) => (
                              <span key={t} className="px-1.5 py-[1px] bg-stone-100 rounded text-stone-500">{t}</span>
                            ))}
                            {trek.restricted && <span className="px-1.5 py-[1px] bg-rose-50 text-rose-600 rounded">Restricted</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-stone-600">{trek.region}</td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${DIFF_BADGE[trek.difficulty] ?? ""}`}>
                        {trek.difficulty}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-stone-600">{trek.minDays}–{trek.maxDays}d</td>
                    <td className="px-4 py-3.5 text-stone-600">{trek.altitude}</td>
                    <td className="px-4 py-3.5 font-semibold text-forest-600">${trek.guideFrom}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setEditing(trek); setMode("edit"); }}
                          className="px-3 py-1.5 rounded-lg border border-stone-200 text-[12px] text-stone-600 hover:border-forest-300 hover:text-forest-600 hover:bg-forest-50 transition-all font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteId(trek._id)}
                          className="px-3 py-1.5 rounded-lg border border-stone-200 text-[12px] text-stone-500 hover:border-red-200 hover:text-red-600 hover:bg-red-50 transition-all font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
