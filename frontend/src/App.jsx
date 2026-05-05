import { useState, useMemo, useEffect } from 'react';
import { createTheme, ThemeProvider, CssBaseline, Dialog, DialogTitle, DialogContent, Box, Fab, Tooltip } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/pt-br';
import ChatIcon from '@mui/icons-material/Chat';
import Login from './Login';
import Cadastro from './Cadastro';
import Mural from './Mural';
import Perfil from './Perfil';
import Header from './Header';
import Home from './Home';
import MeusAnuncios from './MeusAnuncios';
import ItemDetalhes from './ItemDetalhes';
import ListaChats from './ListaChats';
import Chat from './Chat';
import Arquivados from './Arquivados';

function App() {
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [telaAuth, setTelaAuth] = useState(null);
  const [view, setView] = useState('home');
  const [itemSelecionadoId, setItemSelecionadoId] = useState(null);
  const [listaChatsAberta, setListaChatsAberta] = useState(false);
  const [chatAtivo, setChatAtivo] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.title = "Recoopere | Achados e Perdidos";
  }, []);

  const theme = useMemo(() => createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: { main: '#00529b' },
      secondary: { main: '#ffca28' },
      background: {
        default: darkMode ? '#121212' : '#f4f7f9',
        paper: darkMode ? '#1e1e1e' : '#ffffff',
      },
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: '"Poppins", "Roboto", "Inter", sans-serif',
      h4: { fontWeight: 700 },
    },
  }), [darkMode]);

  const handleLogout = () => {
    setUsuarioLogado(null);
    setTelaAuth(null);
    setView('home');
  };

  const abrirDetalhesItem = (id) => {
    setItemSelecionadoId(id);
    setView('item-detalhes');
  };

  const handleLoginSucesso = (dados) => {
    if (!dados || !dados.id) {
      alert("Erro ao processar login.");
      return;
    }
    setUsuarioLogado(dados);
    setTelaAuth(null);
    setView('mural');
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Header 
          usuario={usuarioLogado} 
          onLogout={handleLogout}
          onIrParaMural={() => setView('mural')}
          onIrParaPerfil={() => setView('perfil')}
          onIrParaHome={() => setView('home')}
          onIrParaMeusAnuncios={() => setView('meus-anuncios')}
          onIrParaArquivados={() => setView('arquivados')}
          onIrParaLogin={() => { setView('home'); setTelaAuth('login'); }}
          onIrParaCadastro={() => { setView('home'); setTelaAuth('cadastro'); }}
          darkMode={darkMode}
          toggleDarkMode={() => setDarkMode(!darkMode)}
        />

        {!usuarioLogado ? (
          <>
            {!telaAuth && <Home onComeçar={() => setTelaAuth('login')} />}
            {telaAuth === 'login' && (
              <Login
                onLoginSucesso={handleLoginSucesso}
                onIrParaCadastro={() => setTelaAuth('cadastro')}
              />
            )}
            {telaAuth === 'cadastro' && (
              <Cadastro onVoltarLogin={() => setTelaAuth('login')} />
            )}
          </>
        ) : (
          <Box sx={{ pb: 10, minHeight: '100vh' }}>
            {view === 'mural' && <Mural usuario={usuarioLogado} onVerDetalhes={abrirDetalhesItem} />}
            {view === 'perfil' && (
              <Perfil 
                usuario={usuarioLogado} 
                onUpdateUsuario={(novosDados) => setUsuarioLogado(novosDados)} 
              />
            )}
            {view === 'meus-anuncios' && <MeusAnuncios usuario={usuarioLogado} onVerDetalhes={abrirDetalhesItem} />}
            {view === 'item-detalhes' && (
              <ItemDetalhes 
                itemId={itemSelecionadoId} 
                usuario={usuarioLogado} 
                onVoltar={() => setView('mural')} 
              />
            )}
            {view === 'arquivados' && <Arquivados usuario={usuarioLogado} />}

            <Tooltip title="Minhas Conversas">
              <Fab 
                color="primary" 
                sx={{ position: 'fixed', bottom: 100, right: 32 }}
                onClick={() => setListaChatsAberta(true)}
              >
                <ChatIcon />
              </Fab>
            </Tooltip>
          </Box>
        )}

        {usuarioLogado && (
          <>
            <Dialog open={listaChatsAberta} onClose={() => setListaChatsAberta(false)} fullWidth maxWidth="xs">
              <DialogTitle sx={{ fontWeight: '800' }}>Chat - Minhas Conversas</DialogTitle>
              <DialogContent sx={{ p: 1 }}>
                <ListaChats 
                  usuario={usuarioLogado} 
                  onSelecionarChat={(chat) => {
                    setChatAtivo({ item: chat.item, outroUsuarioId: chat.outro_usuario_id, outroUsuarioNome: chat.outro_usuario_nome });
                    setListaChatsAberta(false);
                  }} 
                />
              </DialogContent>
            </Dialog>

            <Dialog open={Boolean(chatAtivo)} onClose={() => setChatAtivo(null)} fullWidth maxWidth="xs">
              <DialogTitle sx={{ fontWeight: '800' }}>Chat com {chatAtivo?.outroUsuarioNome}</DialogTitle>
              <DialogContent sx={{ p: 0 }}>
                {chatAtivo && (
                  <Chat 
                    item={chatAtivo.item} 
                    usuario={usuarioLogado} 
                    destinatarioId={chatAtivo.outroUsuarioId} 
                    onVerItem={(id) => { abrirDetalhesItem(id); setChatAtivo(null); }}
                  />
                )}
              </DialogContent>
            </Dialog>
          </>
        )}
      </ThemeProvider>
    </LocalizationProvider>
  );
}

export default App;
