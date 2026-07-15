import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProduct } from '../api';
import { Icon } from '../icons';
import { money, orderText, STORE } from '../config';
import { trackContact, trackMeta } from '../metaPixel';

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [error, setError] = useState('');
  const trackedProduct = useRef('');
  useEffect(() => { getProduct(id).then(setProduct).catch(e => setError(e.message)); }, [id]);
  useEffect(() => {
    if (!product || trackedProduct.current === product.id) return;
    trackedProduct.current = product.id;
    trackMeta('ViewContent', {
      content_ids: [product.id],
      content_name: product.name,
      content_category: product.category,
      content_type: 'product',
    });
  }, [product]);
  if (error) return <div className="not-found"><h2>{error}</h2><Link className="btn btn-dark" to="/products">العودة للمنتجات</Link></div>;
  if (!product) return <div className="loading page-loading">جاري تحميل المنتج...</div>;
  const text = orderText(product);
  return <div className="product-page">
    <div className="breadcrumbs"><Link to="/">الرئيسية</Link><span>/</span><Link to="/products">المنتجات</Link><span>/</span><b>{product.name}</b></div>
    <section className="product-detail">
      <div className="gallery">
        <div className="main-photo"><img src={product.images[activeImage]} alt={product.name}/>{product.badge && <span className="badge">{product.badge}</span>}</div>
        {product.images.length > 1 && <div className="thumbs">{product.images.map((img, i) => <button key={img+i} className={activeImage === i ? 'active' : ''} onClick={() => setActiveImage(i)}><img src={img} alt={`${product.name} ${i+1}`}/></button>)}</div>}
      </div>
      <div className="detail-info">
        <span className="product-category">{product.category} • كود {product.sku}</span>
        <h1>{product.name}</h1>
        <div className="detail-price">{Number(product.price) > 0 ? money(product.price) : 'تواصل لمعرفة السعر'} <small>{Number(product.price) > 0 ? 'للقطعة / سعر الجملة' : 'راسلنا للحصول على سعر التاجر'}</small></div>
        <p className="description">{product.description}</p>
        <div className="option"><b>القياسات المتوفرة</b><div className="chips">{product.sizes.map(size => <span key={size}>{size}</span>)}</div></div>
        <div className="option"><b>الألوان المتوفرة</b><div className="color-list">{product.colors.map(color => <span key={color}><i style={{background: color.hex || '#b59b83'}}/>{color.name || color}</span>)}</div></div>
        <div className="order-note"><Icon name="bag"/><span><b>أقل طلب: {product.minOrder || 6} قطع</b><small>راسلنا لمعرفة سعر الدرزن والكميات</small></span></div>
        <div className="order-actions"><a className="btn whatsapp" href={STORE.whatsappUrl} target="_blank" rel="noreferrer" onClick={() => trackContact('whatsapp')}><Icon name="phone"/> طلب عبر واتساب</a><a className="btn telegram" href={`https://t.me/${STORE.telegram}?text=${text}`} target="_blank" rel="noreferrer" onClick={() => trackContact('telegram')}>طلب عبر تيليجرام</a></div>
        <p className="delivery-line"><Icon name="truck" size={20}/> توصيل سريع وآمن إلى جميع محافظات العراق</p>
      </div>
    </section>
  </div>;
}
