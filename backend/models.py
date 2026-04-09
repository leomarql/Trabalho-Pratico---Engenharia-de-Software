from sqlalchemy import Column, Integer, String, Boolean
from database import Base

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    senha = Column(String)
    is_admin = Column(Boolean, default=False) # Necessário para a História 6