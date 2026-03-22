# Achados e Perdidos UFMG - Trabalho prático - Engenharia de Software

## Membros da Equipe
* Leonardo Martins Marques Oliveira - Papel: Fullstack
* Yuri Henriques Batista - Papel: Fullstack
* Gustavo Eulalio de Souza Ferreira - Papel: Fullstack
* Isabella Araujo Pinto Carvalho - Papel: Fullstack

## Objetivo do Sistema
Uma plataforma web para centralizar o registro de itens perdidos e encontrados no campus da UFMG. O sistema permitirá que estudantes reportem objetos que perderam ou anunciem itens que encontraram, categorizando-os por local, data e tipo. O objetivo é facilitar a devolução rápida de pertences através de um mural público pesquisável e um sistema de contato direto entre os usuários.

## Tecnologias
* **Frontend:** React e Node.js
* **Backend:** Python com FastAPI
* **Banco de Dados:** PostgreSQL 
* **Agentes de IA:** Cursor, Claude Code e Gemini para desenvolvimento e refatoração.

## Histórias de Usuário
1. Como estudante, quero publicar a foto e o local de um item que encontrei para que o dono possa identificá-lo.
2. Como estudante que perdeu algo, quero buscar anúncios filtrando por categoria (ex: eletrônicos, documentos) para tentar achar meu pertence.
3. Como usuário cadastrado, quero enviar uma mensagem interna ao descobridor do meu item para combinarmos a devolução.
4. Como usuário, quero marcar um item que anunciei como "Devolvido" para que ele não apareça mais nas buscas ativas do mural.
5. Como estudante, quero criar um alerta com a descrição do que perdi para ser notificado automaticamente caso alguém encontre.
6. Como administrador, quero poder excluir anúncios falsos ou com conteúdo impróprio para manter a plataforma segura.
7. Como usuário, quero fazer login no sistema utilizando meu e-mail acadêmico para garantir que apenas pessoas da comunidade universitária usem a plataforma.
8. Como estudante, quero visualizar um mural na página inicial com os últimos 10 itens encontrados recentemente para checagem rápida.

## Documentação Preliminar (UML)

### Diagrama de Casos de Uso
```mermaid
usecaseDiagram
    actor Estudante
    actor Administrador
    
    Estudante --> (Cadastrar Item Encontrado)
    Estudante --> (Buscar Itens Perdidos)
    Estudante --> (Enviar Mensagem)
    Estudante --> (Marcar como Devolvido)
    Estudante --> (Fazer Login)
    
    Administrador --> (Fazer Login)
    Administrador --> (Excluir Anúncios Inválidos)
