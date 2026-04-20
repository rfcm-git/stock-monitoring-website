import { useState } from "react";
import { DB } from "../services/storage";
import { hashPass } from "../utils/helpers";
import {useApp} from "../context/AppContext";

export default function SettingsPage() {
  const { settings, setSettings, user, setUser, toast, darkMode, setDarkMode } = useApp();
  const [bizForm, setBizForm] = useState({...settings});
  const [profForm, setProfForm] = useState({name:user.name,email:user.email,password:'',newPassword:''});
  const setBiz = k => e => setBizForm(f=>({...f,[k]:e.target.value}));
  const setProf = k => e => setProfForm(f=>({...f,[k]:e.target.value}));

  const saveBiz = () => {
    const s = {...bizForm, tax:parseFloat(bizForm.tax||0)};
    DB.set('settings', s); setSettings(s); toast('Settings saved','success');
  };

  const saveProfile = () => {
    const users = DB.get('users')||[];
    if (profForm.password && profForm.newPassword) {
      const u = users.find(u=>u.id===user.id);
      if (u.password!==hashPass(profForm.password)) return toast('Current password incorrect','error');
    }
    const updated = users.map(u=>u.id===user.id?{...u,name:profForm.name,email:profForm.email,...(profForm.newPassword?{password:hashPass(profForm.newPassword)}:{})}:u);
    DB.set('users',updated);
    const newUser={...user,name:profForm.name,email:profForm.email};
    DB.set('session',{...DB.get('session')}); setUser(newUser);
    toast('Profile updated','success');
  };

  return <div className="grid-2" style={{alignItems:'start'}}>
    <div>
      <div className="card mb-4">
        <h3 style={{fontFamily:'var(--font-head)',marginBottom:20}}>Business Settings</h3>
        <div className="form-group"><label>Business Name</label><input className="form-control" value={bizForm.businessName||''} onChange={setBiz('businessName')}/></div>
        <div className="form-group"><label>Address</label><input className="form-control" value={bizForm.address||''} onChange={setBiz('address')}/></div>
        <div className="form-group"><label>Currency Symbol</label><input className="form-control" value={bizForm.currency||'₱'} onChange={setBiz('currency')} style={{maxWidth:100}}/></div>
        <div className="form-group"><label>Tax Rate (%)</label><input className="form-control" type="number" min="0" max="100" value={bizForm.tax||0} onChange={setBiz('tax')} style={{maxWidth:120}}/></div>
        <div className="form-group"><label>Low Stock Threshold (default)</label><input className="form-control" type="number" min="0" value={bizForm.lowStockThreshold||10} onChange={setBiz('lowStockThreshold')} style={{maxWidth:120}}/></div>
        <button className="btn btn-primary" onClick={saveBiz}>Save Settings</button>
      </div>
      <div className="card">
        <h3 style={{fontFamily:'var(--font-head)',marginBottom:16}}>Appearance</h3>
        <div className="flex items-center justify-between">
          <div><div style={{fontWeight:500}}>Dark Mode</div><div className="text-muted text-sm">Toggle light/dark theme</div></div>
          <div className={`theme-toggle ${darkMode?'':'light'}`} onClick={()=>setDarkMode(d=>!d)}/>
        </div>
      </div>
    </div>
    <div className="card">
      <h3 style={{fontFamily:'var(--font-head)',marginBottom:20}}>Profile Settings</h3>
      <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:20}}>
        <div className="user-avatar" style={{width:52,height:52,fontSize:18}}>{user.name.slice(0,2).toUpperCase()}</div>
        <div><div style={{fontWeight:600}}>{user.name}</div><span className={`badge ${user.role==='admin'?'badge-purple':'badge-gray'}`}>{user.role}</span></div>
      </div>
      <div className="form-group"><label>Full Name</label><input className="form-control" value={profForm.name} onChange={setProf('name')}/></div>
      <div className="form-group"><label>Email</label><input className="form-control" type="email" value={profForm.email} onChange={setProf('email')}/></div>
      <div className="form-group"><label>Current Password (required to change password)</label><input className="form-control" type="password" value={profForm.password} onChange={setProf('password')} placeholder="••••••••"/></div>
      <div className="form-group"><label>New Password</label><input className="form-control" type="password" value={profForm.newPassword} onChange={setProf('newPassword')} placeholder="Leave blank to keep current"/></div>
      <button className="btn btn-primary" onClick={saveProfile}>Save Profile</button>
    </div>
  </div>;
}
