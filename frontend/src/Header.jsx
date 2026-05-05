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
  Container,
  Divider
} from '@mui/material';
import { useState } from 'react';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ListAltIcon from '@mui/icons-material/ListAlt';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import ArchiveIcon from '@mui/icons-material/Archive';

function Header({ 
  usuario, 
  onLogout, 
  onIrParaMural, 
  onIrParaPerfil, 
  onIrParaHome,
  onIrParaLogin,
  onIrParaCadastro,
  onIrParaMeusAnuncios,
  onIrParaArquivados,
  darkMode,
  toggleDarkMode
}) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="sticky" elevation={0} sx={{ bgcolor: darkMode ? 'background.paper' : 'white', color: 'primary.main', borderBottom: '1px solid', borderColor: 'divider' }}>
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
                display: { xs: 'none', sm: 'block' },
                color: '#00529b' // Azul fixo para o nome
              }}
            >
              Recoopere
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* TEMA DARK TOGGLE */}
            <Tooltip title={darkMode ? "Ativar Luz" : "Ativar Noite"}>
              <IconButton onClick={toggleDarkMode} color="inherit">
                {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>

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
                <Tooltip title="Mural">
                  <IconButton color="inherit" onClick={onIrParaMural}>
                    <DashboardIcon />
                  </IconButton>
                </Tooltip>

                <Button 
                  startIcon={<ListAltIcon />}
                  color="inherit" 
                  onClick={onIrParaMeusAnuncios}
                  sx={{ fontWeight: 600, display: { xs: 'none', md: 'flex' } }}
                >
                  Meus Anúncios
                </Button>

                <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                  <IconButton
                    onClick={handleMenu}
                    color="inherit"
                  >
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main', color: 'primary.main', fontWeight: 700, fontSize: '0.9rem' }}>
                      {usuario?.nome ? usuario.nome.charAt(0).toUpperCase() : 'U'}
                    </Avatar>
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  >
                    <MenuItem onClick={() => { handleClose(); onIrParaPerfil(); }}>Editar Perfil</MenuItem>
                    <MenuItem onClick={() => { handleClose(); onIrParaArquivados(); }}>
                      <ArchiveIcon sx={{ mr: 1, fontSize: 20 }} /> Itens Devolvidos
                    </MenuItem>
                    <MenuItem onClick={() => { handleClose(); onIrParaMeusAnuncios(); }} sx={{ display: { md: 'none' } }}>Meus Anúncios</MenuItem>
                    <Divider />
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
