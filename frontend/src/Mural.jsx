import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import CadastroItem from './CadastroItem';

const CATEGORIAS = [
  { label: 'Todos', valor: '' },
  { label: 'Eletrônicos', valor: 'Eletrônicos' },
  { label: 'Documentos', valor: 'Documentos' },
  { label: 'Roupas', valor: 'Roupas' },
  { label: 'Outros', valor: 'Outros' },
];

const getBtnStyle = (ativo) => ({
  padding: '8px 16px',
  cursor: 'pointer',
  backgroundColor: ativo ? '#00529b' : '#eee',
  color: ativo ? 'white' : 'black',
  border: 'none',
  borderRadius: '4px',
});

// O componente Mural recebe os dados do usuário que acabou de logar
function Mural({ usuario }) {
  const [itens, setItens] = useState([]);
  // Começa vazio, o que significa que vai mostrar "Todos"
  const [filtro, setFiltro] = useState("");

  // Função para buscar os itens do backend (História 2)
  const carregarItens = useCallback(async () => {
    try {
      const resposta = await axios.get(
        'http://127.0.0.1:8000/itens',
        { params: filtro ? { categoria: filtro } : {} }
      );
      setItens(resposta.data);
    } catch (erro) {
      console.error("Erro ao buscar itens", erro);
    }
  }, [filtro]);

  // Função para marcar como devolvido (História 4)
  const marcarDevolvido = async (itemId) => {
    try {
      await axios.patch(`http://127.0.0.1:8000/itens/${itemId}/devolver?usuario_id=${usuario.id}`);
      alert("Item marcado como devolvido!");
      carregarItens(); // Recarrega para o item sumir (conforme regra do backend)
    } catch (erro) {
      alert("Erro ao marcar como devolvido: " + (erro.response?.data?.detail || "Erro desconhecido"));
    }
  };

  // O useEffect faz a função carregarItens rodar automaticamente assim que a tela abre
  useEffect(() => {
    carregarItens();
  }, [carregarItens]); // carregarItens já depende de filtro via useCallback

  // Função que o botão vermelho vai chamar
  const deletarItem = async (itemId) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/itens/${itemId}?usuario_id=${usuario.id}`);
      alert("Anúncio excluído com sucesso!");
      carregarItens(); // Recarrega o mural para o item sumir da tela
    } catch (erro) {
      alert("Erro ao excluir: " + (erro.response?.data?.detail || "Erro desconhecido"));
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Últimos itens encontrados</h2>
      <p>Logado como: <strong>{usuario.nome}</strong> {usuario.is_admin ? '(👑 Admin)' : ''}</p>
      
      {/* Formulário de cadastro para a História 1 */}
      <CadastroItem usuario={usuario} onSucesso={carregarItens} />
      
      {/* Filtros de categoria para a História 2 */}
      <div aria-label="Filtros de categoria" style={{ marginTop: '30px', marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {CATEGORIAS.map(({ label, valor }) => (
          <button
            key={label}
            onClick={() => setFiltro(valor)}
            aria-pressed={filtro === valor}
            style={getBtnStyle(filtro === valor)}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '20px' }}>
        {itens.length === 0 ? <p>Nenhum item encontrado no momento.</p> : itens.map((item) => (
          <div key={item.id} style={{ border: '1px solid #ccc', padding: '15px', width: '250px', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
            
            {/* Exibe a foto se ela existir (História 1) */}
            {item.imagem_url && (
              <img 
                src={`http://127.0.0.1:8000/${item.imagem_url}`} 
                alt={item.titulo} 
                style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px', marginBottom: '10px' }} 
              />
            )}

            <h3>{item.titulo}</h3>
            <p><strong>Local:</strong> {item.local_encontrado}</p>
            <p><strong>Descrição:</strong> {item.descricao}</p>
            
            {/* O botão "Devolvido" SÓ aparece se o usuário for o dono do item (História 4) */}
            {usuario.id === item.dono_id && (
              <button 
                onClick={() => marcarDevolvido(item.id)}
                style={{ backgroundColor: '#28a745', color: 'white', padding: '8px', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%', marginTop: '10px' }}
              >
                ✅ Marcar como Devolvido
              </button>
            )}

            {/* A REGRA DE NEGÓCIO DA US06 (RENDERIZAÇÃO CONDICIONAL) */}
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
