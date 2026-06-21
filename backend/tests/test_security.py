"""
test_security.py — Testes unitários para security.py

Testa as funções puras de hash e verificação de senha.
Não depende de banco de dados ou HTTP.
"""

import pytest
from security import get_password_hash, verify_password


class TestGetPasswordHash:
    def test_retorna_uma_string(self):
        """O hash deve ser uma string."""
        resultado = get_password_hash("minha_senha")
        assert isinstance(resultado, str)

    def test_hash_diferente_da_senha_original(self):
        """O hash não deve ser igual ao texto puro."""
        senha = "senha_secreta_123"
        resultado = get_password_hash(senha)
        assert resultado != senha

    def test_mesmo_input_gera_hashes_diferentes(self):
        """bcrypt gera um salt aleatório; hashes da mesma senha devem ser únicos."""
        senha = "mesma_senha"
        hash1 = get_password_hash(senha)
        hash2 = get_password_hash(senha)
        assert hash1 != hash2

    def test_hash_tem_prefixo_bcrypt(self):
        """Hashes bcrypt sempre começam com '$2b$'."""
        resultado = get_password_hash("qualquer")
        assert resultado.startswith("$2b$")


class TestVerifyPassword:
    def test_senha_correta_retorna_true(self):
        """verify_password deve retornar True quando a senha bate com o hash."""
        senha = "senha_correta"
        hash_ = get_password_hash(senha)
        assert verify_password(senha, hash_) is True

    def test_senha_errada_retorna_false(self):
        """verify_password deve retornar False para senha incorreta."""
        hash_ = get_password_hash("senha_certa")
        assert verify_password("senha_errada", hash_) is False

    def test_string_vazia_retorna_false(self):
        """Verificar string vazia contra um hash real deve retornar False."""
        hash_ = get_password_hash("alguma_senha")
        assert verify_password("", hash_) is False

    def test_senha_com_caracteres_especiais(self):
        """Senhas com caracteres especiais devem funcionar normalmente."""
        senha = "S3nh@#!$%&*()"
        hash_ = get_password_hash(senha)
        assert verify_password(senha, hash_) is True
        assert verify_password("S3nh@#!$%&*(", hash_) is False
