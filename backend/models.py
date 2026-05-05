from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.sql import func
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
    imagem_url = Column(String, nullable=True) # Campo para a foto do item
    
    # Isso cria a relação com a tabela de usuários (quem postou o anúncio)
    dono_id = Column(Integer, ForeignKey("usuarios.id"))
    # Novo campo: ID do usuário que reivindicou o item
    reclamante_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)

class Mensagem(Base):
    __tablename__ = "mensagens"

    id = Column(Integer, primary_key=True, index=True)
    conteudo = Column(String)
    data_envio = Column(DateTime(timezone=True), server_default=func.now())
    
    # Contexto: A mensagem pertence a um item específico
    item_id = Column(Integer, ForeignKey("itens.id"))
    remetente_id = Column(Integer, ForeignKey("usuarios.id"))
    destinatario_id = Column(Integer, ForeignKey("usuarios.id"))
