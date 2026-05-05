import { useState } from 'react';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import Login from './Login';
import Cadastro from './Cadastro';
import Mural from './Mural';
import Perfil from './Perfil';
import Header from './Header';

// Configuração do Tema Material You (Material Design 3)
const theme = createTheme({
  palette: {
    primary: {
      main: '#6750A4', // Cor clássica do Material M3
    },
    secondary: {
      main: '#625B71',
    },
    background: {
      default: '#FEF7FF', // Fundo levemente colorido conforme o M3
    },
  },
  shape: {
    borderRadius: 16, // Bordas bem arredondadas (característica do Material You)
  },
  typography: {
    fontFamily: '"Roboto", "Inter", sans-serif',
  },
});

function App() {
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [telaAuth, setTelaAuth] = useState('login');
  const [view, setView] = useState('mural'); // Gerencia a tela interna: 'mural' ou 'perfil'

  const handleLogout = () => {
    setUsuarioLogado(null);
    setTelaAuth('login');
    setView('mural');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="app-container">
        {!usuarioLogado ? (
          telaAuth === 'login' ? (
            <Login
              onLoginSucesso={(dadosUsuario) => setUsuarioLogado(dadosUsuario)}
              onIrParaCadastro={() => setTelaAuth('cadastro')}
            />
          ) : (
            <Cadastro onVoltarLogin={() => setTelaAuth('login')} />
          )
        ) : (
          <>
            <Header 
              usuario={usuarioLogado} 
              onLogout={handleLogout}
              onIrParaMural={() => setView('mural')}
              onIrParaPerfil={() => setView('perfil')}
            />
            {view === 'mural' ? (
              <Mural usuario={usuarioLogado} />
            ) : (
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
