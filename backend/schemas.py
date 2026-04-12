from pydantic import BaseModel, field_validator
from typing import Optional

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

    # Isso avisa o Pydantic para ler os dados do SQLAlchemy sem dar erro
    class Config:
        from_attributes = True

# 3. Schema para os dados que o usuário envia ao tentar logar
class UsuarioLogin(BaseModel):
    email: str
    senha: str