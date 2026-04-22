import { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { uid } from "../utils/helpers";
import { DB } from "../services/storage";
import { Icon } from "../components/Icons";
import { fmtCurrency, now } from "../utils/helpers";
import Modal from "../components/Modal";

import { FetchProducts, FetchCategories } from "../services/get-data";
import DeleteProduct from "../services/delete-data";
import AddProduct from "../services/add-data";
import EditProduct from "../services/edit-data";



export default function Inventory() {
  const { settings, toast } = useApp();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [barcodeVal, setBarcodeVal] = useState('');
  const barcodeRef = useRef(null);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          FetchProducts(),
          FetchCategories()
        ]);

        setProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error(error);
        toast('Failed to load data', 'error');
      }
    };
    loadData();
  }, []);
  
  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    return (!q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
      && (!catFilter || p.category === catFilter);
  });

  const openAdd = () => {
    setForm({
      name: '',
      sku: 'SKU-' + uid().slice(0, 4).toUpperCase(),
      category: '',
      price: '',
      stock: '',
      minStock: '10'
    });
    setModal('add');
  };
  const openEdit = p => { setForm({ ...p, price: String(p.price), stock: String(p.stock), minStock: String(p.minStock) }); setModal('edit'); };

  const save = async () => {
    if (!form.name || !form.sku || !form.price || form.stock === '') {
      return toast('Fill all required fields', 'error');
    }

    const entry = {
      ...form,
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
      minStock: parseInt(form.minStock || 0)
    };

    if (modal === 'add') {
      if (products.find(p => p.sku === form.sku)) {
        return toast('SKU already exists', 'error');
      }

      try {
        await AddProduct(entry);
        setProducts(prev => [...prev, entry]);
        toast('Product added', 'success');
      } catch (e) {
        toast('Failed to add product', 'error');
      }

    } else {
      const original = products.find(p => String(p.id) === String(form.id));

      if (!original) {
        toast('Original product not found', 'error');
        return;
      }

      const updatedFields = {};

      Object.keys(entry).forEach(key => {
        if (key === 'id') return;
        if (entry[key] !== original[key]) {
          updatedFields[key] = entry[key];
        }
      });

      if (Object.keys(updatedFields).length === 0) {
        toast('No changes made', 'info');
        return;
      }

      try {
        await EditProduct(form.id, updatedFields);

        setProducts(prev =>
          prev.map(p =>
            p.id === form.id ? { ...p, ...updatedFields } : p
          )
        );

        toast('Product updated', 'success');
      } catch (e) {
        toast('Failed to update product', 'error');
      }
    }

    setModal(null);
  };

  const del = id => {
    if (!confirm('Delete this product?')) return;
    DeleteProduct(id);
    setProducts(prev => prev.filter(p => p.id !== id));
    toast('Product deleted', 'success');
  };

  const exportCSV = () => {
    const rows = [['Name', 'SKU', 'Category', 'Price', 'Stock', 'Min Stock', 'Status']];
    filtered.forEach(p => rows.push([p.name, p.sku, p.category, p.price, p.stock, p.minStock, p.stock <= p.minStock ? 'Low Stock' : 'OK']));
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv,' + encodeURIComponent(csv); a.download = 'inventory.csv'; a.click();
    toast('Exported CSV', 'success');
  };

  const handleBarcode = e => {
    if (e.key === 'Enter' && barcodeVal.trim()) {
      const p = products.find(p => p.sku === barcodeVal.trim());
      if (p) { openEdit(p); setBarcodeVal(''); }
      else toast('SKU not found', 'error');
    }
  };

  return <div>
    <div className="filter-bar">
      <input className="search-input" placeholder="🔍  Search name or SKU…" value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: 180 }} />
      <select className="search-input" value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ minWidth: 150 }}>
        <option value="">All Categories</option>
        {categories.map(c => <option key={c}>{c}</option>)}
      </select>
      <input ref={barcodeRef} className="search-input" placeholder="📦 Scan barcode…" value={barcodeVal}
        onChange={e => setBarcodeVal(e.target.value)} onKeyDown={handleBarcode} style={{ minWidth: 160 }} />
      <button className="btn btn-secondary btn-sm" onClick={exportCSV}><Icon.Download /> CSV</button>
      <button className="btn btn-primary btn-sm" onClick={openAdd}><Icon.Plus /> Add Product</button>
    </div>

    <div className="card" style={{ padding: 0 }}>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Product</th><th>SKU</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {products.length ? products.map(p => (
              <tr key={p.id}>
                <td><div style={{ fontWeight: 500 }}>{p.name}</div></td>
                <td><code style={{ fontSize: 12, color: 'var(--text3)' }}>{p.sku}</code></td>
                <td><span className="badge badge-purple">{p.category}</span></td>
                <td style={{ color: 'var(--accent3)', fontWeight: 500 }}>{fmtCurrency(p.price, settings.currency)}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>{p.stock}</span>
                    <div className="progress-bar" style={{ width: 60 }}>
                      <div className="progress-fill" style={{ width: `${Math.min(100, p.stock / (p.minStock * 2) * 100)}%`, background: p.stock <= p.minStock ? 'var(--red)' : p.stock <= p.minStock * 1.5 ? 'var(--yellow)' : 'var(--green)' }} />
                    </div>
                  </div>
                </td>
                <td>{p.stock === 0 ? <span className="badge badge-red">Out of Stock</span> : p.stock <= p.minStock ? <span className="badge badge-yellow">Low Stock</span> : <span className="badge badge-green">In Stock</span>}</td>
                <td>
                  <div className="flex gap-2">
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}><Icon.Edit width={12} height={12} /></button>
                    <button className="btn btn-danger btn-sm" onClick={() => del(p.id)}><Icon.Trash width={12} height={12} /></button>
                  </div>
                </td>
              </tr>
            )) : <tr><td colSpan={7}><div className="empty-state"><div className="icon">📦</div><p>No products found</p></div></td></tr>}
          </tbody>
        </table>
      </div>
    </div>

    <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'add' ? 'Add New Product' : 'Edit Product'}
      footer={<><button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>Save Product</button></>}>
      <div className="grid-2">
        <div className="form-group" style={{ gridColumn: '1/-1' }}>
          <label>Product Name *</label>
          <input className="form-control" value={form.name || ''} onChange={set('name')} placeholder="e.g. Wireless Headphones" />
        </div>
        <div className="form-group">
          <label>SKU *</label>
          <input className="form-control" value={form.sku || ''} onChange={set('sku')} placeholder="SKU-001" />
        </div>
        <div className="form-group">
          <label>Category</label>
          <select className="form-control" value={form.category || ''} onChange={set('category')}>
            <option value="" disabled> Choose category... </option>
            {categories.map(c => <option key={c} >{c}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Price ({settings.currency}) *</label>
          <input className="form-control" type="number" min="0" value={form.price || ''} onChange={set('price')} placeholder="0.00" />
        </div>
        <div className="form-group">
          <label>Stock Quantity *</label>
          <input className="form-control" type="number" min="0" value={form.stock || ''} onChange={set('stock')} placeholder="0" />
        </div>
        <div className="form-group" style={{ gridColumn: '1/-1' }}>
          <label>Min Stock (Low Stock Alert)</label>
          <input className="form-control" type="number" min="0" value={form.minStock || ''} onChange={set('minStock')} placeholder="10" />
        </div>
      </div>
    </Modal>
  </div>;
}