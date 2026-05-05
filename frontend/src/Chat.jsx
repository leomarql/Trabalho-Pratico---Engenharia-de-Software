import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Box, 
  TextField, 
  Typography, 
  Paper, 
  Stack, 
  IconButton,
  Avatar,
  Button,
  Divider
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

function Chat({ item, usuario, destinatarioId, onVerItem }) {
  const [mensagens, setMensagens] = useState([]);
  const [novaMensagem, setNovaMensagem] = useState('');
  const scrollRef = useRef();

  const carregarMensagens = async () => {
    try {
      const resposta = await axios.get(`http://127.0.0.1:8000/mensagens/${item.id}?usuario_id=${usuario.id}&outro_id=${destinatarioId}`);
      setMensagens(resposta.data);
    } catch (erro) {
      console.error("Erro ao carregar chat", erro);
    }
  };

  const enviarMensagem = async (e) => {
    e.preventDefault();
    if (!novaMensagem.trim()) return;

    try {
      await axios.post(`http://127.0.0.1:8000/mensagens?remetente_id=${usuario.id}`, {
        conteudo: novaMensagem,
        item_id: item.id,
        destinatario_id: destinatarioId
      });
      setNovaMensagem('');
      carregarMensagens();
    } catch (erro) {
      alert("Erro ao enviar mensagem");
    }
  };

  useEffect(() => {
    carregarMeusMensagens();
    const interval = setInterval(carregarMensagens, 3000);
    return () => clearInterval(interval);
  }, [item.id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  const carregarMeusMensagens = () => carregarMensagens();

  return (
    <Box sx={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
      {/* TÍTULO E BOTÃO DE DETALHES */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'background.paper' }}>
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', display: 'block', textTransform: 'uppercase' }}>
            Chat de Devolução
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
            {item.titulo}
          </Typography>
        </Box>
        <Button 
          size="small" 
          variant="outlined" 
          startIcon={<InfoOutlinedIcon />} 
          onClick={() => onVerItem(item.id)}
          sx={{ borderRadius: 2 }}
        >
          Ver Item
        </Button>
      </Box>
      
      <Paper variant="outlined" sx={{ flexGrow: 1, p: 2, overflowY: 'auto', mb: 1, bgcolor: 'background.default', borderRadius: 0, border: 'none' }}>
        <Stack spacing={2}>
          {mensagens.map((msg) => (
            <Box 
              key={msg.id} 
              sx={{ 
                alignSelf: msg.remetente_id === usuario.id ? 'flex-end' : 'flex-start',
                maxWidth: '85%'
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: msg.remetente_id === usuario.id ? 'flex-end' : 'flex-start' }}>
                <Typography variant="caption" sx={{ mb: 0.5, px: 1, fontWeight: 600, color: 'text.secondary' }}>
                  {msg.remetente_id === usuario.id ? "Você" : msg.remetente_nome}
                </Typography>
                <Paper 
                  sx={{ 
                    p: 1.5, 
                    bgcolor: msg.remetente_id === usuario.id ? 'primary.main' : 'background.paper',
                    color: msg.remetente_id === usuario.id ? 'white' : 'text.primary',
                    borderRadius: msg.remetente_id === usuario.id ? '20px 20px 0 20px' : '20px 20px 20px 0',
                    boxShadow: '0px 2px 5px rgba(0,0,0,0.05)'
                  }}
                >
                  <Typography variant="body2">{msg.conteudo}</Typography>
                </Paper>
                <Typography variant="caption" sx={{ fontSize: '9px', mt: 0.5, opacity: 0.7 }}>
                  {new Date(msg.data_envio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </Box>
            </Box>
          ))}
          <div ref={scrollRef} />
        </Stack>
      </Paper>

      <Box component="form" onSubmit={enviarMensagem} sx={{ display: 'flex', gap: 1, p: 2, bgcolor: 'background.paper' }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Escreva uma mensagem..."
          value={novaMensagem}
          onChange={(e) => setNovaMensagem(e.target.value)}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 6, bgcolor: 'background.paper' } }}
        />
        <IconButton type="submit" color="primary" disabled={!novaMensagem.trim()} sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' }, '&.Mui-disabled': { bgcolor: '#ccc' } }}>
          <SendIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
}

export default Chat;
