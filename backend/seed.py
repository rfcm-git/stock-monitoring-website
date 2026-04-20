from sqlalchemy.orm import Session
from backend.model import User, Product, Sale
import random
from datetime import datetime, timedelta
import hashlib

def hash_pass(p: str):
    return hashlib.sha256(p.encode()).hexdigest()

def seed_data(db: Session):
    # prevent duplicate seed
    if db.query(User).first():
        return

    # ----------------------------
    # USERS
    # ----------------------------
    admin = User(
        name="Admin User",
        email="admin@stockflow.com",
        password=hash_pass("admin123"),
        role="admin"
    )

    staff = User(
        name="Staff Member",
        email="staff@stockflow.com",
        password=hash_pass("staff123"),
        role="staff"
    )

    db.add_all([admin, staff])

    # ----------------------------
    # PRODUCTS
    # ----------------------------
    products_data = [
        {"name": "Wireless Headphones", "sku": "SKU-001", "category": "Electronics", "price": 2999, "stock": 45, "minStock": 10},
        {"name": "USB-C Hub", "sku": "SKU-002", "category": "Electronics", "price": 1299, "stock": 8, "minStock": 10},
        {"name": "Office Chair", "sku": "SKU-003", "category": "Furniture", "price": 5499, "stock": 12, "minStock": 5},
        {"name": "Mechanical Keyboard", "sku": "SKU-004", "category": "Electronics", "price": 3499, "stock": 3, "minStock": 8},
        {"name": "Notebook Pack", "sku": "SKU-005", "category": "Office Supplies", "price": 249, "stock": 150, "minStock": 20},
        {"name": "Coffee Beans 1kg", "sku": "SKU-006", "category": "Food & Beverage", "price": 699, "stock": 60, "minStock": 15},
        {"name": "Standing Desk", "sku": "SKU-007", "category": "Furniture", "price": 12999, "stock": 5, "minStock": 3},
        {"name": "Polo Shirt", "sku": "SKU-008", "category": "Clothing", "price": 799, "stock": 2, "minStock": 10},
        {"name": "Gaming Mouse", "sku": "SKU-009", "category": "Electronics", "price": 1599, "stock": 25, "minStock": 10},
        {"name": 'LED Monitor 24"', "sku": "SKU-010", "category": "Electronics", "price": 8999, "stock": 7, "minStock": 5},
        {"name": "Desk Lamp", "sku": "SKU-011", "category": "Furniture", "price": 899, "stock": 20, "minStock": 8},
        {"name": "Backpack", "sku": "SKU-012", "category": "Accessories", "price": 1299, "stock": 18, "minStock": 6},
        {"name": "Water Bottle", "sku": "SKU-013", "category": "Accessories", "price": 499, "stock": 40, "minStock": 12},
        {"name": "Printer Ink Cartridge", "sku": "SKU-014", "category": "Office Supplies", "price": 1199, "stock": 9, "minStock": 10},
        {"name": "A4 Bond Paper (500 sheets)", "sku": "SKU-015", "category": "Office Supplies", "price": 299, "stock": 100, "minStock": 25},
        {"name": "Espresso Machine", "sku": "SKU-016", "category": "Food & Beverage", "price": 15999, "stock": 4, "minStock": 2},
        {"name": "Blender", "sku": "SKU-017", "category": "Appliances", "price": 2499, "stock": 14, "minStock": 5},
        {"name": "Electric Kettle", "sku": "SKU-018", "category": "Appliances", "price": 1299, "stock": 22, "minStock": 7},
        {"name": "Sneakers", "sku": "SKU-019", "category": "Clothing", "price": 3499, "stock": 6, "minStock": 10},
        {"name": "Denim Jeans", "sku": "SKU-020", "category": "Clothing", "price": 1999, "stock": 11, "minStock": 8},
        {"name": "Smartphone Stand", "sku": "SKU-021", "category": "Electronics", "price": 399, "stock": 35, "minStock": 10},
        {"name": "External Hard Drive 1TB", "sku": "SKU-022", "category": "Electronics", "price": 4599, "stock": 10, "minStock": 5},
        {"name": "Whiteboard", "sku": "SKU-023", "category": "Office Supplies", "price": 1799, "stock": 6, "minStock": 4},
        {"name": "Air Purifier", "sku": "SKU-024", "category": "Appliances", "price": 6999, "stock": 8, "minStock": 3},
    ]

    products = []
    for p in products_data:
        product = Product(**p)
        db.add(product)
        products.append(product)

    db.commit()

    for p in products:
        db.refresh(p)

    # ----------------------------
    # SALES
    # ----------------------------
    sales = []

    for i in range(30, -1, -1):
        d = datetime.utcnow() - timedelta(days=i)

        for _ in range(random.randint(1, 4)):
            prod = random.choice(products)
            qty = random.randint(1, 4)

            subtotal = prod.price * qty
            tax = subtotal * 0.12
            total = subtotal + tax

            sales.append(Sale(
                productId=prod.id,
                productName=prod.name,
                sku=prod.sku,
                category=prod.category,
                quantity=qty,
                unitPrice=prod.price,
                subtotal=subtotal,
                tax=tax,
                total=total,
                cashier=random.choice(["Admin User", "Staff Member"]),
                createdAt=(d + timedelta(seconds=random.randint(0, 86400))).isoformat()
            ))

    db.add_all(sales)
    db.commit()