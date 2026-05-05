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

import CadastroItem from './CadastroItem';

function Mural({ usuario }) {
  const [itens, setItens] = useState([]);
  const [itensFiltrados, setItensFiltrados] = useState([]);
  const [busca, setBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todos');
  const [openDialog, setOpenDialog] = useState(false);

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

  // Efeito para filtrar os itens quando a busca ou a categoria mudam
  useEffect(() => {
    const filtrados = itens.filter((item) => {
      const matchBusca = item.titulo.toLowerCase().includes(busca.toLowerCase()) || 
                         item.descricao.toLowerCase().includes(busca.toLowerCase());
      const matchCategoria = categoriaFiltro === 'Todos' || item.categoria === categoriaFiltro;
      return matchBusca && matchCategoria;
    });
    setItensFiltrados(filtrados);
  }, [busca, categoriaFiltro, itens]);

  const marcarDevolvido = async (itemId) => {
    if (!window.confirm("Deseja marcar este item como devolvido? Ele sairá do mural.")) return;
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
          Mural de Achados e Perdidos
        </Typography>

        {/* BARRA DE FILTROS */}
        <Paper sx={{ p: 2, mb: 4, borderRadius: 4, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Pesquisar por título ou descrição..."
            variant="outlined"
            size="small"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            sx={{ flexGrow: 1, minWidth: '250px' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
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
              startAdornment: (
                <InputAdornment position="start">
                  <FilterListIcon color="action" />
                </InputAdornment>
              ),
              sx: { borderRadius: 3 }
            }}
          >
            {categorias.map((cat) => (
              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
            ))}
          </TextField>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto', fontWeight: 600 }}>
            {itensFiltrados.length} itens encontrados
          </Typography>
        </Paper>

        <Grid container spacing={3}>
          {itensFiltrados.length === 0 ? (
            <Grid item xs={12}>
              <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 6, bgcolor: 'white' }}>
                <SearchIcon sx={{ fontSize: 64, color: '#ddd', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">Ops! Nenhum item corresponde à sua busca.</Typography>
                <Button sx={{ mt: 2 }} onClick={() => { setBusca(''); setCategoriaFiltro('Todos'); }}>Limpar Filtros</Button>
              </Paper>
            </Grid>
          ) : itensFiltrados.map((item) => (
            <Grid item key={item.id} xs={12} sm={6} md={4}>
              <Card sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                borderRadius: 4,
                boxShadow: '0px 10px 20px rgba(0,0,0,0.05)',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-5px)', boxShadow: '0px 15px 30px rgba(0,0,0,0.1)' }
              }}>
                {item.imagem_url ? (
                  <CardMedia
                    component="img"
                    height="220"
                    image={`http://127.0.0.1:8000/${item.imagem_url}`}
                    alt={item.titulo}
                  />
                ) : (
                  <Box sx={{ height: 220, bgcolor: 'grey.200', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <SearchIcon sx={{ fontSize: 40, color: 'grey.400' }} />
                  </Box>
                )}
                
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" component="h2" sx={{ fontWeight: '800', lineHeight: 1.2 }}>
                      {item.titulo}
                    </Typography>
                    <Chip label={item.categoria} size="small" color="primary" sx={{ fontWeight: 600, borderRadius: 1.5 }} />
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, color: 'text.secondary' }}>
                    <LocationOnIcon sx={{ fontSize: 16, mr: 0.5, color: 'secondary.main' }} />
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>{item.local_encontrado}</Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: 1.6
                  }}>
                    {item.descricao}
                  </Typography>
                </CardContent>

                <CardActions sx={{ justifyContent: 'space-between', px: 3, pb: 3, pt: 0 }}>
                  <Box>
                    {usuario.id === item.dono_id && (
                      <Button 
                        size="small" 
                        variant="contained" 
                        color="success" 
                        startIcon={<CheckCircleIcon />}
                        onClick={() => marcarDevolvido(item.id)}
                        sx={{ borderRadius: 2, fontWeight: 700, px: 2 }}
                      >
                        Devolvido
                      </Button>
                    )}
                  </Box>
                  <Box>
                    {(usuario.is_admin || usuario.id === item.dono_id) && (
                      <IconButton color="error" onClick={() => deletarItem(item.id)} sx={{ bgcolor: 'error.light', color: 'white', '&:hover': { bgcolor: 'error.main' } }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* BOTÃO FLUTUANTE PARA ADICIONAR */}
      <Fab 
        color="secondary" 
        aria-label="add" 
        sx={{ position: 'fixed', bottom: 32, right: 32, color: 'primary.main', fontWeight: 'bold' }}
        onClick={() => setOpenDialog(true)}
      >
        <AddIcon />
      </Fab>

      {/* JANELA DE CADASTRO */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 4, p: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: '800', color: 'primary.main' }}>📢 Anunciar Novo Item</DialogTitle>
        <DialogContent>
          <CadastroItem 
            usuario={usuario} 
            onSucesso={() => {
              carregarItens();
              setOpenDialog(false);
            }} 
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default Mural;
