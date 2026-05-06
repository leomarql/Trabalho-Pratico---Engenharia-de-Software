import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar, 
  Typography, 
  Divider,
  Box,
  Badge
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';

function ListaChats({ usuario, onSelecionarChat }) {
  const [chats, setChats] = useState([]);

  const carregarChats = async () => {
    try {
      const resposta = await axios.get(`http://127.0.0.1:8000/meus-chats/${usuario.id}`);
      setChats(resposta.data);
    } catch (erro) {
      console.error("Erro ao carregar lista de chats", erro);
    }
  };

  useEffect(() => {
    carregarChats();
  }, [usuario.id]);

  return (
    <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
      {chats.length === 0 ? (
        <Typography sx={{ p: 2, textAlign: 'center' }} color="text.secondary">
          Nenhuma conversa ativa no momento.
        </Typography>
      ) : (
        <List>
          {chats.map((chat, index) => (
            <div key={`${chat.item.id}-${chat.outro_usuario_id}`}>
              <ListItem 
                alignItems="flex-start" 
                button 
                onClick={() => onSelecionarChat(chat)}
                sx={{ borderRadius: 2, mb: 1, '&:hover': { bgcolor: 'secondary.light' } }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: chat.tipo === 'dono' ? 'primary.main' : 'secondary.main' }}>
                    {chat.outro_usuario_nome.charAt(0).toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      {chat.item.titulo}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">
                        {chat.outro_usuario_nome}
                      </Typography>
                      {" — "}{chat.tipo === 'dono' ? "Reivindicou seu item" : "Anunciante"}
                    </>
                  }
                />
              </ListItem>
              {index < chats.length - 1 && <Divider variant="inset" component="li" />}
            </div>
          ))}
        </List>
      )}
    </Box>
  );
}

export default ListaChats;
