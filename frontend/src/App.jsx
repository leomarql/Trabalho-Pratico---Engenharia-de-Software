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

const STORAGE_USER = 'recoopere_usuario';
const STORAGE_VIEW = 'recoopere_view';
const STORAGE_ITEM = 'recoopere_itemId';
const STORAGE_THEME = 'recoopere_darkMode';
const VIEWS_LOGADO = ['mural', 'perfil', 'meus-anuncios', 'item-detalhes', 'arquivados'];

function readPersistedSession() {
  try {
    const rawUser = localStorage.getItem(STORAGE_USER);
    if (!rawUser) {
      return { user: null, view: 'home', itemId: null };
    }
    const user = JSON.parse(rawUser);
    if (!user?.id) {
      return { user: null, view: 'home', itemId: null };
    }
    let view = localStorage.getItem(STORAGE_VIEW) || 'mural';
    if (!VIEWS_LOGADO.includes(view)) {
      view = 'mural';
    }
    let itemId = null;
    const rawItem = localStorage.getItem(STORAGE_ITEM);
    if (rawItem) {
      const n = parseInt(rawItem, 10);
      if (Number.isFinite(n)) {
        itemId = n;
      }
    }
    if (view === 'item-detalhes' && itemId == null) {
      view = 'mural';
    }
    return { user, view, itemId };
  } catch {
    return { user: null, view: 'home', itemId: null };
  }
}

function App() {
  const [usuarioLogado, setUsuarioLogado] = useState(() => readPersistedSession().user);
  const [telaAuth, setTelaAuth] = useState(null);
  const [view, setView] = useState(() => {
    const s = readPersistedSession();
    return s.user ? s.view : 'home';
  });
  const [itemSelecionadoId, setItemSelecionadoId] = useState(() => {
    const s = readPersistedSession();
    return s.user ? s.itemId : null;
  });
  const [listaChatsAberta, setListaChatsAberta] = useState(false);
  const [chatAtivo, setChatAtivo] = useState(null);
  
  // PERSISTÊNCIA DO TEMA: Lê do localStorage ao iniciar
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem(STORAGE_THEME);
    return saved === 'true';
  });

  useEffect(() => {
    document.title = "Recoopere | Achados e Perdidos";
  }, []);

  // Sincroniza a sessão no localStorage
  useEffect(() => {
    if (usuarioLogado) {
      localStorage.setItem(STORAGE_USER, JSON.stringify(usuarioLogado));
      localStorage.setItem(STORAGE_VIEW, view);
      if (itemSelecionadoId != null) {
        localStorage.setItem(STORAGE_ITEM, String(itemSelecionadoId));
      } else {
        localStorage.removeItem(STORAGE_ITEM);
      }
    } else {
      localStorage.removeItem(STORAGE_USER);
      localStorage.removeItem(STORAGE_VIEW);
      localStorage.removeItem(STORAGE_ITEM);
    }
  }, [usuarioLogado, view, itemSelecionadoId]);

  // Sincroniza o tema no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem(STORAGE_THEME, String(darkMode));
  }, [darkMode]);

  const lightColors = {
    primary: '#005ac1',
    onPrimary: '#ffffff',
    primaryContainer: '#d8e2ff',
    onPrimaryContainer: '#001a41',
  };

  const darkColors = {
    primary: '#adc6ff',
    onPrimary: '#002e69',
    primaryContainer: '#004494',
    onPrimaryContainer: '#d8e2ff',
  };

  const theme = useMemo(() => createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: { 
        main: darkMode ? darkColors.primary : lightColors.primary,
        contrastText: darkMode ? darkColors.onPrimary : lightColors.onPrimary,
      },
      tokens: darkMode ? darkColors : lightColors,
      background: {
        default: darkMode ? '#1b1b1f' : '#fefbff',
        paper: darkMode ? '#1b1b1f' : '#ffffff',
      },
    },
    shape: { borderRadius: 16 },
    typography: {
      fontFamily: '"Poppins", "Roboto", "Inter", sans-serif',
      h4: { fontWeight: 700 },
    },
  }), [darkMode]);

  const handleLogout = () => {
    setUsuarioLogado(null);
    setTelaAuth(null);
    setView('home');
    localStorage.clear(); // Limpa tudo ao sair
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

  const handleLogoClick = () => {
    if (usuarioLogado) {
      setView('mural');
    } else {
      setView('home');
      setTelaAuth(null);
    }
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
          onIrParaHome={handleLogoClick}
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
              <DialogTitle sx={{ fontWeight: '800', color: 'primary.main' }}>Chat - Minhas Conversas</DialogTitle>
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
              <DialogTitle sx={{ fontWeight: '800', color: 'primary.main' }}>Chat com {chatAtivo?.outroUsuarioNome}</DialogTitle>
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
