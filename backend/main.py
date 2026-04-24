from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session
from datetime import datetime

from backend.db.database import Base, engine, SessionLocal, get_db
from backend.seed import seed_data
from backend.model import Product
from fastapi.middleware.cors import CORSMiddleware
from backend.schema import ProductCreate, ProductUpdate 

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# create tables
Base.metadata.create_all(bind=engine)

@app.on_event("startup")
def startup():
    db = SessionLocal()
    seed_data(db)
    db.close()

@app.get("/")
@app.get("/products")
def get_products(db: Session = Depends(get_db)):
    products = db.query(Product).all()
    return products



@app.get("/product/{product_id}")
def get_product(product_id: str, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    return product

@app.post("/product/add")
def create_product(product_in: ProductCreate, db: Session = Depends(get_db)):
    product = Product(
        **product_in.dict(),
        createdAt=datetime.utcnow()
    )

    db.add(product)
    db.commit()
    db.refresh(product)
    return product

@app.patch("/product/{product_id}")
def update_product(
    product_id: str,
    product_in: ProductUpdate,
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    for key, value in product_in.dict(exclude_unset=True).items():
        setattr(product, key, value)

    db.commit()
    db.refresh(product)

    return product
    
@app.delete("/product/{product_id}")
def delete_product(product_id: str, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if product:
        db.delete(product)
        db.commit()
    db.close()
    return {"message": "Product deleted" if product else "Product not found"}

@app.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    categories = db.query(Product.category).distinct().all()
    return [cat[0] for cat in categories]

@app.get("/categories/{category}/products")
def get_products_by_category(category: str, db: Session = Depends(get_db)):
    products = db.query(Product).filter(Product.category == category).all()
    return products

@app.get("/search")
def search_products(q: str, db: Session = Depends(get_db)):
    return db.query(Product).filter(
        or_(
            Product.name.ilike(f"%{q.strip()}%"),
            Product.category.ilike(f"%{q.strip()}%"),
            Product.sku.ilike(f"%{q.strip()}%")
        )
    ).all()

'''@app.get("/categories/{category}/products")
def get_products_by_category(
    category: str,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    return (
        db.query(Product)
        .filter(Product.category == category)
        .offset(skip)
        .limit(limit)
        .all()
    )'''