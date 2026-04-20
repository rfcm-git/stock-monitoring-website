import { useState } from "react";
import { DB } from "../services/storage";
import { uid, now, hashPass } from "../utils/helpers";

// ─── AUTH SCREEN ─────────────────────────────────────────────────────────────
export default function Auth({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'staff' });
  const [err, setErr] = useState('');
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));

  const submit = () => {
    setErr('');
    const users = DB.get('users') || [];
    if (mode==='login') {
      const u = users.find(u=>u.email===form.email && u.password===hashPass(form.password));
      if (!u) return setErr('Invalid email or password');
      DB.set('session', { userId:u.id, expires:Date.now()+8*3600*1000 });
      onLogin(u);
    } else {
      if (!form.name||!form.email||!form.password) return setErr('All fields required');
      if (users.find(u=>u.email===form.email)) return setErr('Email already exists');
      const u = { id:uid(), name:form.name, email:form.email, password:hashPass(form.password), role:'staff', createdAt:now() };
      DB.set('users', [...users, u]);
      DB.set('session', { userId:u.id, expires:Date.now()+8*3600*1000 });
      onLogin(u);
    }
  };

  return <div className="auth-wrap">
    <div className="auth-bg"/>
    <div className="auth-card">
      <div className="auth-logo">StockFlow<span>INVENTORY & SALES SYSTEM</span></div>
      <h2>{mode==='login'?'Welcome back':'Create account'}</h2>
      <p>{mode==='login'?'Sign in to your workspace':'Register to get started'}</p>
      {err && <div className="alert alert-error">⚠ {err}</div>}
      {mode==='register' && <div className="form-group">
        <label>Full Name</label>
        <input className="form-control" placeholder="John Doe" value={form.name} onChange={set('name')}/>
      </div>}
      <div className="form-group">
        <label>Email Address</label>
        <input className="form-control" type="email" placeholder="you@company.com" value={form.email} onChange={set('email')}/>
      </div>
      <div className="form-group">
        <label>Password</label>
        <input className="form-control" type="password" placeholder="••••••••" value={form.password} onChange={set('password')} onKeyDown={e=>e.key==='Enter'&&submit()}/>
      </div>
      <button className="btn btn-primary btn-full mt-3" onClick={submit}>
        {mode==='login'?'Sign In':'Create Account'}
      </button>
      <p className="text-center mt-4 text-sm" style={{textAlign:'center'}}>
        <span className="text-muted">{mode==='login'?'No account? ':'Have an account? '}</span>
        <span style={{color:'var(--accent3)',cursor:'pointer'}} onClick={()=>setMode(m=>m==='login'?'register':'login')}>
          {mode==='login'?'Register':'Sign In'}
        </span>
      </p>
      <div className="mt-4" style={{background:'var(--bg3)',borderRadius:8,padding:'10px 14px',fontSize:12,color:'var(--text3)'}}>
        <strong style={{color:'var(--text2)'}}>Demo accounts:</strong><br/>
        admin@stockflow.com / admin123<br/>
        staff@stockflow.com / staff123
      </div>
    </div>
  </div>;
}