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
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import PanToolIcon from '@mui/icons-material/PanTool';
import Chat from './Chat';

function MeusAnuncios({ usuario }) {
  const [meusItens, setMeusItens] = useState([]);
  const [chatAberto, setChatAberto] = useState(null); // { item, outroUsuarioId }

  const carregarMeusItens = async () => {
    try {
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: '800', color: 'primary.main' }}>
        Meus Anúncios Publicados
      </Typography>

      {meusItens.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4 }}>
          <Typography color="text.secondary">Você ainda não publicou nenhum anúncio de item encontrado.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={4}>
          {meusItens.map((item) => (
            <Grid item key={item.id} xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', borderRadius: 4, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <CardMedia
                  component="img"
                  height="160"
                  image={item.imagem_url ? `http://127.0.0.1:8000/${item.imagem_url}` : 'https://via.placeholder.com/160'}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>{item.titulo}</Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PanToolIcon sx={{ fontSize: 18 }} /> 
                    REIVINDICAÇÕES ({item.total_reivindicacoes})
                  </Typography>

                  {item.reivindicacoes.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      Ninguém reivindicou este item ainda.
                    </Typography>
                  ) : (
                    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                      {item.reivindicacoes.map((reiv) => (
                        <ListItem 
                          key={reiv.id} 
                          disableGutters 
                          secondaryAction={
                            <IconButton edge="end" color="primary" onClick={() => setChatAberto({ item, outroUsuarioId: reiv.usuario_id })}>
                              <ChatIcon />
                            </IconButton>
                          }
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem', bgcolor: 'secondary.main', color: 'primary.main' }}>
                              {reiv.usuario_nome.charAt(0).toUpperCase()}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{reiv.usuario_nome}</Typography>} 
                          />
                        </ListItem>
                      ))}
                    </List>
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
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle sx={{ fontWeight: '800' }}>Conversa sobre Devolução</DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {chatAberto && (
            <Chat 
              item={chatAberto.item} 
              usuario={usuario} 
              destinatarioId={chatAberto.outroUsuarioId} 
            />
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
}

export default MeusAnuncios;
