from fastapi import FastAPI
import models
from database import engine

# Comando mágico que lê o models.py e cria as tabelas no banco SQLite
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.get("/")
def read_root():
    return {"mensagem": "API de Achados e Perdidos rodando com sucesso!"}