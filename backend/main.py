from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware # Para configurar o CORS e liberar o React
from fastapi.staticfiles import StaticFiles # Para servir arquivos de imagem
from sqlalchemy.orm import Session
import shutil
import os

# Importando nossos arquivos
import models
import schemas
import security
from database import engine, get_db

# Cria as tabelas no banco de dados automaticamente
models.Base.metadata.create_all(bind=engine)

# Garante que a pasta de uploads exista fisicamente no servidor
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

app = FastAPI()

# Configura o FastAPI para "servir" a pasta uploads no endereço /uploads
# Isso permite que o React acesse http://localhost:8000/uploads/foto.jpg
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# --- CONFIGURAÇÃO DE CORS (Liberando o React) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Permite o endereço do frontend
    allow_credentials=True,
    allow_methods=["*"], # Permite todos os métodos (POST, GET, OPTIONS)
    allow_headers=["*"], # Permite todos os cabeçalhos
)

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

# Rota de login do Usuário
@app.post("/login")
def login(usuario: schemas.UsuarioLogin, db: Session = Depends(get_db)):
    # 1. Busca o usuário pelo e-mail
    db_usuario = db.query(models.Usuario).filter(models.Usuario.email == usuario.email).first()
    
    # 2. Se o usuário não existe, nega o acesso
    if not db_usuario:
        raise HTTPException(status_code=401, detail="E-mail ou senha incorretos.")

    # 3. Usa a função do security.py para comparar a senha digitada com o hash do banco
    senha_valida = security.verify_password(usuario.senha, db_usuario.senha)
    
    if not senha_valida:
        raise HTTPException(status_code=401, detail="E-mail ou senha incorretos.")

    # 4. Se tudo deu certo, retorna sucesso com os dados de permissão
    return {
        "mensagem": "Login realizado com sucesso!", 
        "nome": db_usuario.nome,
        "id": db_usuario.id,           # Adicionado
        "is_admin": db_usuario.is_admin # Adicionado
    }

# --- ROTA PARA CRIAR UM ANÚNCIO (ITEM) COM UPLOAD DE IMAGEM ---
@app.post("/itens", response_model=schemas.ItemResponse, status_code=status.HTTP_201_CREATED)
async def criar_item(
    titulo: str = Form(...),
    descricao: str = Form(...),
    categoria: str = Form(...),
    local_encontrado: str = Form(...),
    dono_id: int = Form(...),
    imagem: UploadFile = File(None), # Campo opcional para o arquivo de foto
    db: Session = Depends(get_db)
):
    caminho_imagem = None

    # Se o usuário enviou uma imagem, nós salvamos ela na pasta /uploads
    if imagem:
        caminho_imagem = f"{UPLOAD_DIR}/{imagem.filename}"
        with open(caminho_imagem, "wb") as buffer:
            shutil.copyfileobj(imagem.file, buffer)
    
    # Monta o objeto do banco de dados com as informações recebidas
    novo_item = models.Item(
        titulo=titulo,
        descricao=descricao,
        categoria=categoria,
        local_encontrado=local_encontrado,
        imagem_url=caminho_imagem, # Salva o caminho do arquivo físico (ex: uploads/foto.jpg)
        dono_id=dono_id
    )

    # Salva no banco de dados
    db.add(novo_item)
    db.commit()
    db.refresh(novo_item)

    return novo_item

# --- ROTA PARA EXCLUIR ANÚNCIO (DONO OU ADMIN) ---
@app.delete("/itens/{item_id}", status_code=status.HTTP_200_OK)
def excluir_item(item_id: int, usuario_id: int, db: Session = Depends(get_db)):
    
    # 1. Busca quem é o usuário que apertou o botão de excluir
    usuario = db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")

    # 2. Busca o anúncio PRIMEIRO (para sabermos quem é o dono dele)
    item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Anúncio não encontrado.")

    # 3. A NOVA REGRA DE NEGÓCIO: Ele NÃO é admin E também NÃO é o dono? Bloqueia!
    if not usuario.is_admin and item.dono_id != usuario.id:
        raise HTTPException(status_code=403, detail="Acesso negado. Você só pode excluir seus próprios anúncios.")

    # 4. Executa a exclusão no banco de dados
    db.delete(item)
    db.commit()

    return {"mensagem": f"Anúncio '{item.titulo}' excluído com sucesso."}

# --- ROTA PARA MARCAR COMO DEVOLVIDO (HISTÓRIA 4) ---
@app.patch("/itens/{item_id}/devolver", status_code=status.HTTP_200_OK)
def marcar_devolvido(item_id: int, usuario_id: int, db: Session = Depends(get_db)):
    
    # 1. Busca o item no banco
    item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Anúncio não encontrado.")

    # 2. Segurança: Somente o DONO do anúncio pode marcar como devolvido
    if item.dono_id != usuario_id:
        raise HTTPException(status_code=403, detail="Apenas o criador do anúncio pode marcá-lo como devolvido.")

    # 3. Muda o status para sumir do mural (conforme a História 4)
    item.status = "devolvido"
    db.commit()

    return {"mensagem": f"O item '{item.titulo}' agora está marcado como devolvido!"}

# --- ROTA SECRETA (TEMPORÁRIA) PARA PROMOVER USUÁRIO ---
@app.patch("/usuarios/{usuario_id}/promover")
def promover_para_admin(usuario_id: int, db: Session = Depends(get_db)):
    usuario = db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")
    
    usuario.is_admin = True # Muda o status no banco
    db.commit()
    
    return {"mensagem": f"O usuário {usuario.nome} agora é um ADMINISTRADOR!"}

# --- ROTA PARA LISTAR TODOS OS ANÚNCIOS (O MURAL) ---
@app.get("/itens", response_model=list[schemas.ItemResponse])
def listar_itens(db: Session = Depends(get_db)):
    # Agora mostramos apenas o que ainda está ATIVO
    itens = db.query(models.Item).filter(models.Item.status == "ativo").all()
    return itens