import { useState, useEffect } from 'react';
import axios from 'axios';

// O componente Mural recebe os dados do usuário que acabou de logar
function Mural({ usuario }) {
  const [itens, setItens] = useState([]);

  // Função para buscar os itens no backend
  const carregarItens = async () => {
    try {
      const resposta = await axios.get('http://127.0.0.1:8000/itens');
      setItens(resposta.data);
    } catch (erro) {
      console.error("Erro ao carregar itens", erro);
    }
  };

  // O useEffect faz a função carregarItens rodar automaticamente assim que a tela abre
  useEffect(() => {
    carregarItens();
  }, []);

  // Função que o botão vermelho vai chamar
  const deletarItem = async (itemId) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/itens/${itemId}?usuario_id=${usuario.id}`);
      alert("Anúncio excluído com sucesso!");
      carregarItens(); // Recarrega o mural para o item sumir da tela
    } catch (erro) {
      alert("Erro ao excluir: " + erro.response.data.detail);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Mural de Achados e Perdidos</h2>
      <p>Logado como: <strong>{usuario.nome}</strong> {usuario.is_admin ? '(👑 Admin)' : ''}</p>
      
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '20px' }}>
        {itens.map((item) => (
          <div key={item.id} style={{ border: '1px solid #ccc', padding: '15px', width: '250px', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
            <h3>{item.titulo}</h3>
            <p><strong>Local:</strong> {item.local_encontrado}</p>
            <p><strong>Descrição:</strong> {item.descricao}</p>
            
            {/* A REGRA DE NEGÓCIO DA US06 (RENDERIZAÇÃO CONDICIONAL) */}
            {/* O botão SÓ aparece se o usuário for Admin OU for o dono do item */}
            {(usuario.is_admin || usuario.id === item.dono_id) && (
              <button 
                onClick={() => deletarItem(item.id)}
                style={{ backgroundColor: '#cc0000', color: 'white', padding: '8px', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%', marginTop: '10px' }}
              >
                🗑️ Excluir Anúncio
              </button>
            )}

          </div>
        ))}
      </div>
    </div>
  );
}

export default Mural;