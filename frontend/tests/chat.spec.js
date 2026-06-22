import { test, expect } from '@playwright/test';
import { registrar, logar, criarItem, emailUnico } from './utils';

// E2E #3 — Fluxo de mensagens (domínio da Pessoa C):
// Um usuário (dono) publica um item; outro (reclamante) reivindica e abre o chat,
// enviando uma mensagem. Valida reivindicação + chat ponta a ponta.
test('reivindicar um item e conversar pelo chat', async ({ page }) => {
  const senha = 'senha123';
  const tituloItem = `Guarda-chuva ${Date.now()}`;

  // Aceita automaticamente os window.confirm() (reivindicar usa confirm nativo)
  page.on('dialog', (dialog) => dialog.accept());

  // ---- Usuário A (DONO): cadastra, loga e publica um item ----
  const emailDono = emailUnico('dono');
  await registrar(page, { nome: 'Dona do Item', email: emailDono, senha });
  await page.getByRole('button', { name: /já tenho conta/i }).click();
  await logar(page, { email: emailDono, senha });

  await criarItem(page, {
    titulo: tituloItem,
    descricao: 'Guarda-chuva preto esquecido no auditório.',
    local: 'Auditório',
  });

  // Sai da conta do dono
  await page.locator('.MuiAvatar-root').first().click();
  await page.getByRole('menuitem', { name: /sair/i }).click();
  await expect(page.getByText(/perdeu algo/i)).toBeVisible();

  // ---- Usuário B (RECLAMANTE): cadastra, loga, reivindica e conversa ----
  const emailReclamante = emailUnico('reclamante');
  await registrar(page, { nome: 'Reclamante E2E', email: emailReclamante, senha });
  await page.getByRole('button', { name: /já tenho conta/i }).click();
  await logar(page, { email: emailReclamante, senha });

  // Abre os detalhes do item publicado pelo dono
  await page.getByText(tituloItem).first().click();
  await expect(page.getByRole('button', { name: /este item é meu/i })).toBeVisible();

  // Reivindica o item
  await page.getByRole('button', { name: /este item é meu/i }).click();
  await expect(page.getByRole('button', { name: /item reivindicado/i })).toBeVisible();

  // Abre a lista de conversas (Fab primário de chat) e seleciona a conversa
  await page.locator('.MuiFab-primary').click();
  await expect(page.getByText(/chat - minhas conversas/i)).toBeVisible();
  
  // FECHAR QUALQUER DIALOGO QUE POSSA ESTAR ABERTO ANTES DE CLICAR
  const closeButton = page.getByRole('button', { name: /fechar/i });
  if (await closeButton.isVisible()) {
    await closeButton.click();
    // Aguarda o dialog fechar completamente e dá um tempo extra para a animação
    await expect(closeButton).not.toBeVisible();
    await page.waitForTimeout(500); 
  }

  // Clica no item na lista chat, sendo mais específico: procura o texto dentro de um item de lista
  await page.locator('li').filter({ hasText: tituloItem }).click({ timeout: 10000 });

  // Envia uma mensagem no chat
  const campo = page.getByPlaceholder(/escreva uma mensagem/i);
  await expect(campo).toBeVisible();
  await campo.fill('Olá! Acho que esse guarda-chuva é meu.');
  await page.locator('button[type="submit"]').last().click();

  // A mensagem enviada aparece na conversa
  await expect(page.getByText(/acho que esse guarda-chuva é meu/i)).toBeVisible();
});
