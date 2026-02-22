from database import engine, Base
from models import scan_models

def init():
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created!")

init()