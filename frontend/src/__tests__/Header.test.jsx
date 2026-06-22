import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Header from '../Header';

afterEach(() => {
  cleanup();
});

function montar(props = {}) {
  const handlers = {
    onLogout: vi.fn(),
    onIrParaMural: vi.fn(),
    onIrParaPerfil: vi.fn(),
    onIrParaHome: vi.fn(),
    onIrParaLogin: vi.fn(),
    onIrParaCadastro: vi.fn(),
    onIrParaMeusAnuncios: vi.fn(),
    onIrParaArquivados: vi.fn(),
    toggleDarkMode: vi.fn(),
  };
  render(<Header usuario={null} darkMode={false} {...handlers} {...props} />);
  return handlers;
}

describe('Header - usuário deslogado', () => {
  it('mostra os botões "Entrar" e "Cadastrar"', () => {
    montar({ usuario: null });
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cadastrar/i })).toBeInTheDocument();
  });

  it('não mostra o avatar/menu do usuário', () => {
    montar({ usuario: null });
    expect(screen.queryByRole('button', { name: /meus anúncios/i })).not.toBeInTheDocument();
  });

  it('clicar em "Entrar" chama onIrParaLogin', async () => {
    const h = montar({ usuario: null });
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }));
    expect(h.onIrParaLogin).toHaveBeenCalledTimes(1);
  });

  it('clicar em "Cadastrar" chama onIrParaCadastro', async () => {
    const h = montar({ usuario: null });
    await userEvent.click(screen.getByRole('button', { name: /cadastrar/i }));
    expect(h.onIrParaCadastro).toHaveBeenCalledTimes(1);
  });

  it('clicar no logo "Recoopere" chama onIrParaHome', async () => {
    const h = montar({ usuario: null });
    await userEvent.click(screen.getByText('Recoopere'));
    expect(h.onIrParaHome).toHaveBeenCalledTimes(1);
  });
});

describe('Header - usuário logado', () => {
  const usuario = { id: 1, nome: 'Ana', imagem_url: null };

  it('mostra a inicial do nome no avatar e não mostra "Entrar"', () => {
    montar({ usuario });
    expect(screen.getByText('A')).toBeInTheDocument(); // inicial de "Ana"
    expect(screen.queryByRole('button', { name: /entrar/i })).not.toBeInTheDocument();
  });

  it('abre o menu ao clicar no avatar e mostra as opções', async () => {
    montar({ usuario });
    // o avatar fica dentro de um IconButton; clicamos no que contém a inicial
    const avatarBtn = screen.getByText('A').closest('button');
    await userEvent.click(avatarBtn);

    expect(await screen.findByText('Editar Perfil')).toBeInTheDocument();
    expect(screen.getByText(/itens devolvidos/i)).toBeInTheDocument();
    expect(screen.getByText('Sair')).toBeInTheDocument();
  });

  it('clicar em "Editar Perfil" no menu chama onIrParaPerfil', async () => {
    const h = montar({ usuario });
    await userEvent.click(screen.getByText('A').closest('button'));
    await userEvent.click(await screen.findByText('Editar Perfil'));
    expect(h.onIrParaPerfil).toHaveBeenCalledTimes(1);
  });

  it('clicar em "Sair" no menu chama onLogout', async () => {
    const h = montar({ usuario });
    await userEvent.click(screen.getByText('A').closest('button'));
    await userEvent.click(await screen.findByText('Sair'));
    expect(h.onLogout).toHaveBeenCalledTimes(1);
  });
});

describe('Header - tema', () => {
  it('clicar no botão de tema chama toggleDarkMode', async () => {
    const h = montar({ usuario: null, darkMode: false });
    // No modo claro, o ícone é "Brightness4" (ativar noite); seu tooltip é "Ativar Noite"
    const botaoTema = screen.getByRole('button', { name: /ativar noite/i });
    await userEvent.click(botaoTema);
    expect(h.toggleDarkMode).toHaveBeenCalledTimes(1);
  });
});
