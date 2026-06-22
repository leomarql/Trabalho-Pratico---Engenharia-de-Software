import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import App from '../App';

vi.mock('axios');

const STORAGE_USER = 'recoopere_usuario';
const usuario = { id: 1, nome: 'Ana', imagem_url: null };

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  // Qualquer componente filho que busque dados ao montar recebe respostas neutras.
  axios.get.mockResolvedValue({ data: [] });
  axios.post.mockResolvedValue({ data: {} });
});

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe('App - usuário deslogado', () => {
  it('renderiza a Home e o cabeçalho com "Entrar"/"Cadastrar" quando não há sessão', () => {
    render(<App />);
    expect(screen.getByText(/perdeu algo/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cadastrar/i })).toBeInTheDocument();
  });

  it('não mostra a área logada (mural/conversas) sem sessão', () => {
    render(<App />);
    expect(screen.queryByText(/mural de achados e perdidos/i)).not.toBeInTheDocument();
  });

  it('clicar em "Entrar" no cabeçalho leva à tela de login', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }));
    expect(await screen.findByText(/acesso ao recoopere/i)).toBeInTheDocument();
    // a landing some ao entrar no fluxo de auth
    expect(screen.queryByText(/perdeu algo/i)).not.toBeInTheDocument();
  });

  it('clicar em "Começar agora" na Home também abre o login', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /começar agora/i }));
    expect(await screen.findByText(/acesso ao recoopere/i)).toBeInTheDocument();
  });
});

describe('App - usuário logado (sessão persistida)', () => {
  beforeEach(() => {
    localStorage.setItem(STORAGE_USER, JSON.stringify(usuario));
  });

  it('restaura a sessão do localStorage e abre direto no Mural', async () => {
    render(<App />);
    expect(await screen.findByText(/mural de achados e perdidos/i)).toBeInTheDocument();
  });

  it('mostra o avatar do usuário e esconde "Entrar"/"Cadastrar"', async () => {
    render(<App />);
    await screen.findByText(/mural de achados e perdidos/i);
    expect(screen.getByText('A')).toBeInTheDocument(); // inicial de "Ana" no avatar
    expect(screen.queryByRole('button', { name: /cadastrar/i })).not.toBeInTheDocument();
  });

  it('abre o diálogo "Minhas Conversas" ao clicar no botão flutuante de chat', async () => {
    render(<App />);
    await screen.findByText(/mural de achados e perdidos/i);

    const fab = document.querySelector('.MuiFab-primary');
    expect(fab).toBeTruthy();
    await userEvent.click(fab);

    expect(await screen.findByText(/chat - minhas conversas/i)).toBeInTheDocument();
    // ListaChats dentro do diálogo consulta os chats do usuário logado
    await waitFor(() =>
      expect(
        axios.get.mock.calls.some((c) => String(c[0]).includes('/meus-chats/1'))
      ).toBe(true)
    );
  });
});

describe('App - logout', () => {
  it('ao sair, volta para a Home e limpa a sessão do localStorage', async () => {
    localStorage.setItem(STORAGE_USER, JSON.stringify(usuario));
    render(<App />);
    await screen.findByText(/mural de achados e perdidos/i);

    // abre o menu do avatar e clica em "Sair"
    await userEvent.click(screen.getByText('A').closest('button'));
    await userEvent.click(await screen.findByText('Sair'));

    expect(await screen.findByText(/perdeu algo/i)).toBeInTheDocument();
    expect(localStorage.getItem(STORAGE_USER)).toBeNull();
  });
});
