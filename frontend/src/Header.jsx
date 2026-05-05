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
import AccountCircle from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';

function Header({ 
  usuario, 
  onLogout, 
  onIrParaMural, 
  onIrParaPerfil, 
  onIrParaHome,
  onIrParaLogin,
  onIrParaCadastro 
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
              // Botoes para Usuário NÃO Logado
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
              // Botoes para Usuário LOGADO
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

                <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                  <IconButton
                    size="large"
                    aria-label="account of current user"
                    aria-controls="menu-appbar"
                    aria-haspopup="true"
                    onClick={handleMenu}
                    color="inherit"
                  >
                    <Avatar sx={{ width: 36, height: 36, bgcolor: 'secondary.main', color: 'primary.main', fontWeight: 700 }}>
                      {usuario.nome.charAt(0).toUpperCase()}
                    </Avatar>
                  </IconButton>
                  <Menu
                    id="menu-appbar"
                    anchorEl={anchorEl}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    keepMounted
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                  >
                    <MenuItem onClick={() => { handleClose(); onIrParaPerfil(); }}>Meu Perfil</MenuItem>
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
