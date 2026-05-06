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
  Stack,
  Avatar
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PanToolIcon from '@mui/icons-material/PanTool';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import dayjs from 'dayjs';

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

  const marcarDevolvido = async () => {
    if (!window.confirm("Deseja marcar este item como devolvido?")) return;
    try {
      await axios.patch(`http://127.0.0.1:8000/itens/${itemId}/devolver?usuario_id=${usuario.id}`);
      alert("Item devolvido!");
      onVoltar(); // Volta ao mural já que o item some
    } catch (erro) {
      alert("Erro ao marcar como devolvido");
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
              
              <Stack spacing={1} sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                  <LocationOnIcon sx={{ mr: 0.5, color: 'secondary.main' }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{item.local_encontrado}</Typography>
                </Box>
                {item.data_encontrado && (
                  <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                    <CalendarMonthIcon sx={{ mr: 0.5, color: 'secondary.main' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Encontrado em: {dayjs(item.data_encontrado).format('DD/MM/YYYY')}
                    </Typography>
                  </Box>
                )}
              </Stack>

              <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary', lineHeight: 1.8 }}>
                {item.descricao}
              </Typography>

              {item.dono_nome && (
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                  <Avatar
                    src={item.dono_imagem_url ? `http://127.0.0.1:8000/${item.dono_imagem_url}` : undefined}
                    sx={{ width: 40, height: 40, bgcolor: 'secondary.main' }}
                  >
                    {!item.dono_imagem_url && item.dono_nome.charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography variant="body2" color="text.secondary">
                    Anunciado por <strong>{item.dono_nome}</strong>
                  </Typography>
                </Stack>
              )}

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

              <Stack spacing={2}>
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

                {usuario.id === item.dono_id && (
                  <Button 
                    fullWidth 
                    variant="contained" 
                    size="large" 
                    color="success"
                    startIcon={<CheckCircleIcon />}
                    onClick={marcarDevolvido}
                    sx={{ py: 2, borderRadius: 3, fontWeight: 800 }}
                  >
                    Marcar como Devolvido
                  </Button>
                )}
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}

export default ItemDetalhes;
