def test_read_root(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"mensagem": "API Recoopere rodando!"}


def test_criar_usuario(client, usuario_payload):
    response = client.post("/usuarios", json=usuario_payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "joao@ufmg.br"
    assert "senha" not in data  # resposta não expõe senha