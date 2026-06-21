// setupTests.js — Carregado automaticamente antes de cada arquivo de teste
// Adiciona os matchers customizados do jest-dom (ex: toBeInTheDocument, toHaveValue)
import React from 'react';
import '@testing-library/jest-dom';

// @vitejs/plugin-react às vezes não aplica o runtime automático em contextos de teste.
// Isso garante que React esteja no escopo global para qualquer JSX compilado
// com o runtime clássico (React.createElement), sem precisar modificar os arquivos fonte.
global.React = React;
