import { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Paper,
  Stack,
  Fade
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import HandshakeIcon from '@mui/icons-material/Handshake';

const slides = [
  {
    titulo: "Busca Inteligente",
    descricao: "Encontre seus pertences rapidamente filtrando por categoria, local e data no nosso mural interativo.",
    icone: <SearchIcon sx={{ fontSize: 80, color: 'secondary.main' }} />
  },
  {
    titulo: "Anúncio com Foto",
    descricao: "Encontrou algo? Publique uma foto na hora! Imagens ajudam o dono a identificar o objeto com precisão.",
    icone: <AddPhotoAlternateIcon sx={{ fontSize: 80, color: 'secondary.main' }} />
  },
  {
    titulo: "Comunidade Segura",
    descricao: "Acesso exclusivo para a comunidade UFMG. Mais segurança e confiança na hora de devolver ou recuperar itens.",
    icone: <HandshakeIcon sx={{ fontSize: 80, color: 'secondary.main' }} />
  }
];

function Home({ onComeçar }) {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '80vh', pt: { xs: 4, md: 8 }, pb: 6, textAlign: 'center' }}>
      <Container maxWidth="lg">
        <Grid container spacing={6} direction="column" alignItems="center">
          {/* Texto de Impacto Centralizado */}
          <Grid item xs={12} sx={{ width: '100%' }}>
            <Typography 
              variant="h2" 
              component="h1" 
              sx={{ 
                fontWeight: 800, 
                color: 'primary.main', 
                mb: 2,
                lineHeight: 1.2,
                fontSize: { xs: '2.5rem', md: '3.75rem' }
              }}
            >
              Perdeu algo? <br />
              <span style={{ color: '#ffca28' }}>A gente te ajuda</span> <br />
              a recooperar.
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4, fontWeight: 400, maxWidth: 700, mx: 'auto' }}>
              O Recoopere é a plataforma oficial de achados e perdidos para a comunidade acadêmica. 
              Conectamos quem encontrou com quem perdeu de forma rápida e segura.
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button 
                variant="contained" 
                size="large" 
                onClick={onComeçar}
                sx={{ px: 6, py: 2, borderRadius: 3, fontSize: '1.2rem', fontWeight: 700 }}
              >
                Começar agora
              </Button>
            </Box>
          </Grid>

          {/* Carrossel Centralizado */}
          <Grid item xs={12} sx={{ width: '100%', maxWidth: 600 }}>
            <Box sx={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Fade in={true} key={activeSlide} timeout={1000}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 6, 
                    borderRadius: 8, 
                    bgcolor: 'background.paper', 
                    textAlign: 'center',
                    boxShadow: '0px 20px 40px rgba(0,0,0,0.05)',
                    width: '100%',
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <Box sx={{ mb: 3 }}>
                    {slides[activeSlide].icone}
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, mb: 2, color: 'primary.main' }}>
                    {slides[activeSlide].titulo}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
                    {slides[activeSlide].descricao}
                  </Typography>
                  
                  <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 4 }}>
                    {slides.map((_, index) => (
                      <Box 
                        key={index}
                        sx={{ 
                          width: index === activeSlide ? 24 : 8, 
                          height: 8, 
                          borderRadius: 4, 
                          bgcolor: index === activeSlide ? 'secondary.main' : '#ddd',
                          transition: 'width 0.3s'
                        }} 
                      />
                    ))}
                  </Stack>
                </Paper>
              </Fade>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default Home;
