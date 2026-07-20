import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../api';
import ProductCard from '../components/ProductCard';
import TelegramVideo from '../components/TelegramVideo';
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
  const showVideoPreview = new URLSearchParams(window.location.search).get('videoPreview') === '1';
  useEffect(() => { getProducts().then(setProducts).catch(() => {}); }, []);
  useEffect(() => {
    if (!showVideoPreview || window.location.hash !== '#video-preview') return;
    window.requestAnimationFrame(() => document.getElementById('video-preview')?.scrollIntoView({ behavior: 'smooth' }));
  }, [showVideoPreview]);
  return <>
    <section className="hero">
      <div className="hero-image"/>
      <div className="hero-overlay"/>
      <div className="hero-content">
        <span className="eyebrow">مارتر • شريكك بالجملة</span>
        <h1>من أول درزن<br/>إلى <em>أكبر محل</em></h1>
        <p>سواء تبدأ مشروعاً جديداً أو عندك محل كبير، مارتر يجهزك بموديلات مطلوبة وكميات تناسب شغلك، مع الدفع عند الاستلام والتوصيل لكل العراق.</p>
        <div className="hero-buttons"><Link className="btn btn-gold" to="/products">تصفّح التشكيلة <Icon name="arrow" size={18}/></Link><a className="btn btn-glass" href={STORE.whatsappUrl} target="_blank" rel="noreferrer" onClick={() => trackContact('whatsapp')}>تواصل واتساب</a></div>
      </div>
      <div className="hero-note"><b>01</b><span>اختيارات الموسم<br/><small>جودة تستحقها تجارتك</small></span></div>
    </section>

    <section className="benefits">
      <div><Icon name="bag"/><span><b>البيع بالجملة فقط</b><small>أقل طلب: درزن واحد (12 قطعة)</small></span></div>
      <div><Icon name="phone"/><span><b>الدفع عند الاستلام</b><small>لا حاجة إلى تحويل مسبق</small></span></div>
      <div><Icon name="check"/><span><b>فحص قبل الدفع</b><small>تأكد من طلبك عند وصوله</small></span></div>
      <div><Icon name="truck"/><span><b>استبدال أو إرجاع</b><small>عند وجود خلل أو عدم مطابقة</small></span></div>
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

    {showVideoPreview && <section id="video-preview" className="video-showcase">
      <div className="video-showcase-copy">
        <span className="eyebrow">من القماش إلى الحركة</span>
        <h2>شوف الموديل بالحركة<br/><em>مو بس بصورة</em></h2>
        <p>شاهد القَصّة، حركة القماش والتفاصيل مثل ما هي على الحقيقة قبل ما تختار طلبك بالجملة.</p>
        <div className="video-proof-list">
          <span><Icon name="check" size={17}/> تصوير حقيقي للموديل</span>
          <span><Icon name="check" size={17}/> تفاصيل أوضح للتاجر</span>
          <span><Icon name="check" size={17}/> موديلات تتجدد باستمرار</span>
        </div>
        <a className="btn btn-gold video-telegram-link" href="https://t.me/master_women_clothes/368" target="_blank" rel="noreferrer" onClick={() => trackContact('telegram')}>شاهد على تيليجرام <Icon name="arrow" size={18}/></a>
      </div>
      <div className="video-showcase-stage">
        <span className="video-stage-number">01</span>
        <div className="video-frame">
          <div className="video-frame-head">
            <span><i/> متوفر الآن</span>
            <small>مارتر • الشورجة</small>
          </div>
          <TelegramVideo
            post="master_women_clothes/368"
            poster={dressesCategory}
          />
          <div className="video-frame-foot">
            <div><small>البيع</small><b>بالجملة فقط</b></div>
            <span>أقل طلب 12 قطعة</span>
          </div>
        </div>
      </div>
    </section>}

    <section className="order-guide">
      <div className="order-guide-heading">
        <span className="eyebrow dark">طلب جملة واضح وآمن</span>
        <h2>من اختيار الموديل<br/>إلى <em>باب محلك</em></h2>
        <p>اطلب بسهولة عبر واتساب، وافحص الشحنة عند وصولها ثم ادفع عند الاستلام.</p>
        <a className="btn btn-dark" href={STORE.whatsappUrl} target="_blank" rel="noreferrer" onClick={() => trackContact('whatsapp')}><Icon name="phone" size={18}/> اطلب درزن عبر واتساب</a>
      </div>
      <div className="order-guide-steps">
        <article><b>01</b><div><h3>اختر الموديل</h3><p>تصفح التشكيلة وحدد كود المنتج المناسب لتجارتك.</p></div></article>
        <article><b>02</b><div><h3>اطلب درزن</h3><p>أقل طلب درزن واحد، أي 12 قطعة، والبيع بالجملة فقط.</p></div></article>
        <article><b>03</b><div><h3>افحص عند الوصول</h3><p>يمكنك التأكد من الطلب قبل دفع المبلغ للمندوب.</p></div></article>
        <article><b>04</b><div><h3>ادفع عند الاستلام</h3><p>والاستبدال أو الإرجاع متوفر عند الخلل أو عدم المطابقة.</p></div></article>
      </div>
    </section>

    <section className="section products-home">
      <div className="section-heading-row"><div className="section-title"><span className="eyebrow dark">الأكثر طلباً</span><h2>مختارات <em>التجار</em></h2></div><Link to="/products" className="text-link">مشاهدة الكل <Icon name="arrow" size={17}/></Link></div>
      <div className="product-grid">{products.filter(p => p.featured).slice(0, 4).map(p => <ProductCard key={p.id} product={p}/>)}</div>
    </section>

    <section className="wholesale-banner">
      <div><span className="eyebrow">لأصحاب المحلات والبوتيكات</span><h2>كبّر تجارتك<br/>بتشكيلة <em>تبيع نفسها</em></h2><p>راسلنا للحصول على صور الموديلات المتوفرة وأسعار الكميات الخاصة. أقل طلب درزن واحد (12 قطعة).</p><a className="btn btn-gold" href={`https://t.me/${STORE.telegram}`} target="_blank" rel="noreferrer" onClick={() => trackContact('telegram')}>قناة التيليجرام <Icon name="arrow" size={18}/></a></div>
      <div className="banner-stat"><strong>+100</strong><span>موديل متجدد<br/>على مدار الموسم</span></div>
    </section>
  </>;
}
