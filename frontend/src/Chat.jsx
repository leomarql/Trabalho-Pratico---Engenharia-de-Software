import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Stack, 
  Avatar,
  Divider,
  IconButton
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

function Chat({ item, usuario, destinatarioId }) {
  const [mensagens, setMensagens] = useState([]);
  const [novaMensagem, setNovaMensagem] = useState('');
  const scrollRef = useRef();

  const carregarMensagens = async () => {
    try {
      const resposta = await axios.get(`http://127.0.0.1:8000/mensagens/${item.id}`);
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

  // Carrega mensagens e faz scroll para o fim
  useEffect(() => {
    carregarMensagens();
    const interval = setInterval(carregarMensagens, 3000); // Polling simples a cada 3s
    return () => clearInterval(interval);
  }, [item.id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  return (
    <Box sx={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
        Conversando sobre: <b>{item.titulo}</b>
      </Typography>
      
      <Paper variant="outlined" sx={{ flexGrow: 1, p: 2, overflowY: 'auto', mb: 2, bgcolor: '#f9f9f9', borderRadius: 3 }}>
        <Stack spacing={2}>
          {mensagens.map((msg) => (
            <Box 
              key={msg.id} 
              sx={{ 
                alignSelf: msg.remetente_id === usuario.id ? 'flex-end' : 'flex-start',
                maxWidth: '80%'
              }}
            >
              <Paper 
                sx={{ 
                  p: 1.5, 
                  bgcolor: msg.remetente_id === usuario.id ? 'primary.main' : 'white',
                  color: msg.remetente_id === usuario.id ? 'white' : 'text.primary',
                  borderRadius: msg.remetente_id === usuario.id ? '16px 16px 0 16px' : '16px 16px 16px 0',
                  boxShadow: '0px 2px 4px rgba(0,0,0,0.05)'
                }}
              >
                <Typography variant="body2">{msg.conteudo}</Typography>
              </Paper>
              <Typography variant="caption" sx={{ fontSize: '10px', display: 'block', mt: 0.5, textAlign: msg.remetente_id === usuario.id ? 'right' : 'left' }}>
                {new Date(msg.data_envio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Typography>
            </Box>
          ))}
          <div ref={scrollRef} />
        </Stack>
      </Paper>

      <Box component="form" onSubmit={enviarMensagem} sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Digite sua mensagem..."
          value={novaMensagem}
          onChange={(e) => setNovaMensagem(e.target.value)}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4 } }}
        />
        <IconButton type="submit" color="primary" sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}>
          <SendIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
}

export default Chat;
