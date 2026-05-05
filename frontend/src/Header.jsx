import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Box, 
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Container
} from '@mui/material';
import { useState } from 'react';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ListAltIcon from '@mui/icons-material/ListAlt';

function Header({ 
  usuario, 
  onLogout, 
  onIrParaMural, 
  onIrParaPerfil, 
  onIrParaHome,
  onIrParaLogin,
  onIrParaCadastro,
  onIrParaMeusAnuncios
}) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'white', color: 'primary.main', borderBottom: '1px solid #eee' }}>
      <Container maxWidth="lg">
        <Toolbar sx={{ px: { xs: 0 } }}>
          {/* Logo e Nome do Sistema */}
          <Box 
            sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1, cursor: 'pointer' }} 
            onClick={onIrParaHome}
          >
            <Box 
              component="img"
              src="./src/assets/Logo/icon.png"
              alt="Logo Recoopere"
              sx={{ width: 40, height: 40 }}
            />
            <Typography 
              variant="h5" 
              component="div" 
              sx={{ 
                fontWeight: 800, 
                letterSpacing: '-0.5px',
                display: { xs: 'none', sm: 'block' } 
              }}
            >
              Recoopere
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {!usuario ? (
              <>
                <Button color="inherit" onClick={onIrParaLogin} sx={{ fontWeight: 600 }}>
                  Entrar
                </Button>
                <Button 
                  variant="contained" 
                  color="secondary" 
                  onClick={onIrParaCadastro}
                  sx={{ fontWeight: 700, borderRadius: 2, color: 'primary.main' }}
                >
                  Cadastrar
                </Button>
              </>
            ) : (
              <>
                <Tooltip title="Mural de Itens">
                  <Button 
                    startIcon={<DashboardIcon />} 
                    color="inherit" 
                    onClick={onIrParaMural}
                    sx={{ fontWeight: 600 }}
                  >
                    Mural
                  </Button>
                </Tooltip>

                <Button 
                  startIcon={<ListAltIcon />}
                  color="inherit" 
                  onClick={onIrParaMeusAnuncios}
                  sx={{ fontWeight: 600, display: { xs: 'none', md: 'flex' } }}
                >
                  Meus Anúncios
                </Button>

                <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                  <IconButton
                    size="large"
                    onClick={handleMenu}
                    color="inherit"
                  >
                    <Avatar sx={{ width: 36, height: 36, bgcolor: 'secondary.main', color: 'primary.main', fontWeight: 700 }}>
                      {usuario.nome.charAt(0).toUpperCase()}
                    </Avatar>
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                  >
                    <MenuItem onClick={() => { handleClose(); onIrParaPerfil(); }}>Meu Perfil</MenuItem>
                    <MenuItem onClick={() => { handleClose(); onIrParaMeusAnuncios(); }} sx={{ display: { md: 'none' } }}>Meus Anúncios</MenuItem>
                    <MenuItem onClick={() => { handleClose(); onLogout(); }}>Sair</MenuItem>
                  </Menu>
                </Box>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Header;
