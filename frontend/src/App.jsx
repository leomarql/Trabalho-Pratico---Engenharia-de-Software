import { useState } from 'react';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import Login from './Login';
import Cadastro from './Cadastro';
import Mural from './Mural';

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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div>
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
          <Mural usuario={usuarioLogado} />
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;