import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  Chip, 
  Button, 
  Divider,
  Avatar,
  Stack
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PanToolIcon from '@mui/icons-material/PanTool';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function ItemDetalhes({ itemId, usuario, onVoltar }) {
  const [item, setItem] = useState(null);

  const carregarItem = async () => {
    try {
      const resposta = await axios.get(`http://127.0.0.1:8000/itens/${itemId}`);
      setItem(resposta.data);
    } catch (erro) {
      console.error("Erro ao carregar detalhes", erro);
    }
  };

  const reivindicarItem = async () => {
    if (!window.confirm("Você acredita que este item é seu?")) return;
    try {
      await axios.patch(`http://127.0.0.1:8000/itens/${itemId}/reivindicar?usuario_id=${usuario.id}`);
      alert("Item reivindicado com sucesso!");
      carregarItem();
    } catch (erro) {
      alert("Erro: " + (erro.response?.data?.detail || "Erro desconhecido"));
    }
  };

  useEffect(() => {
    carregarItem();
  }, [itemId]);

  if (!item) return <Typography>Carregando...</Typography>;

  const jaReivindicadoPorMim = item.reivindicacoes.some(r => r.usuario_id === usuario.id);

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={onVoltar} sx={{ mb: 2 }}>
        Voltar ao Mural
      </Button>

      <Paper elevation={3} sx={{ borderRadius: 6, overflow: 'hidden' }}>
        <Grid container>
          <Grid item xs={12} md={6}>
            {item.imagem_url ? (
              <Box 
                component="img" 
                src={`http://127.0.0.1:8000/${item.imagem_url}`} 
                sx={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: 400 }}
              />
            ) : (
              <Box sx={{ width: '100%', height: '100%', bgcolor: 'grey.200', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
                <Typography color="text.secondary">Sem Foto</Typography>
              </Box>
            )}
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 4 }}>
              <Chip label={item.categoria} color="primary" sx={{ mb: 2, fontWeight: 700 }} />
              <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>{item.titulo}</Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, color: 'text.secondary' }}>
                <LocationOnIcon sx={{ mr: 0.5, color: 'secondary.main' }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{item.local_encontrado}</Typography>
              </Box>

              <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', lineHeight: 1.8 }}>
                {item.descricao}
              </Typography>

              <Divider sx={{ mb: 3 }} />

              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
                <Box sx={{ textAlign: 'center', px: 2, py: 1, bgcolor: 'background.default', borderRadius: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main' }}>
                    {item.total_reivindicacoes}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">REIVINDICAÇÕES</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Este item foi identificado por {item.total_reivindicacoes} pessoa(s).
                </Typography>
              </Stack>

              {usuario.id !== item.dono_id && (
                <Button 
                  fullWidth 
                  variant="contained" 
                  size="large" 
                  color={jaReivindicadoPorMim ? "success" : "warning"}
                  startIcon={<PanToolIcon />}
                  disabled={jaReivindicadoPorMim}
                  onClick={reivindicarItem}
                  sx={{ py: 2, borderRadius: 3, fontWeight: 800 }}
                >
                  {jaReivindicadoPorMim ? "Item Reivindicado" : "Este item é meu!"}
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}

export default ItemDetalhes;
