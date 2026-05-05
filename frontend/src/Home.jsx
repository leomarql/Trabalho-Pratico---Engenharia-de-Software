import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Paper,
  Stack
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import HandshakeIcon from '@mui/icons-material/Handshake';

function Home({ onComeçar }) {
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '80vh', pt: 8, pb: 6 }}>
      <Container maxWidth="lg">
        <Grid container spacing={6} alignItems="center">
          {/* Lado Esquerdo: Texto de Impacto */}
          <Grid item xs={12} md={6}>
            <Typography 
              variant="h2" 
              component="h1" 
              sx={{ 
                fontWeight: 800, 
                color: 'primary.main', 
                mb: 2,
                lineHeight: 1.2
              }}
            >
              Perdeu algo? <br />
              <span style={{ color: '#ffca28' }}>A gente te ajuda</span> <br />
              a recuperar.
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4, fontWeight: 400 }}>
              O Recoopere é a plataforma oficial de achados e perdidos para a comunidade acadêmica. 
              Conectamos quem encontrou com quem perdeu de forma rápida, segura e gratuita.
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button 
                variant="contained" 
                size="large" 
                onClick={onComeçar}
                sx={{ px: 4, py: 2, borderRadius: 3, fontSize: '1.1rem' }}
              >
                Começar agora
              </Button>
              <Button 
                variant="outlined" 
                size="large"
                sx={{ px: 4, py: 2, borderRadius: 3, fontSize: '1.1rem' }}
                onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })}
              >
                Saiba mais
              </Button>
            </Stack>
          </Grid>

          {/* Lado Direito: Ilustração/Espaço */}
          <Grid item xs={12} md={6}>
            <Box 
              component="img"
              src="./src/assets/hero.png" // Usando a imagem hero que já existe no projeto
              alt="Achados e Perdidos"
              sx={{ 
                width: '100%', 
                maxWidth: 500, 
                display: 'block', 
                margin: 'auto',
                filter: 'drop-shadow(0px 20px 40px rgba(0,0,0,0.1))'
              }}
            />
          </Grid>
        </Grid>

        {/* Seção de Recursos (Destaques) */}
        <Grid container spacing={4} sx={{ mt: 10 }}>
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: 6, bgcolor: 'white', height: '100%' }}>
              <SearchIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Busca Inteligente</Typography>
              <Typography variant="body1" color="text.secondary">
                Filtre por categoria, local e data para encontrar seu objeto perdido rapidamente no nosso mural.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: 6, bgcolor: 'white', height: '100%' }}>
              <AddPhotoAlternateIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Anúncio com Foto</Typography>
              <Typography variant="body1" color="text.secondary">
                Encontrou algo? Publique uma foto e a localização exata para que o dono identifique na hora.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: 6, bgcolor: 'white', height: '100%' }}>
              <HandshakeIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Comunidade Segura</Typography>
              <Typography variant="body1" color="text.secondary">
                Acesso restrito à comunidade universitária através do login acadêmico, garantindo mais segurança.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default Home;
