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
  Avatar,
  IconButton
} from '@mui/material';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function detalheErro(erro) {
  if (!erro.response?.data) return 'Erro de conexão com o servidor.';
  const d = erro.response.data.detail;
  if (typeof d === 'string') return d;
  if (Array.isArray(d)) return d.map((e) => e.msg || String(e)).join(' ');
  return 'Erro ao cadastrar.';
}

function Cadastro({ onVoltarLogin }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });

  useEffect(() => {
    document.title = "Recoopere | Cadastro";
  }, []);

  const cadastrar = async (e) => {
    e.preventDefault();
    setMensagem({ tipo: '', texto: '' });

    try {
      await axios.post('http://127.0.0.1:8000/usuarios', {
        nome,
        email,
        senha,
      });
      setMensagem({ tipo: 'success', texto: 'Conta criada! Você já pode entrar com seu e-mail e senha.' });
      setNome('');
      setEmail('');
      setSenha('');
    } catch (erro) {
      setMensagem({ tipo: 'error', texto: detalheErro(erro) });
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ padding: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', borderRadius: 4 }}>
          <Box sx={{ alignSelf: 'flex-start', mb: 1 }}>
             <IconButton onClick={onVoltarLogin} color="primary" size="small">
                <ArrowBackIcon />
             </IconButton>
          </Box>
          
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main', color: 'primary.main' }}>
            <PersonAddOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5" sx={{ mb: 1, fontWeight: 700 }}>
            Criar Conta
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Use seu e-mail acadêmico <b>@ufmg.br</b>
          </Typography>

          {mensagem.texto && (
            <Alert severity={mensagem.tipo} sx={{ width: '100%', mb: 2 }}>
              {mensagem.texto}
            </Alert>
          )}

          <Box component="form" onSubmit={cadastrar} noValidate sx={{ width: '100%' }}>
            <TextField margin="normal" required fullWidth label="Nome Completo" value={nome} onChange={(e) => setNome(e.target.value)} />
            <TextField margin="normal" required fullWidth label="E-mail Acadêmico" placeholder="exemplo@ufmg.br" value={email} onChange={(e) => setEmail(e.target.value)} />
            <TextField margin="normal" required fullWidth label="Senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1rem', fontWeight: 700 }}>
              Finalizar Cadastro
            </Button>
            <Button fullWidth variant="text" onClick={onVoltarLogin}>
              Já tenho conta? Entrar
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default Cadastro;
