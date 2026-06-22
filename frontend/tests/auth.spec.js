import { test, expect } from '@playwright/test';

test('fluxo de cadastro e login', async ({ page }) => {
  // Ir para a home
  await page.goto('/');

  // Clicar em "Começar agora" -> vai para login
  await page.click('button:has-text("Começar agora")');

  // Clicar em "Criar nova conta" -> vai para cadastro
  await page.click('button:has-text("Criar nova conta")');

  // Preencher formulário de cadastro
  await page.fill('label:has-text("Nome Completo")', 'Teste E2E');
  await page.fill('label:has-text("E-mail Acadêmico")', 'teste.e2e@ufmg.br');
  await page.fill('label:has-text("Senha")', 'senha123');
  await page.click('button:has-text("Finalizar Cadastro")');

  // Validar sucesso (o componente de Cadastro exibe um alert)
  await expect(page.locator('role=alert')).toBeVisible();

  // Agora, após cadastro, o componente de Cadastro volta para Login (onVoltarLogin)
  // Ou o usuário precisa logar.

  // Preencher Login
  await page.fill('label:has-text("E-mail Acadêmico")', 'teste.e2e@ufmg.br');
  await page.fill('label:has-text("Senha")', 'senha123');
  await page.click('button:has-text("Entrar")');

  // Validar sucesso do login (esperar redirecionamento ou elemento na tela mural)
  // A tela Home tem "Perdeu algo?" e a tela mural deve ter algo diferente.
  // Pelo App.jsx, se logado, a view vira 'mural'.
});
