# Test Suite Documentation

This document provides an overview of the automated tests for the Recoopere project.

## Frontend Tests (`frontend/src/__tests__/`)

The frontend tests are built using `Vitest` and `@testing-library/react`.

### `Login.test.jsx`
- **Login — renderização**: Verifies that input fields (email, password), buttons (Entrar, Criar nova conta), and the initial state (no errors) are correctly rendered.
- **Login — sucesso**: Tests that successful API calls trigger the `onLoginSucesso` callback and that `axios.post` is called with the expected credentials.
- **Login — erros**: Tests handling of 401 errors, failures to call the success callback on error, and connection error handling.
- **Login — navegação**: Tests that clicking the "Criar nova conta" button triggers the `onIrParaCadastro` callback.

### `Perfil.test.jsx`
- **Perfil — renderização dos dados do usuário**: Verifies that the user's name is displayed, fields are pre-filled, the password field is empty, the "Salvar Alterações" button exists, and no alerts appear initially.
- **Perfil — fluxo de atualização de dados**: Tests the full update flow: submitting updated data, receiving success alerts, triggering the `onUpdateUsuario` callback, and correctly clearing the password field upon success.
- **Perfil — tratamento de erros**: Tests that API error messages (like email already registered) are correctly displayed, handles generic errors, and ensures `onUpdateUsuario` is not called on error.

### `Cadastro.test.jsx`
- **Cadastro — renderização**: Verifies rendering of input fields (Name, Email, Password), buttons (Finalizar, Voltar), and the initial state.
- **Cadastro — submit chama a API**: Tests successful API submission, confirmation of success messages, and clearing of fields after success.
- **Cadastro — tratamento de erros**: Tests handling of duplicate email errors, connection issues, and Pydantic validation errors (array-based).

---

## Backend Tests (`backend/tests/`)

The backend tests are built using `pytest` with `TestClient` for integration testing.

### `test_health.py`
- Tests basic health check endpoints to ensure the API is running and user creation is functional.

### `test_schemas.py`
- **TestUsuarioCreate**: Validates Pydantic schema rules for user creation, ensuring emails end with `@ufmg.br`, rejecting invalid formats (Gmail, Hotmail, empty), and ensuring required fields are present.
- **TestUsuarioUpdate**: Validates schema rules for user updates, ensuring partial updates work and email validation is enforced if an email is provided.

### `test_security.py`
- **TestGetPasswordHash**: Validates bcrypt password hashing behavior (output type, uniqueness, prefix).
- **TestVerifyPassword**: Validates password verification against correct/incorrect passwords and special characters.

### `test_usuarios.py`
- **TestCriarUsuario**: Integration tests for `POST /usuarios`, covering successful registration, default admin status, duplicate emails, invalid email domains, missing fields, and initial profile picture state.
- **TestLogin**: Integration tests for `POST /login`, covering success scenarios, incorrect passwords, non-existent users, and ensuring sensitive data (password) is not exposed.
- **TestAtualizarUsuario**: Integration tests for `PUT /usuarios/{id}`, covering successful updates, conflict handling (duplicate email), and 404 scenarios.
- **TestAtualizarFotoPerfil**: Integration tests for `PATCH /usuarios/{id}/foto`, covering non-existent users and successful image upload with `imagem_url` persistence.
