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
  Paper,
  Divider
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

function Arquivados({ usuario }) {
  const [itensArquivados, setItensArquivados] = useState([]);

  useEffect(() => {
    document.title = "Recoopere | Itens Devolvidos";
    carregarArquivados();
  }, [usuario.id]);

  const carregarArquivados = async () => {
    try {
      const resposta = await axios.get('http://127.0.0.1:8000/itens-arquivados'); 
      const filtrados = resposta.data.filter(item => item.dono_id === usuario.id);
      setItensArquivados(filtrados);
    } catch (erro) {
      console.error("Erro ao carregar itens arquivados", erro);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: '800', color: 'primary.main' }}>
        Arquivo: Itens Devolvidos
      </Typography>

      {itensArquivados.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4 }}>
          <Typography color="text.secondary">Você ainda não possui itens arquivados como devolvidos.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={4}>
          {itensArquivados.map((item) => (
            <Grid item key={item.id} xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', borderRadius: 4, opacity: 0.8 }}>
                <CardMedia
                  component="img"
                  height="160"
                  image={item.imagem_url ? `http://127.0.0.1:8000/${item.imagem_url}` : 'https://via.placeholder.com/160'}
                  sx={{ filter: 'grayscale(100%)' }}
                />
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{item.titulo}</Typography>
                    <Chip icon={<CheckCircleIcon />} label="Devolvido" color="success" size="small" />
                  </Box>
                  <Typography variant="body2" color="text.secondary">{item.descricao}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}

export default Arquivados;
