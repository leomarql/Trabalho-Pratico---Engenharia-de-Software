from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import shutil
import os
from datetime import datetime

import models
import schemas
import security
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

app = FastAPI()
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"mensagem": "API Recoopere rodando!"}

@app.post("/usuarios", response_model=schemas.UsuarioResponse, status_code=status.HTTP_201_CREATED)
def criar_usuario(usuario: schemas.UsuarioCreate, db: Session = Depends(get_db)):
    usuario_existente = db.query(models.Usuario).filter(models.Usuario.email == usuario.email).first()
    if usuario_existente:
        raise HTTPException(status_code=400, detail="E-mail já cadastrado.")

    novo_usuario = models.Usuario(
        nome=usuario.nome,
        email=usuario.email,
        senha=security.get_password_hash(usuario.senha)
    )
    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)
    return novo_usuario

@app.post("/login")
def login(usuario: schemas.UsuarioLogin, db: Session = Depends(get_db)):
    db_usuario = db.query(models.Usuario).filter(models.Usuario.email == usuario.email).first()
    if not db_usuario or not security.verify_password(usuario.senha, db_usuario.senha):
        raise HTTPException(status_code=401, detail="E-mail ou senha incorretos.")

    return {
        "mensagem": "Login realizado com sucesso!", 
        "nome": db_usuario.nome,
        "id": db_usuario.id,
        "email": db_usuario.email,
        "is_admin": db_usuario.is_admin
    }

@app.put("/usuarios/{usuario_id}", response_model=schemas.UsuarioResponse)
def atualizar_usuario(usuario_id: int, usuario_update: schemas.UsuarioUpdate, db: Session = Depends(get_db)):
    db_usuario = db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()
    if not db_usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")

    if usuario_update.nome: db_usuario.nome = usuario_update.nome
    if usuario_update.email:
        if usuario_update.email != db_usuario.email:
            if db.query(models.Usuario).filter(models.Usuario.email == usuario_update.email).first():
                raise HTTPException(status_code=400, detail="E-mail já cadastrado.")
            db_usuario.email = usuario_update.email
    if usuario_update.senha:
        db_usuario.senha = security.get_password_hash(usuario_update.senha)

    db.commit()
    db.refresh(db_usuario)
    return db_usuario

@app.post("/itens", response_model=schemas.ItemResponse, status_code=status.HTTP_201_CREATED)
async def criar_item(
    titulo: str = Form(...),
    descricao: str = Form(...),
    categoria: str = Form(...),
    local_encontrado: str = Form(...),
    data_encontrado: str = Form(None), # Recebe como string ISO
    dono_id: int = Form(...),
    imagem: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    caminho_imagem = None
    if imagem:
        caminho_imagem = f"{UPLOAD_DIR}/{imagem.filename}"
        with open(caminho_imagem, "wb") as buffer:
            shutil.copyfileobj(imagem.file, buffer)
    
    dt_obj = None
    if data_encontrado:
        try:
            dt_obj = datetime.fromisoformat(data_encontrado.replace('Z', '+00:00'))
        except:
            pass

    novo_item = models.Item(
        titulo=titulo, descricao=descricao, categoria=categoria,
        local_encontrado=local_encontrado, data_encontrado=dt_obj,
        imagem_url=caminho_imagem, dono_id=dono_id
    )
    db.add(novo_item)
    db.commit()
    db.refresh(novo_item)
    return {**novo_item.__dict__, "total_reivindicacoes": 0, "reivindicacoes": []}

@app.get("/itens", response_model=list[schemas.ItemResponse])
def listar_itens(db: Session = Depends(get_db)):
    itens = db.query(models.Item).filter(models.Item.status == "ativo").order_by(models.Item.id.desc()).all()
    res = []
    for item in itens:
        reivs = []
        for r in item.reivindicacoes:
            reivs.append({
                "id": r.id, "item_id": r.item_id, "usuario_id": r.usuario_id,
                "data_reivindicacao": r.data_reivindicacao, "usuario_nome": r.usuario.nome
            })
        res.append({
            **item.__dict__,
            "total_reivindicacoes": len(item.reivindicacoes),
            "reivindicacoes": reivs
        })
    return res

@app.get("/itens-arquivados", response_model=list[schemas.ItemResponse])
def listar_itens_arquivados(db: Session = Depends(get_db)):
    itens = db.query(models.Item).filter(models.Item.status == "devolvido").order_by(models.Item.id.desc()).all()
    res = []
    for item in itens:
        res.append({
            **item.__dict__,
            "total_reivindicacoes": len(item.reivindicacoes),
            "reivindicacoes": []
        })
    return res

@app.get("/itens/{item_id}", response_model=schemas.ItemResponse)
def obter_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item não encontrado.")
    
    reivs = []
    for r in item.reivindicacoes:
        reivs.append({
            "id": r.id, "item_id": r.item_id, "usuario_id": r.usuario_id,
            "data_reivindicacao": r.data_reivindicacao, "usuario_nome": r.usuario.nome
        })
    return {
        **item.__dict__,
        "total_reivindicacoes": len(item.reivindicacoes),
        "reivindicacoes": reivs
    }

@app.patch("/itens/{item_id}/reivindicar", status_code=status.HTTP_200_OK)
def reivindicar_item(item_id: int, usuario_id: int, db: Session = Depends(get_db)):
    item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if not item: raise HTTPException(status_code=404, detail="Item não encontrado.")
    if item.dono_id == usuario_id: raise HTTPException(status_code=400, detail="Você não pode reivindicar seu próprio item.")
    
    ja_reivindicou = db.query(models.Reivindicacao).filter(models.Reivindicacao.item_id == item_id, models.Reivindicacao.usuario_id == usuario_id).first()
    if ja_reivindicou: raise HTTPException(status_code=400, detail="Você já reivindicou este item.")

    nova_reiv = models.Reivindicacao(item_id=item_id, usuario_id=usuario_id)
    db.add(nova_reiv)
    db.commit()
    return {"mensagem": "Item reivindicado com sucesso!"}

@app.post("/mensagens", response_model=schemas.MensagemResponse)
def enviar_mensagem(mensagem: schemas.MensagemCreate, remetente_id: int, db: Session = Depends(get_db)):
    nova_msg = models.Mensagem(
        conteudo=mensagem.conteudo, item_id=mensagem.item_id,
        remetente_id=remetente_id, destinatario_id=mensagem.destinatario_id
    )
    db.add(nova_msg)
    db.commit()
    db.refresh(nova_msg)
    return {**nova_msg.__dict__, "remetente_nome": nova_msg.remetente.nome}

@app.get("/mensagens/{item_id}", response_model=list[schemas.MensagemResponse])
def listar_mensagens(item_id: int, usuario_id: int, outro_id: int, db: Session = Depends(get_db)):
    msgs = db.query(models.Mensagem).filter(
        models.Mensagem.item_id == item_id,
        (
            (models.Mensagem.remetente_id == usuario_id) & (models.Mensagem.destinatario_id == outro_id) |
            (models.Mensagem.remetente_id == outro_id) & (models.Mensagem.destinatario_id == usuario_id)
        )
    ).order_by(models.Mensagem.data_envio.asc()).all()
    
    return [{**m.__dict__, "remetente_nome": m.remetente.nome} for m in msgs]

@app.get("/meus-chats/{usuario_id}")
def listar_meus_chats(usuario_id: int, db: Session = Depends(get_db)):
    itens_anunciados = db.query(models.Item).filter(models.Item.dono_id == usuario_id).all()
    chats = []
    for item in itens_anunciados:
        for reiv in item.reivindicacoes:
            chats.append({
                "item": item,
                "outro_usuario_id": reiv.usuario_id,
                "outro_usuario_nome": reiv.usuario.nome,
                "tipo": "dono"
            })
    reivindicacoes = db.query(models.Reivindicacao).filter(models.Reivindicacao.usuario_id == usuario_id).all()
    for reiv in reivindicacoes:
        chats.append({
            "item": reiv.item,
            "outro_usuario_id": reiv.item.dono_id,
            "outro_usuario_nome": db.query(models.Usuario).filter(models.Usuario.id == reiv.item.dono_id).first().nome,
            "tipo": "reclamante"
        })
    return chats

@app.delete("/itens/{item_id}", status_code=status.HTTP_200_OK)
def excluir_item(item_id: int, usuario_id: int, db: Session = Depends(get_db)):
    item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if not item: raise HTTPException(status_code=404, detail="Item não encontrado.")
    usuario = db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()
    if not usuario.is_admin and item.dono_id != usuario_id:
        raise HTTPException(status_code=403, detail="Acesso negado.")
    db.delete(item)
    db.commit()
    return {"mensagem": "Excluído."}

@app.patch("/usuarios/{usuario_id}/foto", response_model=schemas.UsuarioResponse)
async def atualizar_foto_perfil(usuario_id: int, imagem: UploadFile = File(...), db: Session = Depends(get_db)):
    usuario = db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()
    if not usuario: raise HTTPException(status_code=404, detail="Usuário não encontrado.")
    
    caminho = f"{UPLOAD_DIR}/user_{usuario_id}_{imagem.filename}"
    with open(caminho, "wb") as buffer:
        shutil.copyfileobj(imagem.file, buffer)
    
    usuario.imagem_url = caminho
    db.commit()
    db.refresh(usuario)
    return usuario


@app.put("/itens/{item_id}", response_model=schemas.ItemResponse)
def editar_item(
    item_id: int, 
    usuario_id: int,
    titulo: str = Form(...),
    descricao: str = Form(...),
    categoria: str = Form(...),
    local_encontrado: str = Form(...),
    data_encontrado: str = Form(None),
    imagem: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if not item: raise HTTPException(status_code=404, detail="Item não encontrado.")
    if item.dono_id != usuario_id: raise HTTPException(status_code=403, detail="Acesso negado.")

    item.titulo = titulo
    item.descricao = descricao
    item.categoria = categoria
    item.local_encontrado = local_encontrado
    
    if data_encontrado:
        try:
            item.data_encontrado = datetime.fromisoformat(data_encontrado.replace('Z', '+00:00'))
        except:
            pass

    if imagem:
        caminho_imagem = f"{UPLOAD_DIR}/{imagem.filename}"
        with open(caminho_imagem, "wb") as buffer:
            shutil.copyfileobj(imagem.file, buffer)
        item.imagem_url = caminho_imagem

    db.commit()
    db.refresh(item)
    return {
        **item.__dict__,
        "total_reivindicacoes": len(item.reivindicacoes),
        "reivindicacoes": []
    }
