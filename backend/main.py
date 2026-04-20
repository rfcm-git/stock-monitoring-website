from fastapi import FastAPI
from backend.db.database import Base, engine, SessionLocal
from backend.seed import seed_data
from backend.model import Product, Sale

app = FastAPI()

# create tables
Base.metadata.create_all(bind=engine)

@app.on_event("startup")
def startup():
    db = SessionLocal()
    seed_data(db)
    db.close()


@app.get("/products")
def get_products():
    db = SessionLocal()
    products = db.query(Product).all()
    db.close()

    return [
        {
            "id": p.id,
            "name": p.name,
            "sku": p.sku,
            "category": p.category,
            "price": p.price,
            "stock": p.stock,
            "minStock": p.minStock,
            "createdAt": p.createdAt,
        }
        for p in products
    ]