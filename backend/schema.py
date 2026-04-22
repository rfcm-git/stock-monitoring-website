from pydantic import BaseModel
from datetime import datetime
from backend.db.database import Base
from typing import Optional


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
    createdAt: str = datetime.utcnow().isoformat()
    
    class Config:
        from_attributes = True
        
class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    minStock: Optional[int] = None
    
'''class UserBase(BaseModel):
    name: str
    email: str
    password: str
    role: str
    
class UserResponse(UserBase):
    id: str
    createdAt: str

    class Config:
        from_attributes = True
        
class UserCreate(UserBase):
    createdAt: str = datetime.utcnow().isoformat()
    
    class Config:
        from_attributes = True
        
class UserUpdate(BaseModel):
    pass'''