from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from database import Base

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    senha = Column(String)
    is_admin = Column(Boolean, default=False) # Necessário para a História 6

class Item(Base):
    __tablename__ = "itens"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String, index=True)
    descricao = Column(String)
    categoria = Column(String) # Ex: "Eletrônicos", "Documentos", "Roupas"
    local_encontrado = Column(String)
    status = Column(String, default="ativo") # Pode ser "ativo", "devolvido" ou "removido"
    
    # Isso cria a relação com a tabela de usuários (quem postou o anúncio)
    dono_id = Column(Integer, ForeignKey("usuarios.id"))