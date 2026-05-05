import { useState } from 'react';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import Login from './Login';
import Cadastro from './Cadastro';
import Mural from './Mural';
import Perfil from './Perfil';
import Header from './Header';
import Home from './Home';
import MeusAnuncios from './MeusAnuncios';

const theme = createTheme({
  palette: {
    primary: { main: '#00529b' },
    secondary: { main: '#ffca28' },
    background: { default: '#f4f7f9' },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Inter", sans-serif',
    h4: { fontWeight: 700 },
  },
});

function App() {
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [telaAuth, setTelaAuth] = useState(null);
  const [view, setView] = useState('home');

  const handleLogout = () => {
    setUsuarioLogado(null);
    setTelaAuth(null);
    setView('home');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header 
        usuario={usuarioLogado} 
        onLogout={handleLogout}
        onIrParaMural={() => setView('mural')}
        onIrParaPerfil={() => setView('perfil')}
        onIrParaHome={() => setView('home')}
        onIrParaMeusAnuncios={() => setView('meus-anuncios')}
        onIrParaLogin={() => { setView('home'); setTelaAuth('login'); }}
        onIrParaCadastro={() => { setView('home'); setTelaAuth('cadastro'); }}
      />

      {!usuarioLogado && !telaAuth && <Home onComeçar={() => setTelaAuth('login')} />}

      {!usuarioLogado && telaAuth === 'login' && (
        <Login
          onLoginSucesso={(dados) => { setUsuarioLogado(dados); setTelaAuth(null); setView('mural'); }}
          onIrParaCadastro={() => setTelaAuth('cadastro')}
        />
      )}
      {!usuarioLogado && telaAuth === 'cadastro' && (
        <Cadastro onVoltarLogin={() => setTelaAuth('login')} />
      )}

      {usuarioLogado && (
        <>
          {view === 'mural' && <Mural usuario={usuarioLogado} />}
          {view === 'perfil' && (
            <Perfil 
              usuario={usuarioLogado} 
              onUpdateUsuario={(novosDados) => setUsuarioLogado(novosDados)} 
            />
          )}
          {view === 'meus-anuncios' && <MeusAnuncios usuario={usuarioLogado} />}
        </>
      )}
    </ThemeProvider>
  );
}

export default App;
