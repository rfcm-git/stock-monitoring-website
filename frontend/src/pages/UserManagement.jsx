import { useState } from "react";
import { DB } from "../services/storage";
import {useApp} from "../context/AppContext";
import { Icon } from "../components/Icons"
import { fmtDate } from "../utils/helpers";
import { uid, now, hashPass } from "../utils/helpers";
import Modal from "../components/Modal"


export default function UserManagement() {
  const { user:me, toast } = useApp();
  const [users, setUsers] = useState(DB.get('users')||[]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));

  const save = () => {
    if (!form.name||!form.email) return toast('Name and email required','error');
    const all = DB.get('users')||[];
    if (modal==='add') {
      if (!form.password) return toast('Password required','error');
      if (all.find(u=>u.email===form.email)) return toast('Email exists','error');
      const u={id:uid(),name:form.name,email:form.email,password:hashPass(form.password),role:form.role||'staff',createdAt:now()};
      const updated=[...all,u]; DB.set('users',updated); setUsers(updated); toast('User added','success');
    } else {
      const updated=all.map(u=>u.id===form.id?{...u,name:form.name,email:form.email,role:form.role,...(form.password?{password:hashPass(form.password)}:{})}:u);
      DB.set('users',updated); setUsers(updated); toast('User updated','success');
    }
    setModal(null);
  };

  const del = id => {
    if (id===me.id) return toast("Can't delete yourself",'error');
    if (!confirm('Delete user?')) return;
    const updated=(DB.get('users')||[]).filter(u=>u``.id!==id);
    DB.set('users',updated); setUsers(updated); toast('User deleted','success');
  };

  return <div>
    <div className="filter-bar">
      <div style={{flex:1}}/>
      <button className="btn btn-primary btn-sm" onClick={()=>{setForm({name:'',email:'',password:'',role:'staff'});setModal('add');}}><Icon.Plus/> Add User</button>
    </div>
    <div className="card" style={{padding:0}}>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th></tr></thead>
          <tbody>{users.map(u=><tr key={u.id}>
            <td><div style={{display:'flex',alignItems:'center',gap:10}}>
              <div className="user-avatar" style={{width:28,height:28,fontSize:11}}>{u.name.slice(0,2).toUpperCase()}</div>
              <span style={{fontWeight:500}}>{u.name}</span>{u.id===me.id&&<span className="badge badge-cyan" style={{fontSize:10}}>You</span>}
            </div></td>
            <td className="text-muted">{u.email}</td>
            <td><span className={`badge ${u.role==='admin'?'badge-purple':'badge-gray'}`}>{u.role}</span></td>
            <td className="text-muted text-sm">{fmtDate(u.createdAt)}</td>
            <td><div className="flex gap-2">
              <button className="btn btn-secondary btn-sm" onClick={()=>{setForm({...u,password:''});setModal('edit');}}><Icon.Edit/></button>
              <button className="btn btn-danger btn-sm" onClick={()=>del(u.id)} disabled={u.id===me.id}><Icon.Trash/></button>
            </div></td>
          </tr>)}</tbody>
        </table>
      </div>
    </div>

    <Modal open={!!modal} onClose={()=>setModal(null)} title={modal==='add'?'Add User':'Edit User'}
      footer={<><button className="btn btn-secondary" onClick={()=>setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>Save</button></>}>
      <div className="form-group"><label>Full Name *</label><input className="form-control" value={form.name||''} onChange={set('name')} placeholder="John Doe"/></div>
      <div className="form-group"><label>Email *</label><input className="form-control" type="email" value={form.email||''} onChange={set('email')} placeholder="john@example.com"/></div>
      <div className="form-group"><label>{modal==='add'?'Password *':'New Password (leave blank to keep)'}</label><input className="form-control" type="password" value={form.password||''} onChange={set('password')} placeholder="••••••••"/></div>
      <div className="form-group"><label>Role</label>
        <select className="form-control" value={form.role||'staff'} onChange={set('role')}>
          <option value="staff">Staff</option><option value="admin">Admin</option>
        </select>
      </div>
    </Modal>
  </div>;
}