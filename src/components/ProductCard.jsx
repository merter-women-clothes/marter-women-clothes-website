import React from 'react';
import { Link } from 'react-router-dom';
import { money } from '../config';
import { Icon } from '../icons';

export default function ProductCard({ product }) {
  return <article className="product-card">
    <Link to={`/product/${product.id}`} className="product-image-wrap">
      {product.badge && <span className="badge">{product.badge}</span>}
      <img className="product-image" src={product.images?.[0]} alt={product.name} loading="lazy"/>
      <span className="view-product">عرض المنتج <Icon name="arrow" size={17}/></span>
    </Link>
    <div className="product-info">
      <span className="product-category">{product.category}</span>
      <Link to={`/product/${product.id}`}><h3>{product.name}</h3></Link>
      <div className="product-minimum"><Icon name="bag" size={14}/> أقل طلب: درزن (12 قطعة)</div>
      <div className="product-bottom"><strong>{Number(product.price) > 0 ? money(product.price) : 'تواصل لمعرفة السعر'}</strong><small>{Number(product.price) > 0 ? 'للقطعة / جملة' : 'سعر خاص للتجار'}</small></div>
    </div>
  </article>;
}
