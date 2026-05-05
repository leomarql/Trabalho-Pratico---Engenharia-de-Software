import { useState } from 'react';
import axios from 'axios';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Container, 
  Paper, 
  Alert,
  Avatar,
  Stack
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

function Perfil({ usuario, onUpdateUsuario }) {
  const [nome, setNome] = useState(usuario.nome);
  const [email, setEmail] = useState(usuario.email);
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMensagem({ tipo: '', texto: '' });

    const dadosUpdate = { nome, email };
    if (senha) {
      dadosUpdate.senha = senha;
    }

    try {
      const resposta = await axios.put(`http://127.0.0.1:8000/usuarios/${usuario.id}`, dadosUpdate);
      setMensagem({ tipo: 'success', texto: 'Dados atualizados com sucesso!' });
      // Atualiza os dados do usuário no estado global do App
      onUpdateUsuario({ ...usuario, nome: resposta.data.nome, email: resposta.data.email });
      setSenha(''); // Limpa o campo de senha
    } catch (erro) {
      setMensagem({ 
        tipo: 'error', 
        texto: erro.response?.data?.detail || 'Erro ao atualizar dados.' 
      });
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 56, height: 56 }}>
            <AccountCircleIcon fontSize="large" />
          </Avatar>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Meu Perfil
          </Typography>
        </Box>

        {mensagem.texto && (
          <Alert severity={mensagem.tipo} sx={{ mb: 3 }}>
            {mensagem.texto}
          </Alert>
        )}

        <Box component="form" onSubmit={handleUpdate}>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="E-mail Acadêmico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              helperText="Deve terminar com @ufmg.br"
            />
            <TextField
              fullWidth
              label="Nova Senha"
              type="password"
              placeholder="Deixe em branco para não alterar"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
            
            <Button
              type="submit"
              variant="contained"
              size="large"
              sx={{ py: 1.5, borderRadius: 2 }}
            >
              Salvar Alterações
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}

export default Perfil;
