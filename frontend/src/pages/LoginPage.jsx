// frontend/src/pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/index.js';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading } = useAuthStore();
  const [form, setForm] = useState({ email:'', password:'' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(form.email, form.password);
    if (result.ok) { toast.success('Vítejte zpět!'); navigate('/'); }
    else toast.error(result.error);
  };

  return (
    <AuthLayout title="Přihlásit se" subtitle="Vítejte zpět v Zeměploše">
      <form onSubmit={handleSubmit}>
        <Field label="E-mail" type="email" value={form.email} onChange={v => setForm(f => ({...f, email:v}))} placeholder="vas@email.cz" />
        <Field label="Heslo" type="password" value={form.password} onChange={v => setForm(f => ({...f, password:v}))} placeholder="••••••••" />
        <AuthButton loading={loading}>Přihlásit se</AuthButton>
      </form>
      <div style={{ textAlign:'center', marginTop:16, fontSize:13, color:'#888' }}>
        Nemáte účet? <Link to="/registrace" style={{ color:'#3A5728', fontWeight:700 }}>Zaregistrujte se</Link>
      </div>
    </AuthLayout>
  );
}
