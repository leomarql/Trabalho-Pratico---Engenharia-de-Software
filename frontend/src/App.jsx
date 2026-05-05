import { useState } from 'react';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import Login from './Login';
import Cadastro from './Cadastro';
import Mural from './Mural';
import Perfil from './Perfil';
import Header from './Header';
import Home from './Home';

// Configuração do Tema Recoopere (Azul e Amarelo)
const theme = createTheme({
  palette: {
    primary: {
      main: '#00529b', // Azul UFMG / Confiança
    },
    secondary: {
      main: '#ffca28', // Amarelo / Alerta e Atenção
    },
    background: {
      default: '#f4f7f9',
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Inter", sans-serif',
    h4: {
      fontWeight: 700,
    },
  },
});

function App() {
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [telaAuth, setTelaAuth] = useState(null); // null, 'login' ou 'cadastro'
  const [view, setView] = useState('home'); // 'home', 'mural' ou 'perfil'

  const handleLogout = () => {
    setUsuarioLogado(null);
    setTelaAuth(null);
    setView('home');
  };

  const handleLoginSucesso = (dados) => {
    setUsuarioLogado(dados);
    setTelaAuth(null);
    setView('mural');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="app-container">
        {/* Header sempre visível, mas muda dependendo se está logado */}
        <Header 
          usuario={usuarioLogado} 
          onLogout={handleLogout}
          onIrParaMural={() => setView('mural')}
          onIrParaPerfil={() => setView('perfil')}
          onIrParaHome={() => setView('home')}
          onIrParaLogin={() => { setView('home'); setTelaAuth('login'); }}
          onIrParaCadastro={() => { setView('home'); setTelaAuth('cadastro'); }}
        />

        {/* Se não estiver logado e não escolheu login/cadastro, mostra Home */}
        {!usuarioLogado && !telaAuth && <Home onComeçar={() => setTelaAuth('login')} />}

        {/* Telas de Autenticação (Modais ou Sobrepostas à Home) */}
        {!usuarioLogado && telaAuth === 'login' && (
          <Login
            onLoginSucesso={handleLoginSucesso}
            onIrParaCadastro={() => setTelaAuth('cadastro')}
          />
        )}
        {!usuarioLogado && telaAuth === 'cadastro' && (
          <Cadastro onVoltarLogin={() => setTelaAuth('login')} />
        )}

        {/* Telas Internas (Apenas Logado) */}
        {usuarioLogado && (
          <>
            {view === 'mural' && <Mural usuario={usuarioLogado} />}
            {view === 'perfil' && (
              <Perfil 
                usuario={usuarioLogado} 
                onUpdateUsuario={(novosDados) => setUsuarioLogado(novosDados)} 
              />
            )}
          </>
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;
