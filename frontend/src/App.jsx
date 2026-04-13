import { useState } from 'react';
import Login from './Login';
import Cadastro from './Cadastro';
import Mural from './Mural';

function App() {
  // Esse estado guarda quem está usando o sistema. Começa "vazio" (null)
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  // Alterna entre login e cadastro quando ainda não há sessão
  const [telaAuth, setTelaAuth] = useState('login');

  return (
    <div>
      {/* Se NÃO tiver usuário logado, mostra Login ou Cadastro */}
      {!usuarioLogado ? (
        telaAuth === 'login' ? (
          <Login
            onLoginSucesso={(dadosUsuario) => setUsuarioLogado(dadosUsuario)}
            onIrParaCadastro={() => setTelaAuth('cadastro')}
          />
        ) : (
          <Cadastro onVoltarLogin={() => setTelaAuth('login')} />
        )
      ) : (
        /* Se TIVER usuário logado, mostra a tela do Mural e passa os dados pra ele */
        <Mural usuario={usuarioLogado} />
      )}
    </div>
  );
}

export default App;