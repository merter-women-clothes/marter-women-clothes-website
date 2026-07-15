import express from 'express';
import multer from 'multer';
import AdmZip from 'adm-zip';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const dataDir = process.env.DATA_DIR || path.join(root, 'data');
const uploadsDir = path.join(dataDir, 'uploads');
const dbFile = path.join(dataDir, 'products.json');
const seedFile = path.join(root, 'server', 'seed.json');
const seedUploadsArchive = path.join(root, 'server', 'seed-uploads.zip');
const port = process.env.PORT || 3001;
const adminPassword = process.env.ADMIN_PASSWORD || 'master2026';
const minimumOrder = 12;

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

const app = express();
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(uploadsDir));

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

if (fs.existsSync(path.join(root, 'dist'))) {
  app.use(express.static(path.join(root, 'dist')));
  app.get('/{*splat}', (_, res) => res.sendFile(path.join(root, 'dist', 'index.html')));
}

app.use((err, _req, res, _next) => res.status(400).json({error:err.message}));
app.listen(port, () => console.log(`Marter store running on http://localhost:${port}`));
