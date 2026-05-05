import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Typography, 
  Container, 
  Grid, 
  Card, 
  CardMedia, 
  CardContent, 
  CardActions, 
  Button, 
  IconButton, 
  Box, 
  Fab, 
  Dialog,
  DialogTitle,
  DialogContent,
  Chip,
  Paper,
  TextField,
  InputAdornment,
  MenuItem
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ChatIcon from '@mui/icons-material/Chat';
import PanToolIcon from '@mui/icons-material/PanTool';

import CadastroItem from './CadastroItem';
import Chat from './Chat';

function Mural({ usuario }) {
  const [itens, setItens] = useState([]);
  const [itensFiltrados, setItensFiltrados] = useState([]);
  const [busca, setBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todos');
  const [openDialog, setOpenDialog] = useState(false);
  const [chatAberto, setChatAberto] = useState(null);

  const categorias = ['Todos', 'Eletrônicos', 'Documentos', 'Roupas', 'Outros'];

  const carregarItens = async () => {
    try {
      const resposta = await axios.get('http://127.0.0.1:8000/itens');
      setItens(resposta.data);
      setItensFiltrados(resposta.data);
    } catch (erro) {
      console.error("Erro ao carregar itens", erro);
    }
  };

  useEffect(() => {
    const filtrados = itens.filter((item) => {
      const matchBusca = item.titulo.toLowerCase().includes(busca.toLowerCase()) || 
                         item.descricao.toLowerCase().includes(busca.toLowerCase());
      const matchCategoria = categoriaFiltro === 'Todos' || item.categoria === categoriaFiltro;
      return matchBusca && matchCategoria;
    });
    setItensFiltrados(filtrados);
  }, [busca, categoriaFiltro, itens]);

  const reivindicarItem = async (itemId) => {
    if (!window.confirm("Você acredita que este item é seu? Isso notificará o anunciante.")) return;
    try {
      await axios.patch(`http://127.0.0.1:8000/itens/${itemId}/reivindicar?usuario_id=${usuario.id}`);
      alert("Item reivindicado! Agora você pode conversar com o anunciante.");
      carregarItens();
    } catch (erro) {
      alert("Erro: " + (erro.response?.data?.detail || "Erro desconhecido"));
    }
  };

  const marcarDevolvido = async (itemId) => {
    if (!window.confirm("Deseja marcar este item como devolvido?")) return;
    try {
      await axios.patch(`http://127.0.0.1:8000/itens/${itemId}/devolver?usuario_id=${usuario.id}`);
      carregarItens();
    } catch (erro) {
      alert("Erro: " + (erro.response?.data?.detail || "Erro desconhecido"));
    }
  };

  const deletarItem = async (itemId) => {
    if (!window.confirm("Tem certeza que deseja excluir este anúncio?")) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/itens/${itemId}?usuario_id=${usuario.id}`);
      carregarItens();
    } catch (erro) {
      alert("Erro: " + (erro.response?.data?.detail || "Erro desconhecido"));
    }
  };

  useEffect(() => {
    carregarItens();
  }, []);

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.default', pb: 8 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ mb: 4, fontWeight: '800', color: 'primary.main' }}>
          Mural de Itens
        </Typography>

        <Paper sx={{ p: 2, mb: 4, borderRadius: 4, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Pesquisar..."
            variant="outlined"
            size="small"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            sx={{ flexGrow: 1, minWidth: '250px' }}
            InputProps={{
              startAdornment: (<InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>),
              sx: { borderRadius: 3 }
            }}
          />
          <TextField
            select
            label="Categoria"
            size="small"
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
            sx={{ minWidth: '150px' }}
            InputProps={{
              sx: { borderRadius: 3 }
            }}
          >
            {categorias.map((cat) => (<MenuItem key={cat} value={cat}>{cat}</MenuItem>))}
          </TextField>
        </Paper>

        <Grid container spacing={3}>
          {itensFiltrados.map((item) => (
            <Grid item key={item.id} xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', borderRadius: 4, display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="220"
                  image={item.imagem_url ? `http://127.0.0.1:8000/${item.imagem_url}` : 'https://via.placeholder.com/220'}
                />
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: '800' }}>{item.titulo}</Typography>
                    <Chip label={item.categoria} size="small" color="primary" />
                  </Box>
                  <Typography variant="body2" color="text.secondary">{item.descricao}</Typography>
                </CardContent>

                <CardActions sx={{ px: 3, pb: 3, pt: 0, gap: 1 }}>
                  {/* Botão de Reivindicar (Para quem não é o dono) */}
                  {usuario.id !== item.dono_id && !item.reclamante_id && (
                    <Button 
                      variant="contained" 
                      color="warning" 
                      startIcon={<PanToolIcon />}
                      onClick={() => reivindicarItem(item.id)}
                      sx={{ borderRadius: 2, fontWeight: 700 }}
                    >
                      É meu!
                    </Button>
                  )}

                  {/* Botão de Chat (Para o reclamante) */}
                  {item.reclamante_id === usuario.id && (
                    <Button 
                      variant="contained" 
                      color="primary" 
                      startIcon={<ChatIcon />}
                      onClick={() => setChatAberto(item)}
                      sx={{ borderRadius: 2 }}
                    >
                      Chat
                    </Button>
                  )}

                  {/* Botões do Dono */}
                  {usuario.id === item.dono_id && (
                    <Button 
                      variant="contained" 
                      color="success" 
                      onClick={() => marcarDevolvido(item.id)}
                      sx={{ borderRadius: 2 }}
                    >
                      Devolvido
                    </Button>
                  )}

                  <Box sx={{ flexGrow: 1 }} />
                  {(usuario.is_admin || usuario.id === item.dono_id) && (
                    <IconButton color="error" onClick={() => deletarItem(item.id)}>
                      <DeleteIcon />
                    </IconButton>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Fab color="secondary" sx={{ position: 'fixed', bottom: 32, right: 32 }} onClick={() => setOpenDialog(true)}>
        <AddIcon />
      </Fab>

      {/* Dialog de Cadastro */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: '800' }}>📢 Novo Anúncio</DialogTitle>
        <DialogContent><CadastroItem usuario={usuario} onSucesso={() => { carregarItens(); setOpenDialog(false); }} /></DialogContent>
      </Dialog>

      {/* Dialog do Chat no Mural */}
      <Dialog open={Boolean(chatAberto)} onClose={() => setChatAberto(null)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: '800' }}>Chat com Anunciante</DialogTitle>
        <DialogContent>
          {chatAberto && <Chat item={chatAberto} usuario={usuario} destinatarioId={chatAberto.dono_id} />}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default Mural;
