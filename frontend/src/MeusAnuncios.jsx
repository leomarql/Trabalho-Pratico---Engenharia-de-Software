import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Box, 
  Chip, 
  Button, 
  Dialog,
  DialogTitle,
  DialogContent,
  Paper
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Chat from './Chat';

function MeusAnuncios({ usuario }) {
  const [meusItens, setMeusItens] = useState([]);
  const [chatAberto, setChatAberto] = useState(null); // Item que está com o chat aberto

  const carregarMeusItens = async () => {
    try {
      // No backend atual, a rota /itens traz tudo. Vamos filtrar aqui no front.
      const resposta = await axios.get('http://127.0.0.1:8000/itens');
      const filtrados = resposta.data.filter(item => item.dono_id === usuario.id);
      setMeusItens(filtrados);
    } catch (erro) {
      console.error("Erro ao carregar meus anúncios", erro);
    }
  };

  useEffect(() => {
    carregarMeusItens();
  }, [usuario.id]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: '800', color: 'primary.main' }}>
        Meus Anúncios
      </Typography>

      {meusItens.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 4 }}>
          <Typography color="text.secondary">Você ainda não publicou nenhum anúncio.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {meusItens.map((item) => (
            <Grid item key={item.id} xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', borderRadius: 4, display: 'flex', flexDirection: 'column' }}>
                {item.imagem_url && (
                  <CardMedia
                    component="img"
                    height="140"
                    image={`http://127.0.0.1:8000/${item.imagem_url}`}
                  />
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{item.titulo}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{item.descricao}</Typography>
                  
                  {item.reclamante_id ? (
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'secondary.light', borderRadius: 2, border: '1px solid #ffca28' }}>
                      <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 1 }}>
                        ⚠️ ALGUÉM REIVINDICOU ESTE ITEM!
                      </Typography>
                      <Button 
                        fullWidth 
                        variant="contained" 
                        startIcon={<ChatIcon />}
                        onClick={() => setChatAberto(item)}
                        sx={{ borderRadius: 2 }}
                      >
                        Abrir Chat
                      </Button>
                    </Box>
                  ) : (
                    <Chip label="Nenhuma reivindicação" variant="outlined" size="small" />
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* DIALOG DO CHAT */}
      <Dialog 
        open={Boolean(chatAberto)} 
        onClose={() => setChatAberto(null)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: '800' }}>Chat de Devolução</DialogTitle>
        <DialogContent>
          {chatAberto && (
            <Chat 
              item={chatAberto} 
              usuario={usuario} 
              destinatarioId={chatAberto.reclamante_id} 
            />
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
}

export default MeusAnuncios;
