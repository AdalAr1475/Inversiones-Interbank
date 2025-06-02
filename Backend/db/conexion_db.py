from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from os import getenv

user = "postgres"
password = getenv("DB_PASSWORD", "1234")
host = "localhost:5432"
database = "InversionesDB"

URL_DATABASE = f"postgresql://{user}:{password}@{host}/{database}"

engine = create_engine(URL_DATABASE)
SesionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SesionLocal()
    try:
        yield db
    finally:
        db.close()