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
  Paper
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import LocationOnIcon from '@mui/icons-material/LocationOn';

import CadastroItem from './CadastroItem';

function Mural({ usuario }) {
  const [itens, setItens] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);

  const carregarItens = async () => {
    try {
      const resposta = await axios.get('http://127.0.0.1:8000/itens');
      setItens(resposta.data);
    } catch (erro) {
      console.error("Erro ao carregar itens", erro);
    }
  };

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
        <Typography variant="h4" sx={{ mb: 4, fontWeight: '500', color: 'primary.main' }}>
          Últimos Itens Encontrados
        </Typography>

        <Grid container spacing={3}>
          {itens.length === 0 ? (
            <Grid item xs={12}>
              <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 4, bgcolor: '#f0f0f0' }}>
                <Typography color="text.secondary">Nenhum item encontrado no momento.</Typography>
              </Paper>
            </Grid>
          ) : itens.map((item) => (
            <Grid item key={item.id} xs={12} sm={6} md={4}>
              <Card sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                borderRadius: 4,
                transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.02)' }
              }}>
                {item.imagem_url ? (
                  <CardMedia
                    component="img"
                    height="200"
                    image={`http://127.0.0.1:8000/${item.imagem_url}`}
                    alt={item.titulo}
                  />
                ) : (
                  <Box sx={{ height: 200, bgcolor: 'grey.300', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography color="text.secondary">Sem foto</Typography>
                  </Box>
                )}
                
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                    {item.titulo}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'text.secondary' }}>
                    <LocationOnIcon sx={{ fontSize: 18, mr: 0.5 }} />
                    <Typography variant="body2">{item.local_encontrado}</Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {item.descricao}
                  </Typography>
                  
                  <Box sx={{ mt: 2 }}>
                    <Chip label={item.categoria} size="small" color="primary" variant="outlined" />
                  </Box>
                </CardContent>

                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Box>
                    {usuario.id === item.dono_id && (
                      <Button 
                        size="small" 
                        variant="contained" 
                        color="success" 
                        startIcon={<CheckCircleIcon />}
                        onClick={() => marcarDevolvido(item.id)}
                        sx={{ borderRadius: 2 }}
                      >
                        Devolvido
                      </Button>
                    )}
                  </Box>
                  <Box>
                    {(usuario.is_admin || usuario.id === item.dono_id) && (
                      <IconButton color="error" onClick={() => deletarItem(item.id)}>
                        <DeleteIcon />
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
        color="primary" 
        aria-label="add" 
        sx={{ position: 'fixed', bottom: 32, right: 32 }}
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
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>Anunciar Novo Item</DialogTitle>
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
