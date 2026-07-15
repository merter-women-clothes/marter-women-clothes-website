import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { Icon } from './icons';
import { STORE } from './config';
import { trackContact, trackMeta } from './metaPixel';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductPage from './pages/ProductPage';
import Admin from './pages/Admin';

function MetaRouteTracker() {
  const location = useLocation();
  const firstView = useRef(true);

  useEffect(() => {
    if (firstView.current) {
      firstView.current = false;
      return;
    }
    trackMeta('PageView', {
      page_path: `${location.pathname}${location.search}`,
    });
  }, [location.pathname, location.search]);

  return null;
}

function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => { setOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }, [location.pathname]);
  if (location.pathname.startsWith('/admin')) return null;
  return <>
    <div className="topbar">توصيل إلى جميع محافظات العراق • البيع بالجملة فقط</div>
    <header className="header">
      <Link to="/" className="brand">
        <span className="brand-mark">M</span>
        <span><b className="brand-ar">مارتر</b><small className="brand-sub">MARTER • ألبسة نسائية بالجملة</small></span>
      </Link>
      <nav className={open ? 'nav open' : 'nav'}>
        <NavLink to="/">الرئيسية</NavLink>
        <NavLink to="/products">جميع المنتجات</NavLink>
        <NavLink to="/products?category=بجامات">بجامات</NavLink>
        <NavLink to="/products?category=دشاديش">دشاديش</NavLink>
        <a href="#contact">تواصل معنا</a>
      </nav>
      <div className="header-actions">
        <a className="header-order" href={STORE.whatsappUrl} target="_blank" rel="noreferrer" onClick={() => trackContact('whatsapp')}><Icon name="phone" size={18}/> اطلب الآن</a>
        <button className="menu-btn" onClick={() => setOpen(!open)} aria-label="القائمة"><Icon name={open ? 'close' : 'menu'}/></button>
      </div>
    </header>
  </>;
}

function Footer() {
  const location = useLocation();
  if (location.pathname.startsWith('/admin')) return null;
  return <footer id="contact" className="footer">
    <div className="footer-grid">
      <div>
        <div className="brand footer-brand"><span className="brand-mark">M</span><span><b className="brand-ar">مارتر</b><small className="brand-sub">MARTER • ألبسة نسائية بالجملة</small></span></div>
        <p>وجهتكم لملابس النساء بالجملة من قلب سوق الشورجة. موديلات مختارة، أسعار تجار، وتوصيل إلى جميع محافظات العراق.</p>
      </div>
      <div><h4>روابط سريعة</h4><Link to="/products">جميع المنتجات</Link><Link to="/products?category=بجامات">البجامات</Link><Link to="/products?category=دشاديش">الدشاديش</Link></div>
      <div><h4>تواصل معنا</h4><p><Icon name="pin" size={18}/> {STORE.location}</p><p>مسؤول الطلبات: {STORE.owner}</p><a href={`https://t.me/${STORE.telegram}`} target="_blank" rel="noreferrer" onClick={() => trackContact('telegram')}>تيليجرام: @{STORE.telegram}</a><a href={STORE.whatsappUrl} target="_blank" rel="noreferrer" onClick={() => trackContact('whatsapp')}>واتساب للطلبات</a></div>
    </div>
    <div className="copyright"><span>© {new Date().getFullYear()} {STORE.name}</span><Link to="/admin">إدارة المتجر</Link></div>
  </footer>;
}

function App() {
  return <><MetaRouteTracker/><Header/><main><Routes>
    <Route path="/" element={<Home/>}/>
    <Route path="/products" element={<Products/>}/>
    <Route path="/product/:id" element={<ProductPage/>}/>
    <Route path="/admin" element={<Admin/>}/>
    <Route path="*" element={<Home/>}/>
  </Routes></main><Footer/></>;
}

export default App;
