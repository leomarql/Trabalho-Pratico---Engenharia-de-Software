import { useState } from 'react';
import axios from 'axios';

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');

  const fazerLogin = async (e) => {
    e.preventDefault(); // Evita que a página recarregue ao enviar o formulário
    
    try {
      // Fazendo a requisição POST para a sua API Python
      const resposta = await axios.post('http://127.0.0.1:8000/login', {
        email: email,
        senha: senha
      });
      
      // Se der certo (Código 200)
      setMensagem(`✅ ${resposta.data.mensagem} Bem-vindo, ${resposta.data.nome}!`);
    } catch (erro) {
      // Se der erro (Código 401 - Senha incorreta)
      if (erro.response) {
        setMensagem(`❌ Erro: ${erro.response.data.detail}`);
      } else {
        setMensagem("❌ Erro de conexão com o servidor.");
      }
    }
  };

  return (
    <div style={{ padding: '50px', fontFamily: 'sans-serif' }}>
      <h2>Login - Achados e Perdidos UFMG</h2>
      
      <form onSubmit={fazerLogin} style={{ display: 'flex', flexDirection: 'column', width: '300px' }}>
        <label>E-mail Acadêmico:</label>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="seu@ufmg.br"
          required
          style={{ marginBottom: '10px', padding: '8px' }}
        />

        <label>Senha:</label>
        <input 
          type="password" 
          value={senha} 
          onChange={(e) => setSenha(e.target.value)} 
          placeholder="Sua senha"
          required
          style={{ marginBottom: '20px', padding: '8px' }}
        />

        <button type="submit" style={{ padding: '10px', backgroundColor: '#00529b', color: 'white', border: 'none', cursor: 'pointer' }}>
          Entrar
        </button>
      </form>

      {/* Exibe a mensagem de sucesso ou erro aqui */}
      {mensagem && <p style={{ marginTop: '20px', fontWeight: 'bold' }}>{mensagem}</p>}
    </div>
  );
}

export default Login;