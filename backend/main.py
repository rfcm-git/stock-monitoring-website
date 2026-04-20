from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session

from backend.db.database import Base, engine, SessionLocal, get_db
from backend.seed import seed_data
from backend.model import Product
from fastapi.middleware.cors import CORSMiddleware
from backend.schema import ProductCreate 

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

@app.get("/products")
def get_products(db: Session = Depends(get_db)):
    products = db.query(Product).all()
    return products

@app.post("/product/add")
def create_product(product_in: ProductCreate, db: Session = Depends(get_db)):
    product = Product(**product_in.dict())
    db.add(product)
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