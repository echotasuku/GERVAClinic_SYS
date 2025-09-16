import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Modal, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Retirada.css';

const Retiradas = () => {
  const [retiradas, setRetiradas] = useState([]);
  const [novaRetirada, setNovaRetirada] = useState({
    data: '',
    medicamento_id: '',
    farmaceutico_id: '',
    quantidade: '',
    receita: null
  });
  const [showModal, setShowModal] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [retiradaParaEdicao, setRetiradaParaEdicao] = useState(null);
  const [medicamentos, setMedicamentos] = useState([]);
  const [farmaceuticos, setFarmaceuticos] = useState([]);

  // Carregar retiradas, medicamentos e farmacêuticos
  useEffect(() => {
    fetchRetiradas();
    fetchMedicamentos();
    fetchFarmaceuticos();
  }, []);

  // Função para buscar retiradas
  const fetchRetiradas = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get('http://127.0.0.1:8080/api/retiradas', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setRetiradas(response.data);
    } catch (error) {
      console.error('Erro ao buscar retiradas:', error);
    }
  };

  // Função para buscar medicamentos disponíveis
  const fetchMedicamentos = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get('http://127.0.0.1:8080/api/medicamentos-list', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setMedicamentos(response.data);
    } catch (error) {
      console.error('Erro ao buscar medicamentos:', error);
    }
  };

  // Função para buscar farmacêuticos
  const fetchFarmaceuticos = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get('http://127.0.0.1:8080/api/farmaceuticos-list', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setFarmaceuticos(response.data);
    } catch (error) {
      console.error('Erro ao buscar farmacêuticos:', error);
    }
  };

  // Função para manipular inputs de retirada
  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    setNovaRetirada({
      ...novaRetirada,
      [name]: type === 'file' ? files[0] : value
    });
  };

  // Função para submissão do formulário de retirada
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    for (const key in novaRetirada) {
      if (novaRetirada[key] !== null) {
        formData.append(key, novaRetirada[key]);
      }
    }

    try {
      const token = localStorage.getItem('auth_token');
      if (modoEdicao && retiradaParaEdicao) {
        await axios.put(`http://127.0.0.1:8080/api/retiradas/${retiradaParaEdicao.id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });
      } else {
        await axios.post('http://127.0.0.1:8080/api/retiradas', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });
      }

      fetchRetiradas();
      fecharModal();
    } catch (error) {
      console.error('Erro ao criar/editar retirada:', error);
    }
  };

  // Função para abrir o modal
  const abrirModal = () => {
    setShowModal(true);
    setModoEdicao(false);
    setNovaRetirada({
      data: '',
      medicamento_id: '',
      farmaceutico_id: '',
      quantidade: '',
      receita: ''
    });
  };

  // Função para fechar o modal
  const fecharModal = () => {
    setShowModal(false);
    setModoEdicao(false);
    setRetiradaParaEdicao(null);
    setNovaRetirada({
      data: '',
      medicamento_id: '',
      farmaceutico_id: '',
      quantidade: '',
      receita: ''
    });
  };

  // Função para editar retirada
  const handleEditarRetirada = (retirada) => {
    setNovaRetirada({
      data: retirada.data,
      medicamento_id: retirada.medicamento_id,
      farmaceutico_id: retirada.farmaceutico_id,
      quantidade: retirada.quantidade,
      receita: retirada.receita
    });
    setRetiradaParaEdicao(retirada);
    setModoEdicao(true);
    setShowModal(true);
  };

  // Função para excluir retirada
  const handleExcluirRetirada = async (id) => {
    try {
      const token = localStorage.getItem('auth_token');
      await axios.delete(`http://127.0.0.1:8080/api/retiradas/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      fetchRetiradas();
    } catch (error) {
      console.error('Erro ao excluir retirada:', error);
    }
  };

  return (
    <div className="retiradas-container">
      <h2>Retiradas</h2>
      <Button variant="primary" onClick={abrirModal}>Adicionar Retirada</Button>
      <Modal show={showModal} onHide={fecharModal}>
        <Modal.Header closeButton>
          <Modal.Title>{modoEdicao ? 'Editar Retirada' : 'Adicionar Retirada'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleFormSubmit}>
            <Form.Group controlId="formData">
              <Form.Label>Data</Form.Label>
              <Form.Control type="date" name="data" value={novaRetirada.data} onChange={handleInputChange} required />
            </Form.Group>
            <Form.Group controlId="formMedicamento">
              <Form.Label>Medicamento</Form.Label>
              <Form.Control as="select" name="medicamento_id" value={novaRetirada.medicamento_id} onChange={handleInputChange} required>
                <option value="">Selecione um medicamento</option>
                {medicamentos.map((medicamento) => (
                  <option key={medicamento.id} value={medicamento.id}>{medicamento.nome}</option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="formFarmaceutico">
              <Form.Label>Farmacêutico</Form.Label>
              <Form.Control as="select" name="farmaceutico_id" value={novaRetirada.farmaceutico_id} onChange={handleInputChange} required>
                <option value="">Selecione um farmacêutico</option>
                {farmaceuticos.map((farmaceutico) => (
                  <option key={farmaceutico.id} value={farmaceutico.id}>{farmaceutico.id_func} - {farmaceutico.CRF}</option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="formQuantidade">
              <Form.Label>Quantidade</Form.Label>
              <Form.Control type="number" name="quantidade" value={novaRetirada.quantidade} onChange={handleInputChange} required />
            </Form.Group>
            <Form.Group controlId="formReceita">
              <Form.Label>Receita</Form.Label>
              <Form.Control type="file" name="receita" onChange={handleInputChange} />
            </Form.Group>
            <Button variant="primary" type="submit">{modoEdicao ? 'Salvar Alterações' : 'Salvar'}</Button>
          </Form>
        </Modal.Body>
      </Modal>
      <ul className="retiradas-list">
        {retiradas.map((retirada) => (
          <li key={retirada.id} className="retirada-item">
            <div className="retirada-info">
              <span><strong>Data:</strong> {retirada.data}</span>
              <span><strong>Medicamento:</strong> {retirada.medicamento ? retirada.medicamento.nome : 'Desconhecido'}</span>
              <span><strong>Farmacêutico:</strong> {retirada.farmaceutico ? `${retirada.farmaceutico.id_func} - ${retirada.farmaceutico.CRF}` : 'Desconhecido'}</span>
              <span><strong>Quantidade:</strong> {retirada.quantidade}</span>
              <span><strong>Receita:</strong> {retirada.receita ? (
                <a href={`http://127.0.0.1:8080/storage/${retirada.receita}`} target="_blank" rel="noopener noreferrer">Visualizar Receita</a>
              ) : 'Nenhum arquivo anexado'}</span>
            </div>
            <div className="retirada-actions">
              <Button variant="info" onClick={() => handleEditarRetirada(retirada)}>Editar</Button>
              <Button variant="danger" onClick={() => handleExcluirRetirada(retirada.id)} className="ms-2">Excluir</Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Retiradas;
