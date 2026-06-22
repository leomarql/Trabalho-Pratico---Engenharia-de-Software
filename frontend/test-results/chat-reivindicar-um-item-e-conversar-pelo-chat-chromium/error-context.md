# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: chat.spec.js >> reivindicar um item e conversar pelo chat
- Location: tests\chat.spec.js:7:1

# Error details

```
Error: locator.click: Error: strict mode violation: getByRole('button', { name: /^entrar$/i }) resolved to 2 elements:
    1) <button tabindex="0" type="button" class="MuiButtonBase-root MuiButton-root MuiButton-text MuiButton-sizeMedium MuiButton-colorInherit MuiButton-root MuiButton-text MuiButton-sizeMedium MuiButton-colorInherit css-mhj1bh-MuiButtonBase-root-MuiButton-root">Entrar</button> aka getByRole('banner').getByRole('button', { name: 'Entrar' })
    2) <button tabindex="0" type="submit" class="MuiButtonBase-root MuiButton-root MuiButton-contained MuiButton-sizeMedium MuiButton-colorPrimary MuiButton-fullWidth MuiButton-root MuiButton-contained MuiButton-sizeMedium MuiButton-colorPrimary MuiButton-fullWidth css-eexygx-MuiButtonBase-root-MuiButton-root">Entrar</button> aka getByRole('main').getByRole('button', { name: 'Entrar' })

Call log:
  - waiting for getByRole('button', { name: /^entrar$/i })

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - generic [ref=e5]:
      - generic [ref=e6] [cursor=pointer]:
        - img "Logo Recoopere" [ref=e7]
        - generic [ref=e8]: Recoopere
      - generic [ref=e9]:
        - button "Ativar Noite" [ref=e10] [cursor=pointer]:
          - img [ref=e11]
        - button "Entrar" [ref=e13] [cursor=pointer]
        - button "Cadastrar" [ref=e14] [cursor=pointer]
  - main [ref=e15]:
    - generic [ref=e16]:
      - generic [ref=e17]:
        - img [ref=e19]
        - heading "Acesso ao Recoopere" [level=1] [ref=e21]
        - generic [ref=e22]:
          - generic [ref=e23]:
            - generic [ref=e24]:
              - text: E-mail Acadêmico (@ufmg.br)
              - generic [ref=e25]: "*"
            - generic [ref=e26]:
              - textbox "E-mail Acadêmico (@ufmg.br)" [ref=e27]: dono.1782145861302.14@ufmg.br
              - group:
                - generic: E-mail Acadêmico (@ufmg.br) *
          - generic [ref=e28]:
            - generic [ref=e29]:
              - text: Senha
              - generic [ref=e30]: "*"
            - generic [ref=e31]:
              - textbox "Senha" [active] [ref=e32]: senha123
              - group:
                - generic: Senha *
          - button "Entrar" [ref=e33] [cursor=pointer]
          - button "Criar nova conta" [ref=e34] [cursor=pointer]
      - paragraph [ref=e35]: Recoopere © 2026
```

# Test source

```ts
  1  | // utils.js — Funções auxiliares compartilhadas pelos testes E2E (Playwright)
  2  | import { expect } from '@playwright/test';
  3  | 
  4  | /**
  5  |  * Gera um e-mail @ufmg.br único por execução, evitando colisão de
  6  |  * "e-mail já cadastrado" entre rodadas dos testes (o backend persiste no SQLite).
  7  |  */
  8  | export function emailUnico(prefixo = 'e2e') {
  9  |   return `${prefixo}.${Date.now()}.${Math.floor(Math.random() * 1000)}@ufmg.br`;
  10 | }
  11 | 
  12 | /**
  13 |  * Faz o cadastro de um novo usuário a partir da Home.
  14 |  * Fluxo real: Home -> "Começar agora" -> "Criar nova conta" -> formulário.
  15 |  */
  16 | export async function registrar(page, { nome, email, senha }) {
  17 |   await page.goto('/');
  18 |   await page.getByRole('button', { name: /começar agora/i }).click();
  19 |   await page.getByRole('button', { name: /criar nova conta/i }).click();
  20 | 
  21 |   await page.getByLabel(/nome completo/i).fill(nome);
  22 |   await page.getByLabel(/e-mail acadêmico/i).fill(email);
  23 |   await page.getByLabel(/senha/i).fill(senha);
  24 |   await page.getByRole('button', { name: /finalizar cadastro/i }).click();
  25 | 
  26 |   // O componente de Cadastro exibe um Alert de sucesso
  27 |   await expect(page.getByText(/conta criada/i)).toBeVisible();
  28 | }
  29 | 
  30 | /**
  31 |  * Faz login assumindo que já se está na tela de Login (ou navega até ela).
  32 |  */
  33 | export async function logar(page, { email, senha }) {
  34 |   // Se não estivermos na tela de login, navega até ela
  35 |   if (!(await page.getByText(/acesso ao recoopere/i).isVisible().catch(() => false))) {
  36 |     await page.goto('/');
  37 |     await page.getByRole('button', { name: /começar agora/i }).click();
  38 |   }
  39 |   await page.getByLabel(/e-mail acadêmico/i).fill(email);
  40 |   await page.getByLabel(/senha/i).fill(senha);
> 41 |   await page.getByRole('button', { name: /^entrar$/i }).click();
     |                                                         ^ Error: locator.click: Error: strict mode violation: getByRole('button', { name: /^entrar$/i }) resolved to 2 elements:
  42 | 
  43 |   // Após login, a view vira "mural"
  44 |   await expect(page.getByRole('heading', { name: /mural de achados e perdidos/i })).toBeVisible();
  45 | }
  46 | 
  47 | /**
  48 |  * Cadastra e já loga, retornando o e-mail usado.
  49 |  */
  50 | export async function registrarELogar(page, { nome, senha, prefixo = 'e2e' }) {
  51 |   const email = emailUnico(prefixo);
  52 |   await registrar(page, { nome, email, senha });
  53 |   // Volta para a tela de login
  54 |   await page.getByRole('button', { name: /já tenho conta/i }).click();
  55 |   await logar(page, { email, senha });
  56 |   return email;
  57 | }
  58 | 
  59 | /**
  60 |  * Cria um anúncio de item a partir do Mural (Fab secundário "+").
  61 |  */
  62 | export async function criarItem(page, { titulo, descricao, local }) {
  63 |   // O Mural tem o Fab secundário (Add); o App tem o Fab primário (Chat)
  64 |   await page.locator('.MuiFab-secondary').click();
  65 |   await expect(page.getByText(/novo anúncio/i)).toBeVisible();
  66 | 
  67 |   await page.getByLabel(/o que você encontrou/i).fill(titulo);
  68 |   await page.getByLabel(/descrição detalhada/i).fill(descricao);
  69 |   await page.getByLabel(/onde você encontrou/i).fill(local);
  70 |   await page.getByRole('button', { name: /publicar anúncio/i }).click();
  71 | 
  72 |   // O card do item aparece no mural
  73 |   await expect(page.getByText(titulo).first()).toBeVisible();
  74 | }
  75 | 
```