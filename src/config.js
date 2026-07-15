export const STORE = {
  name: 'Marter Women Clothes',
  arabicName: 'مارتر للملابس النسائية',
  owner: 'عبدالرحمن أحمد',
  whatsappUrl: 'https://wa.me/message/62ZGSGKQUAMWH1',
  telegram: 'master_women_clothes',
  location: 'الشورجة، بغداد، العراق',
  minimumOrder: 12,
  minimumOrderLabel: 'درزن واحد (12 قطعة)',
};

export const money = (value) => `${Number(value || 0).toLocaleString('ar-IQ')} د.ع`;

export const orderText = (product) => encodeURIComponent(
  `السلام عليكم، أريد طلب هذا المنتج بالجملة:\n${product.name}\nالكود: ${product.sku}\nالكمية المبدئية: ${STORE.minimumOrderLabel}\n${Number(product.price) > 0 ? `السعر: ${money(product.price)}\n` : ''}طريقة الدفع: عند الاستلام بعد فحص الطلب\nرابط المنتج: ${window.location.href}`
);
