"""
conftest.py — Infraestrutura compartilhada de testes (pytest)

Usa um banco SQLite em memória para cada teste, garantindo isolamento total.
O banco real (achados_perdidos.db) nunca é tocado durante os testes.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool  # <-- chave: força uma única conexão em memória

from database import Base, get_db
from main import app

TEST_DATABASE_URL = "sqlite:///:memory:"


@pytest.fixture
def client():
    """
    Cria um TestClient com banco SQLite em memória para cada teste.
    O override de dependência garante que as rotas usem o banco de teste.
    """
    engine = create_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,  # garante que create_all e as sessões usam a mesma conexão
    )
    Base.metadata.create_all(bind=engine)
    TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    def override_get_db():
        db = TestingSession()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as c:
        yield c

    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def usuario_payload():
    """Payload padrão de cadastro de usuário para reuso nos testes."""
    return {
        "nome": "João da Silva",
        "email": "joao@ufmg.br",
        "senha": "senha_secreta",
    }


@pytest.fixture
def usuario_criado(client, usuario_payload):
    """Cria um usuário no banco de teste e retorna os dados da resposta."""
    resposta = client.post("/usuarios", json=usuario_payload)
    assert resposta.status_code == 201
    return resposta.json()
