from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    senha = Column(String)
    is_admin = Column(Boolean, default=False)
    imagem_url = Column(String, nullable=True) # Foto de perfil

class Item(Base):
    __tablename__ = "itens"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String, index=True)
    descricao = Column(String)
    categoria = Column(String)
    local_encontrado = Column(String)
    data_encontrado = Column(DateTime(timezone=True), nullable=True)
    status = Column(String, default="ativo")
    imagem_url = Column(String, nullable=True)
    
    dono_id = Column(Integer, ForeignKey("usuarios.id"))

    dono = relationship("Usuario", foreign_keys=[dono_id])
    reivindicacoes = relationship("Reivindicacao", back_populates="item")

class Reivindicacao(Base):
    __tablename__ = "reivindicacoes"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("itens.id"))
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))
    data_reivindicacao = Column(DateTime(timezone=True), server_default=func.now())

    item = relationship("Item", back_populates="reivindicacoes")
    usuario = relationship("Usuario")

class Mensagem(Base):
    __tablename__ = "mensagens"

    id = Column(Integer, primary_key=True, index=True)
    conteudo = Column(String)
    data_envio = Column(DateTime(timezone=True), server_default=func.now())
    
    item_id = Column(Integer, ForeignKey("itens.id"))
    remetente_id = Column(Integer, ForeignKey("usuarios.id"))
    destinatario_id = Column(Integer, ForeignKey("usuarios.id"))

    remetente = relationship("Usuario", foreign_keys=[remetente_id])
    destinatario = relationship("Usuario", foreign_keys=[destinatario_id])
