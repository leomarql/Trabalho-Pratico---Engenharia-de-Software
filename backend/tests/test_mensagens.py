"""
test_mensagens.py — Testes de integração para o sistema de mensagens/chat

Cobre as rotas da "Pessoa C" (mensagens, chat e listagem de conversas):
    - POST   /mensagens                  (enviar_mensagem)
    - GET    /mensagens/{item_id}         (listar_mensagens)
    - GET    /meus-chats/{usuario_id}     (listar_meus_chats)
    - GET    /                            (health check)

Usa o fixture 'client' do conftest.py (banco SQLite em memória, isolado por teste).
"""

import io


# ---------------------------------------------------------------------------
# Helpers — reutilizados nos testes (mesmo estilo de test_items.py)
# ---------------------------------------------------------------------------

def criar_usuario(client, nome, email, senha="senha123"):
    """Cria um usuário e devolve o JSON da resposta."""
    resp = client.post("/usuarios", json={"nome": nome, "email": email, "senha": senha})
    assert resp.status_code == 201
    return resp.json()


def criar_item(client, dono_id, titulo="Mochila", descricao="Mochila azul",
               categoria="Outros", local="RU"):
    """Cria um item (anúncio) pertencente a dono_id."""
    data = {
        "titulo": titulo,
        "descricao": descricao,
        "categoria": categoria,
        "local_encontrado": local,
        "data_encontrado": "",
        "dono_id": str(dono_id),
    }
    resp = client.post("/itens", data=data)
    assert resp.status_code == 201
    return resp.json()


def reivindicar(client, item_id, usuario_id):
    """Faz usuario_id reivindicar item_id."""
    resp = client.patch(f"/itens/{item_id}/reivindicar?usuario_id={usuario_id}")
    assert resp.status_code == 200
    return resp.json()


def enviar(client, remetente_id, item_id, destinatario_id, conteudo):
    """Envia uma mensagem. remetente_id vai como query param; o resto no corpo."""
    return client.post(
        f"/mensagens?remetente_id={remetente_id}",
        json={
            "conteudo": conteudo,
            "item_id": item_id,
            "destinatario_id": destinatario_id,
        },
    )


# ---------------------------------------------------------------------------
# GET / — Health check
# ---------------------------------------------------------------------------

class TestHealthCheck:
    def test_raiz_responde_200_com_mensagem(self, client):
        """A rota raiz deve confirmar que a API está no ar."""
        resposta = client.get("/")
        assert resposta.status_code == 200
        assert resposta.json() == {"mensagem": "API Recoopere rodando!"}


# ---------------------------------------------------------------------------
# POST /mensagens — Envio de mensagem
# ---------------------------------------------------------------------------

class TestEnviarMensagem:
    def test_enviar_mensagem_com_sucesso(self, client):
        """Enviar uma mensagem deve retornar 200 e persistir o conteúdo."""
        dono = criar_usuario(client, "Dono", "dono@ufmg.br")
        reclamante = criar_usuario(client, "Reclamante", "reclamante@ufmg.br")
        item = criar_item(client, dono_id=dono["id"])

        resposta = enviar(client, reclamante["id"], item["id"], dono["id"], "Olá, achei minha mochila!")
        assert resposta.status_code == 200

        dados = resposta.json()
        assert dados["conteudo"] == "Olá, achei minha mochila!"
        assert dados["item_id"] == item["id"]
        assert dados["remetente_id"] == reclamante["id"]
        assert dados["destinatario_id"] == dono["id"]
        assert "id" in dados
        assert "data_envio" in dados

    def test_resposta_inclui_nome_do_remetente(self, client):
        """A resposta serializada deve trazer o nome do remetente (para o front)."""
        dono = criar_usuario(client, "Ana Dona", "ana@ufmg.br")
        reclamante = criar_usuario(client, "Bruno Reclamante", "bruno@ufmg.br")
        item = criar_item(client, dono_id=dono["id"])

        resposta = enviar(client, reclamante["id"], item["id"], dono["id"], "Oi")
        dados = resposta.json()
        assert dados["remetente_nome"] == "Bruno Reclamante"
        # Remetente sem foto de perfil: imagem_url deve ser None
        assert dados["remetente_imagem_url"] is None

    def test_remetente_com_foto_inclui_imagem_url(self, client):
        """Se o remetente tem foto de perfil, ela aparece na mensagem serializada."""
        dono = criar_usuario(client, "Dono", "dono@ufmg.br")
        reclamante = criar_usuario(client, "Com Foto", "foto@ufmg.br")
        # Faz upload de foto para o remetente
        files = {"imagem": ("avatar.png", io.BytesIO(b"img-bytes"), "image/png")}
        up = client.patch(f"/usuarios/{reclamante['id']}/foto", files=files)
        assert up.status_code == 200
        item = criar_item(client, dono_id=dono["id"])

        resposta = enviar(client, reclamante["id"], item["id"], dono["id"], "Tenho foto")
        dados = resposta.json()
        assert dados["remetente_imagem_url"] is not None
        assert "avatar.png" in dados["remetente_imagem_url"]

    def test_varias_mensagens_geram_ids_distintos(self, client):
        """Cada mensagem enviada deve receber um id único."""
        dono = criar_usuario(client, "Dono", "dono@ufmg.br")
        reclamante = criar_usuario(client, "Reclamante", "rec@ufmg.br")
        item = criar_item(client, dono_id=dono["id"])

        r1 = enviar(client, reclamante["id"], item["id"], dono["id"], "msg 1")
        r2 = enviar(client, reclamante["id"], item["id"], dono["id"], "msg 2")
        assert r1.json()["id"] != r2.json()["id"]


# ---------------------------------------------------------------------------
# GET /mensagens/{item_id} — Listagem da conversa entre dois usuários
# ---------------------------------------------------------------------------

class TestListarMensagens:
    def test_lista_vazia_quando_nao_ha_mensagens(self, client):
        """Sem mensagens trocadas, a listagem deve vir vazia."""
        dono = criar_usuario(client, "Dono", "dono@ufmg.br")
        reclamante = criar_usuario(client, "Reclamante", "rec@ufmg.br")
        item = criar_item(client, dono_id=dono["id"])

        resposta = client.get(
            f"/mensagens/{item['id']}?usuario_id={dono['id']}&outro_id={reclamante['id']}"
        )
        assert resposta.status_code == 200
        assert resposta.json() == []

    def test_lista_mensagens_nos_dois_sentidos(self, client):
        """A conversa deve incluir mensagens de A->B E de B->A, em ordem cronológica."""
        dono = criar_usuario(client, "Dono", "dono@ufmg.br")
        reclamante = criar_usuario(client, "Reclamante", "rec@ufmg.br")
        item = criar_item(client, dono_id=dono["id"])

        enviar(client, reclamante["id"], item["id"], dono["id"], "Acho que é meu")
        enviar(client, dono["id"], item["id"], reclamante["id"], "Pode descrever?")
        enviar(client, reclamante["id"], item["id"], dono["id"], "É azul com chaveiro")

        # Consultando pelo lado do dono
        resposta = client.get(
            f"/mensagens/{item['id']}?usuario_id={dono['id']}&outro_id={reclamante['id']}"
        )
        assert resposta.status_code == 200
        msgs = resposta.json()
        assert len(msgs) == 3
        conteudos = [m["conteudo"] for m in msgs]
        assert conteudos == ["Acho que é meu", "Pode descrever?", "É azul com chaveiro"]

    def test_consulta_simetrica_independe_de_quem_pergunta(self, client):
        """Consultar como dono ou como reclamante deve retornar a mesma conversa."""
        dono = criar_usuario(client, "Dono", "dono@ufmg.br")
        reclamante = criar_usuario(client, "Reclamante", "rec@ufmg.br")
        item = criar_item(client, dono_id=dono["id"])

        enviar(client, reclamante["id"], item["id"], dono["id"], "Oi")
        enviar(client, dono["id"], item["id"], reclamante["id"], "Olá")

        como_dono = client.get(
            f"/mensagens/{item['id']}?usuario_id={dono['id']}&outro_id={reclamante['id']}"
        ).json()
        como_reclamante = client.get(
            f"/mensagens/{item['id']}?usuario_id={reclamante['id']}&outro_id={dono['id']}"
        ).json()
        assert [m["id"] for m in como_dono] == [m["id"] for m in como_reclamante]

    def test_conversa_de_terceiro_nao_vaza(self, client):
        """
        Garantia de privacidade: dois reclamantes diferentes do MESMO item
        não devem ver a conversa um do outro com o dono.
        """
        dono = criar_usuario(client, "Dono", "dono@ufmg.br")
        rec_a = criar_usuario(client, "Reclamante A", "a@ufmg.br")
        rec_b = criar_usuario(client, "Reclamante B", "b@ufmg.br")
        item = criar_item(client, dono_id=dono["id"])

        # Conversa do dono com A
        enviar(client, rec_a["id"], item["id"], dono["id"], "Sou o A")
        enviar(client, dono["id"], item["id"], rec_a["id"], "Oi A")
        # Conversa do dono com B
        enviar(client, rec_b["id"], item["id"], dono["id"], "Sou o B")

        conversa_dono_a = client.get(
            f"/mensagens/{item['id']}?usuario_id={dono['id']}&outro_id={rec_a['id']}"
        ).json()
        conteudos = [m["conteudo"] for m in conversa_dono_a]
        # Apenas as mensagens do par dono<->A devem aparecer
        assert "Sou o A" in conteudos
        assert "Oi A" in conteudos
        assert "Sou o B" not in conteudos
        assert len(conversa_dono_a) == 2

    def test_mensagens_de_outro_item_nao_aparecem(self, client):
        """O filtro também é por item: mensagens de outro item não vazam."""
        dono = criar_usuario(client, "Dono", "dono@ufmg.br")
        reclamante = criar_usuario(client, "Reclamante", "rec@ufmg.br")
        item1 = criar_item(client, dono_id=dono["id"], titulo="Item 1")
        item2 = criar_item(client, dono_id=dono["id"], titulo="Item 2")

        enviar(client, reclamante["id"], item1["id"], dono["id"], "Sobre o item 1")
        enviar(client, reclamante["id"], item2["id"], dono["id"], "Sobre o item 2")

        conversa_item1 = client.get(
            f"/mensagens/{item1['id']}?usuario_id={dono['id']}&outro_id={reclamante['id']}"
        ).json()
        conteudos = [m["conteudo"] for m in conversa_item1]
        assert conteudos == ["Sobre o item 1"]


# ---------------------------------------------------------------------------
# GET /meus-chats/{usuario_id} — Listagem de conversas do usuário
# ---------------------------------------------------------------------------

class TestMeusChats:
    def test_sem_chats_retorna_lista_vazia(self, client):
        """Usuário sem anúncios reivindicados e sem reivindicações não tem chats."""
        usuario = criar_usuario(client, "Solitário", "solo@ufmg.br")
        resposta = client.get(f"/meus-chats/{usuario['id']}")
        assert resposta.status_code == 200
        assert resposta.json() == []

    def test_chat_do_lado_dono(self, client):
        """
        Quando alguém reivindica o item do usuário, ele deve ver esse chat
        com tipo='dono' e o outro_usuario sendo o reclamante.
        """
        dono = criar_usuario(client, "Dono", "dono@ufmg.br")
        reclamante = criar_usuario(client, "Reclamante", "rec@ufmg.br")
        item = criar_item(client, dono_id=dono["id"], titulo="Guarda-chuva")
        reivindicar(client, item["id"], reclamante["id"])

        chats = client.get(f"/meus-chats/{dono['id']}").json()
        assert len(chats) == 1
        chat = chats[0]
        assert chat["tipo"] == "dono"
        assert chat["outro_usuario_id"] == reclamante["id"]
        assert chat["outro_usuario_nome"] == "Reclamante"
        assert chat["item"]["id"] == item["id"]
        assert chat["item"]["titulo"] == "Guarda-chuva"

    def test_chat_do_lado_reclamante(self, client):
        """
        Quem reivindica o item de outro deve ver o chat com tipo='reclamante'
        e o outro_usuario sendo o dono do item.
        """
        dono = criar_usuario(client, "Dono", "dono@ufmg.br")
        reclamante = criar_usuario(client, "Reclamante", "rec@ufmg.br")
        item = criar_item(client, dono_id=dono["id"], titulo="Caderno")
        reivindicar(client, item["id"], reclamante["id"])

        chats = client.get(f"/meus-chats/{reclamante['id']}").json()
        assert len(chats) == 1
        chat = chats[0]
        assert chat["tipo"] == "reclamante"
        assert chat["outro_usuario_id"] == dono["id"]
        assert chat["outro_usuario_nome"] == "Dono"
        assert chat["item"]["id"] == item["id"]

    def test_usuario_pode_ser_dono_e_reclamante_ao_mesmo_tempo(self, client):
        """
        Um mesmo usuário pode ter um anúncio reivindicado (lado dono) e ter
        reivindicado o anúncio de outro (lado reclamante). Ambos os chats aparecem.
        """
        ana = criar_usuario(client, "Ana", "ana@ufmg.br")
        bruno = criar_usuario(client, "Bruno", "bruno@ufmg.br")

        # Ana anuncia um item; Bruno reivindica -> Ana é dona desse chat
        item_ana = criar_item(client, dono_id=ana["id"], titulo="Item da Ana")
        reivindicar(client, item_ana["id"], bruno["id"])

        # Bruno anuncia outro item; Ana reivindica -> Ana é reclamante desse chat
        item_bruno = criar_item(client, dono_id=bruno["id"], titulo="Item do Bruno")
        reivindicar(client, item_bruno["id"], ana["id"])

        chats = client.get(f"/meus-chats/{ana['id']}").json()
        assert len(chats) == 2
        tipos = {c["tipo"] for c in chats}
        assert tipos == {"dono", "reclamante"}

    def test_multiplos_reclamantes_geram_multiplos_chats_para_o_dono(self, client):
        """O dono de um item reivindicado por 2 pessoas deve ver 2 chats distintos."""
        dono = criar_usuario(client, "Dono", "dono@ufmg.br")
        rec_a = criar_usuario(client, "Rec A", "a@ufmg.br")
        rec_b = criar_usuario(client, "Rec B", "b@ufmg.br")
        item = criar_item(client, dono_id=dono["id"])
        reivindicar(client, item["id"], rec_a["id"])
        reivindicar(client, item["id"], rec_b["id"])

        chats = client.get(f"/meus-chats/{dono['id']}").json()
        assert len(chats) == 2
        outros = {c["outro_usuario_id"] for c in chats}
        assert outros == {rec_a["id"], rec_b["id"]}
        assert all(c["tipo"] == "dono" for c in chats)
