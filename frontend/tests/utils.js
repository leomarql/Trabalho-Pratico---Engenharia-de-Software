// utils.js — Funções auxiliares compartilhadas pelos testes E2E (Playwright)
import { expect } from '@playwright/test';

/**
 * Gera um e-mail @ufmg.br único por execução, evitando colisão de
 * "e-mail já cadastrado" entre rodadas dos testes (o backend persiste no SQLite).
 */
export function emailUnico(prefixo = 'e2e') {
  return `${prefixo}.${Date.now()}.${Math.floor(Math.random() * 1000)}@ufmg.br`;
}

/**
 * Faz o cadastro de um novo usuário a partir da Home.
 * Fluxo real: Home -> "Começar agora" -> "Criar nova conta" -> formulário.
 */
export async function registrar(page, { nome, email, senha }) {
  await page.goto('/');
  await page.getByRole('button', { name: /começar agora/i }).click();
  await page.getByRole('button', { name: /criar nova conta/i }).click();

  await page.getByLabel(/nome completo/i).fill(nome);
  await page.getByLabel(/e-mail acadêmico/i).fill(email);
  await page.getByLabel(/senha/i).fill(senha);
  await page.getByRole('button', { name: /finalizar cadastro/i }).click();

  // O componente de Cadastro exibe um Alert de sucesso
  await expect(page.getByText(/conta criada/i)).toBeVisible();
}

/**
 * Faz login assumindo que já se está na tela de Login (ou navega até ela).
 */
export async function logar(page, { email, senha }) {
  // Se não estivermos na tela de login, navega até ela
  if (!(await page.getByText(/acesso ao recoopere/i).isVisible().catch(() => false))) {
    await page.goto('/');
    await page.getByRole('button', { name: /começar agora/i }).click();
  }
  await page.getByLabel(/e-mail acadêmico/i).fill(email);
  await page.getByLabel(/senha/i).fill(senha);
  await page.getByRole('main').getByRole('button', { name: /^entrar$/i }).click();

  // Após login, a view vira "mural"
  await expect(page.getByRole('heading', { name: /mural de achados e perdidos/i })).toBeVisible();
}

/**
 * Cadastra e já loga, retornando o e-mail usado.
 */
export async function registrarELogar(page, { nome, senha, prefixo = 'e2e' }) {
  const email = emailUnico(prefixo);
  await registrar(page, { nome, email, senha });
  // Volta para a tela de login
  await page.getByRole('button', { name: /já tenho conta/i }).click();
  await logar(page, { email, senha });
  return email;
}

/**
 * Cria um anúncio de item a partir do Mural (Fab secundário "+").
 */
export async function criarItem(page, { titulo, descricao, local }) {
  // O Mural tem o Fab secundário (Add); o App tem o Fab primário (Chat)
  await page.locator('.MuiFab-secondary').click();
  await expect(page.getByText(/novo anúncio/i)).toBeVisible();

  await page.getByLabel(/o que você encontrou/i).fill(titulo);
  await page.getByLabel(/descrição detalhada/i).fill(descricao);
  await page.getByLabel(/onde você encontrou/i).fill(local);
  await page.getByRole('button', { name: /publicar anúncio/i }).click();

  // O card do item aparece no mural
  await expect(page.getByText(titulo).first()).toBeVisible();
}
