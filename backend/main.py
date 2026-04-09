from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session

# Importando nossos arquivos
import models
import schemas
import security
from database import engine, get_db

# Cria as tabelas no banco de dados automaticamente
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.get("/")
def read_root():
    return {"mensagem": "API de Achados e Perdidos rodando com sucesso!"}

# --- ROTA DE CADASTRO DE USUÁRIO ---
# O "response_model" garante que a senha NÃO seja devolvida na resposta
@app.post("/usuarios", response_model=schemas.UsuarioResponse, status_code=status.HTTP_201_CREATED)
def criar_usuario(usuario: schemas.UsuarioCreate, db: Session = Depends(get_db)):
    
    # 1. Verifica se o e-mail já existe no banco de dados
    usuario_existente = db.query(models.Usuario).filter(models.Usuario.email == usuario.email).first()
    if usuario_existente:
        raise HTTPException(status_code=400, detail="E-mail já cadastrado.")

    # 2. Esconde a senha usando a função de Hashing
    senha_criptografada = security.get_password_hash(usuario.senha)

    # 3. Monta o usuário para salvar no banco (models)
    novo_usuario = models.Usuario(
        nome=usuario.nome,
        email=usuario.email,
        senha=senha_criptografada
    )

    # 4. Salva no banco de fato
    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)

    return novo_usuario