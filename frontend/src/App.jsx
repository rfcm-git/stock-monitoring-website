import { useState, useEffect } from "react";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Sales from "./pages/Sales";
import Reports from "./pages/Reports";
import UserManagement from "./pages/UserManagement";
import SettingsPage from "./pages/Settings";
import SeedData from "./services/seed"
import ToastContainer from "./components/Toast";
import { Icon } from "./components/Icons";
import { uid } from "./utils/helpers";
import { AppCtx } from "./context/AppContext"
import { DB } from "./services/storage";

export default function App() {
  SeedData();
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [products, setProducts] = useState(DB.get('products') || []);
  const [sales, setSales] = useState(DB.get('sales') || []);
  const [settings, setSettings] = useState(DB.get('settings') || { businessName: 'StockFlow', currency: '₱', tax: 12 });
  const [toasts, setToasts] = useState([]);

  const toast = (msg, type = 'info') => {
    const id = uid();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  };

  // session check
  useEffect(() => {
    const sess = DB.get('session');
    if (sess && sess.expires > Date.now()) {
      const u = (DB.get('users') || []).find(u => u.id === sess.userId);
      if (u) setUser(u);
    }
    // auto logout
    const interval = setInterval(() => {
      const s = DB.get('session');
      if (s && s.expires < Date.now()) { DB.set('session', null); setUser(null); toast('Session expired', 'info'); }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { document.body.className = darkMode ? '' : 'light'; }, [darkMode]);

  const logout = () => { DB.set('session', null); setUser(null); };

  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;

  if (!user) return <AppCtx.Provider value={{}}>
    <Auth onLogin={u => setUser(u)} />
    <ToastContainer toasts={toasts} remove={() => { }} />
  </AppCtx.Provider>;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'Dashboard', section: 'Main' },
    { id: 'inventory', label: 'Inventory', icon: 'Box', section: 'Main', badge: lowStockCount > 0 ? lowStockCount : null },
    { id: 'sales', label: 'Sales', icon: 'Cart', section: 'Main' },
    { id: 'reports', label: 'Reports', icon: 'Chart', section: 'Analytics' },
    ...(user.role === 'admin' ? [{ id: 'users', label: 'Users', icon: 'Users', section: 'Admin' }] : []),
    { id: 'settings', label: 'Settings', icon: 'Settings', section: 'System' },
  ];

  const sections = [...new Set(navItems.map(n => n.section))];

  const pageTitles = { dashboard: 'Dashboard', inventory: 'Inventory Management', sales: 'Sales Management', reports: 'Reports & Analytics', users: 'User Management', settings: 'Settings' };

  const ctx = { products, setProducts, sales, setSales, settings, setSettings, user, setUser, toast, darkMode, setDarkMode };

  return <AppCtx.Provider value={ctx}>
    <div className="app-layout">
      {sidebarOpen && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 99 }} onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="brand">StockFlow</div>
          <div className="tagline">Inventory & Sales System</div>
        </div>
        <nav className="sidebar-nav">
          {sections.map(sec => <div key={sec}>
            <div className="nav-section">{sec}</div>
            {navItems.filter(n => n.section === sec).map(n => {
              const Ic = Icon[n.icon];
              return <button key={n.id} className={`nav-item ${page === n.id ? 'active' : ''}`} onClick={() => { setPage(n.id); setSidebarOpen(false); }}>
                <Ic />{n.label}{n.badge && <span className="badge">{n.badge}</span>}
              </button>;
            })}
          </div>)}
        </nav>
        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="user-avatar">{user.name.slice(0, 2).toUpperCase()}</div>
            <div className="user-info"><div className="user-name">{user.name}</div><div className="user-role">{user.role}</div></div>
            <button className="logout-button" onClick={logout} title="Logout">
              <Icon.Logout />
            </button>
          </div>
        </div>
      </aside>

      <div className="main-content">
        <div className="topbar">
          <button className="menu-btn" onClick={() => setSidebarOpen(o => !o)}><Icon.Menu /></button>
          <div className="topbar-title">{pageTitles[page]}</div>
          <div className="topbar-actions">
            <div className={`theme-toggle ${darkMode ? '' : 'light'}`} onClick={() => setDarkMode(d => !d)} title="Toggle theme" />
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
          </div>
        </div>
        <div className="page-body">
          {page === 'dashboard' && <Dashboard />}
          {page === 'inventory' && <Inventory />}
          {page === 'sales' && <Sales />}
          {page === 'reports' && <Reports />}
          {page === 'users' && (user.role === 'admin' ? <UserManagement /> : <div className="empty-state"><div className="icon">🔒</div><h3>Access Denied</h3><p>Admin only</p></div>)}
          {page === 'settings' && <SettingsPage />}
        </div>
      </div>
    </div>
    <ToastContainer toasts={toasts} />
  </AppCtx.Provider>;
}