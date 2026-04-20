from pydantic import BaseModel
from datetime import datetime
from backend.utils.helpers import uid
from sqlalchemy import Column, String, Integer, Float
from backend.db.database import Base

class ProductBase(BaseModel):
    name: str
    sku: str
    category: str
    price: float
    stock: int = 0
    minStock: int = 0
    
# Schema for reading a product (includes ID and timestamp)
class ProductResponse(ProductBase):
    id: str
    createdAt: str

    class Config:
        from_attributes = True # Allows Pydantic to read SQLAlchemy models
        
# Schema for creating a new product (excludes ID and timestamp)
class ProductCreate(ProductBase):
    id: str = uid()
    createdAt: str = datetime.utcnow().isoformat()
    
    class Config:
        from_attributes = True
    
