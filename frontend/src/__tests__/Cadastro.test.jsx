/**
 * Cadastro.test.jsx — Testes do componente de cadastro de usuário
 *
 * Axios é mockado para evitar chamadas HTTP reais ao backend.
 * MUI é renderizado normalmente via jsdom.
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';

import Cadastro from '../Cadastro';

// Mock completo do módulo axios
vi.mock('axios');

// Prop obrigatória do componente
const mockOnVoltarLogin = vi.fn();

const renderCadastro = () =>
  render(<Cadastro onVoltarLogin={mockOnVoltarLogin} />);

describe('Cadastro — renderização', () => {
  it('exibe o campo "Nome Completo"', () => {
    renderCadastro();
    expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
  });

  it('exibe o campo "E-mail Acadêmico"', () => {
    renderCadastro();
    expect(screen.getByLabelText(/e-mail acadêmico/i)).toBeInTheDocument();
  });

  it('exibe o campo "Senha"', () => {
    renderCadastro();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
  });

  it('exibe o botão "Finalizar Cadastro"', () => {
    renderCadastro();
    expect(screen.getByRole('button', { name: /finalizar cadastro/i })).toBeInTheDocument();
  });

  it('exibe o botão de voltar para login', () => {
    renderCadastro();
    expect(screen.getByRole('button', { name: /já tenho conta/i })).toBeInTheDocument();
  });

  it('não exibe mensagem de erro inicialmente', () => {
    renderCadastro();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

describe('Cadastro — submit chama a API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('chama axios.post com os dados corretos ao submeter', async () => {
    axios.post.mockResolvedValueOnce({ data: {} });
    const user = userEvent.setup();
    renderCadastro();

    await user.type(screen.getByLabelText(/nome completo/i), 'Maria Silva');
    await user.type(screen.getByLabelText(/e-mail acadêmico/i), 'maria@ufmg.br');
    await user.type(screen.getByLabelText(/senha/i), 'senha123');
    await user.click(screen.getByRole('button', { name: /finalizar cadastro/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://127.0.0.1:8000/usuarios',
        {
          nome: 'Maria Silva',
          email: 'maria@ufmg.br',
          senha: 'senha123',
        }
      );
    });
  });

  it('exibe mensagem de sucesso após cadastro bem-sucedido', async () => {
    axios.post.mockResolvedValueOnce({ data: {} });
    const user = userEvent.setup();
    renderCadastro();

    await user.type(screen.getByLabelText(/nome completo/i), 'João');
    await user.type(screen.getByLabelText(/e-mail acadêmico/i), 'joao@ufmg.br');
    await user.type(screen.getByLabelText(/senha/i), 'abc123');
    await user.click(screen.getByRole('button', { name: /finalizar cadastro/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/conta criada/i)).toBeInTheDocument();
    });
  });

  it('limpa os campos após cadastro bem-sucedido', async () => {
    axios.post.mockResolvedValueOnce({ data: {} });
    const user = userEvent.setup();
    renderCadastro();

    const campoNome = screen.getByLabelText(/nome completo/i);
    const campoEmail = screen.getByLabelText(/e-mail acadêmico/i);
    const campoSenha = screen.getByLabelText(/senha/i);

    await user.type(campoNome, 'Ana');
    await user.type(campoEmail, 'ana@ufmg.br');
    await user.type(campoSenha, 'pw');
    await user.click(screen.getByRole('button', { name: /finalizar cadastro/i }));

    await waitFor(() => {
      expect(campoNome).toHaveValue('');
      expect(campoEmail).toHaveValue('');
      expect(campoSenha).toHaveValue('');
    });
  });
});

describe('Cadastro — tratamento de erros', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exibe mensagem de erro quando a API retorna email duplicado', async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { detail: 'E-mail já cadastrado.' } },
    });
    const user = userEvent.setup();
    renderCadastro();

    await user.type(screen.getByLabelText(/nome completo/i), 'Teste');
    await user.type(screen.getByLabelText(/e-mail acadêmico/i), 'teste@ufmg.br');
    await user.type(screen.getByLabelText(/senha/i), '123');
    await user.click(screen.getByRole('button', { name: /finalizar cadastro/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/e-mail já cadastrado/i)).toBeInTheDocument();
    });
  });

  it('exibe mensagem de erro de conexão quando não há resposta', async () => {
    axios.post.mockRejectedValueOnce({ response: null });
    const user = userEvent.setup();
    renderCadastro();

    await user.type(screen.getByLabelText(/nome completo/i), 'Teste');
    await user.type(screen.getByLabelText(/e-mail acadêmico/i), 'teste@ufmg.br');
    await user.type(screen.getByLabelText(/senha/i), '123');
    await user.click(screen.getByRole('button', { name: /finalizar cadastro/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/erro de conexão/i)).toBeInTheDocument();
    });
  });

  it('exibe erros de validação retornados como array pelo Pydantic', async () => {
    axios.post.mockRejectedValueOnce({
      response: {
        data: {
          detail: [{ msg: 'O e-mail deve obrigatoriamente terminar com @ufmg.br' }],
        },
      },
    });
    const user = userEvent.setup();
    renderCadastro();

    await user.type(screen.getByLabelText(/nome completo/i), 'X');
    await user.type(screen.getByLabelText(/e-mail acadêmico/i), 'x@gmail.com');
    await user.type(screen.getByLabelText(/senha/i), '123');
    await user.click(screen.getByRole('button', { name: /finalizar cadastro/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      // Use queryByText to find only the alert message, ignoring the instructional text
      const alertMessage = screen.getByText(/O e-mail deve obrigatoriamente terminar com @ufmg.br/i);
      expect(alertMessage).toBeInTheDocument();
    });
  });

  it('chama onVoltarLogin ao clicar em "Já tenho conta"', async () => {
    const user = userEvent.setup();
    renderCadastro();

    await user.click(screen.getByRole('button', { name: /já tenho conta/i }));
    expect(mockOnVoltarLogin).toHaveBeenCalledOnce();
  });
});
