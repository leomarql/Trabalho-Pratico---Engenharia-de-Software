import { test, expect } from '@playwright/test';
import { registrarELogar } from './utils';

// E2E #4 — Casca do app (domínio da Pessoa C): navegação logado, tema e logout.
test('navegar entre telas, alternar tema e sair', async ({ page }) => {
  await registrarELogar(page, { nome: 'Navegador E2E', senha: 'senha123', prefixo: 'nav' });

  // Alterna o tema (claro -> escuro)
  await page.getByRole('button', { name: /ativar noite/i }).click();
  // Agora o botão deve permitir voltar para o tema claro
  await expect(page.getByRole('button', { name: /ativar luz/i })).toBeVisible();

  // Navega para "Meus Anúncios" pelo cabeçalho
  await page.getByRole('button', { name: /meus anúncios/i }).first().click();
  await expect(page.getByRole('heading', { name: /meus anúncios publicados/i })).toBeVisible();

  // Abre o menu do avatar e vai para "Editar Perfil"
  await page.locator('.MuiAvatar-root').first().click();
  await page.getByRole('menuitem', { name: /editar perfil/i }).click();
  await expect(page.getByRole('button', { name: /salvar alterações/i })).toBeVisible();

  // Sai da conta -> volta para a Home (deslogado)
  await page.locator('.MuiAvatar-root').first().click();
  await page.getByRole('menuitem', { name: /sair/i }).click();
  await expect(page.getByText(/perdeu algo/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /entrar/i })).toBeVisible();
});
