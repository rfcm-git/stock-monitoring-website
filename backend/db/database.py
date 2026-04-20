from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base


# sqlite:// means to use sqlite database
# ./ means the database file will be created in the current directory
# stockflow.db is the name of the database file
# /// means indicates a local file path (not a server)
# For production, you can change this to a more robust database like PostgreSQL or MySQL
DATABASE_URL = "sqlite:///./stockflow.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db  # This "lends" the connection to the route
    finally:
        db.close() # This "returns" the connection and closes it automatically