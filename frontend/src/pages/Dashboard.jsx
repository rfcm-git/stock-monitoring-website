import { useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { Icon } from "../components/Icons"
import { fmtCurrency, fmtTime } from "../utils/helpers";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Filler
} from 'chart.js/auto';

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Filler // 👈 THIS is what you're missing
);

export default function Dashboard() {
  const { products, sales, settings, toast } = useApp();
  const salesRef = useRef(null);
  const catRef = useRef(null);
  const chartInstances = useRef({});

  const totalProducts = products.length;
  const totalStock = products.reduce((a,p)=>a+p.stock,0);
  const lowStock = products.filter(p=>p.stock<=p.minStock).length;

  const today = new Date(); today.setHours(0,0,0,0);
  const todaySales = sales.filter(s=>new Date(s.createdAt)>=today);
  const todayRevenue = todaySales.reduce((a,s)=>a+s.total,0);

  const last7 = Array.from({length:7},(_,i)=>{
    const d=new Date(); d.setDate(d.getDate()-6+i); d.setHours(0,0,0,0);
    const end=new Date(d); end.setHours(23,59,59,999);
    const dayS = sales.filter(s=>{ const t=new Date(s.createdAt); return t>=d&&t<=end; });
    return { label:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()], rev:dayS.reduce((a,s)=>a+s.total,0), cnt:dayS.length };
  });

  const catSales = {};
  sales.forEach(s=>{ catSales[s.category]=(catSales[s.category]||0)+s.total; });
  const catData = Object.entries(catSales).sort((a,b)=>b[1]-a[1]).slice(0,5);

  useEffect(()=>{
    if (salesRef.current) {
      if (chartInstances.current.sales) chartInstances.current.sales.destroy();
      chartInstances.current.sales = new Chart(salesRef.current, {
        type:'bar',
        data:{ labels:last7.map(d=>d.label), datasets:[{
          label:'Revenue',data:last7.map(d=>d.rev),
          backgroundColor:'rgba(124,106,255,.5)',borderColor:'rgba(124,106,255,1)',
          borderWidth:2,borderRadius:6
        }]},
        options:{ responsive:true,maintainAspectRatio:false, plugins:{legend:{display:false}},
          scales:{ x:{grid:{color:'rgba(255,255,255,.04)'},ticks:{color:'#6060a0'}},
            y:{grid:{color:'rgba(255,255,255,.04)'},ticks:{color:'#6060a0',callback:v=>`₱${(v/1000).toFixed(0)}k`}} }}
      });
    }
    if (catRef.current && catData.length) {
      if (chartInstances.current.cat) chartInstances.current.cat.destroy();
      chartInstances.current.cat = new Chart(catRef.current, {
        type:'doughnut',
        data:{ labels:catData.map(c=>c[0]), datasets:[{
          data:catData.map(c=>c[1]),
          backgroundColor:['rgba(124,106,255,.8)','rgba(34,217,138,.8)','rgba(34,212,240,.8)','rgba(255,200,71,.8)','rgba(255,90,110,.8)'],
          borderWidth:0
        }]},
        options:{ responsive:true,maintainAspectRatio:false, plugins:{legend:{position:'right',labels:{color:'#9898b8',font:{size:11},boxWidth:12}}} }
      });
    }
    return ()=>{ Object.values(chartInstances.current).forEach(c=>c.destroy()); chartInstances.current={}; };
  },[sales.length]);

  const recentSales = [...sales].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,5);
  const lowStockItems = products.filter(p=>p.stock<=p.minStock).slice(0,5);

  return <div>
    <div className="stats-grid">
      <div className="stat-card purple">
        <div className="stat-icon purple"><Icon.Box/></div>
        <div className="stat-value">{totalProducts}</div>
        <div className="stat-label">Total Products</div>
      </div>
      <div className="stat-card green">
        <div className="stat-icon green"><Icon.Cart/></div>
        <div className="stat-value">{fmtCurrency(todayRevenue, settings.currency)}</div>
        <div className="stat-label">Today's Revenue</div>
      </div>
      <div className="stat-card yellow">
        <div className="stat-icon yellow"><Icon.Chart/></div>
        <div className="stat-value">{todaySales.length}</div>
        <div className="stat-label">Today's Transactions</div>
      </div>
      <div className="stat-card red">
        <div className="stat-icon red"><Icon.Alert/></div>
        <div className="stat-value">{lowStock}</div>
        <div className="stat-label">Low Stock Alerts</div>
      </div>
    </div>

    <div className="grid-2 mb-4">
      <div className="card">
        <div className="section-head"><h2>Revenue (Last 7 Days)</h2></div>
        <div className="chart-wrap"><canvas ref={salesRef}/></div>
      </div>
      <div className="card">
        <div className="section-head"><h2>Sales by Category</h2></div>
        <div className="chart-wrap">{catData.length?<canvas ref={catRef}/>:<div className="empty-state"><div className="icon">📊</div><p>No data yet</p></div>}</div>
      </div>
    </div>

    <div className="grid-2">
      <div className="card">
        <div className="section-head"><h2>Recent Sales</h2></div>
        {recentSales.length ? <table><thead><tr><th>Product</th><th>Qty</th><th>Total</th><th>Time</th></tr></thead>
          <tbody>{recentSales.map(s=><tr key={s.id}>
            <td><div className="truncate" style={{maxWidth:140}}>{s.productName}</div></td>
            <td>{s.quantity}</td>
            <td style={{color:'var(--green)'}}>{fmtCurrency(s.total,settings.currency)}</td>
            <td className="text-muted text-sm">{fmtTime(s.createdAt)}</td>
          </tr>)}</tbody></table>
        : <div className="empty-state"><div className="icon">🛒</div><p>No sales yet</p></div>}
      </div>
      <div className="card">
        <div className="section-head"><h2>Low Stock Alerts</h2></div>
        {lowStockItems.length ? <table><thead><tr><th>Product</th><th>Stock</th><th>Min</th></tr></thead>
          <tbody>{lowStockItems.map(p=><tr key={p.id}>
            <td><div className="truncate" style={{maxWidth:150}}>{p.name}</div></td>
            <td><span className={`badge ${p.stock===0?'badge-red':'badge-yellow'}`}>{p.stock}</span></td>
            <td className="text-muted">{p.minStock}</td>
          </tr>)}</tbody></table>
        : <div className="empty-state"><div className="icon">✅</div><p>All stock levels OK</p></div>}
      </div>
    </div>
  </div>;
}