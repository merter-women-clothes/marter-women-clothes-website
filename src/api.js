const API = '/api';

export async function getProducts() {
  const res = await fetch(`${API}/products`);
  if (!res.ok) throw new Error('تعذر تحميل المنتجات');
  return res.json();
}

export async function getProduct(id) {
  const res = await fetch(`${API}/products/${id}`);
  if (!res.ok) throw new Error('المنتج غير موجود');
  return res.json();
}

export async function login(password) {
  const res = await fetch(`${API}/admin/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
  if (!res.ok) throw new Error('كلمة المرور غير صحيحة');
  return res.json();
}

export async function saveProduct(product, password) {
  const method = product.id ? 'PUT' : 'POST';
  const url = product.id ? `${API}/products/${product.id}` : `${API}/products`;
  const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json', 'x-admin-password': password }, body: JSON.stringify(product) });
  if (!res.ok) throw new Error('تعذر حفظ المنتج');
  return res.json();
}

export async function deleteProduct(id, password) {
  const res = await fetch(`${API}/products/${id}`, { method: 'DELETE', headers: { 'x-admin-password': password } });
  if (!res.ok) throw new Error('تعذر حذف المنتج');
}

export async function uploadImages(files, password) {
  const form = new FormData();
  [...files].forEach(file => form.append('images', file));
  const res = await fetch(`${API}/upload`, { method: 'POST', headers: { 'x-admin-password': password }, body: form });
  if (!res.ok) throw new Error('تعذر رفع الصور');
  return res.json();
}
