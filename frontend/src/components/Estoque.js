import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Modal, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Estoque.css'; // Arquivo CSS para estilização específica

const Estoque = () => {
  const [estoque, setEstoque] = useState([]);
  const [medicamentos, setMedicamentos] = useState([]); // Armazena os medicamentos disponíveis
  const [novoEstoque, setNovoEstoque] = useState({
    lote: '',
    data_validade: '',
    quantidade_estoque: '',
    preco: '',
    medicamento_id: '' // Medicamento será selecionado do select
  });
  const [showModal, setShowModal] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [estoqueParaEdicao, setEstoqueParaEdicao] = useState(null);

  useEffect(() => {
    fetchEstoque();
    fetchMedicamentos(); // Buscar medicamentos ao carregar o componente
  }, []);

  // Função para buscar o estoque
  const fetchEstoque = async () => {
    try {
      const token = localStorage.getItem('auth_token'); // Obtém o token do localStorage
      const response = await axios.get('http://127.0.0.1:8080/api/estoque', {
        headers: {
          Authorization: `Bearer ${token}` // Adiciona o token no cabeçalho
        }
      });
      setEstoque(response.data);
    } catch (error) {
      console.error('Erro ao buscar estoque:', error);
    }
  };

  // Função para buscar medicamentos
  const fetchMedicamentos = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get('http://127.0.0.1:8080/api/medicamentos', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setMedicamentos(response.data); // Armazena os medicamentos na variável de estado
    } catch (error) {
      console.error('Erro ao buscar medicamentos:', error);
    }
  };

  const handleInputChange = (e) => {
    setNovoEstoque({
      ...novoEstoque,
      [e.target.name]: e.target.value
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('auth_token'); // Obtém o token do localStorage

      if (modoEdicao && estoqueParaEdicao) {
        await axios.put(`http://127.0.0.1:8080/api/estoque/${estoqueParaEdicao.id}`, novoEstoque, {
          headers: {
            Authorization: `Bearer ${token}` // Adiciona o token no cabeçalho
          }
        });
      } else {
        await axios.post('http://127.0.0.1:8080/api/estoque', novoEstoque, {
          headers: {
            Authorization: `Bearer ${token}` // Adiciona o token no cabeçalho
          }
        });
      }

      fetchEstoque();
      setShowModal(false); // Fecha o modal após enviar o formulário
      setNovoEstoque({
        lote: '',
        data_validade: '',
        quantidade_estoque: '',
        preco: '',
        medicamento_id: ''
      });
      setModoEdicao(false);
      setEstoqueParaEdicao(null);
    } catch (error) {
      console.error('Erro ao criar/editar estoque:', error);
    }
  };

  const abrirModal = () => {
    setShowModal(true);
    setModoEdicao(false);
    setEstoqueParaEdicao(null);
  };

  const fecharModal = () => {
    setShowModal(false);
    setModoEdicao(false);
    setEstoqueParaEdicao(null);
    setNovoEstoque({
      lote: '',
      data_validade: '',
      quantidade_estoque: '',
      preco: '',
      medicamento_id: ''
    });
  };

  const handleEditarEstoque = (item) => {
    setNovoEstoque({
      lote: item.lote,
      data_validade: item.data_validade,
      quantidade_estoque: item.quantidade_estoque,
      preco: item.preco,
      medicamento_id: item.medicamento_id
    });
    setEstoqueParaEdicao(item);
    setModoEdicao(true);
    setShowModal(true);
  };

  const handleExcluirEstoque = async (item) => {
    try {
      const token = localStorage.getItem('auth_token'); // Obtém o token do localStorage
      await axios.delete(`http://127.0.0.1:8080/api/estoque/${item.id}`, {
        headers: {
          Authorization: `Bearer ${token}` // Adiciona o token no cabeçalho
        }
      });
      fetchEstoque();
    } catch (error) {
      console.error('Erro ao excluir estoque:', error);
    }
  };

  return (
    <div className="estoque-container">
      <h2>Estoque</h2>

      {/* Botão para abrir o modal de adicionar estoque */}
      <Button variant="primary" onClick={abrirModal}>Adicionar Estoque</Button>

      {/* Modal para adicionar/editar estoque */}
      <Modal show={showModal} onHide={fecharModal}>
        <Modal.Header closeButton>
          <Modal.Title>{modoEdicao ? 'Editar Estoque' : 'Adicionar Estoque'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleFormSubmit}>
            <Form.Group controlId="formLote">
              <Form.Label>Lote</Form.Label>
              <Form.Control type="text" name="lote" placeholder="Lote" value={novoEstoque.lote} onChange={handleInputChange} required />
            </Form.Group>
            <Form.Group controlId="formDataValidade">
              <Form.Label>Data de Validade</Form.Label>
              <Form.Control type="date" name="data_validade" placeholder="Data de Validade" value={novoEstoque.data_validade} onChange={handleInputChange} required />
            </Form.Group>
            <Form.Group controlId="formQuantidadeEstoque">
              <Form.Label>Quantidade em Estoque</Form.Label>
              <Form.Control type="number" name="quantidade_estoque" placeholder="Quantidade em Estoque" value={novoEstoque.quantidade_estoque} onChange={handleInputChange} required />
            </Form.Group>
            <Form.Group controlId="formPreco">
              <Form.Label>Preço</Form.Label>
              <Form.Control type="number" step="0.01" name="preco" placeholder="Preço" value={novoEstoque.preco} onChange={handleInputChange} required />
            </Form.Group>
            <Form.Group controlId="formMedicamentoId">
              <Form.Label>Medicamento</Form.Label>
              <Form.Control as="select" name="medicamento_id" value={novoEstoque.medicamento_id} onChange={handleInputChange} required>
                <option value="">Selecione um Medicamento</option>
                {medicamentos.map((medicamento) => (
                  <option key={medicamento.id} value={medicamento.id}>{medicamento.nome}</option>
                ))}
              </Form.Control>
            </Form.Group>
            <Button variant="primary" type="submit">{modoEdicao ? 'Salvar Alterações' : 'Salvar'}</Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Lista de estoque */}
      <ul className="estoque-list">
        {estoque.map((item) => (
          <li key={item.id} className="estoque-item">
            <div className="estoque-info">
              <span><strong>Lote:</strong> {item.lote}</span>
              <span><strong>Data de Validade:</strong> {item.data_validade}</span>
              <span><strong>Quantidade em Estoque:</strong> {item.quantidade_estoque}</span>
              <span><strong>Preço:</strong> {item.preco}</span>
              <span><strong>Medicamento:</strong> {item.medicamento_id}</span>
            </div>
            <div className="estoque-actions">
              <Button variant="info" onClick={() => handleEditarEstoque(item)}>Editar</Button>
              <Button variant="danger" onClick={() => handleExcluirEstoque(item)} className="ms-2">Excluir</Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Estoque;
