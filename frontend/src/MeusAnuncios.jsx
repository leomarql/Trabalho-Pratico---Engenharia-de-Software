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
  Avatar,
  IconButton,
  TextField,
  MenuItem,
  Stack
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import PanToolIcon from '@mui/icons-material/PanTool';
import EditIcon from '@mui/icons-material/Edit';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import Chat from './Chat';

function MeusAnuncios({ usuario, onVerDetalhes }) {
  const [meusItens, setMeusItens] = useState([]);
  const [chatAberto, setChatAberto] = useState(null);
  const [editandoItem, setEditandoItem] = useState(null);

  // Estados do formulário de edição
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('Outros');
  const [local, setLocal] = useState('');
  const [imagem, setImagem] = useState(null);

  const categorias = ['Eletrônicos', 'Documentos', 'Roupas', 'Outros'];

  const carregarMeusItens = async () => {
    try {
      const resposta = await axios.get('http://127.0.0.1:8000/itens');
      const filtrados = resposta.data.filter(item => item.dono_id === usuario.id);
      setMeusItens(filtrados);
    } catch (erro) {
      console.error("Erro ao carregar meus anúncios", erro);
    }
  };

  const abrirEdicao = (item) => {
    setEditandoItem(item);
    setTitulo(item.titulo);
    setDescricao(item.descricao);
    setCategoria(item.categoria);
    setLocal(item.local_encontrado);
    setImagem(null);
  };

  const salvarEdicao = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('descricao', descricao);
    formData.append('categoria', categoria);
    formData.append('local_encontrado', local);
    formData.append('usuario_id', usuario.id);
    if (imagem) formData.append('imagem', imagem);

    try {
      await axios.put(`http://127.0.0.1:8000/itens/${editandoItem.id}?usuario_id=${usuario.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setEditandoItem(null);
      carregarMeusItens();
    } catch (erro) {
      alert("Erro ao editar anúncio");
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
          <Typography color="text.secondary">Você ainda não publicou nenhum anúncio.</Typography>
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
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{item.titulo}</Typography>
                    <IconButton size="small" color="primary" onClick={() => abrirEdicao(item)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Button size="small" fullWidth variant="outlined" sx={{ mb: 2 }} onClick={() => onVerDetalhes(item.id)}>
                    Ver Detalhes do Anúncio
                  </Button>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', mb: 1 }}>
                    REIVINDICAÇÕES ({item.total_reivindicacoes})
                  </Typography>

                  {item.reivindicacoes.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      Ninguém reivindicou este item ainda.
                    </Typography>
                  ) : (
                    <List sx={{ width: '100%' }}>
                      {item.reivindicacoes.map((reiv) => (
                        <ListItem 
                          key={reiv.id} 
                          disableGutters 
                          secondaryAction={
                            <IconButton edge="end" color="primary" onClick={() => setChatAberto({ item, outroUsuarioId: reiv.usuario_id, outroUsuarioNome: reiv.usuario_nome })}>
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
      <Dialog open={Boolean(chatAberto)} onClose={() => setChatAberto(null)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: '800' }}>Conversa com {chatAberto?.outroUsuarioNome}</DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {chatAberto && (
            <Chat 
              item={chatAberto.item} 
              usuario={usuario} 
              destinatarioId={chatAberto.outroUsuarioId} 
              onVerItem={(id) => { onVerDetalhes(id); setChatAberto(null); }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* DIALOG DE EDIÇÃO */}
      <Dialog open={Boolean(editandoItem)} onClose={() => setEditandoItem(null)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: '800' }}>✏️ Editar Anúncio</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={salvarEdicao} sx={{ mt: 2 }}>
            <Stack spacing={3}>
              <TextField label="Título" fullWidth required value={titulo} onChange={(e) => setTitulo(e.target.value)} />
              <TextField label="Descrição" fullWidth multiline rows={3} required value={descricao} onChange={(e) => setDescricao(e.target.value)} />
              <TextField select label="Categoria" fullWidth value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                {categorias.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
              </TextField>
              <TextField label="Local" fullWidth required value={local} onChange={(e) => setLocal(e.target.value)} />
              <Button variant="outlined" component="label" startIcon={<PhotoCamera />}>
                Trocar Foto (Opcional)
                <input type="file" hidden accept="image/*" onChange={(e) => setImagem(e.target.files[0])} />
              </Button>
              <Button type="submit" fullWidth variant="contained" size="large" sx={{ borderRadius: 2 }}>Salvar Alterações</Button>
            </Stack>
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
}

export default MeusAnuncios;
