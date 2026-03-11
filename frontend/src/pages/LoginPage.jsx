// frontend/src/pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabase';

export default function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
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
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { name } }
        });
        if (error) throw error;
        setSuccess('Zkontroluj email a potvrď registraci! Pak se přihlas.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/mapa');
      }
    } catch (err) {
      setError(err.message === 'Invalid login credentials'
        ? 'Špatný email nebo heslo.'
        : err.message === 'User already registered'
        ? 'Tento email je již registrován.'
        : err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/mapa' }
    });
    if (error) { setError(error.message); setLoading(false); }
  }

  const T = {
    bg: '#FAFAF7', card: 'white', text: '#1E120A', sub: '#666',
    border: 'rgba(58,87,40,0.2)', green: '#3A5728', light: '#F4EDD8',
  };

  return (
    <div style={{ minHeight:'100vh', background: T.bg, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet"/>
      <style>{`
        * { box-sizing: border-box; }
        .auth-input { width:100%; padding:12px 14px; border:1.5px solid rgba(58,87,40,0.2); border-radius:10px;
          font-size:15px; font-family:'DM Sans',sans-serif; outline:none; transition:border 0.2s;
          background:white; color:#1E120A; }
        .auth-input:focus { border-color:#3A5728; box-shadow:0 0 0 3px rgba(58,87,40,0.1); }
        .auth-btn { width:100%; padding:13px; border:none; border-radius:10px; font-size:15px;
          font-weight:700; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.2s; }
        .auth-btn-primary { background:#3A5728; color:white; box-shadow:0 4px 16px rgba(58,87,40,0.25); }
        .auth-btn-primary:hover { background:#2d4420; transform:translateY(-1px); }
        .auth-btn-primary:disabled { opacity:0.6; cursor:not-allowed; transform:none; }
        .auth-btn-google { background:white; color:#1E120A; border:1.5px solid rgba(0,0,0,0.15);
          display:flex; align-items:center; justify-content:center; gap:10px; }
        .auth-btn-google:hover { background:#f5f5f5; }
        .tab { flex:1; padding:10px; background:none; border:none; cursor:pointer;
          font-size:14px; font-weight:600; font-family:'DM Sans',sans-serif;
          border-bottom:2px solid transparent; transition:all 0.2s; color:#999; }
        .tab.active { color:#3A5728; border-bottom-color:#3A5728; }
      `}</style>

      <div style={{ width:'100%', maxWidth:420 }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <Link to="/" style={{ textDecoration:'none' }}>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:26, fontWeight:700, color:T.text }}>
              <span style={{ color:T.green }}>Mapa</span>Farem<span style={{ color:T.green }}>.cz</span>
            </div>
          </Link>
          <p style={{ color:T.sub, fontSize:14, marginTop:6 }}>
            {mode === 'login' ? 'Přihlaš se ke svému účtu' : 'Vytvoř si účet zdarma'}
          </p>
        </div>

        <div style={{ background:T.card, borderRadius:20, padding:32, boxShadow:'0 4px 32px rgba(0,0,0,0.08)', border:`1px solid ${T.border}` }}>
          {/* Tabs */}
          <div style={{ display:'flex', marginBottom:28, borderBottom:`1.5px solid ${T.border}` }}>
            <button className={`tab ${mode==='login'?'active':''}`} onClick={() => { setMode('login'); setError(''); setSuccess(''); }}>
              Přihlášení
            </button>
            <button className={`tab ${mode==='register'?'active':''}`} onClick={() => { setMode('register'); setError(''); setSuccess(''); }}>
              Registrace
            </button>
          </div>

          {/* Google */}
          <button className="auth-btn auth-btn-google" onClick={handleGoogle} disabled={loading} style={{ marginBottom:16 }}>
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Pokračovat přes Google
          </button>

          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
            <div style={{ flex:1, height:1, background:T.border }}/>
            <span style={{ color:T.sub, fontSize:12 }}>nebo</span>
            <div style={{ flex:1, height:1, background:T.border }}/>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {mode === 'register' && (
              <input className="auth-input" type="text" placeholder="Jméno" value={name}
                onChange={e => setName(e.target.value)} required minLength={2}/>
            )}
            <input className="auth-input" type="email" placeholder="Email" value={email}
              onChange={e => setEmail(e.target.value)} required/>
            <input className="auth-input" type="password" placeholder="Heslo (min. 6 znaků)" value={password}
              onChange={e => setPassword(e.target.value)} required minLength={6}/>

            {error && (
              <div style={{ background:'#FEE2E2', border:'1px solid #FCA5A5', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#991B1B' }}>
                ❌ {error}
              </div>
            )}
            {success && (
              <div style={{ background:'#DCFCE7', border:'1px solid #86EFAC', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#166534' }}>
                ✅ {success}
              </div>
            )}

            <button className="auth-btn auth-btn-primary" type="submit" disabled={loading} style={{ marginTop:4 }}>
              {loading ? '...' : mode === 'login' ? 'Přihlásit se' : 'Vytvořit účet'}
            </button>
          </form>

          {mode === 'login' && (
            <p style={{ textAlign:'center', marginTop:16, fontSize:13, color:T.sub }}>
              Ještě nemáš účet?{' '}
              <span onClick={() => setMode('register')} style={{ color:T.green, cursor:'pointer', fontWeight:700 }}>
                Zaregistruj se
              </span>
            </p>
          )}
        </div>

        <p style={{ textAlign:'center', marginTop:20, fontSize:12, color:T.sub }}>
          <Link to="/mapa" style={{ color:T.green, textDecoration:'none' }}>← Zpět na mapu</Link>
        </p>
      </div>
    </div>
  );
}
