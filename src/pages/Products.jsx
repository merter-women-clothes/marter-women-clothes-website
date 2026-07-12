import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts } from '../api';
import ProductCard from '../components/ProductCard';
import { Icon } from '../icons';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const category = searchParams.get('category') || 'الكل';
  useEffect(() => { getProducts().then(setProducts).finally(() => setLoading(false)); }, []);
  const categories = ['الكل', ...new Set(products.map(p => p.category))];
  const filtered = useMemo(() => products.filter(p => (category === 'الكل' || p.category === category) && (p.name.includes(query) || p.sku.toLowerCase().includes(query.toLowerCase()))), [products, category, query]);
  return <div className="catalog-page">
    <section className="page-hero"><span className="eyebrow">تشكيلتنا المتجددة</span><h1>جميع <em>المنتجات</em></h1><p>اختاري الموديلات المناسبة لمحلك واطلبيها مباشرة بالجملة.</p></section>
    <section className="catalog-content">
      <div className="catalog-toolbar">
        <div className="filter-scroll">{categories.map(cat => <button key={cat} className={category === cat ? 'active' : ''} onClick={() => cat === 'الكل' ? setSearchParams({}) : setSearchParams({category: cat})}>{cat}</button>)}</div>
        <label className="search-box"><Icon name="search" size={19}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="ابحثي بالاسم أو الكود..."/></label>
      </div>
      <div className="results-count">{filtered.length} منتج متوفر</div>
      {loading ? <div className="loading">جاري تحميل التشكيلة...</div> : filtered.length ? <div className="product-grid">{filtered.map(p => <ProductCard key={p.id} product={p}/>)}</div> : <div className="empty-state"><Icon name="bag" size={42}/><h3>لا توجد منتجات مطابقة</h3><p>جرّبي تغيير البحث أو القسم.</p></div>}
    </section>
  </div>;
}
