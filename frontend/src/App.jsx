import { useState } from 'react';
import { createTheme, ThemeProvider, CssBaseline, Dialog, DialogTitle, DialogContent, Box, Fab, Tooltip } from '@mui/material';
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
  const [itemSelecionadoId, setItemSelecionadoId] = useState(null);
  const [listaChatsAberta, setListaChatsAberta] = useState(false);
  const [chatAtivo, setChatAtivo] = useState(null); // { item, outroUsuarioId, outroUsuarioNome }

  const handleLogout = () => {
    setUsuarioLogado(null);
    setTelaAuth(null);
    setView('home');
  };

  const abrirDetalhesItem = (id) => {
    setItemSelecionadoId(id);
    setView('item-detalhes');
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
        <Box sx={{ pb: 10 }}>
          {view === 'mural' && <Mural usuario={usuarioLogado} onVerDetalhes={abrirDetalhesItem} />}
          {view === 'perfil' && (
            <Perfil 
              usuario={usuarioLogado} 
              onUpdateUsuario={(novosDados) => setUsuarioLogado(novosDados)} 
            />
          )}
          {view === 'meus-anuncios' && <MeusAnuncios usuario={usuarioLogado} />}
          {view === 'item-detalhes' && (
            <ItemDetalhes 
              itemId={itemSelecionadoId} 
              usuario={usuarioLogado} 
              onVoltar={() => setView('mural')} 
            />
          )}

          {/* BOTÃO FLUTUANTE DE CHATS (Acima do FAB de adicionar no Mural) */}
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

      {/* DIALOG DE LISTA DE CHATS */}
      <Dialog open={listaChatsAberta} onClose={() => setListaChatsAberta(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: '800' }}>Minhas Conversas</DialogTitle>
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

      {/* DIALOG DO CHAT ATIVO */}
      <Dialog open={Boolean(chatAtivo)} onClose={() => setChatAtivo(null)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: '800' }}>Conversa com {chatAtivo?.outroUsuarioNome}</DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {chatAtivo && (
            <Chat 
              item={chatAtivo.item} 
              usuario={usuarioLogado} 
              destinatarioId={chatAtivo.outroUsuarioId} 
            />
          )}
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  );
}

export default App;
