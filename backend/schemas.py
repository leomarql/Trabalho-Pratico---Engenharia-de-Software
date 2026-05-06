from pydantic import BaseModel, field_validator
from typing import Optional, Any, List
from datetime import datetime

# 1. Schema de Entrada (O que o usuário envia no formulário de Cadastro)
class UsuarioCreate(BaseModel):
    nome: str
    email: str
    senha: str

    # Verifica se o email enviado é válido
    @field_validator('email')
    @classmethod
    def validar_email_ufmg(cls, v):
        if not v.endswith('@ufmg.br'):
            raise ValueError('O e-mail deve obrigatoriamente terminar com @ufmg.br')
        return v

# 2. Schema de Saída (O que a API devolve para o frontend não pode conter a senha)
class UsuarioResponse(BaseModel):
    id: int
    nome: str
    email: str
    is_admin: bool
    imagem_url: Optional[str] = None

    class Config:
        from_attributes = True

# 3. Schema para os dados que o usuário envia ao tentar logar
class UsuarioLogin(BaseModel):
    email: str
    senha: str

# 4. Schema para atualização de dados do usuário
class UsuarioUpdate(BaseModel):
    nome: Optional[str] = None
    email: Optional[str] = None
    senha: Optional[str] = None

    @field_validator('email')
    @classmethod
    def validar_email_ufmg(cls, v):
        if v is not None and not v.endswith('@ufmg.br'):
            raise ValueError('O e-mail deve obrigatoriamente terminar com @ufmg.br')
        return v

# --- SCHEMAS PARA REIVINDICAÇÕES ---
class ReivindicacaoResponse(BaseModel):
    id: int
    item_id: int
    usuario_id: int
    data_reivindicacao: datetime
    usuario_nome: Optional[str] = None  # Nome do reclamante para facilitar o front
    usuario_imagem_url: Optional[str] = None

    class Config:
        from_attributes = True

# --- SCHEMAS PARA ANÚNCIOS (ITENS) ---
class ItemCreate(BaseModel):
    titulo: str
    descricao: str
    categoria: str
    local_encontrado: str
    data_encontrado: Optional[datetime] = None
    dono_id: int

class ItemResponse(BaseModel):
    id: int
    titulo: str
    descricao: str
    categoria: str
    local_encontrado: str
    data_encontrado: Optional[datetime] = None
    status: str
    imagem_url: Optional[str] = None
    dono_id: int
    dono_nome: Optional[str] = None
    dono_imagem_url: Optional[str] = None
    total_reivindicacoes: int = 0
    reivindicacoes: List[ReivindicacaoResponse] = []

    class Config:
        from_attributes = True

# --- SCHEMAS PARA O CHAT (MENSAGENS) ---
class MensagemCreate(BaseModel):
    conteudo: str
    item_id: int
    destinatario_id: int

class MensagemResponse(BaseModel):
    id: int
    conteudo: str
    data_envio: datetime
    item_id: int
    remetente_id: int
    destinatario_id: int
    remetente_nome: Optional[str] = None
    remetente_imagem_url: Optional[str] = None

    class Config:
        from_attributes = True
