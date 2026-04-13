import { useState } from 'react';
import axios from 'axios';

function CadastroItem({ usuario, onSucesso }) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('Outros');
  const [local, setLocal] = useState('');
  const [imagem, setImagem] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // FormData é necessário para enviar arquivos (fotos) para o servidor
    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('descricao', descricao);
    formData.append('categoria', categoria);
    formData.append('local_encontrado', local);
    formData.append('dono_id', usuario.id);
    if (imagem) {
      formData.append('imagem', imagem);
    }

    try {
      await axios.post('http://127.0.0.1:8000/itens', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Item cadastrado com sucesso!');
      onSucesso(); // Recarrega o mural
      // Limpa o formulário
      setTitulo('');
      setDescricao('');
      setLocal('');
      setImagem(null);
    } catch (erro) {
      alert('Erro ao cadastrar item: ' + erro.response?.data?.detail || erro.message);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '20px', backgroundColor: '#fff' }}>
      <h3>📢 Anunciar Item Encontrado</h3>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="O que você encontrou?" value={titulo} onChange={(e) => setTitulo(e.target.value)} required style={styles.input} />
        <textarea placeholder="Descrição (cor, marca, detalhes...)" value={descricao} onChange={(e) => setDescricao(e.target.value)} required style={styles.input} />
        
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)} style={styles.input}>
          <option value="Eletrônicos">Eletrônicos</option>
          <option value="Documentos">Documentos</option>
          <option value="Roupas">Roupas</option>
          <option value="Outros">Outros</option>
        </select>

        <input type="text" placeholder="Onde você encontrou?" value={local} onChange={(e) => setLocal(e.target.value)} required style={styles.input} />
        
        <div style={{ marginBottom: '10px' }}>
          <label><strong>Foto do Item:</strong></label><br />
          <input type="file" accept="image/*" onChange={(e) => setImagem(e.target.files[0])} style={{ marginTop: '5px' }} />
        </div>

        <button type="submit" style={styles.botao}>Publicar Anúncio</button>
      </form>
    </div>
  );
}

const styles = {
  input: { display: 'block', width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc' },
  botao: { backgroundColor: '#007bff', color: 'white', padding: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%' }
};

export default CadastroItem;
