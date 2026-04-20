import {useApp} from "../context/AppContext";
import { useEffect, useRef, useState } from "react";
import { Icon } from "../components/Icons";
import { fmtCurrency } from "../utils/helpers";
import { Chart } from "chart.js";

export default function Reports() {
  const { sales, products, settings, toast } = useApp();
  const [period, setPeriod] = useState('month');
  const chartRef = useRef(null);
  const chartInst = useRef(null);

  const now2 = new Date();
  const filtered = sales.filter(s=>{
    const t=new Date(s.createdAt);
    const d=new Date(now2);
    if (period==='day'){d.setHours(0,0,0,0);return t>=d;}
    if (period==='week'){d.setDate(d.getDate()-7);return t>=d;}
    if (period==='month'){d.setMonth(d.getMonth()-1);return t>=d;}
    return true;
  });

  const revenue = filtered.reduce((a,s)=>a+s.total,0);
  const txns = filtered.length;
  const avgTx = txns?revenue/txns:0;

  // best sellers
  const prodMap = {};
  filtered.forEach(s=>{
    if (!prodMap[s.productId]) prodMap[s.productId]={name:s.productName,qty:0,rev:0};
    prodMap[s.productId].qty+=s.quantity; prodMap[s.productId].rev+=s.total;
  });
  const bestSellers = Object.values(prodMap).sort((a,b)=>b.rev-a.rev).slice(0,8);

  // chart data
  const days = period==='day'?24:period==='week'?7:30;
  const chartData = Array.from({length:days},(_,i)=>{
    const d=new Date(now2);
    if (period==='day'){d.setHours(d.getHours()-days+1+i); const end=new Date(d); end.setMinutes(59,59,999);
      const rev=filtered.filter(s=>{const t=new Date(s.createdAt);return t.getHours()===d.getHours()&&t.toDateString()===d.toDateString();}).reduce((a,s)=>a+s.total,0);
      return {label:`${d.getHours()}:00`,rev};}
    d.setDate(d.getDate()-days+1+i); d.setHours(0,0,0,0); const end=new Date(d); end.setHours(23,59,59,999);
    const rev=filtered.filter(s=>{const t=new Date(s.createdAt);return t>=d&&t<=end;}).reduce((a,s)=>a+s.total,0);
    return {label:period==='week'?['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()]:`${d.getMonth()+1}/${d.getDate()}`,rev};
  });

  useEffect(()=>{
    if (!chartRef.current) return;
    if (chartInst.current) chartInst.current.destroy();
    chartInst.current = new Chart(chartRef.current,{
      type:'line',
      data:{labels:chartData.map(d=>d.label),datasets:[{label:'Revenue',data:chartData.map(d=>d.rev),
        borderColor:'rgba(34,217,138,1)',backgroundColor:'rgba(34,217,138,.08)',fill:true,tension:.4,pointRadius:3,pointBackgroundColor:'rgba(34,217,138,1)'}]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},
        scales:{x:{grid:{color:'rgba(255,255,255,.04)'},ticks:{color:'#6060a0',maxTicksLimit:10}},
          y:{grid:{color:'rgba(255,255,255,.04)'},ticks:{color:'#6060a0',callback:v=>`₱${(v/1000).toFixed(1)}k`}}}}
    });
    return ()=>{if(chartInst.current)chartInst.current.destroy();};
  },[period,sales.length]);

  const exportReport = () => {
    const rows=[['#','Product','Quantity Sold','Revenue']];
    bestSellers.forEach((p,i)=>rows.push([i+1,p.name,p.qty,fmtCurrency(p.rev,settings.currency)]));
    const csv=rows.map(r=>r.join(',')).join('\n');
    const a=document.createElement('a'); a.href='data:text/csv,'+encodeURIComponent(csv); a.download='report.csv'; a.click();
    toast('Report exported','success');
  };

  const invStatus = products.map(p=>({...p,status:p.stock===0?'Out of Stock':p.stock<=p.minStock?'Low Stock':'In Stock'}));

  return <div>
    <div className="filter-bar">
      {['day','week','month','all'].map(p=><button key={p} className={`btn btn-sm ${period===p?'btn-primary':'btn-secondary'}`} onClick={()=>setPeriod(p)}>{p==='day'?'Today':p==='week'?'This Week':p==='month'?'This Month':'All Time'}</button>)}
      <div style={{marginLeft:'auto'}}><button className="btn btn-secondary btn-sm" onClick={exportReport}><Icon.Download/> Export Report</button></div>
    </div>

    <div className="stats-grid mb-4">
      <div className="stat-card green"><div className="stat-icon green"><Icon.Chart/></div><div className="stat-value">{fmtCurrency(revenue,settings.currency)}</div><div className="stat-label">Total Revenue</div></div>
      <div className="stat-card purple"><div className="stat-icon purple"><Icon.Receipt/></div><div className="stat-value">{txns}</div><div className="stat-label">Transactions</div></div>
      <div className="stat-card yellow"><div className="stat-icon yellow"><Icon.Cart/></div><div className="stat-value">{fmtCurrency(avgTx,settings.currency)}</div><div className="stat-label">Avg per Transaction</div></div>
    </div>

    <div className="card mb-4">
      <div className="section-head"><h2>Revenue Trend</h2></div>
      <div className="chart-wrap" style={{height:250}}><canvas ref={chartRef}/></div>
    </div>

    <div className="grid-2">
      <div className="card">
        <div className="section-head"><h2>Best Selling Products</h2></div>
        {bestSellers.length ? <table><thead><tr><th>#</th><th>Product</th><th>Qty Sold</th><th>Revenue</th></tr></thead>
          <tbody>{bestSellers.map((p,i)=><tr key={p.name}>
            <td><span className="badge badge-purple">{i+1}</span></td>
            <td style={{fontWeight:500}}>{p.name}</td>
            <td>{p.qty}</td>
            <td style={{color:'var(--green)',fontWeight:500}}>{fmtCurrency(p.rev,settings.currency)}</td>
          </tr>)}</tbody></table>
        : <div className="empty-state"><div className="icon">📊</div><p>No sales in this period</p></div>}
      </div>
      <div className="card">
        <div className="section-head"><h2>Inventory Status</h2></div>
        <div style={{maxHeight:320,overflowY:'auto'}}>
          <table><thead><tr><th>Product</th><th>Stock</th><th>Status</th></tr></thead>
          <tbody>{invStatus.map(p=><tr key={p.id}>
            <td className="truncate" style={{maxWidth:150}}>{p.name}</td>
            <td>{p.stock}</td>
            <td><span className={`badge ${p.status==='In Stock'?'badge-green':p.status==='Low Stock'?'badge-yellow':'badge-red'}`}>{p.status}</span></td>
          </tr>)}</tbody></table>
        </div>
      </div>
    </div>
  </div>;
}