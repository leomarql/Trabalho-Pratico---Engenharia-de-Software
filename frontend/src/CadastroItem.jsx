import { useState } from 'react';
import axios from 'axios';
import { 
  Box, 
  Button, 
  TextField, 
  MenuItem, 
  Typography, 
  Stack
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import dayjs from 'dayjs';

function CadastroItem({ usuario, onSucesso }) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('Outros');
  const [local, setLocal] = useState('');
  const [dataEncontrado, setDataEncontrado] = useState(dayjs());
  const [imagem, setImagem] = useState(null);
  const [nomeArquivo, setNomeArquivo] = useState('');

  const categorias = ['Eletrônicos', 'Documentos', 'Roupas', 'Outros'];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagem(file);
      setNomeArquivo(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('descricao', descricao);
    formData.append('categoria', categoria);
    formData.append('local_encontrado', local);
    formData.append('data_encontrado', dataEncontrado ? dataEncontrado.toISOString() : '');
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
      onSucesso();
    } catch (erro) {
      alert('Erro ao cadastrar item: ' + (erro.response?.data?.detail || erro.message));
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
      <Stack spacing={2}>
        <TextField
          label="O que você encontrou?"
          fullWidth
          required
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />
        
        <TextField
          label="Descrição detalhada"
          fullWidth
          multiline
          rows={3}
          required
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            select
            label="Categoria"
            fullWidth
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          >
            {categorias.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>

          <DatePicker
            label="Data que encontrou"
            value={dataEncontrado}
            onChange={(newValue) => setDataEncontrado(newValue)}
            sx={{ width: '100%' }}
          />
        </Stack>

        <TextField
          label="Onde você encontrou?"
          fullWidth
          required
          value={local}
          onChange={(e) => setLocal(e.target.value)}
        />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1, border: '1px dashed #ccc', borderRadius: 2 }}>
          <Button
            variant="outlined"
            component="label"
            startIcon={<PhotoCamera />}
          >
            Anexar Foto
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleFileChange}
            />
          </Button>
          <Typography variant="caption" color="text.secondary">
            {nomeArquivo || 'Nenhuma foto selecionada'}
          </Typography>
        </Box>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          sx={{ mt: 2, py: 1.5, borderRadius: 2, fontWeight: 700 }}
        >
          Publicar Anúncio
        </Button>
      </Stack>
    </Box>
  );
}

export default CadastroItem;
