import express from 'express';
import multer from 'multer';
import AdmZip from 'adm-zip';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { STORE, money } from '../src/config.js';
 
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const dataDir = process.env.DATA_DIR || path.join(root, 'data');
const uploadsDir = path.join(dataDir, 'uploads');
const dbFile = path.join(dataDir, 'products.json');
const seedFile = path.join(root, 'server', 'seed.json');
const seedUploadsArchive = path.join(root, 'server', 'seed-uploads.zip');
const distDir = path.join(root, 'dist');
const port = process.env.PORT || 3001;
const adminPassword = process.env.ADMIN_PASSWORD || 'master2026';
const minimumOrder = 12;
const siteUrl = (process.env.SITE_URL || 'https://marteriraq.com').replace(/\/$/, '');
 
fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(dbFile)) fs.copyFileSync(seedFile, dbFile);
if (fs.existsSync(seedUploadsArchive)) {
  const archive = new AdmZip(seedUploadsArchive);
  for (const entry of archive.getEntries()) {
    if (entry.isDirectory) continue;
    const filename = path.basename(entry.entryName);
    if (!filename || filename.startsWith('.')) continue;
    const destination = path.join(uploadsDir, filename);
    if (!fs.existsSync(destination)) fs.writeFileSync(destination, entry.getData());
  }
}
 
const readProducts = () => JSON.parse(fs.readFileSync(dbFile, 'utf8')).map(product => ({...product, minOrder: minimumOrder}));
const writeProducts = products => fs.writeFileSync(dbFile, JSON.stringify(products, null, 2));
const auth = (req, res, next) => req.headers['x-admin-password'] === adminPassword ? next() : res.status(401).json({error:'Unauthorized'});
const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (_, file, cb) => cb(null, `${Date.now()}-${Math.random().toString(36).slice(2,8)}${path.extname(file.originalname).toLowerCase()}`)
});
const upload = multer({ storage, limits: { fileSize: 8 * 1024 * 1024, files: 8 }, fileFilter: (_, file, cb) => cb(null, file.mimetype.startsWith('image/')) });
 
// --- SEO helpers: inject per-page <title>/meta/Open Graph tags into the built index.html
// so search engines and link-preview crawlers (Google, WhatsApp, Facebook) see real content
// instead of the blank shell the React SPA renders client-side. ---
let indexHtmlTemplate = null;
const getIndexHtmlTemplate = () => {
  if (indexHtmlTemplate === null) {
    const indexHtmlPath = path.join(distDir, 'index.html');
    indexHtmlTemplate = fs.existsSync(indexHtmlPath) ? fs.readFileSync(indexHtmlPath, 'utf8') : false;
  }
  return indexHtmlTemplate || null;
};
const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const absoluteUrl = (value) => (value ? (/^https?:\/\//.test(value) ? value : `${siteUrl}${value}`) : null);
const defaultOgImage = () => {
  const products = readProducts();
  const pick = products.find((p) => p.featured) || products[0];
  return pick && pick.images && pick.images[0] ? absoluteUrl(pick.images[0]) : null;
};
 
const renderSeoHtml = ({ title, description, pagePath, image, noindex }) => {
  const template = getIndexHtmlTemplate();
  if (!template) return null;
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const url = `${siteUrl}${pagePath}`;
  const imageUrl = absoluteUrl(image) || defaultOgImage();
 
  let html = template
    .replace(/<title>.*?<\/title>/s, `<title>${safeTitle}</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${safeDescription}" />`);
 
  const extraTags = [
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${escapeHtml(STORE.name)}" />`,
    `<meta property="og:title" content="${safeTitle}" />`,
    `<meta property="og:description" content="${safeDescription}" />`,
    `<meta property="og:url" content="${url}" />`,
    imageUrl ? `<meta property="og:image" content="${imageUrl}" />` : '',
    `<meta property="og:locale" content="ar_IQ" />`,
    `<meta name="twitter:card" content="${imageUrl ? 'summary_large_image' : 'summary'}" />`,
    `<meta name="twitter:title" content="${safeTitle}" />`,
    `<meta name="twitter:description" content="${safeDescription}" />`,
    imageUrl ? `<meta name="twitter:image" content="${imageUrl}" />` : '',
    noindex ? `<meta name="robots" content="noindex, nofollow" />` : '',
  ].filter(Boolean).join('\n    ');
 
  return html.replace('</head>', `  ${extraTags}\n  </head>`);
};
 
const app = express();
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(uploadsDir));
 
app.get('/robots.txt', (_, res) => {
  res.type('text/plain').send(`User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${siteUrl}/sitemap.xml\n`);
});
 
app.get('/sitemap.xml', (_, res) => {
  const products = readProducts();
  const urls = [
    { loc: `${siteUrl}/`, priority: '1.0' },
    { loc: `${siteUrl}/products`, priority: '0.8' },
    ...products.map((p) => ({ loc: `${siteUrl}/product/${p.id}`, priority: '0.6', lastmod: (p.updatedAt || p.createdAt || '').slice(0, 10) })),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url>\n    <loc>${u.loc}</loc>\n${u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>\n` : ''}    <priority>${u.priority}</priority>\n  </url>`)
    .join('\n')}\n</urlset>\n`;
  res.type('application/xml').send(xml);
});
 
app.get('/api/health', (_, res) => res.json({ok:true}));
app.get('/api/products', (_, res) => res.json(readProducts()));
app.get('/api/products/:id', (req, res) => {
  const product = readProducts().find(p => p.id === req.params.id);
  product ? res.json(product) : res.status(404).json({error:'Not found'});
});
app.post('/api/admin/login', (req, res) => req.body.password === adminPassword ? res.json({ok:true}) : res.status(401).json({error:'Invalid password'}));
app.post('/api/upload', auth, upload.array('images', 8), (req, res) => res.json({urls:req.files.map(f => `/uploads/${f.filename}`)}));
app.post('/api/products', auth, (req, res) => {
  const products = readProducts();
  const product = {...req.body, minOrder: minimumOrder, id: `${Date.now()}-${Math.random().toString(36).slice(2,7)}`, createdAt: new Date().toISOString()};
  products.unshift(product); writeProducts(products); res.status(201).json(product);
});
app.put('/api/products/:id', auth, (req, res) => {
  const products = readProducts(); const index = products.findIndex(p => p.id === req.params.id);
  if (index < 0) return res.status(404).json({error:'Not found'});
  products[index] = {...products[index], ...req.body, minOrder: minimumOrder, id:req.params.id, updatedAt:new Date().toISOString()};
  writeProducts(products); res.json(products[index]);
});
app.delete('/api/products/:id', auth, (req, res) => {
  const products = readProducts(); const found = products.find(p => p.id === req.params.id);
  if (!found) return res.status(404).json({error:'Not found'});
  writeProducts(products.filter(p => p.id !== req.params.id)); res.status(204).end();
});
 
if (fs.existsSync(distDir)) {
  const sendSeoOrFallback = (res, status, options) => {
    const html = renderSeoHtml(options);
    if (html) res.status(status).type('html').send(html);
    else res.status(status).sendFile(path.join(distDir, 'index.html'));
  };
 
  // index:false so this doesn't auto-serve dist/index.html for "/" before our SEO route below runs
  app.use(express.static(distDir, { index: false }));
 
  app.get('/', (_, res) => {
    sendSeoOrFallback(res, 200, {
      title: `${STORE.name} | ملابس نسائية بالجملة من الشورجة`,
      description: `${STORE.arabicName} بالجملة من ${STORE.location}. أقل طلب ${STORE.minimumOrderLabel}، توصيل لجميع محافظات العراق، الدفع عند الاستلام.`,
      pagePath: '/',
    });
  });
 
  app.get('/products', (req, res) => {
    const category = req.query.category;
    sendSeoOrFallback(res, 200, {
      title: category ? `${category} بالجملة | ${STORE.name}` : `جميع المنتجات | ${STORE.name}`,
      description: category
        ? `تشكيلة ${category} بالجملة من ${STORE.location}. أقل طلب ${STORE.minimumOrderLabel}، الدفع عند الاستلام.`
        : `تصفح كل تشكيلة الملابس النسائية بالجملة من ${STORE.name} - ${STORE.location}. أقل طلب ${STORE.minimumOrderLabel}.`,
      pagePath: category ? `/products?category=${encodeURIComponent(category)}` : '/products',
    });
  });
 
  app.get('/product/:id', (req, res) => {
    const product = readProducts().find((p) => p.id === req.params.id);
    if (!product) {
      return sendSeoOrFallback(res, 404, {
        title: `المنتج غير متوفر | ${STORE.name}`,
        description: `تصفح كل منتجات ${STORE.name} بالجملة من ${STORE.location}.`,
        pagePath: `/product/${req.params.id}`,
        noindex: true,
      });
    }
    const priceLabel = Number(product.price) > 0 ? `${money(product.price)} للقطعة (سعر الجملة)` : 'تواصل لمعرفة سعر الجملة';
    const description = `${product.description ? `${product.description} ` : ''}${product.category} • ${priceLabel} • أقل طلب ${STORE.minimumOrderLabel}.`.slice(0, 300);
    sendSeoOrFallback(res, 200, {
      title: `${product.name} - ${product.category} بالجملة | ${STORE.name}`,
      description,
      pagePath: `/product/${product.id}`,
      image: product.images && product.images[0],
    });
  });
 
  app.get('/admin', (_, res) => {
    sendSeoOrFallback(res, 200, {
      title: `إدارة المتجر | ${STORE.name}`,
      description: 'لوحة تحكم إدارة المتجر.',
      pagePath: '/admin',
      noindex: true,
    });
  });
 
  app.get('/{*splat}', (_, res) => res.sendFile(path.join(distDir, 'index.html')));
}
 
app.use((err, _req, res, _next) => res.status(400).json({error:err.message}));
app.listen(port, () => console.log(`Marter store running on http://localhost:${port}`));
