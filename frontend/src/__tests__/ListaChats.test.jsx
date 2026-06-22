import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import ListaChats from '../ListaChats';

vi.mock('axios');

const usuario = { id: 1, nome: 'Ana' };

const chatsMock = [
  {
    item: { id: 10, titulo: 'Mochila Azul' },
    outro_usuario_id: 2,
    outro_usuario_nome: 'Bruno',
    outro_usuario_imagem_url: null,
    tipo: 'dono', // sou dono do item; Bruno reivindicou
  },
  {
    item: { id: 20, titulo: 'Garrafa Térmica' },
    outro_usuario_id: 3,
    outro_usuario_nome: 'Carla',
    outro_usuario_imagem_url: null,
    tipo: 'reclamante', // reivindiquei o item da Carla
  },
];

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe('ListaChats - carga da API', () => {
  it('busca os chats do usuário logado ao montar', async () => {
    axios.get.mockResolvedValue({ data: chatsMock });
    render(<ListaChats usuario={usuario} onSelecionarChat={vi.fn()} />);

    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    expect(axios.get.mock.calls[0][0]).toContain('/meus-chats/1');
  });

  it('renderiza um item por chat retornado, com o título do item e o nome do outro usuário', async () => {
    axios.get.mockResolvedValue({ data: chatsMock });
    render(<ListaChats usuario={usuario} onSelecionarChat={vi.fn()} />);

    expect(await screen.findByText('Mochila Azul')).toBeInTheDocument();
    expect(await screen.findByText('Bruno')).toBeInTheDocument();
    expect(await screen.findByText('Garrafa Térmica')).toBeInTheDocument();
    expect(await screen.findByText('Carla')).toBeInTheDocument();
  });

  it('mostra o papel correto: "Reivindicou seu item" para dono e "Anunciante" para reclamante', async () => {
    axios.get.mockResolvedValue({ data: chatsMock });
    render(<ListaChats usuario={usuario} onSelecionarChat={vi.fn()} />);

    expect(await screen.findByText(/reivindicou seu item/i)).toBeInTheDocument();
    expect(await screen.findByText(/anunciante/i)).toBeInTheDocument();
  });
});

describe('ListaChats - estado vazio', () => {
  it('exibe mensagem de "nenhuma conversa" quando a API retorna lista vazia', async () => {
    axios.get.mockResolvedValue({ data: [] });
    render(<ListaChats usuario={usuario} onSelecionarChat={vi.fn()} />);

    expect(await screen.findByText(/nenhuma conversa ativa/i)).toBeInTheDocument();
  });

  it('não quebra quando a requisição falha (mantém estado vazio)', async () => {
    axios.get.mockRejectedValue(new Error('falha de rede'));
    render(<ListaChats usuario={usuario} onSelecionarChat={vi.fn()} />);

    expect(await screen.findByText(/nenhuma conversa ativa/i)).toBeInTheDocument();
  });
});

describe('ListaChats - seleção', () => {
  it('chama onSelecionarChat com o chat clicado', async () => {
    axios.get.mockResolvedValue({ data: chatsMock });
    const onSelecionarChat = vi.fn();
    render(<ListaChats usuario={usuario} onSelecionarChat={onSelecionarChat} />);

    const item = await screen.findByText('Mochila Azul');
    await userEvent.click(item);

    expect(onSelecionarChat).toHaveBeenCalledTimes(1);
    expect(onSelecionarChat).toHaveBeenCalledWith(
      expect.objectContaining({
        item: expect.objectContaining({ id: 10, titulo: 'Mochila Azul' }),
        outro_usuario_id: 2,
        outro_usuario_nome: 'Bruno',
      })
    );
  });
});
