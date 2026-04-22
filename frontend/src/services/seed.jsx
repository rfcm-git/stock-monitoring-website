import { DB } from "../services/storage";
import { uid, now, hashPass } from "../utils/helpers";

export default function SeedData() {
  if (DB.get('seeded')) return;
  const adminId = uid();
  const staffId = uid();
  DB.set('users', [
    { id: adminId, name: 'Admin User', email: 'admin@stockflow.com', password: hashPass('admin123'), role: 'admin', createdAt: now() },
    { id: staffId, name: 'Staff Member', email: 'staff@stockflow.com', password: hashPass('staff123'), role: 'staff', createdAt: now() },
  ]);
  const cats = ['Electronics', 'Clothing', 'Food & Beverage', 'Office Supplies', 'Furniture'];
  DB.set('categories', cats);

  // seed some products')
  const prods = [
    { id: uid(), name: 'Wireless Headphones', sku: 'SKU-001', category: 'Electronics', price: 2999, stock: 45, minStock: 10 },
    { id: uid(), name: 'USB-C Hub', sku: 'SKU-002', category: 'Electronics', price: 1299, stock: 8, minStock: 10 },
    { id: uid(), name: 'Office Chair', sku: 'SKU-003', category: 'Furniture', price: 5499, stock: 12, minStock: 5 },
    { id: uid(), name: 'Mechanical Keyboard', sku: 'SKU-004', category: 'Electronics', price: 3499, stock: 3, minStock: 8 },
    { id: uid(), name: 'Notebook Pack', sku: 'SKU-005', category: 'Office Supplies', price: 249, stock: 150, minStock: 20 },
    { id: uid(), name: 'Coffee Beans 1kg', sku: 'SKU-006', category: 'Food & Beverage', price: 699, stock: 60, minStock: 15 },
    { id: uid(), name: 'Standing Desk', sku: 'SKU-007', category: 'Furniture', price: 12999, stock: 5, minStock: 3 },
    { id: uid(), name: 'Polo Shirt', sku: 'SKU-008', category: 'Clothing', price: 799, stock: 2, minStock: 10 },

    // Added items
    { id: uid(), name: 'Gaming Mouse', sku: 'SKU-009', category: 'Electronics', price: 1599, stock: 25, minStock: 10 },
    { id: uid(), name: 'LED Monitor 24"', sku: 'SKU-010', category: 'Electronics', price: 8999, stock: 7, minStock: 5 },
    { id: uid(), name: 'Desk Lamp', sku: 'SKU-011', category: 'Furniture', price: 899, stock: 20, minStock: 8 },
    { id: uid(), name: 'Backpack', sku: 'SKU-012', category: 'Accessories', price: 1299, stock: 18, minStock: 6 },
    { id: uid(), name: 'Water Bottle', sku: 'SKU-013', category: 'Accessories', price: 499, stock: 40, minStock: 12 },
    { id: uid(), name: 'Printer Ink Cartridge', sku: 'SKU-014', category: 'Office Supplies', price: 1199, stock: 9, minStock: 10 },
    { id: uid(), name: 'A4 Bond Paper (500 sheets)', sku: 'SKU-015', category: 'Office Supplies', price: 299, stock: 100, minStock: 25 },
    { id: uid(), name: 'Espresso Machine', sku: 'SKU-016', category: 'Food & Beverage', price: 15999, stock: 4, minStock: 2 },
    { id: uid(), name: 'Blender', sku: 'SKU-017', category: 'Appliances', price: 2499, stock: 14, minStock: 5 },
    { id: uid(), name: 'Electric Kettle', sku: 'SKU-018', category: 'Appliances', price: 1299, stock: 22, minStock: 7 },
    { id: uid(), name: 'Sneakers', sku: 'SKU-019', category: 'Clothing', price: 3499, stock: 6, minStock: 10 },
    { id: uid(), name: 'Denim Jeans', sku: 'SKU-020', category: 'Clothing', price: 1999, stock: 11, minStock: 8 },
    { id: uid(), name: 'Smartphone Stand', sku: 'SKU-021', category: 'Electronics', price: 399, stock: 35, minStock: 10 },
    { id: uid(), name: 'External Hard Drive 1TB', sku: 'SKU-022', category: 'Electronics', price: 4599, stock: 10, minStock: 5 },
    { id: uid(), name: 'Whiteboard', sku: 'SKU-023', category: 'Office Supplies', price: 1799, stock: 6, minStock: 4 },
    { id: uid(), name: 'Air Purifier', sku: 'SKU-024', category: 'Appliances', price: 6999, stock: 8, minStock: 3 },
  ].map(p => ({ ...p, id: uid(), createdAt: now() }));
  DB.set('products', prods);


  // seed some past sales
  const sales = [];
  for (let i = 30; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const count = Math.floor(Math.random() * 4) + 1;
    for (let j = 0; j < count; j++) {
      const prod = prods[Math.floor(Math.random() * prods.length)];
      const qty = Math.floor(Math.random() * 4) + 1;
      sales.push({
        id: uid(), productId: prod.id, productName: prod.name, sku: prod.sku,
        category: prod.category, quantity: qty, unitPrice: prod.price,
        subtotal: prod.price * qty, tax: prod.price * qty * .12, total: prod.price * qty * 1.12,
        cashier: Math.random() > .5 ? 'Admin User' : 'Staff Member',
        createdAt: new Date(d.getTime() + Math.random() * 86400000).toISOString()
      });
    }
  }

  DB.set('sales', sales);
  DB.set('settings', { businessName: 'StockFlow POS', currency: '₱', tax: 12, address: 'Manila, Philippines', lowStockThreshold: 10 });
  DB.set('seeded', true);
}