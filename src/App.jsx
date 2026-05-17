import { useState, useEffect, useMemo } from 'react'
import {
  Calculator, FolderOpen, Database, Wrench, Settings2,
  Plus, Trash2, Save, Search, X, Pencil, Globe,
} from 'lucide-react'

// ── Data ──────────────────────────────────────────────────────────────────────

const DEFAULT_FILAMENTS = [
  { id: 1,  name: 'PolyTerra',            hersteller: 'Polymaker', farbe: 'Charcoal Black',    preis: 14.99, gewicht: 1000 },
  { id: 2,  name: 'PolyTerra',            hersteller: 'Polymaker', farbe: 'Cotton White',      preis: 14.99, gewicht: 1000 },
  { id: 3,  name: 'PolyTerra',            hersteller: 'Polymaker', farbe: 'Sapphire Blue',     preis: 14.99, gewicht: 1000 },
  { id: 4,  name: 'ECO PLA Glow',         hersteller: '3D Jake',   farbe: 'Glow in the dark',  preis: 27.99, gewicht: 1000 },
  { id: 5,  name: 'Elegoo PLA',           hersteller: 'Elegoo',    farbe: 'Sky Blue',          preis: 12.99, gewicht: 1000 },
  { id: 6,  name: 'PETG HF',              hersteller: 'Bambu Lab', farbe: 'Grau',              preis: 14.29, gewicht: 1000 },
  { id: 7,  name: 'PETG HF',              hersteller: 'Bambu Lab', farbe: 'Schwarz',           preis: 14.29, gewicht: 1000 },
  { id: 8,  name: 'PLA Matt',             hersteller: 'Bambu Lab', farbe: 'Aschgrau',          preis: 12.64, gewicht: 1000 },
  { id: 9,  name: 'PLA Matt',             hersteller: 'Bambu Lab', farbe: 'Schwarz',           preis: 12.64, gewicht: 1000 },
  { id: 10, name: 'PLA Silk+',            hersteller: 'Bambu Lab', farbe: 'Gold',              preis: 14.29, gewicht: 1000 },
  { id: 11, name: 'PLA Silk Multi Color', hersteller: 'Bambu Lab', farbe: 'Aurora',            preis: 27.99, gewicht: 1000 },
  { id: 12, name: 'PLA Silk Multi Color', hersteller: 'Bambu Lab', farbe: 'Hawaii Blau',       preis: 27.99, gewicht: 1000 },
  { id: 13, name: 'TPU for AMS',          hersteller: 'Bambu Lab', farbe: 'Schwarz',           preis: 39.99, gewicht: 1000 },
]

const DEFAULT_WEAR = [
  { id: 1, bauteil: 'Complete Hotend Assembly – P1 Series',   preis: 36.99, lebensdauer: 1000 },
  { id: 2, bauteil: 'Hardened Steel Extruder Gear Assembly',  preis: 20.99, lebensdauer: 3000 },
  { id: 3, bauteil: 'Dual-Texture PEI Plate',                 preis: 29.99, lebensdauer: 1500 },
  { id: 4, bauteil: 'PTFE Tubes',                             preis: 10.99, lebensdauer: 2000 },
]

const DEFAULT_PROJECTS = [
  { id: 'ex1', name: 'Weinhalterung Hand',            gesamtkosten: 2.93, stueckzahl: 1, notiz: '',                    filament: 'PolyTerra', makerworld: '', datum: '2025-01-01' },
  { id: 'ex2', name: '7× individuelle iPhone Halter', gesamtkosten: 1.98, stueckzahl: 7, notiz: '0,28 € pro Stück',   filament: 'PolyTerra', makerworld: '', datum: '2025-01-02' },
  { id: 'ex3', name: 'Fugendüse',                     gesamtkosten: 0.43, stueckzahl: 1, notiz: '',                    filament: 'PolyTerra', makerworld: '', datum: '2025-01-03' },
  { id: 'ex4', name: 'Box Schraubenzieher 24×12×8',   gesamtkosten: 3.43, stueckzahl: 1, notiz: '',                    filament: 'PolyTerra', makerworld: '', datum: '2025-01-04' },
  { id: 'ex5', name: 'Box WZ Schublade 19×13×10',     gesamtkosten: 3.29, stueckzahl: 1, notiz: '',                    filament: 'PolyTerra', makerworld: '', datum: '2025-01-05' },
  { id: 'ex6', name: '2× Box Flur Schrank 23×10×9,5', gesamtkosten: 5.72, stueckzahl: 2, notiz: '2,86 € pro Stück',   filament: 'PolyTerra', makerworld: '', datum: '2025-01-06' },
  { id: 'ex7', name: 'Schuhschrank (2-teilig)',        gesamtkosten: 9.11, stueckzahl: 1, notiz: 'bevorzugte Variante', filament: 'PolyTerra', makerworld: '', datum: '2025-01-07' },
  { id: 'ex8', name: 'Box WZ Schublade 10×8×6',       gesamtkosten: 0.80, stueckzahl: 1, notiz: '',                    filament: 'PolyTerra', makerworld: '', datum: '2025-01-08' },
]

const SLOT_COLORS = ['#2563EB', '#EA580C', '#16A34A', '#7C3AED']
const SLOT_NAMES  = ['Farbe 1', 'Farbe 2', 'Farbe 3', 'Farbe 4']
const EMPTY_PROJ_FORM = { name: '', gesamtkosten: '', stueckzahl: '1', notiz: '', filament: '', makerworld: '', datum: '' }

// ── Hooks ─────────────────────────────────────────────────────────────────────

function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : initial }
    catch { return initial }
  })
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(value)) } catch {} }, [key, value])
  return [value, setValue]
}

// ── Utils ─────────────────────────────────────────────────────────────────────

const fmt    = (v, d = 2) => Number(v).toFixed(d).replace('.', ',')
const fmtEur = v => `${fmt(v)} €`
const today  = () => new Date().toISOString().slice(0, 10)

// ── UI Primitives ─────────────────────────────────────────────────────────────

function Field({ label, unit, children, style }) {
  return (
    <div className="input-group" style={style}>
      {label && <div className="input-label">{label}</div>}
      <div className="input-with-unit">
        {children}
        {unit && <span className="unit">{unit}</span>}
      </div>
    </div>
  )
}

function Sheet({ open, onClose, title, children }) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])
  if (!open) return null
  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="sheet">
        <div className="sheet-handle" />
        {title && <div className="sheet-title">{title}</div>}
        {children}
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, primary }) {
  return (
    <div className={`stat-card${primary ? ' primary' : ''}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  )
}

function CostBar({ label, value, total, color }) {
  const pct = total > 0 ? (value / total) * 100 : 0
  return (
    <div className="cost-bar-row">
      <div className="cost-bar-header">
        <span className="cost-bar-label">{label}</span>
        <span className="cost-bar-value" style={{ color }}>{fmtEur(value)}</span>
      </div>
      <div className="cost-bar-track">
        <div className="cost-bar-fill" style={{ width: `${pct.toFixed(1)}%`, background: color }} />
      </div>
      <span className="cost-bar-pct">{pct.toFixed(1)} %</span>
    </div>
  )
}

// ── AMS Slot Card ─────────────────────────────────────────────────────────────

function AmsSlot({ slot, index, filaments, onChange, onRemove, canRemove, cost }) {
  const color = SLOT_COLORS[index]
  return (
    <div style={{ border: `2px solid ${color}20`, borderLeft: `4px solid ${color}`, borderRadius: 10, padding: '12px 14px', marginBottom: 10, background: 'var(--bg)' }}>
      <div className="flex-between" style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: color, flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>{SLOT_NAMES[index]}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {cost > 0 && <span style={{ fontSize: 12, fontWeight: 600, color }}>{fmtEur(cost)}</span>}
          {canRemove && (
            <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 2, display: 'flex' }}>
              <X size={15} />
            </button>
          )}
        </div>
      </div>
      <select value={slot.filamentId} onChange={e => onChange({ ...slot, filamentId: +e.target.value })} style={{ marginBottom: 10 }}>
        {filaments.map(f => <option key={f.id} value={f.id}>{f.name} – {f.farbe} ({f.hersteller})</option>)}
      </select>
      <Field label="Gewicht im Modell" unit="g">
        <input type="number" inputMode="decimal" value={slot.gewicht} min={0} step={1}
          onChange={e => onChange({ ...slot, gewicht: parseFloat(e.target.value) || 0 })} />
      </Field>
    </div>
  )
}

// ── Kalkulation ───────────────────────────────────────────────────────────────

function KalkulationScreen({ filaments, wear, inputs, setInputs, strompreis, leistung, onSave }) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [saveName,  setSaveName]  = useState('')
  const [saveStueck,setSaveStueck]= useState('1')
  const [saveNotiz, setSaveNotiz] = useState('')

  const fil = filaments.find(f => f.id === inputs.filamentId) || filaments[0]

  const calc = useMemo(() => {
    const vph  = wear.reduce((s, w) => s + w.preis / (w.lebensdauer || 1), 0)
    const strom = inputs.druckzeit * leistung * strompreis
    const verl  = inputs.druckzeit * vph

    if (!inputs.amsMode) {
      const k1000 = fil ? (fil.preis / fil.gewicht) * 1000 : 0
      const gFil  = inputs.modell + inputs.stuetz + inputs.purge
      const mat   = (gFil / 1000) * k1000
      const ges   = mat + strom + verl
      return { k1000, gFil, mat, strom, verl, ges, p1000: gFil > 0 ? (ges / gFil) * 1000 : 0, slotDetails: null, purgeCost: 0, totalPurgeG: 0 }
    } else {
      const slots = inputs.amsSlots
      const slotDetails = slots.map(s => {
        const f   = filaments.find(f => f.id === s.filamentId) || filaments[0]
        const k1000 = (f.preis / f.gewicht) * 1000
        return { ...s, f, k1000, cost: (s.gewicht / 1000) * k1000 }
      })
      const slotMatCost = slotDetails.reduce((s, d) => s + d.cost, 0)
      const avgK1000    = slotDetails.reduce((s, d) => s + d.k1000, 0) / slots.length
      const numChanges  = slots.length - 1
      const totalPurgeG = numChanges * inputs.amsPurge
      const purgeCost   = (totalPurgeG / 1000) * avgK1000
      const suppK1000   = slotDetails[0]?.k1000 || 0
      const suppCost    = (inputs.stuetz / 1000) * suppK1000
      const mat         = slotMatCost + purgeCost + suppCost
      const gFil        = slots.reduce((s, sl) => s + sl.gewicht, 0) + totalPurgeG + inputs.stuetz
      const ges         = mat + strom + verl
      return { k1000: avgK1000, gFil, mat, strom, verl, ges, p1000: gFil > 0 ? (ges / gFil) * 1000 : 0, slotDetails, purgeCost, totalPurgeG, suppCost }
    }
  }, [inputs, fil, filaments, strompreis, leistung, wear])

  const filamentSummary = inputs.amsMode
    ? 'AMS: ' + inputs.amsSlots.map(s => { const f = filaments.find(f => f.id === s.filamentId); return f ? f.name : '?' }).join(' + ')
    : (fil ? `${fil.name} – ${fil.farbe}` : '')

  const addAmsSlot = () => {
    if (inputs.amsSlots.length >= 4) return
    setInputs(i => ({ ...i, amsSlots: [...i.amsSlots, { id: Date.now(), filamentId: filaments[0]?.id || 1, gewicht: 10 }] }))
  }

  const updateAmsSlot = (id, updated) => setInputs(i => ({ ...i, amsSlots: i.amsSlots.map(s => s.id === id ? updated : s) }))
  const removeAmsSlot = id => setInputs(i => ({ ...i, amsSlots: i.amsSlots.filter(s => s.id !== id) }))

  const handleSave = () => {
    if (!saveName.trim()) return
    const stk = parseInt(saveStueck) || 1
    onSave({ id: `p_${Date.now()}`, name: saveName.trim(), gesamtkosten: calc.ges, stueckzahl: stk, notiz: saveNotiz, filament: filamentSummary, makerworld: '', datum: today() })
    setSheetOpen(false); setSaveName(''); setSaveStueck('1'); setSaveNotiz('')
  }

  return (
    <div className="screen">
      <div className="screen-content" style={{ paddingTop: 12 }}>

        {/* Hero */}
        <div className="card" style={{ textAlign: 'center', padding: '28px 20px 22px' }}>
          <div className="big-cost">{fmtEur(calc.ges)}</div>
          <div className="big-cost-label">{fmt(calc.gFil, 0)} g · {fmt(inputs.druckzeit, 2)} h</div>
        </div>

        {/* Mode toggle */}
        <div style={{ display: 'flex', background: 'var(--card)', borderRadius: 12, padding: 4, marginBottom: 12, boxShadow: 'var(--shadow)' }}>
          {[{ label: '⬤ Einfarbig', ams: false }, { label: '🎨 AMS Multi-Color', ams: true }].map(({ label, ams }) => (
            <button key={String(ams)} onClick={() => setInputs(i => ({ ...i, amsMode: ams }))}
              style={{ flex: 1, padding: '10px 8px', fontSize: 14, fontWeight: 600, border: 'none', borderRadius: 9, cursor: 'pointer', transition: 'all 0.2s',
                background: inputs.amsMode === ams ? 'var(--primary)' : 'transparent',
                color: inputs.amsMode === ams ? 'white' : 'var(--text-3)',
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* Filament — single mode */}
        {!inputs.amsMode && (
          <div className="card">
            <Field label="Filament">
              <select value={inputs.filamentId} onChange={e => setInputs(i => ({ ...i, filamentId: +e.target.value }))}>
                {filaments.map(f => <option key={f.id} value={f.id}>{f.name} – {f.farbe} ({f.hersteller})</option>)}
              </select>
            </Field>
            <div className="flex-between mt-8">
              <span style={{ fontSize: 14, color: 'var(--text-3)' }}>{fmt(fil?.preis ?? 0, 2)} € / {fil?.gewicht ?? 1000} g</span>
              <span className="chip chip-blue">{fmt(calc.k1000, 2)} €/kg</span>
            </div>
          </div>
        )}

        {/* AMS slots */}
        {inputs.amsMode && (
          <div className="card">
            <div className="section-title mb-12">AMS Farbkonfiguration</div>
            {inputs.amsSlots.map((slot, i) => (
              <AmsSlot key={slot.id} slot={slot} index={i} filaments={filaments}
                onChange={updated => updateAmsSlot(slot.id, updated)}
                onRemove={() => removeAmsSlot(slot.id)}
                canRemove={inputs.amsSlots.length > 2}
                cost={calc.slotDetails?.[i]?.cost ?? 0}
              />
            ))}
            {inputs.amsSlots.length < 4 && (
              <button onClick={addAmsSlot} className="btn btn-secondary" style={{ marginBottom: 14, minHeight: 40, fontSize: 14 }}>
                <Plus size={16} /> Farbe {inputs.amsSlots.length + 1} hinzufügen
              </button>
            )}
            <div className="flex-between" style={{ background: 'var(--bg)', borderRadius: 10, padding: '10px 14px' }}>
              <span style={{ fontSize: 14, color: 'var(--text-2)' }}>Spülung pro Farbwechsel</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="number" inputMode="decimal" value={inputs.amsPurge} min={0} step={5}
                  onChange={e => setInputs(i => ({ ...i, amsPurge: parseFloat(e.target.value) || 0 }))}
                  style={{ width: 70, textAlign: 'right', fontSize: 16 }} />
                <span style={{ fontSize: 14, color: 'var(--text-3)' }}>g</span>
              </div>
            </div>
            {inputs.amsSlots.length > 1 && (
              <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 6, textAlign: 'right' }}>
                = {inputs.amsSlots.length - 1} Wechsel × {inputs.amsPurge} g = {(inputs.amsSlots.length - 1) * inputs.amsPurge} g Spülung ({fmtEur(calc.purgeCost)})
              </div>
            )}
          </div>
        )}

        {/* Parameters */}
        <div className="card">
          <div className="section-title mb-12">Druckparameter</div>
          <div className="grid-2">
            {!inputs.amsMode && (
              <Field label="Modell" unit="g">
                <input type="number" inputMode="decimal" value={inputs.modell} min={0} step={1}
                  onChange={e => setInputs(i => ({ ...i, modell: parseFloat(e.target.value) || 0 }))} />
              </Field>
            )}
            <Field label="Stützmaterial" unit="g">
              <input type="number" inputMode="decimal" value={inputs.stuetz} min={0} step={1}
                onChange={e => setInputs(i => ({ ...i, stuetz: parseFloat(e.target.value) || 0 }))} />
            </Field>
            {!inputs.amsMode && (
              <Field label="Purge / Abfall" unit="g">
                <input type="number" inputMode="decimal" value={inputs.purge} min={0} step={0.5}
                  onChange={e => setInputs(i => ({ ...i, purge: parseFloat(e.target.value) || 0 }))} />
              </Field>
            )}
            <Field label="Druckzeit" unit="h">
              <input type="number" inputMode="decimal" value={inputs.druckzeit} min={0} step={0.25}
                onChange={e => setInputs(i => ({ ...i, druckzeit: parseFloat(e.target.value) || 0 }))} />
            </Field>
          </div>
        </div>

        {/* Breakdown */}
        <div className="card">
          <div className="section-title mb-12">Aufschlüsselung</div>

          {/* AMS per-slot breakdown */}
          {inputs.amsMode && calc.slotDetails && (
            <div style={{ marginBottom: 16 }}>
              {calc.slotDetails.map((d, i) => (
                <div key={d.id} className="cost-bar-row">
                  <div className="cost-bar-header">
                    <span className="cost-bar-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: SLOT_COLORS[i], display: 'inline-block', flexShrink: 0 }} />
                      {d.f.name} ({d.gewicht} g)
                    </span>
                    <span className="cost-bar-value" style={{ color: SLOT_COLORS[i] }}>{fmtEur(d.cost)}</span>
                  </div>
                  <div className="cost-bar-track">
                    <div className="cost-bar-fill" style={{ width: `${calc.ges > 0 ? (d.cost / calc.ges * 100).toFixed(1) : 0}%`, background: SLOT_COLORS[i] }} />
                  </div>
                </div>
              ))}
              {calc.purgeCost > 0 && (
                <div className="cost-bar-row">
                  <div className="cost-bar-header">
                    <span className="cost-bar-label">AMS-Spülung ({calc.totalPurgeG} g)</span>
                    <span className="cost-bar-value" style={{ color: '#94A3B8' }}>{fmtEur(calc.purgeCost)}</span>
                  </div>
                  <div className="cost-bar-track">
                    <div className="cost-bar-fill" style={{ width: `${calc.ges > 0 ? (calc.purgeCost / calc.ges * 100).toFixed(1) : 0}%`, background: '#94A3B8' }} />
                  </div>
                </div>
              )}
              <div style={{ height: 1, background: 'var(--border)', margin: '12px 0' }} />
            </div>
          )}

          <CostBar label="Materialkosten" value={calc.mat}  total={calc.ges} color="#2563eb" />
          <CostBar label="Stromkosten"    value={calc.strom}total={calc.ges} color="#059669" />
          <CostBar label="Verschleiß"     value={calc.verl} total={calc.ges} color="#d97706" />
          <div className="divider" />
          <div className="flex-between">
            <div><div className="stat-label">Pro 1.000 g</div><div style={{ fontSize: 18, fontWeight: 700 }}>{fmt(calc.p1000, 2)} €</div></div>
            <div style={{ textAlign: 'right' }}><div className="stat-label">Gesamtfilament</div><div style={{ fontSize: 18, fontWeight: 700 }}>{fmt(calc.gFil, 0)} g</div></div>
          </div>
        </div>

        <button className="btn btn-primary" onClick={() => setSheetOpen(true)}>
          <Save size={18} /> Als Projekt speichern
        </button>
        <div style={{ height: 8 }} />
      </div>

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Projekt speichern">
        <div className="flex-col-gap">
          <div className="info-box info-box-blue flex-between">
            <span className="info-box-label">Gesamtkosten</span>
            <span className="info-box-value">{fmtEur(calc.ges)}</span>
          </div>
          <Field label="Bezeichnung *">
            <input value={saveName} onChange={e => setSaveName(e.target.value)} placeholder="z. B. Halterung iPhone 14" />
          </Field>
          <div className="grid-2">
            <Field label="Stückzahl">
              <input type="number" inputMode="numeric" value={saveStueck} min={1} step={1} onChange={e => setSaveStueck(e.target.value)} />
            </Field>
            {parseInt(saveStueck) > 1 && (
              <div className="input-group" style={{ justifyContent: 'flex-end' }}>
                <div className="input-label">Pro Stück</div>
                <div style={{ fontSize: 18, fontWeight: 700, paddingTop: 12, color: 'var(--primary)' }}>{fmtEur(calc.ges / (parseInt(saveStueck) || 1))}</div>
              </div>
            )}
          </div>
          <Field label="Notiz (optional)">
            <input value={saveNotiz} onChange={e => setSaveNotiz(e.target.value)} placeholder="z. B. Auftraggeber, Version…" />
          </Field>
          <button className="btn btn-primary" onClick={handleSave}>Speichern</button>
        </div>
      </Sheet>
    </div>
  )
}

// ── Projekte ──────────────────────────────────────────────────────────────────

function ProjekteScreen({ projekte, setProjekte }) {
  const [q, setQ]               = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editId, setEditId]     = useState(null) // null = new
  const [form, setForm]         = useState({ ...EMPTY_PROJ_FORM, datum: today() })

  const openAdd  = () => { setEditId(null); setForm({ ...EMPTY_PROJ_FORM, datum: today() }); setSheetOpen(true) }
  const openEdit = p  => {
    setEditId(p.id)
    setForm({ name: p.name, gesamtkosten: String(p.gesamtkosten), stueckzahl: String(p.stueckzahl), notiz: p.notiz || '', filament: p.filament || '', makerworld: p.makerworld || '', datum: p.datum || today() })
    setSheetOpen(true)
  }

  const handleSave = () => {
    if (!form.name.trim()) return
    const entry = { name: form.name.trim(), gesamtkosten: parseFloat(form.gesamtkosten) || 0, stueckzahl: parseInt(form.stueckzahl) || 1, notiz: form.notiz, filament: form.filament, makerworld: form.makerworld, datum: form.datum || today() }
    if (editId) {
      setProjekte(ps => ps.map(p => p.id === editId ? { ...p, ...entry } : p))
    } else {
      setProjekte(ps => [{ id: `m_${Date.now()}`, ...entry }, ...ps])
    }
    setSheetOpen(false)
  }

  const list = useMemo(() => {
    const lower = q.toLowerCase()
    const f = q ? projekte.filter(p => p.name.toLowerCase().includes(lower) || (p.notiz || '').toLowerCase().includes(lower) || (p.filament || '').toLowerCase().includes(lower)) : projekte
    return [...f].sort((a, b) => (b.datum || '').localeCompare(a.datum || ''))
  }, [projekte, q])

  const stats = useMemo(() => {
    if (!projekte.length) return null
    const total = projekte.reduce((s, p) => s + p.gesamtkosten, 0)
    return { count: projekte.length, total, avg: total / projekte.length, min: Math.min(...projekte.map(p => p.gesamtkosten)) }
  }, [projekte])

  const mwUrl = url => url?.startsWith('http') ? url : `https://${url}`

  return (
    <div className="screen">
      <div className="screen-content" style={{ paddingTop: 12 }}>

        {stats && (
          <div className="stat-grid">
            <StatCard label="Projekte gesamt" value={stats.count} primary />
            <StatCard label="Ø Kosten" value={fmtEur(stats.avg)} sub="pro Projekt" />
            <StatCard label="Summe" value={fmtEur(stats.total)} />
            <StatCard label="Günstigstes" value={fmtEur(stats.min)} />
          </div>
        )}

        <div className="search-wrap">
          <Search size={16} className="search-icon" />
          <input className="search-input" value={q} onChange={e => setQ(e.target.value)} placeholder="Suchen…" />
          {q && <button onClick={() => setQ('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', display: 'flex', padding: 4 }}><X size={16} /></button>}
        </div>

        {list.length === 0 && (
          <div className="empty"><FolderOpen size={48} /><div className="empty-title">Noch keine Projekte</div><div className="empty-sub">Berechne ein Projekt und speichere es.</div></div>
        )}

        {list.map(p => (
          <div key={p.id} className="proj-card">
            <div className="proj-info">
              <div className="proj-name">{p.name}</div>
              <div className="proj-meta">{[p.filament, p.datum?.slice(0, 10)].filter(Boolean).join(' · ')}</div>
              {p.notiz && <div className="proj-meta">{p.notiz}</div>}
              {p.makerworld && (
                <a href={mwUrl(p.makerworld)} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 8, fontSize: 13, fontWeight: 600, color: 'var(--primary)', textDecoration: 'none', background: 'var(--primary-light)', padding: '5px 10px', borderRadius: 20 }}>
                  <Globe size={13} /> MakerWorld öffnen
                </a>
              )}
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div className="proj-cost">{fmtEur(p.gesamtkosten)}</div>
              {p.stueckzahl > 1 && <div className="proj-unit-cost">{fmtEur(p.gesamtkosten / p.stueckzahl)} / Stk.</div>}
              {p.stueckzahl > 1 && <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>{p.stueckzahl}×</div>}
              <div style={{ display: 'flex', gap: 6, marginTop: 8, justifyContent: 'flex-end' }}>
                <button className="edit-btn" onClick={() => openEdit(p)}><Pencil size={14} /></button>
                <button className="del-btn" onClick={() => setProjekte(ps => ps.filter(x => x.id !== p.id))}><Trash2 size={15} /></button>
              </div>
            </div>
          </div>
        ))}
        <div style={{ height: 80 }} />
      </div>

      <button className="fab" onClick={openAdd} aria-label="Manuell hinzufügen"><Plus size={24} /></button>

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title={editId ? 'Projekt bearbeiten' : 'Projekt hinzufügen'}>
        <div className="flex-col-gap">
          <Field label="Bezeichnung *">
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Projektname" />
          </Field>
          <div className="grid-2">
            <Field label={editId ? 'Gesamtkosten €' : 'Gesamtkosten *'} unit="€">
              <input type="number" inputMode="decimal" value={form.gesamtkosten} step={0.01}
                onChange={e => setForm(f => ({ ...f, gesamtkosten: e.target.value }))} placeholder="0,00" />
            </Field>
            <Field label="Stückzahl">
              <input type="number" inputMode="numeric" value={form.stueckzahl} min={1} step={1}
                onChange={e => setForm(f => ({ ...f, stueckzahl: e.target.value }))} />
            </Field>
          </div>
          <Field label="Filament">
            <input value={form.filament} onChange={e => setForm(f => ({ ...f, filament: e.target.value }))} placeholder="z. B. PolyTerra" />
          </Field>
          <Field label="MakerWorld-Link (optional)">
            <input type="url" inputMode="url" value={form.makerworld}
              onChange={e => setForm(f => ({ ...f, makerworld: e.target.value }))}
              placeholder="https://makerworld.com/…" />
          </Field>
          <Field label="Notiz (optional)">
            <input value={form.notiz} onChange={e => setForm(f => ({ ...f, notiz: e.target.value }))} placeholder="Optional" />
          </Field>
          <Field label="Datum">
            <input type="date" value={form.datum} onChange={e => setForm(f => ({ ...f, datum: e.target.value }))} />
          </Field>
          <button className="btn btn-primary" onClick={handleSave}>{editId ? 'Änderungen speichern' : 'Hinzufügen'}</button>
        </div>
      </Sheet>
    </div>
  )
}

// ── Filamente ─────────────────────────────────────────────────────────────────

function FilamenteScreen({ filaments, setFilaments }) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [form, setForm] = useState({ name: '', hersteller: '', farbe: '', preis: '', gewicht: '1000' })

  const handleAdd = () => {
    if (!form.name.trim() || !form.preis) return
    setFilaments(f => [...f, { id: Date.now(), name: form.name.trim(), hersteller: form.hersteller, farbe: form.farbe, preis: parseFloat(form.preis), gewicht: parseFloat(form.gewicht) || 1000 }])
    setSheetOpen(false); setForm({ name: '', hersteller: '', farbe: '', preis: '', gewicht: '1000' })
  }

  return (
    <div className="screen">
      <div className="screen-content" style={{ paddingTop: 12 }}>
        {filaments.map(f => (
          <div key={f.id} className="list-item">
            <div className="list-item-info">
              <div className="list-item-name">{f.name}{f.farbe ? ` – ${f.farbe}` : ''}</div>
              <div className="list-item-sub">{[f.hersteller, `${f.gewicht} g`, `${fmt(f.preis, 2)} €/Spule`].filter(Boolean).join(' · ')}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              <span className="list-item-badge">{fmt((f.preis / f.gewicht) * 1000, 2)} €/kg</span>
              <button className="del-btn" onClick={() => setFilaments(fl => fl.filter(x => x.id !== f.id))}><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
        {filaments.length === 0 && <div className="empty"><Database size={48} /><div className="empty-title">Keine Filamente</div></div>}
        <div style={{ height: 80 }} />
      </div>
      <button className="fab" onClick={() => setSheetOpen(true)} aria-label="Hinzufügen"><Plus size={24} /></button>
      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Filament hinzufügen">
        <div className="flex-col-gap">
          <Field label="Filamentname *"><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="z. B. PLA Matt" /></Field>
          <div className="grid-2">
            <Field label="Hersteller"><input value={form.hersteller} onChange={e => setForm(f => ({ ...f, hersteller: e.target.value }))} placeholder="Bambu Lab" /></Field>
            <Field label="Farbe"><input value={form.farbe} onChange={e => setForm(f => ({ ...f, farbe: e.target.value }))} placeholder="Schwarz" /></Field>
          </div>
          <div className="grid-2">
            <Field label="Preis *" unit="€"><input type="number" inputMode="decimal" value={form.preis} step={0.01} onChange={e => setForm(f => ({ ...f, preis: e.target.value }))} placeholder="14.99" /></Field>
            <Field label="Spule" unit="g"><input type="number" inputMode="numeric" value={form.gewicht} step={50} onChange={e => setForm(f => ({ ...f, gewicht: e.target.value }))} /></Field>
          </div>
          {form.preis && form.gewicht && (
            <div className="info-box info-box-blue flex-between">
              <span className="info-box-label">Kosten pro kg</span>
              <span className="info-box-value">{fmt((parseFloat(form.preis) / (parseFloat(form.gewicht) || 1)) * 1000, 2)} €</span>
            </div>
          )}
          <button className="btn btn-primary" onClick={handleAdd}>Hinzufügen</button>
        </div>
      </Sheet>
    </div>
  )
}

// ── Verschleiß ────────────────────────────────────────────────────────────────

function VerschleissScreen({ wear, setWear }) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [form, setForm] = useState({ bauteil: '', preis: '', lebensdauer: '' })
  const totalPerH = wear.reduce((s, w) => s + w.preis / (w.lebensdauer || 1), 0)

  const handleAdd = () => {
    if (!form.bauteil.trim() || !form.preis || !form.lebensdauer) return
    setWear(w => [...w, { id: Date.now(), bauteil: form.bauteil.trim(), preis: parseFloat(form.preis), lebensdauer: parseFloat(form.lebensdauer) }])
    setSheetOpen(false); setForm({ bauteil: '', preis: '', lebensdauer: '' })
  }

  return (
    <div className="screen">
      <div className="screen-content" style={{ paddingTop: 12 }}>
        <div className="card flex-between" style={{ marginBottom: 14 }}>
          <div><div className="stat-label">Gesamt Verschleiß</div><div style={{ fontSize: 24, fontWeight: 700 }}>{fmt(totalPerH, 4)} <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-3)' }}>€/h</span></div></div>
          <span className="chip chip-amber">{wear.length} Bauteile</span>
        </div>
        {wear.map(w => (
          <div key={w.id} className="card" style={{ marginBottom: 10 }}>
            <div className="flex-between" style={{ marginBottom: 12 }}>
              <div style={{ flex: 1, paddingRight: 10 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{w.bauteil}</div>
                <span className="chip chip-amber" style={{ marginTop: 6 }}>{fmt(w.preis / (w.lebensdauer || 1), 4)} €/h</span>
              </div>
              <button className="del-btn" onClick={() => setWear(arr => arr.filter(x => x.id !== w.id))}><Trash2 size={15} /></button>
            </div>
            <div className="grid-2">
              <Field label="Ersatzpreis" unit="€">
                <input type="number" inputMode="decimal" value={w.preis} step={0.01}
                  onChange={e => setWear(arr => arr.map(x => x.id === w.id ? { ...x, preis: parseFloat(e.target.value) || 0 } : x))} />
              </Field>
              <Field label="Lebensdauer" unit="h">
                <input type="number" inputMode="numeric" value={w.lebensdauer} step={50}
                  onChange={e => setWear(arr => arr.map(x => x.id === w.id ? { ...x, lebensdauer: parseFloat(e.target.value) || 1 } : x))} />
              </Field>
            </div>
          </div>
        ))}
        <div style={{ height: 80 }} />
      </div>
      <button className="fab" onClick={() => setSheetOpen(true)} aria-label="Hinzufügen"><Plus size={24} /></button>
      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Verschleißteil hinzufügen">
        <div className="flex-col-gap">
          <Field label="Bauteilbezeichnung *"><input value={form.bauteil} onChange={e => setForm(f => ({ ...f, bauteil: e.target.value }))} placeholder="z. B. Hotend Assembly" /></Field>
          <div className="grid-2">
            <Field label="Ersatzpreis *" unit="€"><input type="number" inputMode="decimal" value={form.preis} step={0.01} onChange={e => setForm(f => ({ ...f, preis: e.target.value }))} placeholder="36.99" /></Field>
            <Field label="Lebensdauer *" unit="h"><input type="number" inputMode="numeric" value={form.lebensdauer} step={50} onChange={e => setForm(f => ({ ...f, lebensdauer: e.target.value }))} placeholder="1000" /></Field>
          </div>
          {form.preis && form.lebensdauer && (
            <div className="info-box info-box-amber flex-between">
              <span className="info-box-label">Kosten pro Stunde</span>
              <span className="info-box-value">{fmt(parseFloat(form.preis) / (parseFloat(form.lebensdauer) || 1), 4)} €</span>
            </div>
          )}
          <button className="btn btn-primary" onClick={handleAdd}>Hinzufügen</button>
        </div>
      </Sheet>
    </div>
  )
}

// ── Einstellungen ─────────────────────────────────────────────────────────────

function EinstellungenScreen({ strompreis, setStrompreis, leistung, setLeistung }) {
  return (
    <div className="screen">
      <div className="screen-content" style={{ paddingTop: 12 }}>
        <div className="card">
          <div className="section-title mb-12">Fixe Annahmen</div>
          <div className="flex-col-gap">
            <Field label="Strompreis" unit="€/kWh"><input type="number" inputMode="decimal" value={strompreis} step={0.01} min={0} onChange={e => setStrompreis(parseFloat(e.target.value) || 0)} /></Field>
            <Field label="Ø Leistungsaufnahme" unit="W"><input type="number" inputMode="numeric" value={leistung * 1000} step={5} min={0} onChange={e => setLeistung((parseFloat(e.target.value) || 0) / 1000)} /></Field>
          </div>
        </div>
        <div className="card">
          <div className="section-title mb-12">Berechnungsformeln</div>
          <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 2 }}>
            <div>📦 Materialkosten = (Modell + Stütze + Purge) × €/kg ÷ 1.000</div>
            <div>🎨 AMS-Spülung = (Farben − 1) × g/Wechsel × Ø €/kg</div>
            <div>⚡ Stromkosten = Druckzeit × kW × €/kWh</div>
            <div>🔧 Verschleiß = Druckzeit × Σ(€/h aller Bauteile)</div>
          </div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>3D-Druck Kostenrechner</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>Bambu Lab P1S · v1.1 · El Shado</div>
        </div>
      </div>
    </div>
  )
}

// ── App Root ──────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'kalkulation',  label: 'Rechner',   Icon: Calculator },
  { id: 'projekte',     label: 'Projekte',  Icon: FolderOpen },
  { id: 'filamente',    label: 'Filamente', Icon: Database },
  { id: 'verschleiss',  label: 'Verschleiß',Icon: Wrench },
  { id: 'einstellungen',label: 'Settings',  Icon: Settings2 },
]

const PAGE_TITLES = { kalkulation: 'Kalkulation', filamente: 'Filamentliste', verschleiss: 'Verschleißteile', einstellungen: 'Einstellungen' }

export default function App() {
  const [tab, setTab]       = useState('kalkulation')
  const [inputs, setInputs] = useState({
    amsMode: false,
    filamentId: 1,
    modell: 41,
    stuetz: 0,
    purge: 0,
    druckzeit: 1.75,
    amsSlots: [
      { id: 1, filamentId: 1,  gewicht: 25 },
      { id: 2, filamentId: 6,  gewicht: 16 },
    ],
    amsPurge: 20,
  })

  const [filaments, setFilaments] = useLocalStorage('gbm:filaments', DEFAULT_FILAMENTS)
  const [wear,      setWear]      = useLocalStorage('gbm:wear',      DEFAULT_WEAR)
  const [projekte,  setProjekte]  = useLocalStorage('gbm:projekte',  DEFAULT_PROJECTS)
  const [strompreis,setStrompreis]= useLocalStorage('gbm:strompreis',0.36)
  const [leistung,  setLeistung]  = useLocalStorage('gbm:leistung',  0.105)

  const handleSaveProject = p => { setProjekte(ps => [p, ...ps]); setTab('projekte') }

  const pageTitle = tab === 'projekte' ? `Projekte (${projekte.length})` : PAGE_TITLES[tab]

  return (
    <div className="app">
      <div className="page-header">
        <div>
          <div className="page-title">{pageTitle}</div>
          <div className="page-sub">Bambu Lab P1S</div>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'right' }}>
          <div style={{ fontWeight: 600, color: 'var(--primary)', fontSize: 12 }}>El Shado</div>
        </div>
      </div>

      {tab === 'kalkulation'  && <KalkulationScreen  filaments={filaments} wear={wear} inputs={inputs} setInputs={setInputs} strompreis={strompreis} leistung={leistung} onSave={handleSaveProject} />}
      {tab === 'projekte'     && <ProjekteScreen     projekte={projekte}   setProjekte={setProjekte} />}
      {tab === 'filamente'    && <FilamenteScreen    filaments={filaments} setFilaments={setFilaments} />}
      {tab === 'verschleiss'  && <VerschleissScreen  wear={wear}           setWear={setWear} />}
      {tab === 'einstellungen'&& <EinstellungenScreen strompreis={strompreis} setStrompreis={setStrompreis} leistung={leistung} setLeistung={setLeistung} />}

      <nav className="nav">
        {TABS.map(({ id, label, Icon }) => (
          <button key={id} className={`nav-btn${tab === id ? ' active' : ''}`} onClick={() => setTab(id)} style={{ position: 'relative' }}>
            {id === 'projekte' && projekte.length > 0 && tab !== 'projekte' && <span className="nav-badge">{projekte.length}</span>}
            <Icon />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
