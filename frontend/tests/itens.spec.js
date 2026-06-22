import { test, expect } from '@playwright/test';
import { registrarELogar, criarItem } from './utils';

// E2E #2 — Ciclo de vida do anúncio: usuário loga, publica um item e o vê no mural.
test('publicar um anúncio e vê-lo no mural', async ({ page }) => {
  await registrarELogar(page, { nome: 'Dono E2E', senha: 'senha123', prefixo: 'dono' });

  const titulo = `Mochila Azul ${Date.now()}`;
  await criarItem(page, {
    titulo,
    descricao: 'Mochila azul encontrada na biblioteca central.',
    local: 'Biblioteca Central',
  });

  // O item recém-criado deve estar visível no mural
  await expect(page.getByText(titulo).first()).toBeVisible();

  // E deve abrir a tela de detalhes ao clicar em "Ver detalhes"
  await page.getByText(titulo).first().click();
  await expect(page.getByRole('button', { name: /voltar ao mural/i })).toBeVisible();
});
