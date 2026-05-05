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
  Stack,
  IconButton
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

function Perfil({ usuario, onUpdateUsuario }) {
  const [nome, setNome] = useState(usuario.nome);
  const [email, setEmail] = useState(usuario.email);
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });

  useEffect(() => {
    document.title = "Recoopere | Meu Perfil";
  }, []);

  const handleUpdateFoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('imagem', file);
    try {
      const resp = await axios.patch(`http://127.0.0.1:8000/usuarios/${usuario.id}/foto`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onUpdateUsuario(resp.data);
      alert("Foto atualizada!");
    } catch(e) { alert("Erro ao subir foto"); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMensagem({ tipo: '', texto: '' });

    const dadosUpdate = { nome, email };
    if (senha) dadosUpdate.senha = senha;

    try {
      const resposta = await axios.put(`http://127.0.0.1:8000/usuarios/${usuario.id}`, dadosUpdate);
      setMensagem({ tipo: 'success', texto: 'Dados atualizados com sucesso!' });
      onUpdateUsuario({ ...usuario, nome: resposta.data.nome, email: resposta.data.email });
      setSenha('');
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
          <Box sx={{ position: 'relative' }}>
             <Avatar src={usuario.imagem_url ? `http://127.0.0.1:8000/${usuario.imagem_url}` : undefined} sx={{ m: 1, bgcolor: 'primary.main', width: 80, height: 80 }}>
                {!usuario.imagem_url && <AccountCircleIcon fontSize="large" />}
             </Avatar>
             <IconButton component="label" sx={{ position: 'absolute', bottom: 0, right: 0, bgcolor: 'background.paper' }}>
                <PhotoCamera />
                <input type="file" hidden accept="image/*" onChange={handleUpdateFoto} />
             </IconButton>
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            {usuario.nome}
          </Typography>
        </Box>

        {mensagem.texto && <Alert severity={mensagem.tipo} sx={{ mb: 3 }}>{mensagem.texto}</Alert>}

        <Box component="form" onSubmit={handleUpdate}>
          <Stack spacing={3}>
            <TextField fullWidth label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
            <TextField fullWidth label="E-mail Acadêmico" value={email} onChange={(e) => setEmail(e.target.value)} required helperText="Deve terminar com @ufmg.br" />
            <TextField fullWidth label="Nova Senha" type="password" placeholder="Deixe em branco para não alterar" value={senha} onChange={(e) => setSenha(e.target.value)} />
            <Button type="submit" variant="contained" size="large" sx={{ py: 1.5, borderRadius: 2, fontWeight: 700 }}>Salvar Alterações</Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}

export default Perfil;
