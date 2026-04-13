import { useState } from 'react';
import axios from 'axios';

function detalheErro(erro) {
  if (!erro.response?.data) return 'Erro de conexão com o servidor.';
  const d = erro.response.data.detail;
  if (typeof d === 'string') return d;
  if (Array.isArray(d)) return d.map((e) => e.msg || String(e)).join(' ');
  return 'Erro ao cadastrar.';
}

function Cadastro({ onVoltarLogin }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');

  const cadastrar = async (e) => {
    e.preventDefault();
    setMensagem('');

    try {
      await axios.post('http://127.0.0.1:8000/usuarios', {
        nome,
        email,
        senha,
      });
      setMensagem('✅ Conta criada! Você já pode entrar com seu e-mail e senha.');
      setNome('');
      setEmail('');
      setSenha('');
    } catch (erro) {
      setMensagem(`❌ ${detalheErro(erro)}`);
    }
  };

  return (
    <div style={{ padding: '50px', fontFamily: 'sans-serif' }}>
      <h2>Criar conta - Achados e Perdidos UFMG</h2>
      <p style={{ maxWidth: '400px', color: '#444' }}>
        Use um e-mail que termine com <strong>@ufmg.br</strong>.
      </p>

      <form onSubmit={cadastrar} style={{ display: 'flex', flexDirection: 'column', width: '300px' }}>
        <label>Nome:</label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Seu nome"
          required
          style={{ marginBottom: '10px', padding: '8px' }}
        />

        <label>E-mail acadêmico:</label>
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
          placeholder="Escolha uma senha"
          required
          style={{ marginBottom: '20px', padding: '8px' }}
        />

        <button type="submit" style={{ padding: '10px', backgroundColor: '#00529b', color: 'white', border: 'none', cursor: 'pointer' }}>
          Cadastrar
        </button>
      </form>

      <button
        type="button"
        onClick={onVoltarLogin}
        style={{ marginTop: '16px', padding: '8px 12px', cursor: 'pointer', background: 'transparent', border: '1px solid #00529b', color: '#00529b' }}
      >
        Voltar ao login
      </button>

      {mensagem && <p style={{ marginTop: '20px', fontWeight: 'bold' }}>{mensagem}</p>}
    </div>
  );
}

export default Cadastro;
