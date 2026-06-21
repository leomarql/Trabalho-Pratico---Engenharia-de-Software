import io
from datetime import datetime
import models

def create_user(client, nome, email, senha="senha123"):
    resp = client.post("/usuarios", json={"nome": nome, "email": email, "senha": senha})
    assert resp.status_code == 201
    return resp.json()

def create_item(client, owner_id, titulo="Chave", descricao="Chave encontrada", categoria="Outros",
                local_encontrado="Biblioteca", data_encontrado=None, image_bytes=None, image_name="img.jpg"):
    data = {
        "titulo": titulo,
        "descricao": descricao,
        "categoria": categoria,
        "local_encontrado": local_encontrado,
        "data_encontrado": data_encontrado or "",
        "dono_id": str(owner_id),
    }
    files = {}
    if image_bytes is not None:
        files["imagem"] = (image_name, image_bytes, "image/jpeg")
    response = client.post("/itens", data=data, files=files or None)
    assert response.status_code == 201
    return response.json()

def test_create_item_without_image_without_date(client, usuario_criado):
    owner = usuario_criado
    item = create_item(client, owner_id=owner["id"], titulo="Carteira", descricao="Carteira preta", data_encontrado=None, image_bytes=None)
    assert item["titulo"] == "Carteira"
    assert item["descricao"] == "Carteira preta"
    # imagem_url should be null/None when no image uploaded
    assert item.get("imagem_url") is None or item["imagem_url"] == None
    # data_encontrado should be None when not provided
    assert item.get("data_encontrado") is None

def test_create_item_with_image_and_date(client, usuario_criado):
    owner = usuario_criado
    iso_date = datetime.utcnow().isoformat()
    item = create_item(
        client,
        owner_id=owner["id"],
        titulo="Celular",
        descricao="Celular perdido",
        data_encontrado=iso_date,
        image_bytes=b"\x89PNG\r\n\x1a\n",
        image_name="phone.png"
    )
    assert item["titulo"] == "Celular"
    assert item.get("imagem_url") is not None
    # data_encontrado stored and returned (string in JSON)
    assert item.get("data_encontrado") is not None

def test_list_active_and_archived_items(client, usuario_criado):
    owner = usuario_criado
    # create two items
    item1 = create_item(client, owner_id=owner["id"], titulo="ItemAtivo")
    item2 = create_item(client, owner_id=owner["id"], titulo="ItemArchivado")
    # mark item2 as devolvido
    resp = client.patch(f"/itens/{item2['id']}/devolver?usuario_id={owner['id']}")
    assert resp.status_code == 200
    assert resp.json()["mensagem"] == "Devolvido."
    # active list should include only item1
    resp_active = client.get("/itens")
    assert resp_active.status_code == 200
    active_ids = [i["id"] for i in resp_active.json()]
    assert item1["id"] in active_ids
    assert item2["id"] not in active_ids
    # archived list should include item2
    resp_arch = client.get("/itens-arquivados")
    assert resp_arch.status_code == 200
    arch_ids = [i["id"] for i in resp_arch.json()]
    assert item2["id"] in arch_ids

def test_get_item_not_found_returns_404(client):
    resp = client.get("/itens/9999")
    assert resp.status_code == 404
    assert resp.json()["detail"] == "Item não encontrado."

def test_reivindicar_success_own_and_duplicate(client, usuario_criado):
    owner = usuario_criado
    claimant = create_user(client, "Reclamante", "reclamante@ufmg.br")
    item = create_item(client, owner_id=owner["id"], titulo="Relógio")
    # successful claim by claimant
    resp = client.patch(f"/itens/{item['id']}/reivindicar?usuario_id={claimant['id']}")
    assert resp.status_code == 200
    assert resp.json()["mensagem"] == "Item reivindicado com sucesso!"
    # duplicate claim by same user should return 400 with message
    resp_dup = client.patch(f"/itens/{item['id']}/reivindicar?usuario_id={claimant['id']}")
    assert resp_dup.status_code == 400
    assert resp_dup.json()["detail"] == "Você já reivindicou este item."
    # owner trying to claim own item should get 400
    resp_owner = client.patch(f"/itens/{item['id']}/reivindicar?usuario_id={owner['id']}")
    assert resp_owner.status_code == 400
    assert resp_owner.json()["detail"] == "Você não pode reivindicar seu próprio item."

def test_editar_item_owner_vs_non_owner(client, usuario_criado):
    owner = usuario_criado
    other = create_user(client, "Outro", "outro@ufmg.br")
    item = create_item(client, owner_id=owner["id"], titulo="Livro", descricao="Livro antigo")
    # owner edits successfully
    data = {
        "titulo": "Livro Atualizado",
        "descricao": "Descrição atualizada",
        "categoria": "Outros",
        "local_encontrado": "Sala 1",
        "data_encontrado": "",
    }
    resp = client.put(f"/itens/{item['id']}?usuario_id={owner['id']}", data=data)
    assert resp.status_code == 200
    updated = resp.json()
    assert updated["titulo"] == "Livro Atualizado"
    # non-owner gets 403
    resp_forbidden = client.put(f"/itens/{item['id']}?usuario_id={other['id']}", data=data)
    assert resp_forbidden.status_code == 403
    assert resp_forbidden.json()["detail"] == "Acesso negado."

def test_mark_returned_and_delete_permissions(client, db, usuario_criado):
    owner = usuario_criado
    other = create_user(client, "Usuario2", "usuario2@ufmg.br")
    # item1: test owner mark devolvido and delete
    item1 = create_item(client, owner_id=owner["id"], titulo="ItemParaDevolver")
    resp_devolver = client.patch(f"/itens/{item1['id']}/devolver?usuario_id={owner['id']}")
    assert resp_devolver.status_code == 200
    assert resp_devolver.json()["mensagem"] == "Devolvido."
    # owner can delete
    resp_del_owner = client.delete(f"/itens/{item1['id']}?usuario_id={owner['id']}")
    assert resp_del_owner.status_code == 200
    assert resp_del_owner.json()["mensagem"] == "Excluído."
    # item2: test forbidden delete by non-owner
    item2 = create_item(client, owner_id=owner["id"], titulo="ItemParaTesteDelete")
    resp_del_forbidden = client.delete(f"/itens/{item2['id']}?usuario_id={other['id']}")
    assert resp_del_forbidden.status_code == 403
    assert resp_del_forbidden.json()["detail"] == "Acesso negado."
    # item3: admin delete
    item3 = create_item(client, owner_id=owner["id"], titulo="ItemParaAdminDelete")
    admin = create_user(client, "Admin", "admin@ufmg.br")
    # promote admin in DB
    u = db.query(models.Usuario).filter(models.Usuario.id == admin["id"]).first()
    u.is_admin = True
    db.commit()
    resp_admin_del = client.delete(f"/itens/{item3['id']}?usuario_id={admin['id']}")
    assert resp_admin_del.status_code == 200
    assert resp_admin_del.json()["mensagem"] == "Excluído."