from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Cria o arquivo do banco SQLite na pasta backend
SQLALCHEMY_DATABASE_URL = "sqlite:///./achados_perdidos.db"

# Prepara o motor do banco (a configuração extra é exigência do SQLite)
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# Cria a Sessão que vai conversar com o banco de dados
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para criar as nossas tabelas
Base = declarative_base()

# Função auxiliar para injetar o banco nas rotas do FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()