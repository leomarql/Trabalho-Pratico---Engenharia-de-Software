import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from '../Home';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('Home - conteúdo principal', () => {
  it('renderiza a chamada principal da landing page', () => {
    render(<Home onComeçar={vi.fn()} />);
    expect(screen.getByText(/perdeu algo/i)).toBeInTheDocument();
    expect(screen.getByText(/recooperar/i)).toBeInTheDocument();
  });

  it('mostra o botão "Começar agora"', () => {
    render(<Home onComeçar={vi.fn()} />);
    expect(screen.getByRole('button', { name: /começar agora/i })).toBeInTheDocument();
  });

  it('clicar em "Começar agora" chama o callback onComeçar', async () => {
    const onComeçar = vi.fn();
    render(<Home onComeçar={onComeçar} />);
    await userEvent.click(screen.getByRole('button', { name: /começar agora/i }));
    expect(onComeçar).toHaveBeenCalledTimes(1);
  });
});

describe('Home - carrossel de destaques', () => {
  it('exibe o primeiro slide ao carregar', () => {
    render(<Home onComeçar={vi.fn()} />);
    expect(screen.getByText('Busca Inteligente')).toBeInTheDocument();
  });

  it('avança para o próximo slide após 5 segundos', () => {
    vi.useFakeTimers();
    render(<Home onComeçar={vi.fn()} />);
    expect(screen.getByText('Busca Inteligente')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.getByText('Anúncio com Foto')).toBeInTheDocument();
  });
});
