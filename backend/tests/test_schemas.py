"""
test_schemas.py — Testes de validação dos schemas Pydantic

Verifica que os validadores de email (campo @ufmg.br) funcionam corretamente
para UsuarioCreate e UsuarioUpdate.
"""

import pytest
from pydantic import ValidationError
from schemas import UsuarioCreate, UsuarioUpdate


class TestUsuarioCreate:
    def test_email_valido_ufmg(self):
        """Email terminando em @ufmg.br deve ser aceito."""
        u = UsuarioCreate(nome="Ana", email="ana@ufmg.br", senha="123456")
        assert u.email == "ana@ufmg.br"

    def test_email_subdominio_ufmg(self):
        """Email com subdomínio de ufmg.br ainda deve ser aceito (termina com @ufmg.br)."""
        u = UsuarioCreate(nome="Ana", email="ana.souza@ufmg.br", senha="123456")
        assert u.email == "ana.souza@ufmg.br"

    def test_email_gmail_invalido(self):
        """Email @gmail.com deve levantar ValidationError."""
        with pytest.raises(ValidationError) as exc_info:
            UsuarioCreate(nome="Ana", email="ana@gmail.com", senha="123456")
        assert "ufmg.br" in str(exc_info.value)

    def test_email_hotmail_invalido(self):
        """Email @hotmail.com deve levantar ValidationError."""
        with pytest.raises(ValidationError):
            UsuarioCreate(nome="Ana", email="ana@hotmail.com", senha="123456")

    def test_email_sem_arroba_invalido(self):
        """String sem '@' deve levantar ValidationError."""
        with pytest.raises(ValidationError):
            UsuarioCreate(nome="Ana", email="anaufmg.br", senha="123456")

    def test_email_vazio_invalido(self):
        """Email vazio deve levantar ValidationError."""
        with pytest.raises(ValidationError):
            UsuarioCreate(nome="Ana", email="", senha="123456")

    def test_todos_campos_obrigatorios(self):
        """Omitir qualquer campo obrigatório deve levantar ValidationError."""
        with pytest.raises(ValidationError):
            UsuarioCreate(email="ana@ufmg.br", senha="123456")  # sem nome

        with pytest.raises(ValidationError):
            UsuarioCreate(nome="Ana", senha="123456")  # sem email

        with pytest.raises(ValidationError):
            UsuarioCreate(nome="Ana", email="ana@ufmg.br")  # sem senha

    def test_campos_corretos_apos_criacao(self):
        """Os campos devem manter os valores fornecidos."""
        u = UsuarioCreate(nome="Carlos", email="carlos@ufmg.br", senha="abc123")
        assert u.nome == "Carlos"
        assert u.senha == "abc123"


class TestUsuarioUpdate:
    def test_todos_campos_opcionais(self):
        """UsuarioUpdate permite criação sem nenhum campo (todos opcionais)."""
        u = UsuarioUpdate()
        assert u.nome is None
        assert u.email is None
        assert u.senha is None

    def test_email_none_permitido(self):
        """email=None é válido (campo não será alterado)."""
        u = UsuarioUpdate(email=None)
        assert u.email is None

    def test_email_valido_ufmg(self):
        """Email @ufmg.br deve ser aceito no update."""
        u = UsuarioUpdate(email="novo@ufmg.br")
        assert u.email == "novo@ufmg.br"

    def test_email_invalido_no_update(self):
        """Email não @ufmg.br deve levantar ValidationError mesmo no update."""
        with pytest.raises(ValidationError):
            UsuarioUpdate(email="outro@yahoo.com")

    def test_apenas_nome_atualizado(self):
        """Atualizar só o nome deve funcionar normalmente."""
        u = UsuarioUpdate(nome="Novo Nome")
        assert u.nome == "Novo Nome"
        assert u.email is None
        assert u.senha is None

    def test_apenas_senha_atualizada(self):
        """Atualizar só a senha deve funcionar normalmente."""
        u = UsuarioUpdate(senha="nova_senha_forte")
        assert u.senha == "nova_senha_forte"
