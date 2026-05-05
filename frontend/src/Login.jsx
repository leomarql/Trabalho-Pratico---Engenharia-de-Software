import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Container, 
  Paper, 
  Alert,
  Avatar
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

function Login({ onLoginSucesso, onIrParaCadastro }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });

  useEffect(() => {
    document.title = "Recoopere | Login";
  }, []);

  const fazerLogin = async (e) => {
    e.preventDefault();
    setMensagem({ tipo: '', texto: '' });
    
    try {
      const resposta = await axios.post('http://127.0.0.1:8000/login', {
        email: email,
        senha: senha
      });
      
      onLoginSucesso(resposta.data);
    } catch (erro) {
      if (erro.response) {
        setMensagem({ tipo: 'error', texto: erro.response.data.detail });
      } else {
        setMensagem({ tipo: 'error', texto: "Erro de conexão com o servidor. O backend está rodando?" });
      }
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            padding: 4, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            width: '100%',
            borderRadius: 4
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
            Acesso ao Recoopere
          </Typography>

          {mensagem.texto && (
            <Alert severity={mensagem.tipo} sx={{ width: '100%', mb: 2 }}>
              {mensagem.texto}
            </Alert>
          )}

          <Box component="form" onSubmit={fazerLogin} noValidate sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="E-mail Acadêmico (@ufmg.br)"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Senha"
              type="password"
              id="password"
              autoComplete="current-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1rem', fontWeight: 700 }}
            >
              Entrar
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={onIrParaCadastro}
              sx={{ py: 1.2, fontWeight: 600 }}
            >
              Criar nova conta
            </Button>
          </Box>
        </Paper>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
          {'Recoopere © '}
          {new Date().getFullYear()}
        </Typography>
      </Box>
    </Container>
  );
}

export default Login;
