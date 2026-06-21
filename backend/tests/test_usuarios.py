"""
test_usuarios.py — Testes de integração para os endpoints de usuário

Cobre: POST /usuarios, POST /login, PUT /usuarios/{id},
       PATCH /usuarios/{id}/foto

Usa o fixture 'client' do conftest.py (banco SQLite em memória).
"""

import io
import pytest


# ---------------------------------------------------------------------------
# POST /usuarios — Cadastro
# ---------------------------------------------------------------------------

class TestCriarUsuario:
    def test_cadastro_com_sucesso(self, client):
        """Cadastrar um usuário válido deve retornar 201 com os dados do usuário."""
        resposta = client.post("/usuarios", json={
            "nome": "Maria Silva",
            "email": "maria@ufmg.br",
            "senha": "senha123",
        })
        assert resposta.status_code == 201
        dados = resposta.json()
        assert dados["email"] == "maria@ufmg.br"
        assert dados["nome"] == "Maria Silva"
        assert "id" in dados
        # A senha nunca deve aparecer na resposta
        assert "senha" not in dados

    def test_cadastro_retorna_is_admin_false_por_padrao(self, client):
        """Novo usuário não deve ser admin por padrão."""
        resposta = client.post("/usuarios", json={
            "nome": "Pedro", "email": "pedro@ufmg.br", "senha": "abc"
        })
        assert resposta.json()["is_admin"] is False

    def test_email_duplicado_retorna_400(self, client, usuario_payload):
        """Tentar cadastrar com email já existente deve retornar 400."""
        client.post("/usuarios", json=usuario_payload)
        resposta = client.post("/usuarios", json=usuario_payload)
        assert resposta.status_code == 400
        assert "já cadastrado" in resposta.json()["detail"]

    def test_email_sem_ufmg_retorna_422(self, client):
        """Email sem @ufmg.br deve ser rejeitado pelo Pydantic com 422."""
        resposta = client.post("/usuarios", json={
            "nome": "Fulano",
            "email": "fulano@gmail.com",
            "senha": "123456",
        })
        assert resposta.status_code == 422

    def test_email_hotmail_retorna_422(self, client):
        """Email @hotmail.com deve ser rejeitado com 422."""
        resposta = client.post("/usuarios", json={
            "nome": "Fulano",
            "email": "fulano@hotmail.com",
            "senha": "123456",
        })
        assert resposta.status_code == 422

    def test_campos_obrigatorios_ausentes_retorna_422(self, client):
        """Omitir campos obrigatórios deve retornar 422."""
        resposta = client.post("/usuarios", json={"email": "x@ufmg.br"})
        assert resposta.status_code == 422

    def test_imagem_url_nula_por_padrao(self, client):
        """Campo imagem_url deve ser None para usuário recém criado."""
        resposta = client.post("/usuarios", json={
            "nome": "Novo", "email": "novo@ufmg.br", "senha": "abc"
        })
        assert resposta.json()["imagem_url"] is None


# ---------------------------------------------------------------------------
# POST /login — Autenticação
# ---------------------------------------------------------------------------

class TestLogin:
    def test_login_com_sucesso(self, client, usuario_payload, usuario_criado):
        """Login com credenciais corretas deve retornar 200 e dados do usuário."""
        resposta = client.post("/login", json={
            "email": usuario_payload["email"],
            "senha": usuario_payload["senha"],
        })
        assert resposta.status_code == 200
        dados = resposta.json()
        assert dados["email"] == usuario_payload["email"]
        assert dados["nome"] == usuario_payload["nome"]
        assert "id" in dados
        assert "is_admin" in dados
        assert "mensagem" in dados

    def test_login_senha_errada_retorna_401(self, client, usuario_criado, usuario_payload):
        """Senha incorreta deve retornar 401."""
        resposta = client.post("/login", json={
            "email": usuario_payload["email"],
            "senha": "senha_errada",
        })
        assert resposta.status_code == 401
        assert "incorretos" in resposta.json()["detail"]

    def test_login_email_inexistente_retorna_401(self, client):
        """Email não cadastrado deve retornar 401 (não 404, por segurança)."""
        resposta = client.post("/login", json={
            "email": "naoexiste@ufmg.br",
            "senha": "qualquer",
        })
        assert resposta.status_code == 401

    def test_login_nao_expoe_senha_na_resposta(self, client, usuario_payload, usuario_criado):
        """A resposta do login nunca deve conter o campo 'senha'."""
        resposta = client.post("/login", json={
            "email": usuario_payload["email"],
            "senha": usuario_payload["senha"],
        })
        assert "senha" not in resposta.json()


# ---------------------------------------------------------------------------
# PUT /usuarios/{id} — Atualização de dados
# ---------------------------------------------------------------------------

class TestAtualizarUsuario:
    def test_atualizar_nome_com_sucesso(self, client, usuario_criado):
        """Atualizar só o nome deve retornar 200 com o novo nome."""
        usuario_id = usuario_criado["id"]
        resposta = client.put(f"/usuarios/{usuario_id}", json={"nome": "Novo Nome"})
        assert resposta.status_code == 200
        assert resposta.json()["nome"] == "Novo Nome"

    def test_atualizar_email_com_sucesso(self, client, usuario_criado):
        """Atualizar o email para outro @ufmg.br válido deve funcionar."""
        usuario_id = usuario_criado["id"]
        resposta = client.put(f"/usuarios/{usuario_id}", json={"email": "novoemail@ufmg.br"})
        assert resposta.status_code == 200
        assert resposta.json()["email"] == "novoemail@ufmg.br"

    def test_atualizar_senha_com_sucesso(self, client, usuario_criado, usuario_payload):
        """Após alterar a senha, o login com a nova senha deve funcionar."""
        usuario_id = usuario_criado["id"]
        nova_senha = "nova_senha_forte"

        put_resp = client.put(f"/usuarios/{usuario_id}", json={"senha": nova_senha})
        assert put_resp.status_code == 200

        # Confirma que o login com a nova senha funciona
        login_resp = client.post("/login", json={
            "email": usuario_payload["email"],
            "senha": nova_senha,
        })
        assert login_resp.status_code == 200

        # E que a senha antiga não funciona mais
        login_old = client.post("/login", json={
            "email": usuario_payload["email"],
            "senha": usuario_payload["senha"],
        })
        assert login_old.status_code == 401

    def test_atualizar_email_duplicado_retorna_400(self, client, usuario_criado):
        """Tentar usar um email já em uso por outro usuário deve retornar 400."""
        # Cria segundo usuário
        client.post("/usuarios", json={
            "nome": "Outro", "email": "outro@ufmg.br", "senha": "abc"
        })
        usuario_id = usuario_criado["id"]

        # Tenta atualizar o primeiro com o email do segundo
        resposta = client.put(f"/usuarios/{usuario_id}", json={"email": "outro@ufmg.br"})
        assert resposta.status_code == 400
        assert "já cadastrado" in resposta.json()["detail"]

    def test_atualizar_usuario_inexistente_retorna_404(self, client):
        """Atualizar um ID inexistente deve retornar 404."""
        resposta = client.put("/usuarios/99999", json={"nome": "Teste"})
        assert resposta.status_code == 404

    def test_atualizar_email_para_o_proprio_email_nao_gera_conflito(self, client, usuario_criado):
        """Enviar o mesmo email do usuário no update não deve causar erro de duplicata."""
        usuario_id = usuario_criado["id"]
        email_atual = usuario_criado["email"]
        resposta = client.put(f"/usuarios/{usuario_id}", json={
            "nome": "Nome Atualizado",
            "email": email_atual,
        })
        assert resposta.status_code == 200


# ---------------------------------------------------------------------------
# PATCH /usuarios/{id}/foto — Upload de foto de perfil
# ---------------------------------------------------------------------------

class TestAtualizarFotoPerfil:
    def _make_fake_image(self, filename: str = "foto.jpg") -> dict:
        """Cria um arquivo de imagem falso em memória para o upload."""
        fake_content = b"fake-image-bytes-content"
        return {
            "imagem": (filename, io.BytesIO(fake_content), "image/jpeg")
        }

    def test_upload_usuario_inexistente_retorna_404(self, client):
        """Fazer upload para um usuário inexistente deve retornar 404."""
        resposta = client.patch(
            "/usuarios/99999/foto",
            files=self._make_fake_image(),
        )
        assert resposta.status_code == 404

    def test_upload_com_sucesso(self, client, usuario_criado):
        """Upload de foto válido deve retornar 200 com imagem_url preenchida."""
        usuario_id = usuario_criado["id"]
        resposta = client.patch(
            f"/usuarios/{usuario_id}/foto",
            files=self._make_fake_image("minha_foto.jpg"),
        )
        assert resposta.status_code == 200
        dados = resposta.json()
        assert dados["imagem_url"] is not None
        assert "minha_foto.jpg" in dados["imagem_url"]

    def test_upload_atualiza_campo_imagem_url(self, client, usuario_criado):
        """Após o upload, o campo imagem_url deve estar preenchido."""
        usuario_id = usuario_criado["id"]
        assert usuario_criado["imagem_url"] is None  # estava vazio antes

        client.patch(
            f"/usuarios/{usuario_id}/foto",
            files=self._make_fake_image("avatar.png"),
        )

        # Verifica via login que o campo foi persistido
        login_resp = client.post("/login", json={
            "email": usuario_criado["email"],
            "senha": "senha_secreta",  # mesma do usuario_payload
        })
        assert login_resp.json()["imagem_url"] is not None
