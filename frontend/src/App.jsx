import { useState } from 'react';
import Login from './Login';
import Mural from './Mural';

function App() {
  // Esse estado guarda quem está usando o sistema. Começa "vazio" (null)
  const [usuarioLogado, setUsuarioLogado] = useState(null);

  return (
    <div>
      {/* Se NÃO tiver usuário logado, mostra a tela de Login */}
      {!usuarioLogado ? (
        <Login onLoginSucesso={(dadosUsuario) => setUsuarioLogado(dadosUsuario)} />
      ) : (
        /* Se TIVER usuário logado, mostra a tela do Mural e passa os dados pra ele */
        <Mural usuario={usuarioLogado} />
      )}
    </div>
  );
}

export default App;