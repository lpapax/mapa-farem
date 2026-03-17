// frontend/src/pages/RegisterFarmPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Check, ChevronRight, ChevronLeft, Eye } from 'lucide-react';

const CSS_VARS = `
  :root { --green:#2D5016;--gold:#C8963E;--cream:#FAF7F2;--text:#1A1A1A;--muted:#6B7280;--border:#E8E0D0; }
  *{box-sizing:border-box;margin:0;padding:0;}
  input:focus,select:focus,textarea:focus{outline:none;border-color:#2D5016!important;box-shadow:0 0 0 3px rgba(45,80,22,0.12)!important;}
  input::placeholder,textarea::placeholder{color:#bbb;}
  @media(max-width:600px){
    .type-grid{grid-template-columns:repeat(3,1fr)!important;}
    .products-grid{grid-template-columns:repeat(2,1fr)!important;}
    .contact-grid{grid-template-columns:1fr!important;}
  }
`;

const FARM_TYPES = [
  { id: 'veggie', emoji: '🥬', label: 'Zelenina' },
  { id: 'meat',   emoji: '🥩', label: 'Maso' },
  { id: 'dairy',  emoji: '🧀', label: 'Mléčné' },
  { id: 'honey',  emoji: '🍯', label: 'Med' },
  { id: 'bio',    emoji: '🌿', label: 'BIO' },
  { id: 'wine',   emoji: '🍷', label: 'Víno' },
];

const REGIONS = [
  'Praha','Středočeský kraj','Jihočeský kraj','Plzeňský kraj',
  'Karlovarský kraj','Ústecký kraj','Liberecký kraj','Královéhradecký kraj',
  'Pardubický kraj','Kraj Vysočina','Jihomoravský kraj','Olomoucký kraj',
  'Zlínský kraj','Moravskoslezský kraj',
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
  { id: 'honey',        emoji: '🍯', label: 'Med' },
  { id: 'eggs',         emoji: '🥚', label: 'Vejce' },
  { id: 'milk',         emoji: '🥛', label: 'Mléko' },
  { id: 'cheese',       emoji: '🧀', label: 'Sýry' },
  { id: 'meat',         emoji: '🥩', label: 'Maso' },
  { id: 'wine',         emoji: '🍷', label: 'Víno' },
  { id: 'herbs',        emoji: '🌿', label: 'Bylinky' },
];

const STEPS = [
  { num: 1, label: 'Základní info' },
  { num: 2, label: 'Produkty' },
  { num: 3, label: 'Kontakt' },
  { num: 4, label: 'Fotografie' },
  { num: 5, label: 'Náhled' },
];

const DRAFT_KEY = 'farm-draft-v2';

function initForm() {
  return {
    name: '', region: '', type: '', description: '',
    foundedYear: '', hectares: '', bioCert: false, delivery: false, eshop: false,
    products: [],
    street: '', city: '', lat: '', lng: '',
    phone: '', email: '', website: '', hoursText: '',
    coverPhoto: '', additionalPhotos: ['','','','',''],
    agreedToTerms: false,
  };
}

const inputStyle = {
  width: '100%', padding: '12px 15px',
  border: '1.5px solid #E8E0D0', borderRadius: 10,
  fontSize: 14, fontFamily: "'Inter',sans-serif",
  outline: 'none', background: '#FFFFFF', color: '#1A1A1A', boxSizing: 'border-box',
};

const labelStyle = { fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 6, display: 'block' };
const fieldStyle = { display: 'flex', flexDirection: 'column', gap: 4 };

function ErrorMsg({ msg }) {
  return (
    <div style={{ fontSize: 12, color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 7, padding: '6px 10px', marginTop: 2 }}>
      {msg}
    </div>
  );
}

function StepHeading({ num, title }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#C8963E', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>Krok {num} z 5</div>
      <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, color: '#1A1A1A' }}>{title}</h2>
    </div>
  );
}

function ToggleSwitch({ on, onChange, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: '#FAF7F2', borderRadius: 10, border: '1.5px solid #E8E0D0' }}>
      <span style={{ fontSize: 14, fontWeight: 500, color: '#1A1A1A' }}>{label}</span>
      <div onClick={() => onChange(!on)} style={{ width: 44, height: 24, borderRadius: 12, background: on ? '#2D5016' : '#E8E0D0', cursor: 'pointer', position: 'relative', transition: 'background .25s' }}>
        <div style={{ position: 'absolute', top: 3, left: on ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: 'white', transition: 'left .25s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
      </div>
    </div>
  );
}

export default function RegisterFarmPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(() => {
    try { const s = localStorage.getItem(DRAFT_KEY); return s ? { ...initForm(), ...JSON.parse(s) } : initForm(); } catch { return initForm(); }
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const topRef = useRef(null);

  useEffect(() => {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(form)); } catch {}
  }, [form, step]);

  useEffect(() => {
    if (topRef.current) topRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [step]);

  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const toggleProduct = (id) => setForm(f => ({
    ...f, products: f.products.includes(id) ? f.products.filter(p => p !== id) : [...f.products, id],
  }));

  function validate(s) {
    const e = {};
    if (s === 1) {
      if (!form.name.trim()) e.name = 'Zadejte název farmy.';
      if (!form.region) e.region = 'Vyberte kraj.';
      if (!form.type) e.type = 'Vyberte typ farmy.';
      if (!form.description.trim()) e.description = 'Napište krátký popis.';
    }
    if (s === 2 && form.products.length === 0) e.products = 'Vyberte alespoň jeden produkt.';
    if (s === 3 && !form.phone.trim() && !form.email.trim()) e.contact = 'Zadejte alespoň telefon nebo email.';
    return e;
  }

  function goNext() {
    const errs = validate(step);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setStep(s => s + 1);
  }

  function handlePublish() {
    if (!form.agreedToTerms) { setErrors({ terms: 'Musíte souhlasit s podmínkami.' }); return; }
    localStorage.removeItem(DRAFT_KEY);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAF7F2', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'Inter',sans-serif" }}>
        <div style={{ textAlign: 'center', maxWidth: 520 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#2D5016', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Check size={36} color="white" />
          </div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 34, fontWeight: 700, color: '#1A1A1A', marginBottom: 12 }}>
            Farma přijata!
          </h1>
          <p style={{ color: '#6B7280', lineHeight: 1.8, fontSize: 16, marginBottom: 32 }}>
            Děkujeme za přidání <strong>{form.name || 'vaší farmy'}</strong>.<br />
            Po ověření se zobrazí na mapě — obvykle do 24 hodin.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/mapa')} style={{ padding: '13px 28px', background: '#2D5016', color: 'white', border: 'none', borderRadius: 9999, fontWeight: 700, cursor: 'pointer', fontSize: 15 }}>
              Zpět na mapu →
            </button>
            <button onClick={() => { setSubmitted(false); setStep(1); setForm(initForm()); setErrors({}); }}
              style={{ padding: '13px 28px', background: 'white', color: '#2D5016', border: '2px solid #2D5016', borderRadius: 9999, fontWeight: 700, cursor: 'pointer', fontSize: 15 }}>
              + Přidat další farmu
            </button>
          </div>
        </div>
      </div>
    );
  }

  const selectedType = FARM_TYPES.find(t => t.id === form.type);

  return (
    <div ref={topRef} style={{ minHeight: '100vh', background: '#FAF7F2', fontFamily: "'Inter',sans-serif" }}>
      <style>{CSS_VARS}</style>

      {/* Top nav */}
      <div style={{ background: 'rgba(45,80,22,0.97)', backdropFilter: 'blur(14px)', padding: '0 32px', height: 62, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 22 }}>🌾</span>
          <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: '#FAF7F2' }}>
            Mapa<span style={{ color: '#C8963E' }}>Farem</span>.cz
          </span>
        </Link>
        <Link to="/mapa" style={{ fontSize: 13, color: 'rgba(250,247,242,0.6)', textDecoration: 'none', fontWeight: 500 }}>← Zpět na mapu</Link>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 20px 100px' }}>
        {/* Page title */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 34, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>
            Přidat farmu na mapu
          </h1>
          <p style={{ color: '#6B7280', fontSize: 14 }}>Zdarma · Zobrazí se po ověření · Tisíce zákazníků</p>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: 32 }}>
          {/* Bar */}
          <div style={{ height: 4, background: '#E8E0D0', borderRadius: 9999, marginBottom: 20, position: 'relative' }}>
            <div style={{ height: '100%', width: `${((step - 1) / 4) * 100}%`, background: '#C8963E', borderRadius: 9999, transition: 'width 0.3s ease' }} />
          </div>
          {/* Steps */}
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            {STEPS.map((s, i) => {
              const isCompleted = step > s.num;
              const isCurrent = step === s.num;
              return (
                <div key={s.num} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                  {i > 0 && (
                    <div style={{ position: 'absolute', top: 16, left: '-50%', right: '50%', height: 2, background: isCompleted ? '#C8963E' : '#E8E0D0', transition: 'background 0.3s' }} />
                  )}
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, zIndex: 1, transition: 'all 0.3s', flexShrink: 0,
                    background: isCompleted ? '#C8963E' : isCurrent ? '#2D5016' : '#FAF7F2',
                    color: isCompleted || isCurrent ? 'white' : '#9CA3AF',
                    border: isCompleted || isCurrent ? 'none' : '2px solid #E8E0D0',
                  }}>
                    {isCompleted ? <Check size={14} /> : s.num}
                  </div>
                  <div style={{ fontSize: 10, marginTop: 6, color: isCurrent ? '#2D5016' : isCompleted ? '#C8963E' : '#9CA3AF', fontWeight: isCurrent ? 700 : 500, textAlign: 'center', lineHeight: 1.3, maxWidth: 72, padding: '0 2px' }}>
                    {s.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card */}
        <div style={{ background: '#FFFFFF', borderRadius: 22, padding: '36px 36px 28px', boxShadow: '0 4px 32px rgba(26,45,24,0.10)', border: '1px solid #E8E0D0', marginBottom: 20 }}>

          {/* STEP 1 */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <StepHeading num={1} title="Základní informace" />
              <div style={fieldStyle}>
                <label style={labelStyle}>Název farmy *</label>
                <input style={{ ...inputStyle, borderColor: errors.name ? '#FCA5A5' : '#E8E0D0' }} type="text" placeholder="např. Biofarma Nováků" value={form.name} onChange={e => setField('name', e.target.value)} maxLength={100} />
                {errors.name && <ErrorMsg msg={errors.name} />}
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>Typ farmy *</label>
                <div className="type-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 10 }}>
                  {FARM_TYPES.map(t => {
                    const active = form.type === t.id;
                    return (
                      <div key={t.id} onClick={() => setField('type', t.id)} style={{ padding: '14px 8px', borderRadius: 13, border: `2px solid ${active ? '#2D5016' : '#E8E0D0'}`, background: active ? 'rgba(45,80,22,0.08)' : '#FFFFFF', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s', userSelect: 'none' }}>
                        <div style={{ fontSize: 24 }}>{t.emoji}</div>
                        <div style={{ fontSize: 11, fontWeight: 700, marginTop: 5, color: active ? '#2D5016' : '#6B7280', lineHeight: 1.2 }}>{t.label}</div>
                      </div>
                    );
                  })}
                </div>
                {errors.type && <ErrorMsg msg={errors.type} />}
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>Kraj *</label>
                <select style={{ ...inputStyle, borderColor: errors.region ? '#FCA5A5' : '#E8E0D0', cursor: 'pointer', appearance: 'none', backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath fill='%23888' d='M6 8L0 0h12z'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', paddingRight: 36 }}
                  value={form.region} onChange={e => setField('region', e.target.value)}>
                  <option value="">-- Vyberte kraj --</option>
                  {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                {errors.region && <ErrorMsg msg={errors.region} />}
              </div>
              <div style={fieldStyle}>
                <label style={{ ...labelStyle, display: 'flex', justifyContent: 'space-between' }}>
                  <span>Krátký popis *</span>
                  <span style={{ fontWeight: 400, color: '#aaa' }}>{form.description.length}/280</span>
                </label>
                <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 110, borderColor: errors.description ? '#FCA5A5' : '#E8E0D0' }} placeholder="Pár vět o vaší farmě — co pěstujete, jak nakupovat..." value={form.description} onChange={e => setField('description', e.target.value)} maxLength={280} />
                {errors.description && <ErrorMsg msg={errors.description} />}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Rok založení <span style={{ fontWeight: 400, color: '#aaa' }}>(nepovinné)</span></label>
                  <input style={inputStyle} type="number" placeholder="např. 2008" value={form.foundedYear} onChange={e => setField('foundedYear', e.target.value)} min={1900} max={2026} />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Rozloha (ha) <span style={{ fontWeight: 400, color: '#aaa' }}>(nepovinné)</span></label>
                  <input style={inputStyle} type="number" placeholder="např. 12" value={form.hectares} onChange={e => setField('hectares', e.target.value)} min={0} step={0.1} />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <StepHeading num={2} title="Produkty a certifikace" />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontSize: 14, color: '#6B7280' }}>Vyberte produkty, které vaše farma nabízí.</p>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#2D5016', background: 'rgba(45,80,22,0.08)', padding: '4px 12px', borderRadius: 20 }}>
                  {form.products.length} vybraných
                </div>
              </div>
              <div className="products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
                {PRODUCTS.map(p => {
                  const sel = form.products.includes(p.id);
                  return (
                    <div key={p.id} onClick={() => toggleProduct(p.id)} style={{ padding: '12px 8px', borderRadius: 12, border: `2px solid ${sel ? '#2D5016' : '#E8E0D0'}`, background: sel ? 'rgba(45,80,22,0.07)' : '#FFFFFF', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s', userSelect: 'none', position: 'relative' }}>
                      {sel && <div style={{ position: 'absolute', top: 5, right: 7, width: 16, height: 16, background: '#2D5016', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={9} color="white" /></div>}
                      <div style={{ fontSize: 24 }}>{p.emoji}</div>
                      <div style={{ fontSize: 11, fontWeight: 600, marginTop: 4, color: sel ? '#2D5016' : '#6B7280', lineHeight: 1.2 }}>{p.label}</div>
                    </div>
                  );
                })}
              </div>
              {errors.products && <ErrorMsg msg={errors.products} />}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
                <ToggleSwitch on={form.bioCert} onChange={v => setField('bioCert', v)} label="🌱 BIO certifikace" />
                <ToggleSwitch on={form.delivery} onChange={v => setField('delivery', v)} label="🚚 Nabízíte rozvoz?" />
                <ToggleSwitch on={form.eshop} onChange={v => setField('eshop', v)} label="🛒 Máte e-shop?" />
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <StepHeading num={3} title="Kontakt a poloha" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Ulice a číslo popisné</label>
                  <input style={inputStyle} type="text" placeholder="Farmářská 12" value={form.street} onChange={e => setField('street', e.target.value)} />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Město / obec</label>
                  <input style={inputStyle} type="text" placeholder="Olomouc" value={form.city} onChange={e => setField('city', e.target.value)} />
                </div>
              </div>
              <div className="contact-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={fieldStyle}>
                  <label style={labelStyle}>GPS — šířka (lat)</label>
                  <input style={inputStyle} type="number" placeholder="např. 49.5938" step="0.0001" value={form.lat} onChange={e => setField('lat', e.target.value)} />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>GPS — délka (lng)</label>
                  <input style={inputStyle} type="number" placeholder="např. 17.2509" step="0.0001" value={form.lng} onChange={e => setField('lng', e.target.value)} />
                </div>
              </div>
              <p style={{ fontSize: 12, color: '#6B7280', background: '#FAF7F2', borderRadius: 8, padding: '8px 12px', border: '1px solid #E8E0D0' }}>
                📍 GPS souřadnice najdete na <a href="https://mapy.cz" target="_blank" rel="noopener noreferrer" style={{ color: '#2D5016', fontWeight: 600 }}>mapy.cz</a> — pravý klik → "Co je zde?"
              </p>
              <div className="contact-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Telefon</label>
                  <input style={{ ...inputStyle, borderColor: errors.contact ? '#FCA5A5' : '#E8E0D0' }} type="tel" placeholder="+420 123 456 789" value={form.phone} onChange={e => setField('phone', e.target.value)} />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Email</label>
                  <input style={{ ...inputStyle, borderColor: errors.contact ? '#FCA5A5' : '#E8E0D0' }} type="email" placeholder="farma@email.cz" value={form.email} onChange={e => setField('email', e.target.value)} />
                </div>
              </div>
              {errors.contact && <ErrorMsg msg={errors.contact} />}
              <div style={fieldStyle}>
                <label style={labelStyle}>Web / e-shop <span style={{ fontWeight: 400, color: '#aaa' }}>(volitelné)</span></label>
                <input style={inputStyle} type="url" placeholder="https://mojefarma.cz" value={form.website} onChange={e => setField('website', e.target.value)} />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>Otevírací doba <span style={{ fontWeight: 400, color: '#aaa' }}>(volitelné)</span></label>
                <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 90 }} placeholder={'Po–Pá 8:00–17:00\nSo 8:00–12:00\nNe zavřeno'} value={form.hoursText || ''} onChange={e => setField('hoursText', e.target.value)} />
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <StepHeading num={4} title="Fotografie" />
              <p style={{ fontSize: 14, color: '#6B7280', marginTop: -8 }}>Přidejte URL fotografií vaší farmy. Doporučujeme Google Photos nebo Imgur.</p>
              <div style={fieldStyle}>
                <label style={labelStyle}>Hlavní fotografie (URL)</label>
                <input style={inputStyle} type="url" placeholder="https://images.unsplash.com/..." value={form.coverPhoto} onChange={e => setField('coverPhoto', e.target.value)} />
                {form.coverPhoto && (
                  <div style={{ marginTop: 8, borderRadius: 12, overflow: 'hidden', height: 180 }}>
                    <img src={form.coverPhoto} alt="Náhled" onError={e => { e.currentTarget.style.display = 'none'; }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
              </div>
              {form.additionalPhotos.map((url, i) => (
                <div key={i} style={fieldStyle}>
                  <label style={labelStyle}>Fotografie {i + 2} <span style={{ fontWeight: 400, color: '#aaa' }}>(volitelné)</span></label>
                  <input style={inputStyle} type="url" placeholder="https://..." value={url}
                    onChange={e => { const arr = [...form.additionalPhotos]; arr[i] = e.target.value; setField('additionalPhotos', arr); }} />
                </div>
              ))}
              <p style={{ fontSize: 12, color: '#6B7280', background: '#FAF7F2', borderRadius: 8, padding: '8px 12px', border: '1px solid #E8E0D0' }}>
                💡 Doporučujeme fotky z Google Photos, Imgur nebo podobné služby s veřejným přístupem.
              </p>
            </div>
          )}

          {/* STEP 5 */}
          {step === 5 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <StepHeading num={5} title="Náhled a publikování" />
              {/* Preview card */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Náhled karty farmy</div>
                <div style={{ borderRadius: 18, overflow: 'hidden', border: '1px solid #E8E0D0', boxShadow: '0 2px 16px rgba(26,45,24,0.08)', background: '#FFFFFF' }}>
                  <div style={{ height: 160, background: form.coverPhoto ? 'transparent' : 'linear-gradient(135deg, #D4E4C8 0%, #B8D0A0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, position: 'relative', overflow: 'hidden' }}>
                    {form.coverPhoto
                      ? <img src={form.coverPhoto} alt="Cover" onError={e => { e.currentTarget.style.display='none'; }} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                      : selectedType ? selectedType.emoji : '🌾'
                    }
                  </div>
                  <div style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: '#1A1A1A' }}>
                        {form.name || 'Název farmy'}
                      </h3>
                      {selectedType && <span style={{ fontSize: 11, fontWeight: 700, background: 'rgba(45,80,22,0.1)', color: '#2D5016', padding: '3px 10px', borderRadius: 20 }}>{selectedType.emoji} {selectedType.label}</span>}
                    </div>
                    {form.region && <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 8 }}>📍 {form.city ? form.city + ' · ' : ''}{form.region}</p>}
                    {form.description && <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6, marginBottom: 10 }}>{form.description.slice(0, 120)}{form.description.length > 120 ? '…' : ''}</p>}
                    {form.products.length > 0 && (
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                        {form.products.slice(0, 5).map(pid => {
                          const p = PRODUCTS.find(x => x.id === pid);
                          return p ? <span key={pid} style={{ fontSize: 11, background: '#FAF7F2', color: '#6B7280', padding: '3px 8px', borderRadius: 10, fontWeight: 600, border: '1px solid #E8E0D0' }}>{p.emoji} {p.label}</span> : null;
                        })}
                        {form.products.length > 5 && <span style={{ fontSize: 11, color: '#aaa', padding: '3px 6px' }}>+{form.products.length - 5}</span>}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div style={{ background: '#FAF7F2', borderRadius: 14, padding: '18px 20px', border: '1px solid #E8E0D0' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>Shrnutí</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    ['Název', form.name],
                    ['Kraj', form.region],
                    ['Typ', selectedType ? `${selectedType.emoji} ${selectedType.label}` : ''],
                    ['Produkty', `${form.products.length} vybraných`],
                    form.phone && ['Telefon', form.phone],
                    form.email && ['Email', form.email],
                    form.website && ['Web', form.website],
                  ].filter(Boolean).map(([label, value]) => value ? (
                    <div key={label} style={{ display: 'flex', gap: 8, fontSize: 13 }}>
                      <span style={{ fontWeight: 600, color: '#6B7280', minWidth: 80 }}>{label}:</span>
                      <span style={{ color: '#1A1A1A' }}>{value}</span>
                    </div>
                  ) : null)}
                </div>
              </div>

              {/* Terms */}
              <div onClick={() => setField('agreedToTerms', !form.agreedToTerms)} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', padding: '14px 16px', border: '1.5px solid #E8E0D0', borderRadius: 12, background: '#FAF7F2' }}>
                <div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${form.agreedToTerms ? '#2D5016' : '#E8E0D0'}`, background: form.agreedToTerms ? '#2D5016' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .15s' }}>
                  {form.agreedToTerms && <Check size={12} color="white" />}
                </div>
                <span style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.5 }}>
                  Souhlasím s <span style={{ color: '#2D5016', fontWeight: 600 }}>podmínkami použití</span> a <span style={{ color: '#2D5016', fontWeight: 600 }}>zásadami ochrany osobních údajů</span> MapaFarem.cz.
                </span>
              </div>
              {errors.terms && <ErrorMsg msg={errors.terms} />}

              <button onClick={handlePublish} style={{ width: '100%', padding: '16px', background: '#2D5016', color: 'white', border: 'none', borderRadius: 9999, fontSize: 17, fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 20px rgba(45,80,22,0.25)', transition: 'background .15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#1E3A0F'}
                onMouseLeave={e => e.currentTarget.style.background = '#2D5016'}>
                Publikovat farmu zdarma →
              </button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: step > 1 ? 'space-between' : 'flex-end', alignItems: 'center' }}>
          {step > 1 && (
            <button onClick={() => { setErrors({}); setStep(s => s - 1); }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '12px 24px', background: '#FFFFFF', color: '#6B7280', border: '1.5px solid #E8E0D0', borderRadius: 9999, fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#2D5016'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#E8E0D0'}>
              <ChevronLeft size={16} /> Zpět
            </button>
          )}
          {step < 5 && (
            <button onClick={goNext}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '13px 32px', background: '#C8963E', color: 'white', border: 'none', borderRadius: 9999, fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(200,150,62,0.3)', transition: 'background .15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#B8853A'}
              onMouseLeave={e => e.currentTarget.style.background = '#C8963E'}>
              Pokračovat <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
