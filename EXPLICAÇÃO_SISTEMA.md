# 📘 Guia Técnico - Sistema Recoopere

Este documento explica de forma detalhada o funcionamento de todo o sistema **Recoopere**. Ele foi escrito pensando em quem não tem experiência prévia com **Python (Backend)** ou **React (Frontend)**.

---

## 🏗️ 1. Arquitetura Geral do Sistema

O sistema é dividido em duas partes principais:
1.  **Backend (O Cérebro):** Feito em Python com o framework **FastAPI**. Ele cuida do banco de dados, da segurança (senhas) e de todas as regras de negócio.
2.  **Frontend (O Rosto):** Feito em React com **Material UI**. É o que o usuário vê e interage no navegador.

As duas partes se comunicam através de **JSON** (um formato de texto para troca de dados) usando o protocolo HTTP (como uma conversa de pergunta e resposta).

---

## 🐍 2. Entendendo o Backend (Python)

### 📂 Estrutura de Arquivos:
*   `database.py`: Configura a conexão com o banco de dados SQLite (um arquivo chamado `sql_app.db`).
*   `models.py`: Define a estrutura das tabelas no banco de dados (Usuários, Itens, Reivindicações, Mensagens).
*   `schemas.py`: Define como os dados devem entrar e sair da API (contratos de dados).
*   `security.py`: Contém as ferramentas para criptografar senhas (transforma "123" em um código secreto ilegível).
*   `main.py`: O arquivo principal. Contém as "Rotas" (endereços como `/login`, `/itens`) que o frontend chama.

### 🔑 Principais Conceitos:
*   **SQLAlchemy (ORM):** É uma biblioteca que nos permite mexer no banco de dados usando código Python em vez de linguagem SQL pura. Criamos classes (objetos) que representam as tabelas.
*   **Pydantic (Schemas):** Garante que, se o frontend disser que vai enviar um e-mail, ele realmente envie um texto no formato de e-mail. Se o dado estiver errado, o Python recusa automaticamente.
*   **FastAPI:** É o servidor que fica "ouvindo" as chamadas do navegador e devolve as respostas.

---

## ⚛️ 3. Entendendo o Frontend (React)

### 📂 Estrutura de Arquivos e Componentes:
O React divide a tela em peças menores chamadas **Componentes**.

*   `main.jsx`: O ponto de partida que liga o React ao arquivo `index.html`.
*   `App.jsx`: O componente pai. Ele decide qual tela mostrar (Home, Mural, Perfil) com base no "Estado" (`useState`).
*   `Header.jsx`: A barra superior. Ela muda dinamicamente se o usuário está logado ou não.
*   `Home.jsx`: A Landing Page com o carrossel informativo.
*   `Login.jsx` & `Cadastro.jsx`: Formulários de entrada com validações.
*   `Mural.jsx`: A tela principal que lista os achados e perdidos e permite filtrar por texto, categoria ou data.
*   `ItemDetalhes.jsx`: Mostra a foto grande e a descrição completa de um item específico.
*   `MeusAnuncios.jsx`: Área administrativa do usuário para editar seus anúncios ou abrir chats.
*   `Chat.jsx`: A janela de conversa privada. Usa "Polling" (pergunta ao servidor a cada 3 segundos se há mensagens novas).
*   `Arquivados.jsx`: Histórico de itens que o usuário já devolveu.

### 🎨 Design e Estilo:
*   **Material UI (MUI):** Usamos a biblioteca de componentes do Google. Isso nos dá botões, campos de texto e ícones profissionais prontos para usar.
*   **Material You (M3):** É a linguagem visual que define as bordas arredondadas (12px-16px) e as cores suaves.
*   **Dayjs:** Biblioteca para lidar com datas de forma fácil (formatação DD/MM/YYYY).

---

## 🔄 4. Como as funcionalidades funcionam (Exemplos)

### 📱 O Cadastro de Itens (com Foto):
1.  O usuário preenche o formulário em `CadastroItem.jsx`.
2.  O React cria um objeto `FormData` (necessário para enviar arquivos binários como imagens).
3.  O navegador envia isso para `POST /itens` no Backend.
4.  O Python recebe o arquivo, salva na pasta `uploads/` e guarda o caminho (ex: `uploads/foto.jpg`) no banco de dados.

### 💬 O Sistema de Reivindicação e Chat Privado:
1.  Alguém clica em "É MEU!" no Mural.
2.  O sistema cria uma linha na tabela `reivindicacoes` ligando aquele Usuário àquele Item.
3.  O dono do anúncio vê esse nome na lista em "Meus Anúncios".
4.  Ao abrir o chat, o sistema filtra as mensagens no banco de dados onde:
    `(Remetente = Dono E Destinatário = Reclamante) OU (Remetente = Reclamante E Destinatário = Dono)`.
    *Isso garante que outros reclamantes do mesmo item não vejam a conversa alheia.*

### 🌑 O Tema Escuro:
1.  Usamos o `ThemeProvider` do MUI no `App.jsx`.
2.  Temos um estado chamado `darkMode` (verdadeiro ou falso).
3.  Quando mudamos o botão no Header, o React re-desenha toda a tela trocando as cores de fundo e texto instantaneamente.

---

## 🛠️ 5. Guia de Instalação para Colegas

Para rodar o projeto do zero, seus colegas devem:

1.  **Backend:**
    ```bash
    cd backend
    python -m venv venv
    source venv/bin/activate (ou venv\Scripts\activate no Windows)
    pip install -r requirements.txt
    fastapi dev main.py
    ```

2.  **Frontend:**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

---
*Documentação detalhada gerada para o Trabalho Prático de Engenharia de Software - UFMG.*
