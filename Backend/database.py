from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

user = "postgres"
password = "1234"
host = "localhost:5432"
database = "InversionesDB"

URL_DATABASE = f"postgresql://{user}:{password}@{host}/{database}"

engine = create_engine(URL_DATABASE)
SesionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SesionLocal()
    try:
        yield db
    finally:
        db.close()