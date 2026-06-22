import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import Chat from '../Chat';

vi.mock('axios');

const usuario = { id: 1, nome: 'Ana' };
const item = { id: 10, titulo: 'Mochila Azul' };
const destinatarioId = 2;

const mensagensMock = [
  { id: 1, conteudo: 'Acho que é minha', remetente_id: 2, remetente_nome: 'Bruno', remetente_imagem_url: null, data_envio: '2026-06-22T10:00:00' },
  { id: 2, conteudo: 'Pode descrever?', remetente_id: 1, remetente_nome: 'Ana', remetente_imagem_url: null, data_envio: '2026-06-22T10:01:00' },
];

function renderChat(props = {}) {
  return render(
    <Chat item={item} usuario={usuario} destinatarioId={destinatarioId} onVerItem={vi.fn()} {...props} />
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  axios.get.mockResolvedValue({ data: mensagensMock });
  axios.post.mockResolvedValue({ data: {} });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('Chat - renderização de mensagens', () => {
  it('busca as mensagens da conversa ao montar (item, usuário e destinatário corretos)', async () => {
    renderChat();
    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    const url = axios.get.mock.calls[0][0];
    expect(url).toContain('/mensagens/10');
    expect(url).toContain('usuario_id=1');
    expect(url).toContain('outro_id=2');
  });

  it('exibe o conteúdo das mensagens recebidas da API', async () => {
    renderChat();
    expect(await screen.findByText('Acho que é minha')).toBeInTheDocument();
    expect(await screen.findByText('Pode descrever?')).toBeInTheDocument();
  });

  it('mostra o cabeçalho com o título do item', async () => {
    renderChat();
    expect(await screen.findByText('Mochila Azul')).toBeInTheDocument();
  });

  it('distingue minha mensagem ("Você") da mensagem do outro (nome do remetente)', async () => {
    renderChat();
    // A mensagem do remetente_id=1 (eu) deve ser rotulada "Você"
    expect(await screen.findByText('Você')).toBeInTheDocument();
    // A mensagem do remetente_id=2 (outro) deve mostrar o nome "Bruno"
    expect(await screen.findByText('Bruno')).toBeInTheDocument();
  });

  it('botão "Ver Item" dispara o callback onVerItem com o id do item', async () => {
    const onVerItem = vi.fn();
    renderChat({ onVerItem });
    const botao = await screen.findByRole('button', { name: /ver item/i });
    await userEvent.click(botao);
    expect(onVerItem).toHaveBeenCalledWith(10);
  });
});

describe('Chat - envio de mensagem', () => {
  it('envia mensagem via POST com conteudo, item_id e destinatario_id corretos', async () => {
    renderChat();
    const campo = await screen.findByPlaceholderText(/escreva uma mensagem/i);
    await userEvent.type(campo, 'Olá, tudo bem?');

    // Botão de envio é habilitado quando há texto
    const botaoEnviar = campo.closest('form').querySelector('button[type="submit"]');
    await userEvent.click(botaoEnviar);

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    const [url, corpo] = axios.post.mock.calls[0];
    expect(url).toContain('/mensagens');
    expect(url).toContain('remetente_id=1');
    expect(corpo).toEqual({
      conteudo: 'Olá, tudo bem?',
      item_id: 10,
      destinatario_id: 2,
    });
  });

  it('limpa o campo de texto após enviar a mensagem', async () => {
    renderChat();
    const campo = await screen.findByPlaceholderText(/escreva uma mensagem/i);
    await userEvent.type(campo, 'Mensagem teste');
    expect(campo).toHaveValue('Mensagem teste');

    const botaoEnviar = campo.closest('form').querySelector('button[type="submit"]');
    await userEvent.click(botaoEnviar);

    await waitFor(() => expect(campo).toHaveValue(''));
  });

  it('não envia mensagem vazia (POST não é chamado)', async () => {
    renderChat();
    await screen.findByPlaceholderText(/escreva uma mensagem/i);
    const form = screen.getByPlaceholderText(/escreva uma mensagem/i).closest('form');
    const botaoEnviar = form.querySelector('button[type="submit"]');
    // Botão desabilitado quando o campo está vazio
    expect(botaoEnviar).toBeDisabled();
    expect(axios.post).not.toHaveBeenCalled();
  });
});

describe('Chat - polling (atualização periódica)', () => {
  it('recarrega as mensagens a cada 3 segundos', async () => {
    vi.useFakeTimers();
    renderChat();

    // Primeira carga (no efeito de montagem)
    await vi.waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    // Avança 3s -> deve disparar nova busca
    await vi.advanceTimersByTimeAsync(3000);
    expect(axios.get).toHaveBeenCalledTimes(2);

    // Mais 3s -> mais uma busca
    await vi.advanceTimersByTimeAsync(3000);
    expect(axios.get).toHaveBeenCalledTimes(3);
  });
});
