from sqlalchemy import Column, String, Integer, Float
from backend.db.database import Base
import uuid
from datetime import datetime

# helper
def uid():
    return str(uuid.uuid4())

def now():
    return datetime.utcnow().isoformat()

# ----------------------------
# USERS
# ----------------------------
class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=uid)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, nullable=False)  # admin / staff
    createdAt = Column(String, default=now)


# ----------------------------
# PRODUCTS
# ----------------------------
class Product(Base):
    __tablename__ = "products"

    id = Column(String, primary_key=True, default=uid)
    name = Column(String, nullable=False)
    sku = Column(String, unique=True, nullable=False)
    category = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    stock = Column(Integer, default=0)
    minStock = Column(Integer, default=0)
    createdAt = Column(String, default=now)


# ----------------------------
# SALES
# ----------------------------
class Sale(Base):
    __tablename__ = "sales"

    id = Column(String, primary_key=True, default=uid)

    productId = Column(String, nullable=False)
    productName = Column(String, nullable=False)
    sku = Column(String, nullable=False)
    category = Column(String, nullable=False)

    quantity = Column(Integer, nullable=False)
    unitPrice = Column(Float, nullable=False)

    subtotal = Column(Float, nullable=False)
    tax = Column(Float, nullable=False)
    total = Column(Float, nullable=False)

    cashier = Column(String, nullable=False)
    createdAt = Column(String, default=now)

class Category(Base):
    __tablename__ = "categories"

    id = Column(String, primary_key=True, default=uid)
    name = Column(String, unique=True, nullable=False)

class Setting(Base):
    __tablename__ = "settings"

    id = Column(String, primary_key=True, default=uid)
    businessName = Column(String)
    currency = Column(String)
    tax = Column(Float)
    address = Column(String)
    lowStockThreshold = Column(Integer) 