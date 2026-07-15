import React, { useEffect, useState } from 'react';
import { deleteProduct, getProducts, login, saveProduct, uploadImages } from '../api';
import { Icon } from '../icons';
import { money } from '../config';

const emptyProduct = { name: '', sku: '', category: 'بجامات', price: '', sizes: ['M','L','XL','2XL'], colors: [{name:'متعدد', hex:'#b59b83'}], description: '', images: [], featured: true, badge: 'جديد', minOrder: 12 };

function Login({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const submit = async e => { e.preventDefault(); setError(''); try { await login(password); sessionStorage.setItem('adminPassword', password); onLogin(password); } catch(e) { setError(e.message); } };
  return <div className="admin-login"><div className="login-card"><span className="brand-mark">M</span><h1>إدارة متجر Marter</h1><p>أدخل كلمة المرور لإدارة المنتجات</p><form onSubmit={submit}><label>كلمة المرور<input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoFocus/></label>{error && <div className="form-error">{error}</div>}<button className="btn btn-dark">دخول إلى اللوحة</button></form><a href="/">العودة إلى المتجر</a></div></div>;
}

function ProductForm({ initial, password, onDone, onCancel }) {
  const [form, setForm] = useState({...((initial || emptyProduct)), minOrder: 12});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const set = (key, val) => setForm(prev => ({...prev, [key]: val}));
  const submit = async e => { e.preventDefault(); setSaving(true); setError(''); try { await saveProduct(form, password); onDone(); } catch(e) { setError(e.message); } finally { setSaving(false); } };
  const upload = async e => { if (!e.target.files.length) return; setUploading(true); setError(''); try { const result = await uploadImages(e.target.files, password); set('images', [...form.images, ...result.urls]); } catch(e) { setError(e.message); } finally { setUploading(false); } };
  const colorsText = form.colors.map(c => typeof c === 'string' ? c : `${c.name}:${c.hex}`).join('، ');
  return <div className="admin-modal"><form className="product-form" onSubmit={submit}>
    <div className="form-head"><div><span>إدارة المنتجات</span><h2>{form.id ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h2></div><button type="button" className="icon-button" onClick={onCancel}><Icon name="close"/></button></div>
    <div className="form-grid">
      <label className="full">اسم المنتج<input required value={form.name} onChange={e => set('name', e.target.value)} placeholder="مثال: بجامة قطن صيفية"/></label>
      <label>كود المنتج<input required value={form.sku} onChange={e => set('sku', e.target.value)} placeholder="MW-001"/></label>
      <label>القسم<select value={form.category} onChange={e => set('category', e.target.value)}><option>بجامات</option><option>دشاديش</option><option>فساتين</option><option>ملابس بيت</option><option>أطقم</option></select></label>
      <label>السعر للقطعة (اختياري)<small>اتركه فارغاً ليظهر: تواصل لمعرفة السعر</small><input type="number" min="0" value={form.price} onChange={e => set('price', e.target.value)} placeholder="بدون سعر معلن"/></label>
      <label>أقل كمية طلب<small>ثابت حسب سياسة المتجر: درزن واحد</small><input type="number" value="12" readOnly/></label>
      <label className="full">القياسات <small>افصل بينها بفاصلة</small><input value={form.sizes.join('، ')} onChange={e => set('sizes', e.target.value.split(/[،,]/).map(x=>x.trim()).filter(Boolean))}/></label>
      <label className="full">الألوان <small>مثال: وردي:#e6a6b5، أسود:#111111</small><input value={colorsText} onChange={e => set('colors', e.target.value.split(/[،,]/).map(x => { const [name, hex] = x.trim().split(':'); return {name, hex: hex || '#b59b83'}; }).filter(x=>x.name))}/></label>
      <label className="full">وصف المنتج<textarea rows="4" value={form.description} onChange={e => set('description', e.target.value)} placeholder="الخامة والتفاصيل..."/></label>
      <div className="full image-manager"><b>صور المنتج</b><div className="admin-images">{form.images.map((img, i) => <div key={img+i}><img src={img} alt=""/><button type="button" onClick={() => set('images', form.images.filter((_, idx) => idx !== i))}><Icon name="close" size={15}/></button></div>)}<label className="upload-box"><Icon name="upload"/><span>{uploading ? 'جاري الرفع...' : 'رفع صور'}</span><input hidden type="file" accept="image/*" multiple onChange={upload}/></label></div><small>يمكنك رفع عدة صور. يفضل قياس طولي 4:5.</small></div>
      <label className="switch-row"><input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)}/><span>إظهاره ضمن المنتجات المميزة</span></label>
      <label>شارة المنتج<select value={form.badge || ''} onChange={e => set('badge', e.target.value)}><option value="">بدون شارة</option><option>جديد</option><option>الأكثر طلباً</option><option>عرض خاص</option></select></label>
    </div>
    {error && <div className="form-error">{error}</div>}
    <div className="form-actions"><button type="button" className="btn btn-outline" onClick={onCancel}>إلغاء</button><button className="btn btn-dark" disabled={saving || !form.images.length}>{saving ? 'جاري الحفظ...' : 'حفظ المنتج'}</button></div>
  </form></div>;
}

export default function Admin() {
  const [password, setPassword] = useState(sessionStorage.getItem('adminPassword') || '');
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(undefined);
  const [query, setQuery] = useState('');
  const load = () => getProducts().then(setProducts);
  useEffect(() => { if (password) load().catch(() => setPassword('')); }, [password]);
  if (!password) return <Login onLogin={setPassword}/>;
  const remove = async product => { if (!window.confirm(`هل أنت متأكد من حذف ${product.name}؟`)) return; await deleteProduct(product.id, password); load(); };
  const filtered = products.filter(p => p.name.includes(query) || p.sku.toLowerCase().includes(query.toLowerCase()));
  return <div className="admin-shell">
    <aside className="admin-sidebar"><div className="brand admin-brand"><span className="brand-mark">M</span><span><b>MARTER</b><small>ADMIN PANEL</small></span></div><nav><button className="active"><Icon name="bag"/> المنتجات</button></nav><button className="logout" onClick={() => { sessionStorage.clear(); setPassword(''); }}><Icon name="logout"/> تسجيل الخروج</button></aside>
    <div className="admin-main">
      <header className="admin-header"><div><small>لوحة التحكم</small><h1>إدارة المنتجات</h1></div><a href="/" target="_blank">عرض المتجر ↗</a></header>
      <section className="admin-stats"><div><span>إجمالي المنتجات</span><strong>{products.length}</strong></div><div><span>الأقسام</span><strong>{new Set(products.map(p=>p.category)).size}</strong></div><div><span>منتجات مميزة</span><strong>{products.filter(p=>p.featured).length}</strong></div></section>
      <section className="admin-content"><div className="admin-toolbar"><label className="search-box"><Icon name="search" size={19}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="ابحث عن منتج..."/></label><button className="btn btn-dark" onClick={() => setEditing(null)}><Icon name="plus"/> إضافة منتج</button></div>
        <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>المنتج</th><th>القسم</th><th>السعر</th><th>الحالة</th><th>الإجراءات</th></tr></thead><tbody>{filtered.map(p => <tr key={p.id}><td><div className="table-product"><img src={p.images[0]} alt=""/><span><b>{p.name}</b><small>{p.sku}</small></span></div></td><td>{p.category}</td><td>{Number(p.price) > 0 ? money(p.price) : 'غير معلن'}</td><td><span className="status">متوفر</span></td><td><div className="table-actions"><button onClick={()=>setEditing(p)} title="تعديل"><Icon name="edit" size={19}/></button><button className="danger" onClick={()=>remove(p)} title="حذف"><Icon name="trash" size={19}/></button></div></td></tr>)}</tbody></table>{!filtered.length && <div className="empty-state"><h3>لا توجد منتجات</h3></div>}</div>
      </section>
    </div>
    {editing !== undefined && <ProductForm initial={editing || emptyProduct} password={password} onCancel={() => setEditing(undefined)} onDone={() => { setEditing(undefined); load(); }}/>} 
  </div>;
}
