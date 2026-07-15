import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../api';
import ProductCard from '../components/ProductCard';
import { Icon } from '../icons';
import { STORE } from '../config';
import { trackContact } from '../metaPixel';
import pajamasCategory from '../assets/category-pajamas.webp';
import dishdashasCategory from '../assets/category-dishdashas.webp';
import dressesCategory from '../assets/category-dresses.webp';

const categories = [
  { name: 'بجامات', subtitle: 'كميات وأسعار خاصة للتجار', image: pajamasCategory },
  { name: 'دشاديش', subtitle: 'موديلات جملة من الشورجة', image: dishdashasCategory },
  { name: 'فساتين', subtitle: 'تشكيلات جملة لأصحاب المحلات', image: dressesCategory },
];

export default function Home() {
  const [products, setProducts] = useState([]);
  useEffect(() => { getProducts().then(setProducts).catch(() => {}); }, []);
  return <>
    <section className="hero">
      <div className="hero-image"/>
      <div className="hero-overlay"/>
      <div className="hero-content">
        <span className="eyebrow">تشكيلة 2026 • وصلت حديثاً</span>
        <h1>أناقة تُباع<br/><em>بالجملة</em></h1>
        <p>أحدث موديلات الملابس النسائية المستوردة من تركيا والصين ومصر، بأسعار تجار من قلب الشورجة وتوصيل مضمون لكل العراق.</p>
        <div className="hero-buttons"><Link className="btn btn-gold" to="/products">تسوّق التشكيلة <Icon name="arrow" size={18}/></Link><a className="btn btn-glass" href={STORE.whatsappUrl} target="_blank" rel="noreferrer" onClick={() => trackContact('whatsapp')}>تواصل واتساب</a></div>
      </div>
      <div className="hero-note"><b>01</b><span>اختيارات الموسم<br/><small>جودة تستحقها تجارتك</small></span></div>
    </section>

    <section className="benefits">
      <div><Icon name="bag"/><span><b>أسعار جملة حقيقية</b><small>مباشرة من سوق الشورجة</small></span></div>
      <div><Icon name="truck"/><span><b>توصيل لكل العراق</b><small>شحن سريع وآمن للمحافظات</small></span></div>
      <div><Icon name="check"/><span><b>موديلات مختارة</b><small>جودة وفحص قبل التسليم</small></span></div>
    </section>

    <section className="sourcing-section">
      <div className="sourcing-copy">
        <span className="eyebrow dark">تشكيلات مستوردة بعناية</span>
        <h2>من تركيا والصين ومصر<br/><em>إلى قلب الشورجة</em></h2>
        <p>نستورد موديلات نسائية مختارة ونوفرها بكميات وأسعار خاصة لأصحاب المحلات والبيجات والتجار في جميع محافظات العراق.</p>
      </div>
      <div className="source-countries">
        <article><span>🇹🇷</span><div><h3>تركيا</h3><p>خامات أنيقة وتشطيبات عصرية تناسب المحلات والبوتيكات.</p></div></article>
        <article><span>🇨🇳</span><div><h3>الصين</h3><p>تنوّع كبير وموديلات متجددة بأسعار جملة منافسة.</p></div></article>
        <article><span>🇪🇬</span><div><h3>مصر</h3><p>موديلات عملية ومريحة مطلوبة في السوق العراقي.</p></div></article>
      </div>
    </section>

    <section className="section categories-section">
      <div className="section-title"><span className="eyebrow dark">تسوّق حسب القسم</span><h2>اختاري ما يناسب <em>زبائنكِ</em></h2></div>
      <div className="category-grid">{categories.map((cat, i) => <Link key={cat.name} to={`/products?category=${cat.name}`} className={`category-card category-${i+1}`}>
        <img src={cat.image} alt={cat.name}/><div className="category-shade"/><div><small>{cat.subtitle}</small><h3>{cat.name}</h3><span>اكتشفي المجموعة <Icon name="arrow" size={16}/></span></div>
      </Link>)}</div>
    </section>

    <section className="section products-home">
      <div className="section-heading-row"><div className="section-title"><span className="eyebrow dark">الأكثر طلباً</span><h2>مختارات <em>التجار</em></h2></div><Link to="/products" className="text-link">مشاهدة الكل <Icon name="arrow" size={17}/></Link></div>
      <div className="product-grid">{products.filter(p => p.featured).slice(0, 4).map(p => <ProductCard key={p.id} product={p}/>)}</div>
    </section>

    <section className="wholesale-banner">
      <div><span className="eyebrow">لأصحاب المحلات والبوتيكات</span><h2>كبّر تجارتك<br/>بتشكيلة <em>تبيع نفسها</em></h2><p>راسلنا للحصول على صور الموديلات المتوفرة وأسعار الكميات الخاصة.</p><a className="btn btn-gold" href={`https://t.me/${STORE.telegram}`} target="_blank" rel="noreferrer" onClick={() => trackContact('telegram')}>قناة التيليجرام <Icon name="arrow" size={18}/></a></div>
      <div className="banner-stat"><strong>+100</strong><span>موديل متجدد<br/>على مدار الموسم</span></div>
    </section>
  </>;
}
