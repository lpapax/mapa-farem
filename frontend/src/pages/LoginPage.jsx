// frontend/src/pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../supabase';

const PERKS = [
  { emoji: '📍', text: '1 695 farem po celé ČR' },
  { emoji: '🌱', text: 'BIO, lokální, bez mezičlánků' },
  { emoji: '❤️', text: 'Oblíbené farmy vždy po ruce' },
  { emoji: '🚚', text: 'Rozvoz přímo od farmáře' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('from') || '/mapa';
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      if (mode === 'register') {
        const { error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
        if (error) throw error;
        setSuccess('Zkontroluj email a potvrď registraci. Pak se přihlas.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate(redirectTo);
      }
    } catch (err) {
      setError(
        err.message === 'Invalid login credentials' ? 'Špatný email nebo heslo.' :
        err.message === 'User already registered' ? 'Tento email je již registrován.' :
        err.message
      );
    } finally { setLoading(false); }
  }

  async function handleGoogle() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + redirectTo },
    });
    if (error) { setError(error.message); setLoading(false); }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'DM Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;700&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .ai { width:100%; padding:12px 16px; border:1.5px solid rgba(58,87,40,.18); border-radius:10px;
          font-size:15px; font-family:'DM Sans',sans-serif; outline:none; background:white; color:#1E120A; transition:border .2s,box-shadow .2s; }
        .ai:focus { border-color:#3A5728; box-shadow:0 0 0 3px rgba(58,87,40,.1); }
        .ai::placeholder { color:#aaa; }
        .ab { width:100%; padding:13px; border:none; border-radius:11px; font-size:15px;
          font-weight:700; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all .2s; }
        .ab-g { background:#3A5728; color:white; box-shadow:0 4px 16px rgba(58,87,40,.25); }
        .ab-g:hover { background:#2d4420; transform:translateY(-1px); box-shadow:0 6px 20px rgba(58,87,40,.35); }
        .ab-g:disabled { opacity:.6; cursor:not-allowed; transform:none; }
        .ab-google { background:white; color:#1E120A; border:1.5px solid rgba(0,0,0,.13); display:flex; align-items:center; justify-content:center; gap:10px; }
        .ab-google:hover { background:#f8f8f8; border-color:rgba(0,0,0,.25); }
        .mode-tab { flex:1; padding:10px; background:none; border:none; cursor:pointer;
          font-size:14px; font-weight:600; font-family:'DM Sans',sans-serif; color:#aaa;
          border-bottom:2px solid transparent; transition:all .2s; }
        .mode-tab.on { color:#3A5728; border-bottom-color:#3A5728; }
        @media(max-width:768px){ .split-left { display:none !important; } .split-right { padding:24px !important; } }
      `}</style>

      {/* LEFT — brand panel */}
      <div className="split-left" style={{
        flex: '0 0 45%', background: 'linear-gradient(150deg, #1E2D15 0%, #2d4420 50%, #3A5728 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px 56px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position:'absolute', top:-80, right:-80, width:300, height:300, borderRadius:'50%', border:'1px solid rgba(125,176,90,.15)' }} />
        <div style={{ position:'absolute', bottom:-40, left:-40, width:200, height:200, borderRadius:'50%', border:'1px solid rgba(201,155,48,.12)' }} />

        <Link to="/" style={{ textDecoration:'none', display:'inline-block', marginBottom:48 }}>
          <img src="/logo.png" alt="MapaFarem.cz" style={{ height: 64, borderRadius: 10, background: 'white', padding: 4 }} />
        </Link>

        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:38, fontWeight:900, color:'white', lineHeight:1.2, marginBottom:16 }}>
          Lokální farmy<br/><em style={{ color:'#A8C97A' }}>přímo u tebe</em>
        </h2>
        <p style={{ color:'rgba(255,255,255,.65)', fontSize:15, lineHeight:1.8, marginBottom:44, maxWidth:320 }}>
          Přihlas se a získej přístup k oblíbeným farmám, objednávkám a sezónnímu průvodci.
        </p>

        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {PERKS.map(p => (
            <div key={p.text} style={{ display:'flex', alignItems:'center', gap:14 }}>
              <div style={{ width:38, height:38, borderRadius:10, background:'rgba(255,255,255,.08)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>
                {p.emoji}
              </div>
              <span style={{ fontSize:14, color:'rgba(255,255,255,.75)' }}>{p.text}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop:48, paddingTop:32, borderTop:'1px solid rgba(255,255,255,.1)', fontSize:12, color:'rgba(255,255,255,.35)' }}>
          © 2026 MapaFarem.cz · Data: OpenStreetMap
        </div>
      </div>

      {/* RIGHT — form */}
      <div className="split-right" style={{
        flex: 1, display:'flex', alignItems:'center', justifyContent:'center',
        padding: '60px 40px', background: '#FAFAF7',
      }}>
        <div style={{ width:'100%', maxWidth:400 }}>
          {/* Mobile logo */}
          <div style={{ display:'none' }} className="mobile-logo">
            <Link to="/" style={{ textDecoration:'none' }}>
              <img src="/logo.png" alt="MapaFarem.cz" style={{ height: 52, borderRadius: 8, marginBottom: 28 }} />
            </Link>
          </div>

          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:700, color:'#1E120A', marginBottom:6 }}>
            {mode === 'login' ? 'Vítej zpět 👋' : 'Vytvoř účet'}
          </h1>
          <p style={{ fontSize:14, color:'#888', marginBottom:28 }}>
            {mode === 'login' ? 'Přihlaš se ke svému účtu' : 'Registrace je zdarma a trvá 30 vteřin'}
          </p>

          {/* Tabs */}
          <div style={{ display:'flex', borderBottom:'1.5px solid rgba(58,87,40,.15)', marginBottom:24 }}>
            <button className={`mode-tab ${mode==='login'?'on':''}`} onClick={() => { setMode('login'); setError(''); setSuccess(''); }}>
              Přihlášení
            </button>
            <button className={`mode-tab ${mode==='register'?'on':''}`} onClick={() => { setMode('register'); setError(''); setSuccess(''); }}>
              Registrace
            </button>
          </div>

          {/* Google */}
          <button className="ab ab-google" onClick={handleGoogle} disabled={loading} style={{ marginBottom:16 }}>
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Pokračovat přes Google
          </button>

          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
            <div style={{ flex:1, height:1, background:'rgba(58,87,40,.12)' }}/>
            <span style={{ fontSize:12, color:'#bbb' }}>nebo emailem</span>
            <div style={{ flex:1, height:1, background:'rgba(58,87,40,.12)' }}/>
          </div>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {mode === 'register' && (
              <input className="ai" type="text" placeholder="Jméno" value={name}
                onChange={e => setName(e.target.value)} required minLength={2} />
            )}
            <input className="ai" type="email" placeholder="Email" value={email}
              onChange={e => setEmail(e.target.value)} required />
            <input className="ai" type="password" placeholder="Heslo (min. 8 znaků)" value={password}
              onChange={e => setPassword(e.target.value)} required minLength={8} />

            {error && (
              <div style={{ background:'#FEE2E2', border:'1px solid #FCA5A5', borderRadius:9, padding:'10px 14px', fontSize:13, color:'#991B1B' }}>
                ❌ {error}
              </div>
            )}
            {success && (
              <div style={{ background:'#DCFCE7', border:'1px solid #86EFAC', borderRadius:9, padding:'10px 14px', fontSize:13, color:'#166534' }}>
                ✅ {success}
              </div>
            )}

            <button className="ab ab-g" type="submit" disabled={loading} style={{ marginTop:4 }}>
              {loading ? '⏳ Načítám...' : mode === 'login' ? 'Přihlásit se →' : 'Vytvořit účet →'}
            </button>
          </form>

          <p style={{ textAlign:'center', marginTop:20, fontSize:13, color:'#aaa' }}>
            {mode === 'login' ? 'Ještě nemáš účet?' : 'Už máš účet?'}{' '}
            <span onClick={() => { setMode(mode==='login'?'register':'login'); setError(''); setSuccess(''); }}
              style={{ color:'#3A5728', cursor:'pointer', fontWeight:700 }}>
              {mode === 'login' ? 'Zaregistruj se' : 'Přihlaš se'}
            </span>
          </p>

          <p style={{ textAlign:'center', marginTop:12, fontSize:12 }}>
            <Link to="/mapa" style={{ color:'#bbb', textDecoration:'none' }}>← Zpět na mapu bez přihlášení</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
