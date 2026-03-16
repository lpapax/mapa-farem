// frontend/src/pages/RegisterFarmPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// ─── Design tokens ───────────────────────────────────────────────────────────
const C = {
  cream: '#F5EDE0',
  terra: '#BF5B3D',
  green: '#3A5728',
  dark:  '#1A2D18',
  gold:  '#C8973A',
  white: '#FFFFFF',
  border: 'rgba(58,87,40,0.18)',
  borderFocus: '#3A5728',
  cardShadow: '0 4px 32px rgba(26,45,24,0.10)',
  errorBg: '#FEE2E2',
  errorBorder: '#FCA5A5',
  errorText: '#991B1B',
};

// ─── Data ────────────────────────────────────────────────────────────────────
const FARM_TYPES = [
  { id: 'veggie',  emoji: '🥬', label: 'Zelenina' },
  { id: 'meat',    emoji: '🥩', label: 'Maso' },
  { id: 'dairy',   emoji: '🧀', label: 'Mléčné' },
  { id: 'honey',   emoji: '🍯', label: 'Med' },
  { id: 'bio',     emoji: '🌿', label: 'Bio' },
  { id: 'wine',    emoji: '🍷', label: 'Víno' },
  { id: 'mixed',   emoji: '🌾', label: 'Smíšená' },
];

const REGIONS = [
  'Praha', 'Středočeský kraj', 'Jihočeský kraj', 'Plzeňský kraj',
  'Karlovarský kraj', 'Ústecký kraj', 'Liberecký kraj', 'Královéhradecký kraj',
  'Pardubický kraj', 'Kraj Vysočina', 'Jihomoravský kraj', 'Olomoucký kraj',
  'Zlínský kraj', 'Moravskoslezský kraj',
];

const PRODUCTS = [
  { id: 'strawberries', emoji: '🍓', label: 'Jahody' },
  { id: 'tomatoes',     emoji: '🍅', label: 'Rajčata' },
  { id: 'cucumbers',    emoji: '🥒', label: 'Okurky' },
  { id: 'potatoes',     emoji: '🥔', label: 'Brambory' },
  { id: 'carrots',      emoji: '🥕', label: 'Mrkev' },
  { id: 'pumpkin',      emoji: '🎃', label: 'Dýně' },
  { id: 'apples',       emoji: '🍎', label: 'Jablka' },
  { id: 'pears',        emoji: '🍐', label: 'Hrušky' },
  { id: 'blueberries',  emoji: '🫐', label: 'Borůvky' },
  { id: 'raspberries',  emoji: '🍇', label: 'Maliny' },
  { id: 'honey',        emoji: '🍯', label: 'Med' },
  { id: 'eggs',         emoji: '🥚', label: 'Vejce' },
  { id: 'milk',         emoji: '🥛', label: 'Mléko' },
  { id: 'cheese',       emoji: '🧀', label: 'Sýry' },
  { id: 'yogurt',       emoji: '🍶', label: 'Jogurt' },
  { id: 'meat',         emoji: '🥩', label: 'Maso' },
  { id: 'poultry',      emoji: '🐔', label: 'Drůbež' },
  { id: 'fish',         emoji: '🐟', label: 'Ryby' },
  { id: 'wine',         emoji: '🍷', label: 'Víno' },
  { id: 'herbs',        emoji: '🌿', label: 'Bylinky' },
];


const STEPS = [
  { num: 1, label: 'Info' },
  { num: 2, label: 'Produkty' },
  { num: 3, label: 'Kontakt' },
  { num: 4, label: 'Foto' },
  { num: 5, label: 'Náhled' },
];

const DRAFT_KEY = 'farm-draft';

// ─── Initial form state ───────────────────────────────────────────────────────
function initForm() {
  return {
    name: '',
    region: '',
    type: '',
    description: '',
    products: [],
    phone: '',
    email: '',
    website: '',
    hoursText: '',
  };
}

// ─── Shared input styles ──────────────────────────────────────────────────────
const inputStyle = {
  width: '100%',
  padding: '12px 15px',
  border: `1.5px solid ${C.border}`,
  borderRadius: 10,
  fontSize: 14,
  fontFamily: "'DM Sans', sans-serif",
  outline: 'none',
  background: C.white,
  color: C.dark,
  boxSizing: 'border-box',
};

const labelStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: '#444',
  marginBottom: 6,
  display: 'block',
};

const fieldStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function RegisterFarmPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      return saved ? { ...initForm(), ...JSON.parse(saved) } : initForm();
    } catch {
      return initForm();
    }
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const topRef = useRef(null);

  // Save draft on every form/step change
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    } catch {}
  }, [form, step]);

  // Scroll to top on step change
  useEffect(() => {
    if (topRef.current) topRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [step]);

  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const toggleProduct = (id) => {
    setForm(f => ({
      ...f,
      products: f.products.includes(id)
        ? f.products.filter(p => p !== id)
        : [...f.products, id],
    }));
  };

  // ─── Validation ─────────────────────────────────────────────────────────────
  function validate(s) {
    const errs = {};
    if (s === 1) {
      if (!form.name.trim()) errs.name = 'Zadejte název farmy.';
      if (!form.region) errs.region = 'Vyberte kraj.';
      if (!form.type) errs.type = 'Vyberte typ farmy.';
      if (!form.description.trim()) errs.description = 'Napište krátký popis.';
    }
    if (s === 2) {
      if (form.products.length === 0) errs.products = 'Vyberte alespoň jeden produkt.';
    }
    if (s === 3) {
      if (!form.phone.trim() && !form.email.trim()) {
        errs.contact = 'Zadejte alespoň telefon nebo email.';
      }
    }
    return errs;
  }

  function goNext() {
    const errs = validate(step);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setStep(s => s + 1);
  }

  function goBack() {
    setErrors({});
    setStep(s => s - 1);
  }

  function handlePublish() {
    localStorage.removeItem(DRAFT_KEY);
    setSubmitted(true);
  }

  // ─── Success screen ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: C.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'DM Sans', sans-serif" }}>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,600&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <div style={{ textAlign: 'center', maxWidth: 520 }}>
          <div style={{ fontSize: 80, marginBottom: 24 }}>🎉</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 34, fontWeight: 700, color: C.dark, marginBottom: 12 }}>
            Farma přijata!
          </h1>
          <p style={{ color: '#666', lineHeight: 1.8, fontSize: 16, marginBottom: 32 }}>
            Děkujeme za přidání <strong>{form.name || 'vaší farmy'}</strong>.<br />
            Po ověření se zobrazí na mapě — obvykle do 24 hodin.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/mapa')} style={{ padding: '13px 28px', background: C.green, color: C.white, border: 'none', borderRadius: 11, fontWeight: 700, cursor: 'pointer', fontSize: 15, boxShadow: '0 4px 16px rgba(58,87,40,.25)' }}>
              Zpět na mapu
            </button>
            <button onClick={() => { setSubmitted(false); setStep(1); setForm(initForm()); setErrors({}); }}
              style={{ padding: '13px 28px', background: C.white, color: C.green, border: `2px solid ${C.green}`, borderRadius: 11, fontWeight: 700, cursor: 'pointer', fontSize: 15 }}>
              + Přidat další farmu
            </button>
          </div>
        </div>
      </div>
    );
  }

  const selectedType = FARM_TYPES.find(t => t.id === form.type);

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: C.cream, fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,600&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        input:focus,select:focus,textarea:focus{outline:none;border-color:${C.green}!important;box-shadow:0 0 0 3px rgba(58,87,40,0.12)!important;}
        input::placeholder,textarea::placeholder{color:#bbb;}
        @media(max-width:600px){
          .wizard-grid{grid-template-columns:1fr!important;}
          .products-grid{grid-template-columns:repeat(2,1fr)!important;}
          .photos-grid{grid-template-columns:repeat(2,1fr)!important;}
          .days-row{flex-direction:column!important;}
        }
      `}</style>

      {/* ── Top nav ── */}
      <div ref={topRef} style={{ background: 'rgba(245,237,224,0.97)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(191,91,61,0.12)', padding: '0 32px', height: 62, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 12px rgba(44,24,16,0.06)' }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 22 }}>🌾</span>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: '#2C1810' }}>
            Mapa<span style={{ color: C.terra }}>Farem</span>
          </span>
        </Link>
        <Link to="/mapa" style={{ fontSize: 13, color: '#6B4F3A', textDecoration: 'none', fontWeight: 500 }}>← Zpět na mapu</Link>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 20px 80px' }}>

        {/* ── Page title ── */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 34, fontWeight: 700, color: C.dark, marginBottom: 8 }}>
            Přidat farmu na mapu
          </h1>
          <p style={{ color: '#888', fontSize: 14 }}>Zdarma · Zobrazí se po ověření · Tisíce zákazníků</p>
        </div>

        {/* ── Progress indicator ── */}
        <ProgressBar step={step} />

        {/* ── Card ── */}
        <div style={{ background: C.white, borderRadius: 22, padding: '36px 36px 28px', boxShadow: C.cardShadow, border: `1px solid ${C.border}`, marginTop: 28 }}>

          {step === 1 && <Step1 form={form} setField={setField} errors={errors} />}
          {step === 2 && <Step2 form={form} toggleProduct={toggleProduct} errors={errors} />}
          {step === 3 && <Step3 form={form} setField={setField} errors={errors} />}
          {step === 4 && <Step4 dragOver={dragOver} setDragOver={setDragOver} />}
          {step === 5 && <Step5 form={form} selectedType={selectedType} onPublish={handlePublish} />}

        </div>

        {/* ── Navigation ── */}
        {step < 5 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
            <div>
              {step > 1 && (
                <button type="button" onClick={goBack} style={{ padding: '12px 24px', background: C.white, color: '#666', border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}>
                  ← Zpět
                </button>
              )}
            </div>
            <button type="button" onClick={goNext} style={{ padding: '13px 32px', background: C.green, color: C.white, border: 'none', borderRadius: 11, fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(58,87,40,0.25)', transition: 'all 0.15s' }}>
              Pokračovat →
            </button>
          </div>
        )}

        {step === 5 && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 20 }}>
            <button type="button" onClick={goBack} style={{ padding: '12px 24px', background: C.white, color: '#666', border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              ← Zpět
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function ProgressBar({ step }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', position: 'relative' }}>
      {STEPS.map((s, i) => {
        const isCompleted = step > s.num;
        const isCurrent = step === s.num;
        return (
          <div key={s.num} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            {/* Connector line */}
            {i > 0 && (
              <div style={{
                position: 'absolute',
                top: 16,
                left: '-50%',
                right: '50%',
                height: 2,
                background: isCompleted ? '#C8973A' : isCurrent ? '#3A5728' : '#E5E7EB',
                transition: 'background 0.3s',
              }} />
            )}
            {/* Circle */}
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontWeight: 700,
              zIndex: 1,
              background: isCompleted ? '#C8973A' : isCurrent ? '#1A2D18' : '#F5EDE0',
              color: isCompleted || isCurrent ? '#FFFFFF' : '#AAA',
              border: isCompleted || isCurrent ? 'none' : '2px solid #E5E7EB',
              transition: 'all 0.3s',
              flexShrink: 0,
            }}>
              {isCompleted ? '✓' : s.num}
            </div>
            {/* Label */}
            <div style={{
              fontSize: 10,
              marginTop: 6,
              color: isCurrent ? '#3A5728' : isCompleted ? '#3A5728' : '#AAA',
              fontWeight: isCurrent ? 700 : 500,
              textAlign: 'center',
              lineHeight: 1.3,
              maxWidth: 72,
              padding: '0 2px',
            }}>
              {s.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Step 1 — Základní informace ─────────────────────────────────────────────
function Step1({ form, setField, errors }) {
  const descLen = form.description.length;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <StepHeading num={1} title="Základní informace" />

      {/* Farm name */}
      <div style={fieldStyle}>
        <label style={labelStyle}>Název farmy *</label>
        <input
          style={{ ...inputStyle, borderColor: errors.name ? C.errorBorder : C.border }}
          type="text"
          placeholder="např. Biofarma Nováků"
          value={form.name}
          onChange={e => setField('name', e.target.value)}
          maxLength={100}
        />
        {errors.name && <ErrorMsg msg={errors.name} />}
      </div>

      {/* Region */}
      <div style={fieldStyle}>
        <label style={labelStyle}>Kraj *</label>
        <select
          style={{ ...inputStyle, borderColor: errors.region ? C.errorBorder : C.border, cursor: 'pointer', appearance: 'none', backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23888' d='M6 8L0 0h12z'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', paddingRight: 36 }}
          value={form.region}
          onChange={e => setField('region', e.target.value)}
        >
          <option value="">-- Vyberte kraj --</option>
          {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        {errors.region && <ErrorMsg msg={errors.region} />}
      </div>

      {/* Farm type */}
      <div style={fieldStyle}>
        <label style={labelStyle}>Typ farmy *</label>
        <div className="wizard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
          {FARM_TYPES.map(t => {
            const active = form.type === t.id;
            return (
              <div
                key={t.id}
                onClick={() => setField('type', t.id)}
                style={{
                  padding: '14px 8px',
                  borderRadius: 13,
                  border: `2px solid ${active ? '#3A5728' : C.border}`,
                  background: active ? '#EEF4EA' : C.white,
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.15s',
                  userSelect: 'none',
                }}
              >
                <div style={{ fontSize: 26 }}>{t.emoji}</div>
                <div style={{ fontSize: 11, fontWeight: 700, marginTop: 5, color: active ? '#3A5728' : '#555', lineHeight: 1.2 }}>{t.label}</div>
              </div>
            );
          })}
        </div>
        {errors.type && <ErrorMsg msg={errors.type} />}
      </div>

      {/* Description */}
      <div style={fieldStyle}>
        <label style={{ ...labelStyle, display: 'flex', justifyContent: 'space-between' }}>
          <span>Krátký popis *</span>
          <span style={{ fontWeight: 400, color: descLen > 260 ? C.terra : '#aaa' }}>{descLen}/280</span>
        </label>
        <textarea
          style={{ ...inputStyle, resize: 'vertical', minHeight: 110, borderColor: errors.description ? C.errorBorder : C.border }}
          placeholder="Pár vět o vaší farmě — co pěstujete, jak nakupovat, co vás odlišuje..."
          value={form.description}
          onChange={e => descLen < 280 || e.target.value.length <= form.description.length ? setField('description', e.target.value) : null}
          maxLength={280}
        />
        {errors.description && <ErrorMsg msg={errors.description} />}
      </div>
    </div>
  );
}

// ─── Step 2 — Produkty ────────────────────────────────────────────────────────
function Step2({ form, toggleProduct, errors }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <StepHeading num={2} title="Produkty" />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <p style={{ fontSize: 14, color: '#666' }}>Vyberte produkty, které vaše farma nabízí.</p>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#3A5728', background: '#EEF4EA', padding: '4px 12px', borderRadius: 20 }}>
          Vybráno {form.products.length} produktů
        </div>
      </div>

      <div className="products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
        {PRODUCTS.map(p => {
          const selected = form.products.includes(p.id);
          return (
            <div
              key={p.id}
              onClick={() => toggleProduct(p.id)}
              style={{
                padding: '12px 8px',
                borderRadius: 12,
                border: `2px solid ${selected ? '#3A5728' : C.border}`,
                background: selected ? '#EEF4EA' : C.white,
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.15s',
                userSelect: 'none',
                position: 'relative',
              }}
            >
              {selected && (
                <div style={{ position: 'absolute', top: 5, right: 7, width: 16, height: 16, background: '#3A5728', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: 'white', fontWeight: 700 }}>✓</div>
              )}
              <div style={{ fontSize: 24 }}>{p.emoji}</div>
              <div style={{ fontSize: 11, fontWeight: 600, marginTop: 4, color: selected ? '#3A5728' : '#555', lineHeight: 1.2 }}>{p.label}</div>
            </div>
          );
        })}
      </div>
      {errors.products && <ErrorMsg msg={errors.products} />}
    </div>
  );
}

// ─── Step 3 — Kontakt & Otevírací doba ───────────────────────────────────────
function Step3({ form, setField, errors }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <StepHeading num={3} title="Kontakt & Otevírací doba" />

      {/* Contact fields */}
      <div className="wizard-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Telefon</label>
          <input style={{ ...inputStyle, borderColor: errors.contact ? C.errorBorder : C.border }} type="tel" placeholder="+420 123 456 789" value={form.phone} onChange={e => setField('phone', e.target.value)} />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Email</label>
          <input style={{ ...inputStyle, borderColor: errors.contact ? C.errorBorder : C.border }} type="email" placeholder="farma@email.cz" value={form.email} onChange={e => setField('email', e.target.value)} />
        </div>
      </div>
      {errors.contact && <ErrorMsg msg={errors.contact} />}

      <div style={fieldStyle}>
        <label style={labelStyle}>Web / e-shop <span style={{ fontWeight: 400, color: '#aaa' }}>(volitelné)</span></label>
        <input style={inputStyle} type="url" placeholder="https://mojefarma.cz" value={form.website} onChange={e => setField('website', e.target.value)} />
      </div>

      {/* Opening hours — simple textarea */}
      <div style={fieldStyle}>
        <label style={labelStyle}>Otevírací doba <span style={{ fontWeight: 400, color: '#aaa' }}>(volitelné)</span></label>
        <textarea
          style={{ ...inputStyle, resize: 'vertical', minHeight: 90 }}
          placeholder={'Po–Pá 8:00–17:00\nSo 8:00–12:00\nNe zavřeno'}
          value={form.hoursText || ''}
          onChange={e => setField('hoursText', e.target.value)}
        />
        <div style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>Napište volně, např. "Po–Pá 8–17, So 8–12"</div>
      </div>
    </div>
  );
}

// ─── Step 4 — Fotografie ──────────────────────────────────────────────────────
function Step4({ dragOver, setDragOver }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <StepHeading num={4} title="Fotografie" />
      <p style={{ fontSize: 14, color: '#666', marginTop: -8 }}>Přidejte fotografie vaší farmy a produktů. Dobré fotografie výrazně zvyšují zájem zákazníků.</p>

      {/* Dropzone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); }}
        style={{
          border: `2px dashed ${dragOver ? '#3A5728' : C.border}`,
          borderRadius: 16,
          background: dragOver ? '#EEF4EA' : '#FAFAF8',
          padding: '40px 24px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
      >
        <div style={{ fontSize: 44, marginBottom: 12 }}>📷</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#3A5728', marginBottom: 6 }}>Přetáhněte fotografie sem</div>
        <div style={{ fontSize: 13, color: '#888' }}>nebo klikněte pro výběr</div>
        <div style={{ fontSize: 11, color: '#bbb', marginTop: 8 }}>PNG, JPG, WEBP · Max 10 MB každá</div>
      </div>

      {/* Photo slots */}
      <div className="photos-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            style={{
              aspectRatio: '4/3',
              borderRadius: 13,
              background: '#F0EBE3',
              border: `2px dashed ${C.border}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {i === 0 && (
              <div style={{ position: 'absolute', top: 8, left: 8, background: C.gold, color: C.white, fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, letterSpacing: 0.3 }}>
                Hlavní fotografie
              </div>
            )}
            <div style={{ fontSize: 28, color: '#CCC' }}>+</div>
            <div style={{ fontSize: 10, color: '#BBB', marginTop: 4 }}>Přidat foto</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Step 5 — Náhled & Publikování ────────────────────────────────────────────
function Step5({ form, selectedType, onPublish }) {

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <StepHeading num={5} title="Náhled & Publikování" />

      {/* Preview card */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Náhled karty farmy</div>
        <div style={{ borderRadius: 18, overflow: 'hidden', border: `1px solid ${C.border}`, boxShadow: '0 2px 16px rgba(26,45,24,0.08)', background: C.white }}>
          {/* Photo placeholder */}
          <div style={{ height: 160, background: 'linear-gradient(135deg, #D4C8BB 0%, #C4B9AB 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>
            {selectedType ? selectedType.emoji : '🌾'}
          </div>
          <div style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: '#1A2D18' }}>
                {form.name || 'Název farmy'}
              </h3>
              {selectedType && (
                <span style={{ fontSize: 11, fontWeight: 700, background: '#EEF4EA', color: '#3A5728', padding: '3px 9px', borderRadius: 20 }}>
                  {selectedType.emoji} {selectedType.label}
                </span>
              )}
            </div>
            {form.region && <p style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>📍 {form.region}</p>}
            {form.description && <p style={{ fontSize: 13, color: '#555', lineHeight: 1.6, marginBottom: 10 }}>{form.description.slice(0, 120)}{form.description.length > 120 ? '…' : ''}</p>}
            {form.products.length > 0 && (
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {form.products.slice(0, 5).map(pid => {
                  const p = PRODUCTS.find(x => x.id === pid);
                  return p ? (
                    <span key={pid} style={{ fontSize: 11, background: '#F5EDE0', color: '#6B4F3A', padding: '3px 8px', borderRadius: 10, fontWeight: 600 }}>
                      {p.emoji} {p.label}
                    </span>
                  ) : null;
                })}
                {form.products.length > 5 && <span style={{ fontSize: 11, color: '#aaa', padding: '3px 6px' }}>+{form.products.length - 5} dalších</span>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div style={{ background: '#F9F6F1', borderRadius: 14, padding: '18px 20px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>Shrnutí registrace</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <SummaryRow label="Název" value={form.name} />
          <SummaryRow label="Kraj" value={form.region} />
          <SummaryRow label="Typ" value={selectedType ? `${selectedType.emoji} ${selectedType.label}` : ''} />
          <SummaryRow label="Produkty" value={`${form.products.length} vybraných`} />
          {form.phone && <SummaryRow label="Telefon" value={form.phone} />}
          {form.email && <SummaryRow label="Email" value={form.email} />}
          {form.website && <SummaryRow label="Web" value={form.website} />}
          {form.hoursText && <SummaryRow label="Otevřeno" value={form.hoursText} />}
        </div>
      </div>

      {/* Publish buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button
          type="button"
          onClick={onPublish}
          style={{ width: '100%', padding: '16px', background: '#3A5728', color: C.white, border: 'none', borderRadius: 13, fontSize: 17, fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 20px rgba(58,87,40,0.3)', transition: 'all 0.15s', letterSpacing: 0.3 }}
        >
          ✅ Publikovat farmu zdarma
        </button>
        <button
          type="button"
          onClick={() => {
            try { localStorage.setItem(DRAFT_KEY + '_saved', JSON.stringify({ form, savedAt: new Date().toISOString() })); } catch {}
            alert('Koncept uložen!');
          }}
          style={{ width: '100%', padding: '13px', background: C.white, color: '#3A5728', border: `2px solid #3A5728`, borderRadius: 13, fontSize: 15, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}
        >
          Uložit jako koncept
        </button>
      </div>

      {/* Google OAuth hint */}
      <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, background: '#FAFAF8' }}>
        <div style={{ fontSize: 24, flexShrink: 0 }}>🔑</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 2 }}>Přihlaste se pro správu farmy</div>
          <div style={{ fontSize: 12, color: '#888', lineHeight: 1.5 }}>
            Po přihlášení přes{' '}
            <span style={{ color: '#4285F4', fontWeight: 600 }}>Google</span>
            {' '}budete moci farmu upravovat, odpovídat na recenze a sledovat statistiky.
          </div>
        </div>
      </div>

    </div>
  );
}

// ─── Helper components ────────────────────────────────────────────────────────
function StepHeading({ num, title }) {
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#3A5728', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Krok {num} z 5</div>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: '#1A2D18' }}>{title}</h2>
    </div>
  );
}

function ErrorMsg({ msg }) {
  return (
    <div style={{ fontSize: 12, color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 7, padding: '6px 10px', marginTop: 2 }}>
      {msg}
    </div>
  );
}

function SummaryRow({ label, value }) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', gap: 8, fontSize: 13 }}>
      <span style={{ fontWeight: 600, color: '#555', minWidth: 80 }}>{label}:</span>
      <span style={{ color: '#333' }}>{value}</span>
    </div>
  );
}
