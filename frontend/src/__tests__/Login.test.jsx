/**
 * Login.test.jsx — Testes do componente de login
 *
 * Cobre: renderização do formulário, erro 401, sucesso com callback,
 *        e erro de conexão (sem resposta do servidor).
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';

import Login from '../Login';

vi.mock('axios');

const mockOnLoginSucesso = vi.fn();
const mockOnIrParaCadastro = vi.fn();

const renderLogin = () =>
  render(
    <Login
      onLoginSucesso={mockOnLoginSucesso}
      onIrParaCadastro={mockOnIrParaCadastro}
    />
  );

describe('Login — renderização', () => {
  it('exibe o campo de e-mail', () => {
    renderLogin();
    expect(screen.getByLabelText(/e-mail acadêmico/i)).toBeInTheDocument();
  });

  it('exibe o campo de senha', () => {
    renderLogin();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
  });

  it('exibe o botão "Entrar"', () => {
    renderLogin();
    expect(screen.getByRole('button', { name: /^entrar$/i })).toBeInTheDocument();
  });

  it('exibe o botão "Criar nova conta"', () => {
    renderLogin();
    expect(screen.getByRole('button', { name: /criar nova conta/i })).toBeInTheDocument();
  });

  it('não exibe mensagem de erro inicialmente', () => {
    renderLogin();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

describe('Login — sucesso', () => {
  beforeEach(() => vi.clearAllMocks());

  it('chama onLoginSucesso com os dados da resposta ao autenticar', async () => {
    const dadosUsuario = {
      id: 1,
      nome: 'João',
      email: 'joao@ufmg.br',
      is_admin: false,
      imagem_url: null,
      mensagem: 'Login realizado com sucesso!',
    };
    axios.post.mockResolvedValueOnce({ data: dadosUsuario });

    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText(/e-mail acadêmico/i), 'joao@ufmg.br');
    await user.type(screen.getByLabelText(/senha/i), 'senha123');
    await user.click(screen.getByRole('button', { name: /^entrar$/i }));

    await waitFor(() => {
      expect(mockOnLoginSucesso).toHaveBeenCalledWith(dadosUsuario);
    });
  });

  it('chama axios.post no endpoint correto com as credenciais', async () => {
    axios.post.mockResolvedValueOnce({ data: { id: 1 } });
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText(/e-mail acadêmico/i), 'ana@ufmg.br');
    await user.type(screen.getByLabelText(/senha/i), 'minhasenha');
    await user.click(screen.getByRole('button', { name: /^entrar$/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://127.0.0.1:8000/login',
        { email: 'ana@ufmg.br', senha: 'minhasenha' }
      );
    });
  });
});

describe('Login — erros', () => {
  beforeEach(() => vi.clearAllMocks());

  it('exibe a mensagem de erro 401 retornada pela API', async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { detail: 'E-mail ou senha incorretos.' } },
    });
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText(/e-mail acadêmico/i), 'x@ufmg.br');
    await user.type(screen.getByLabelText(/senha/i), 'errada');
    await user.click(screen.getByRole('button', { name: /^entrar$/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/e-mail ou senha incorretos/i)).toBeInTheDocument();
    });
  });

  it('não chama onLoginSucesso quando o login falha', async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { detail: 'E-mail ou senha incorretos.' } },
    });
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText(/e-mail acadêmico/i), 'x@ufmg.br');
    await user.type(screen.getByLabelText(/senha/i), 'errada');
    await user.click(screen.getByRole('button', { name: /^entrar$/i }));

    await waitFor(() => {
      expect(mockOnLoginSucesso).not.toHaveBeenCalled();
    });
  });

  it('exibe mensagem de erro de conexão quando o backend está fora', async () => {
    // Simula erro de rede: sem propriedade response
    axios.post.mockRejectedValueOnce(new Error('Network Error'));
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText(/e-mail acadêmico/i), 'x@ufmg.br');
    await user.type(screen.getByLabelText(/senha/i), 'qualquer');
    await user.click(screen.getByRole('button', { name: /^entrar$/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/erro de conexão/i)).toBeInTheDocument();
    });
  });
});

describe('Login — navegação', () => {
  it('chama onIrParaCadastro ao clicar em "Criar nova conta"', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole('button', { name: /criar nova conta/i }));
    expect(mockOnIrParaCadastro).toHaveBeenCalledOnce();
  });
});
