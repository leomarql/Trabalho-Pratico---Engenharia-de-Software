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
  MenuItem,
  CardActionArea
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import PanToolIcon from '@mui/icons-material/PanTool';

import CadastroItem from './CadastroItem';

function Mural({ usuario, onVerDetalhes }) {
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

  useEffect(() => {
    const filtrados = itens.filter((item) => {
      const matchBusca = item.titulo.toLowerCase().includes(busca.toLowerCase()) || 
                         item.descricao.toLowerCase().includes(busca.toLowerCase());
      const matchCategoria = categoriaFiltro === 'Todos' || item.categoria === categoriaFiltro;
      return matchBusca && matchCategoria;
    });
    setItensFiltrados(filtrados);
  }, [busca, categoriaFiltro, itens]);

  const deletarItem = async (itemId) => {
    if (!window.confirm("Tem certeza que deseja excluir este anúncio?")) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/itens/${itemId}?usuario_id=${usuario.id}`);
      carregarItens();
    } catch (erro) {
      alert("Erro ao excluir");
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
            InputProps={{ sx: { borderRadius: 3 } }}
          >
            {categorias.map((cat) => (<MenuItem key={cat} value={cat}>{cat}</MenuItem>))}
          </TextField>
        </Paper>

        <Grid container spacing={3}>
          {itensFiltrados.map((item) => (
            <Grid item key={item.id} xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', borderRadius: 4, display: 'flex', flexDirection: 'column' }}>
                <CardActionArea onClick={() => onVerDetalhes(item.id)}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={item.imagem_url ? `http://127.0.0.1:8000/${item.imagem_url}` : 'https://via.placeholder.com/200'}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: '800' }}>{item.titulo}</Typography>
                      <Chip label={item.categoria} size="small" color="primary" />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'text.secondary' }}>
                      <LocationOnIcon sx={{ fontSize: 16, mr: 0.5 }} />
                      <Typography variant="caption">{item.local_encontrado}</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.descricao}
                    </Typography>
                    
                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PanToolIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        {item.total_reivindicacoes} reivindicação(ões)
                      </Typography>
                    </Box>
                  </CardContent>
                </CardActionArea>

                <CardActions sx={{ px: 2, pb: 2 }}>
                  <Button size="small" onClick={() => onVerDetalhes(item.id)}>Ver Detalhes</Button>
                  <Box sx={{ flexGrow: 1 }} />
                  {(usuario.is_admin || usuario.id === item.dono_id) && (
                    <IconButton color="error" size="small" onClick={() => deletarItem(item.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Fab 
        color="secondary" 
        sx={{ position: 'fixed', bottom: 32, right: 32 }} 
        onClick={() => setOpenDialog(true)}
      >
        <AddIcon />
      </Fab>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: '800' }}>📢 Novo Anúncio</DialogTitle>
        <DialogContent><CadastroItem usuario={usuario} onSucesso={() => { carregarItens(); setOpenDialog(false); }} /></DialogContent>
      </Dialog>
    </Box>
  );
}

export default Mural;
