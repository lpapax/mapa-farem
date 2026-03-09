// frontend/src/pages/RegisterPage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/index.js';

// ── SHARED AUTH COMPONENTS ─────────────────────────────────────────────────
export function AuthLayout({ title, subtitle, children }) {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight:'100vh', background:'#F4EDD8', display:'grid', placeItems:'center', fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}`}</style>
      <div style={{ width:'100%', maxWidth:420, padding:'0 16px' }}>
        {/* Logo */}
        <div onClick={() => navigate('/')} style={{ textAlign:'center', marginBottom:32, cursor:'pointer' }}>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:900, color:'#1E120A' }}>
            Zem<span style={{ color:'#7DB05A' }}>ě</span>plocha
          </div>
          <div style={{ fontSize:13, color:'#888', marginTop:4 }}>Mapa lokálních farem ČR</div>
        </div>

        <div style={{ background:'white', borderRadius:16, padding:'28px 28px', boxShadow:'0 8px 32px rgba(0,0,0,0.08)' }}>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:700, marginBottom:4 }}>{title}</h1>
          <p style={{ fontSize:13, color:'#888', marginBottom:22 }}>{subtitle}</p>
          {children}
        </div>

        <div style={{ textAlign:'center', marginTop:20 }}>
          <Link to="/" style={{ fontSize:13, color:'#888', textDecoration:'none' }}>← Zpět na mapu</Link>
        </div>
      </div>
    </div>
  );
}

export function Field({ label, type='text', value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#555', marginBottom:5, textTransform:'uppercase', letterSpacing:.5 }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width:'100%', padding:'10px 14px', borderRadius:9, border:'1.5px solid #EDE5D0', fontFamily:"'DM Sans',sans-serif", fontSize:14, outline:'none', background:'#FDFAF4', transition:'border-color 0.15s' }}
        onFocus={e => e.target.style.borderColor='#3A5728'}
        onBlur={e => e.target.style.borderColor='#EDE5D0'} />
    </div>
  );
}

export function AuthButton({ children, loading, onClick }) {
  return (
    <button onClick={onClick} disabled={loading} style={{ width:'100%', padding:'11px', background: loading ? '#888' : '#3A5728', color:'white', border:'none', borderRadius:9, fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:15, cursor: loading ? 'not-allowed' : 'pointer', marginTop:8, transition:'background 0.15s' }}>
      {loading ? '⏳ Načítání…' : children}
    </button>
  );
}

// ── REGISTER PAGE ──────────────────────────────────────────────────────────
export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, loading } = useAuthStore();
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'CUSTOMER' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register(form.name, form.email, form.password, form.role);
    if (result.ok) { toast.success('Účet vytvořen! Vítejte 🌱'); navigate('/'); }
    else toast.error(result.error);
  };

  return (
    <AuthLayout title="Registrace" subtitle="Vytvořte si účet zdarma">
      <form onSubmit={handleSubmit}>
        <Field label="Jméno a příjmení" value={form.name} onChange={v => setForm(f => ({...f, name:v}))} placeholder="Jan Novák" />
        <Field label="E-mail" type="email" value={form.email} onChange={v => setForm(f => ({...f, email:v}))} placeholder="vas@email.cz" />
        <Field label="Heslo (min. 8 znaků)" type="password" value={form.password} onChange={v => setForm(f => ({...f, password:v}))} placeholder="••••••••" />

        {/* Role selection */}
        <div style={{ marginBottom:18 }}>
          <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#555', marginBottom:8, textTransform:'uppercase', letterSpacing:.5 }}>Typ účtu</label>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            {[['CUSTOMER','🛒 Zákazník','Nakupuji od farmářů'], ['FARMER','🌾 Farmář','Prodávám své produkty']].map(([val, label, sub]) => (
              <div key={val} onClick={() => setForm(f => ({...f, role:val}))}
                style={{ padding:'12px 14px', borderRadius:10, border:`2px solid ${form.role===val ? '#3A5728' : '#EDE5D0'}`, background: form.role===val ? '#E8F0E4' : 'white', cursor:'pointer', transition:'all 0.15s' }}>
                <div style={{ fontWeight:700, fontSize:14 }}>{label}</div>
                <div style={{ fontSize:11, color:'#888', marginTop:2 }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>

        <AuthButton loading={loading}>Zaregistrovat se</AuthButton>
      </form>
      <div style={{ textAlign:'center', marginTop:16, fontSize:13, color:'#888' }}>
        Máte účet? <Link to="/login" style={{ color:'#3A5728', fontWeight:700 }}>Přihlaste se</Link>
      </div>
    </AuthLayout>
  );
}
