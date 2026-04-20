import { useState, useMemo } from "react";
import { DB } from "../services/storage";
import { Icon } from "../components/Icons";
import { useApp } from "../context/AppContext";
import { fmtCurrency, fmtDate, fmtTime } from "../utils/helpers";
import { uid, now } from "../utils/helpers";
import Modal from "../components/Modal";

export default function Sales() {
  const { products, setProducts, sales, setSales, settings, user, toast } = useApp();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [cart, setCart] = useState([]);
  const [prodSearch, setProdSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

  const filteredSales = useMemo(()=>{
    const q = search.toLowerCase();
    const now2 = new Date(); now2.setHours(0,0,0,0);
    const week = new Date(now2); week.setDate(week.getDate()-7);
    const month = new Date(now2); month.setMonth(month.getMonth()-1);
    return [...sales].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).filter(s=>{
      const matchQ = !q || s.productName.toLowerCase().includes(q) || s.sku.toLowerCase().includes(q);
      const t = new Date(s.createdAt);
      const matchD = dateFilter==='today'?t>=now2:dateFilter==='week'?t>=week:dateFilter==='month'?t>=month:true;
      return matchQ && matchD;
    });
  },[sales,search,dateFilter]);

  const totalFiltered = filteredSales.reduce((a,s)=>a+s.total,0);

  const addToCart = p => {
    if (p.stock===0) return toast('Out of stock','error');
    setCart(c=>{
      const ex = c.find(i=>i.id===p.id);
      if (ex) {
        if (ex.qty>=p.stock) return toast('Not enough stock','error'),c;
        return c.map(i=>i.id===p.id?{...i,qty:i.qty+1}:i);
      }
      return [...c,{...p,qty:1}];
    });
  };
  const updateQty = (id,qty) => {
    const p = products.find(x=>x.id===id);
    if (qty>p.stock) return toast('Not enough stock','error');
    if (qty<=0) setCart(c=>c.filter(i=>i.id!==id));
    else setCart(c=>c.map(i=>i.id===id?{...i,qty}:i));
  };
  const subtotalCart = cart.reduce((a,i)=>a+i.price*i.qty,0);
  const taxAmt = subtotalCart*(settings.tax/100);
  const totalCart = subtotalCart+taxAmt;

  const recordSale = () => {
    if (!cart.length) return toast('Cart is empty','error');
    const saleRecords = [];
    let updatedProducts = [...products];
    for (const item of cart) {
      const prod = updatedProducts.find(p=>p.id===item.id);
      if (!prod || prod.stock < item.qty) { toast(`Insufficient stock for ${item.name}`,'error'); return; }
      const sub = item.price*item.qty;
      const tax = sub*(settings.tax/100);
      saleRecords.push({ id:uid(), productId:item.id, productName:item.name, sku:item.sku,
        category:item.category, quantity:item.qty, unitPrice:item.price,
        subtotal:sub, tax, total:sub+tax, cashier:user.name, createdAt:now() });
      updatedProducts = updatedProducts.map(p=>p.id===item.id?{...p,stock:p.stock-item.qty}:p);
    }
    const newSales = [...sales, ...saleRecords];
    DB.set('sales', newSales); setSales(newSales);
    DB.set('products', updatedProducts); setProducts(updatedProducts);
    toast('Sale recorded!','success');
    setReceipt({ items:cart, subtotal:subtotalCart, tax:taxAmt, total:totalCart, cashier:user.name, time:new Date().toLocaleString() });
    setCart([]); setModal(null);
  };

  const exportCSV = () => {
    const rows=[['Date','Product','SKU','Category','Qty','Unit Price','Subtotal','Tax','Total','Cashier']];
    filteredSales.forEach(s=>rows.push([fmtDate(s.createdAt),s.productName,s.sku,s.category,s.quantity,s.unitPrice,s.subtotal,s.tax,s.total,s.cashier]));
    const csv=rows.map(r=>r.join(',')).join('\n');
    const a=document.createElement('a'); a.href='data:text/csv,'+encodeURIComponent(csv); a.download='sales.csv'; a.click();
    toast('Exported CSV','success');
  };

  const prodFiltered = products.filter(p=>{
    const q=prodSearch.toLowerCase();
    return !q||(p.name.toLowerCase().includes(q)||p.sku.toLowerCase().includes(q));
  });

  return <div>
    <div className="filter-bar">
      <input className="search-input" placeholder="🔍 Search sales…" value={search} onChange={e=>setSearch(e.target.value)} style={{flex:1,minWidth:180}}/>
      <select className="search-input" value={dateFilter} onChange={e=>setDateFilter(e.target.value)}>
        <option value="all">All Time</option>
        <option value="today">Today</option>
        <option value="week">This Week</option>
        <option value="month">This Month</option>
      </select>
      <button className="btn btn-secondary btn-sm" onClick={exportCSV}><Icon.Download/> CSV</button>
      <button className="btn btn-primary btn-sm" onClick={()=>setModal('new')}><Icon.Plus/> New Sale</button>
    </div>

    <div className="card mb-4" style={{padding:'14px 20px',display:'flex',gap:24,flexWrap:'wrap'}}>
      <div><div style={{fontSize:11,color:'var(--text3)',textTransform:'uppercase',letterSpacing:.5}}>Transactions</div><div style={{fontFamily:'var(--font-head)',fontSize:20,fontWeight:700}}>{filteredSales.length}</div></div>
      <div><div style={{fontSize:11,color:'var(--text3)',textTransform:'uppercase',letterSpacing:.5}}>Total Revenue</div><div style={{fontFamily:'var(--font-head)',fontSize:20,fontWeight:700,color:'var(--green)'}}>{fmtCurrency(totalFiltered,settings.currency)}</div></div>
      <div><div style={{fontSize:11,color:'var(--text3)',textTransform:'uppercase',letterSpacing:.5}}>Avg per Sale</div><div style={{fontFamily:'var(--font-head)',fontSize:20,fontWeight:700}}>{fmtCurrency(filteredSales.length?totalFiltered/filteredSales.length:0,settings.currency)}</div></div>
    </div>

    <div className="card" style={{padding:0}}>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Date & Time</th><th>Product</th><th>SKU</th><th>Qty</th><th>Unit Price</th><th>Tax</th><th>Total</th><th>Cashier</th></tr></thead>
          <tbody>
            {filteredSales.length ? filteredSales.map(s=><tr key={s.id}>
              <td className="text-muted text-sm">{fmtDate(s.createdAt)} {fmtTime(s.createdAt)}</td>
              <td style={{fontWeight:500}}>{s.productName}</td>
              <td><code style={{fontSize:11,color:'var(--text3)'}}>{s.sku}</code></td>
              <td>{s.quantity}</td>
              <td>{fmtCurrency(s.unitPrice,settings.currency)}</td>
              <td className="text-muted">{fmtCurrency(s.tax,settings.currency)}</td>
              <td style={{color:'var(--green)',fontWeight:600}}>{fmtCurrency(s.total,settings.currency)}</td>
              <td className="text-muted">{s.cashier}</td>
            </tr>) : <tr><td colSpan={8}><div className="empty-state"><div className="icon">🛒</div><p>No sales found</p></div></td></tr>}
          </tbody>
        </table>
      </div>
    </div>

    {/* New Sale Modal */}
    <Modal open={modal==='new'} onClose={()=>setModal(null)} title="New Sale Transaction"
      footer={<><button className="btn btn-secondary" onClick={()=>setModal(null)}>Cancel</button><button className="btn btn-success" onClick={recordSale} disabled={!cart.length}>Record Sale ({fmtCurrency(totalCart,settings.currency)})</button></>}>
      <div className="form-group">
        <label>Search Products</label>
        <input className="form-control" placeholder="Type name or SKU…" value={prodSearch} onChange={e=>setProdSearch(e.target.value)}/>
      </div>
      <div style={{maxHeight:200,overflowY:'auto',background:'var(--bg3)',borderRadius:8,border:'1px solid var(--border)',marginBottom:16}}>
        {prodFiltered.map(p=><div key={p.id} onClick={()=>addToCart(p)} style={{padding:'10px 14px',cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid var(--border)',transition:'background .12s'}}
          onMouseEnter={e=>e.currentTarget.style.background='var(--bg4)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
          <div><div style={{fontSize:13,fontWeight:500}}>{p.name}</div><div style={{fontSize:11,color:'var(--text3)'}}>{p.sku} • Stock: {p.stock}</div></div>
          <div style={{color:'var(--accent3)',fontWeight:600,fontSize:13}}>{fmtCurrency(p.price,settings.currency)}</div>
        </div>)}
      </div>
      {cart.length>0 && <>
        <div style={{fontWeight:600,marginBottom:8,fontSize:13}}>Cart</div>
        {cart.map(i=><div key={i.id} style={{display:'flex',alignItems:'center',gap:10,marginBottom:8,background:'var(--bg3)',padding:'8px 12px',borderRadius:8}}>
          <div style={{flex:1,fontSize:13}}>{i.name}</div>
          <div style={{display:'flex',alignItems:'center',gap:6}}>
            <button className="btn btn-secondary btn-sm" style={{padding:'3px 8px'}} onClick={()=>updateQty(i.id,i.qty-1)}>−</button>
            <span style={{minWidth:24,textAlign:'center',fontSize:13}}>{i.qty}</span>
            <button className="btn btn-secondary btn-sm" style={{padding:'3px 8px'}} onClick={()=>updateQty(i.id,i.qty+1)}>+</button>
          </div>
          <div style={{color:'var(--green)',fontSize:13,minWidth:80,textAlign:'right'}}>{fmtCurrency(i.price*i.qty,settings.currency)}</div>
        </div>)}
        <div style={{borderTop:'1px solid var(--border)',marginTop:12,paddingTop:12}}>
          <div className="flex justify-between text-sm text-muted"><span>Subtotal</span><span>{fmtCurrency(subtotalCart,settings.currency)}</span></div>
          <div className="flex justify-between text-sm text-muted mt-1"><span>Tax ({settings.tax}%)</span><span>{fmtCurrency(taxAmt,settings.currency)}</span></div>
          <div className="flex justify-between mt-2" style={{fontWeight:700,fontSize:15}}><span>Total</span><span style={{color:'var(--green)'}}>{fmtCurrency(totalCart,settings.currency)}</span></div>
        </div>
      </>}
    </Modal>

    {/* Receipt Modal */}
    <Modal open={!!receipt} onClose={()=>setReceipt(null)} title="Sale Receipt">
      {receipt && <div className="receipt">
        <div className="receipt-header">
          <div style={{fontFamily:'var(--font-head)',fontSize:20,fontWeight:800,color:'var(--accent3)'}}>{settings.businessName}</div>
          <div style={{fontSize:12,color:'var(--text3)',marginTop:4}}>{receipt.time}</div>
          <div style={{fontSize:12,color:'var(--text3)'}}>Cashier: {receipt.cashier}</div>
        </div>
        {receipt.items.map(i=><div key={i.id} className="receipt-row">
          <span>{i.name} ×{i.qty}</span>
          <span>{fmtCurrency(i.price*i.qty,settings.currency)}</span>
        </div>)}
        <div className="receipt-row text-muted text-sm"><span>Subtotal</span><span>{fmtCurrency(receipt.subtotal,settings.currency)}</span></div>
        <div className="receipt-row text-muted text-sm"><span>Tax ({settings.tax}%)</span><span>{fmtCurrency(receipt.tax,settings.currency)}</span></div>
        <div className="receipt-row receipt-total"><span>TOTAL</span><span style={{color:'var(--green)'}}>{fmtCurrency(receipt.total,settings.currency)}</span></div>
        <div style={{textAlign:'center',marginTop:16,fontSize:11,color:'var(--text3)'}}>Thank you for your purchase!</div>
      </div>}
    </Modal>
  </div>;
}