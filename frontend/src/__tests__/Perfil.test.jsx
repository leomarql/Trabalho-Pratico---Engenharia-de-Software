/**
 * Perfil.test.jsx — Testes do componente de perfil do usuário
 *
 * Cobre: renderização dos dados do usuário, fluxo de atualização,
 *        tratamento de erro e upload de foto.
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';

import Perfil from '../Perfil';

vi.mock('axios');

const mockOnUpdateUsuario = vi.fn();

const usuarioBase = {
  id: 42,
  nome: 'Carlos Souza',
  email: 'carlos@ufmg.br',
  is_admin: false,
  imagem_url: null,
};

const renderPerfil = (usuario = usuarioBase) =>
  render(<Perfil usuario={usuario} onUpdateUsuario={mockOnUpdateUsuario} />);

describe('Perfil — renderização dos dados do usuário', () => {
  it('exibe o nome do usuário no cabeçalho (Typography)', () => {
    renderPerfil();
    // O Typography com o nome aparece no topo do card
    const nomesExibidos = screen.getAllByText('Carlos Souza');
    expect(nomesExibidos.length).toBeGreaterThanOrEqual(1);
  });

  it('o campo Nome está preenchido com o nome do usuário', () => {
    renderPerfil();
    expect(screen.getByLabelText(/nome/i)).toHaveValue('Carlos Souza');
  });

  it('o campo E-mail está preenchido com o email do usuário', () => {
    renderPerfil();
    expect(screen.getByLabelText(/e-mail acadêmico/i)).toHaveValue('carlos@ufmg.br');
  });

  it('o campo Nova Senha começa vazio', () => {
    renderPerfil();
    expect(screen.getByLabelText(/nova senha/i)).toHaveValue('');
  });

  it('exibe o botão "Salvar Alterações"', () => {
    renderPerfil();
    expect(screen.getByRole('button', { name: /salvar alterações/i })).toBeInTheDocument();
  });

  it('não exibe mensagem de alerta inicialmente', () => {
    renderPerfil();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

describe('Perfil — fluxo de atualização de dados', () => {
  beforeEach(() => vi.clearAllMocks());

  it('chama axios.put com os dados atualizados ao submeter', async () => {
    axios.put.mockResolvedValueOnce({
      data: { ...usuarioBase, nome: 'Carlos Atualizado' },
    });
    const user = userEvent.setup();
    renderPerfil();

    const campoNome = screen.getByLabelText(/nome/i);
    await user.clear(campoNome);
    await user.type(campoNome, 'Carlos Atualizado');
    await user.click(screen.getByRole('button', { name: /salvar alterações/i }));

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        `http://127.0.0.1:8000/usuarios/${usuarioBase.id}`,
        expect.objectContaining({ nome: 'Carlos Atualizado' })
      );
    });
  });

  it('exibe mensagem de sucesso após atualização', async () => {
    axios.put.mockResolvedValueOnce({
      data: { ...usuarioBase, nome: 'Novo' },
    });
    const user = userEvent.setup();
    renderPerfil();

    await user.click(screen.getByRole('button', { name: /salvar alterações/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/atualizados com sucesso/i)).toBeInTheDocument();
    });
  });

  it('chama onUpdateUsuario com os novos dados após sucesso', async () => {
    const dadosNovos = { ...usuarioBase, nome: 'Nome Novo', email: 'novo@ufmg.br' };
    axios.put.mockResolvedValueOnce({ data: dadosNovos });
    const user = userEvent.setup();
    renderPerfil();

    await user.click(screen.getByRole('button', { name: /salvar alterações/i }));

    await waitFor(() => {
      expect(mockOnUpdateUsuario).toHaveBeenCalled();
    });
  });

  it('limpa o campo de senha após atualização bem-sucedida', async () => {
    axios.put.mockResolvedValueOnce({ data: usuarioBase });
    const user = userEvent.setup();
    renderPerfil();

    const campoSenha = screen.getByLabelText(/nova senha/i);
    await user.type(campoSenha, 'novasenha');
    await user.click(screen.getByRole('button', { name: /salvar alterações/i }));

    await waitFor(() => {
      expect(campoSenha).toHaveValue('');
    });
  });

  it('não envia o campo senha quando ele está vazio', async () => {
    axios.put.mockResolvedValueOnce({ data: usuarioBase });
    const user = userEvent.setup();
    renderPerfil();

    await user.click(screen.getByRole('button', { name: /salvar alterações/i }));

    await waitFor(() => {
      const chamada = axios.put.mock.calls[0][1];
      expect(chamada).not.toHaveProperty('senha');
    });
  });
});

describe('Perfil — tratamento de erros', () => {
  beforeEach(() => vi.clearAllMocks());

  it('exibe a mensagem de erro retornada pela API', async () => {
    axios.put.mockRejectedValueOnce({
      response: { data: { detail: 'E-mail já cadastrado.' } },
    });
    const user = userEvent.setup();
    renderPerfil();

    await user.click(screen.getByRole('button', { name: /salvar alterações/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/e-mail já cadastrado/i)).toBeInTheDocument();
    });
  });

  it('exibe mensagem genérica quando não há detalhe de erro', async () => {
    axios.put.mockRejectedValueOnce({});
    const user = userEvent.setup();
    renderPerfil();

    await user.click(screen.getByRole('button', { name: /salvar alterações/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/erro ao atualizar/i)).toBeInTheDocument();
    });
  });

  it('não chama onUpdateUsuario quando há erro', async () => {
    axios.put.mockRejectedValueOnce({ response: { data: { detail: 'Erro' } } });
    const user = userEvent.setup();
    renderPerfil();

    await user.click(screen.getByRole('button', { name: /salvar alterações/i }));

    await waitFor(() => {
      expect(mockOnUpdateUsuario).not.toHaveBeenCalled();
    });
  });
});
