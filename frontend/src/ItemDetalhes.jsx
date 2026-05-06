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
  Stack
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
      onVoltar(); 
    } catch (erro) {
      alert("Erro ao marcar como devolvido");
    }
  };

  useEffect(() => {
    carregarItem();
  }, [itemId]);

  if (!item) return <Typography sx={{ p: 4, textAlign: 'center' }}>Carregando...</Typography>;

  const jaReivindicadoPorMim = item.reivindicacoes.some(r => Number(r.usuario_id) === Number(usuario.id));

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: 'background.default', pt: 4, pb: 8, display: 'flex', justifyContent: 'center' }}>
      <Container maxWidth="md" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* Botão de Voltar forçando largura 100% do container interno */}
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={onVoltar} sx={{ fontWeight: 600 }}>
            Voltar ao Mural
          </Button>
        </Box>

        {/* Paper Principal forçando largura 100% */}
        <Paper elevation={3} sx={{ borderRadius: 6, overflow: 'hidden', width: '100%' }}>
          <Grid container>
            {/* LADO DA IMAGEM */}
            <Grid item xs={12} md={6}>
              {item.imagem_url ? (
                <Box 
                  component="img" 
                  src={`http://127.0.0.1:8000/${item.imagem_url}`} 
                  sx={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: { xs: 300, md: 550 }, display: 'block' }}
                />
              ) : (
                <Box sx={{ width: '100%', height: '100%', bgcolor: 'grey.200', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: { xs: 300, md: 550 } }}>
                  <Typography color="text.secondary" sx={{ fontWeight: 600 }}>Sem Foto</Typography>
                </Box>
              )}
            </Grid>
            
            {/* LADO DAS INFORMAÇÕES - Forçando ocupar todo o espaço lateral */}
            <Grid item xs={12} md={6} sx={{ display: 'flex', width: '100%' }}>
              <Box sx={{ p: { xs: 4, md: 6 }, width: '100%', display: 'flex', flexDirection: 'column', height: '100%' }}>
                
                <Box sx={{ flexGrow: 1, width: '100%' }}>
                  <Chip label={item.categoria} color="primary" sx={{ mb: 2, fontWeight: 700, borderRadius: 1.5 }} />
                  
                  <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, wordBreak: 'break-word', lineHeight: 1.1, width: '100%' }}>
                    {item.titulo}
                  </Typography>
                  
                  <Stack spacing={2} sx={{ mb: 4, width: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                      <LocationOnIcon sx={{ mr: 1.5, color: 'secondary.main', fontSize: 24 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>{item.local_encontrado}</Typography>
                    </Box>
                    {item.data_encontrado && (
                      <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                        <CalendarMonthIcon sx={{ mr: 1.5, color: 'secondary.main', fontSize: 24 }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Encontrado em: {dayjs(item.data_encontrado).format('DD/MM/YYYY')}
                        </Typography>
                      </Box>
                    )}
                  </Stack>

                  <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', lineHeight: 1.8, fontSize: '1.1rem', width: '100%' }}>
                    {item.descricao}
                  </Typography>
                </Box>

                <Divider sx={{ mb: 4 }} />

                <Box sx={{ mb: 4, width: '100%' }}>
                  <Stack direction="row" spacing={3} alignItems="center">
                    <Box sx={{ textAlign: 'center', px: 3, py: 2, bgcolor: 'background.default', borderRadius: 3, border: '1px solid', borderColor: 'divider', minWidth: '100px' }}>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main' }}>
                        {item.total_reivindicacoes}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Reivindicações</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, fontSize: '1rem' }}>
                      Este item foi identificado por {item.total_reivindicacoes} pessoa(s).
                    </Typography>
                  </Stack>
                </Box>

                <Stack spacing={2} sx={{ width: '100%', mt: 'auto' }}>
                  {Number(usuario.id) !== Number(item.dono_id) && (
                    <Button 
                      fullWidth 
                      variant="contained" 
                      size="large" 
                      color={jaReivindicadoPorMim ? "success" : "warning"}
                      startIcon={<PanToolIcon />}
                      disabled={jaReivindicadoPorMim}
                      onClick={reivindicarItem}
                      sx={{ py: 2.5, borderRadius: 4, fontWeight: 800, fontSize: '1.1rem', boxShadow: 'none' }}
                    >
                      {jaReivindicadoPorMim ? "Item Reivindicado" : "Este item é meu!"}
                    </Button>
                  )}

                  {Number(usuario.id) === Number(item.dono_id) && (
                    <Button 
                      fullWidth 
                      variant="contained" 
                      size="large" 
                      color="success"
                      startIcon={<CheckCircleIcon />}
                      onClick={marcarDevolvido}
                      sx={{ py: 2.5, borderRadius: 4, fontWeight: 800, fontSize: '1.1rem', boxShadow: 'none' }}
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
    </Box>
  );
}

export default ItemDetalhes;
