import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Modal, Form, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Retirada.css';

const Retiradas = () => {
    // ... (toda a sua lógica de state, useEffect e funções handle... continua a mesma)
    // NENHUMA ALTERAÇÃO NECESSÁRIA AQUI EM CIMA
  const [retiradas, setRetiradas] = useState([]);
  const [novaRetirada, setNovaRetirada] = useState({
    data: '', medicamento_id: '', farmaceutico_id: '', quantidade: '', receita: null
  });
  const [showModal, setShowModal] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [retiradaParaEdicao, setRetiradaParaEdicao] = useState(null);
  const [medicamentos, setMedicamentos] = useState([]);
  const [farmaceuticos, setFarmaceuticos] = useState([]);

  useEffect(() => {
    fetchRetiradas();
    fetchMedicamentos();
    fetchFarmaceuticos();
  }, []);

  const fetchRetiradas = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get('http://127.0.0.1:8080/api/retiradas', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRetiradas(response.data);
    } catch (error) {
      console.error('Erro ao buscar retiradas:', error);
    }
  };

  const fetchMedicamentos = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get('http://127.0.0.1:8080/api/medicamentos-list', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMedicamentos(response.data);
    } catch (error) {
      console.error('Erro ao buscar medicamentos:', error);
    }
  };

  const fetchFarmaceuticos = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get('http://127.0.0.1:8080/api/farmaceuticos-list', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFarmaceuticos(response.data);
    } catch (error) {
      console.error('Erro ao buscar farmacêuticos:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    setNovaRetirada({
      ...novaRetirada,
      [name]: type === 'file' ? files[0] : value
    });
  };

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
      const headers = { 
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`
      };
      if (modoEdicao && retiradaParaEdicao) {
        formData.append('_method', 'PUT');
        await axios.post(`http://127.0.0.1:8080/api/retiradas/${retiradaParaEdicao.id}`, formData, { headers });
      } else {
        await axios.post('http://127.0.0.1:8080/api/retiradas', formData, { headers });
      }

      fetchRetiradas();
      fecharModal();
    } catch (error) {
      console.error('Erro ao criar/editar retirada:', error);
    }
  };

  const abrirModal = () => {
    setShowModal(true);
    setModoEdicao(false);
    setNovaRetirada({ data: '', medicamento_id: '', farmaceutico_id: '', quantidade: '', receita: null });
  };

  const fecharModal = () => {
    setShowModal(false);
    setModoEdicao(false);
    setRetiradaParaEdicao(null);
    setNovaRetirada({ data: '', medicamento_id: '', farmaceutico_id: '', quantidade: '', receita: null });
  };

  const handleEditarRetirada = (retirada) => {
    const dataFormatada = retirada.data ? new Date(retirada.data).toISOString().split('T')[0] : '';
    setNovaRetirada({ ...retirada, data: dataFormatada, receita: null });
    setRetiradaParaEdicao(retirada);
    setModoEdicao(true);
    setShowModal(true);
  };

  const handleExcluirRetirada = async (id) => {
    try {
      const token = localStorage.getItem('auth_token');
      await axios.delete(`http://127.0.0.1:8080/api/retiradas/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
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

            <Modal
                show={showModal}
                onHide={fecharModal}
                centered
                dialogClassName="custom-modal-width"
                className="retiradas-modal-theme"   
            >
                <Modal.Header closeButton>
                    <Modal.Title>{modoEdicao ? 'Editar Retirada' : 'Adicionar Retirada'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleFormSubmit}>
                        <Row className="mb-3">
                            <Form.Group as={Col} md="8" controlId="formMedicamento">
                                <Form.Label>Medicamento</Form.Label>
                                <Form.Select name="medicamento_id" value={novaRetirada.medicamento_id} onChange={handleInputChange} required>
                                    <option value="">Selecione um medicamento</option>
                                    {medicamentos.map((medicamento) => (
                                        <option key={medicamento.id} value={medicamento.id}>{medicamento.nome}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                            <Form.Group as={Col} md="4" controlId="formQuantidade">
                                <Form.Label>Quantidade</Form.Label>
                                <Form.Control type="number" name="quantidade" placeholder="Qtd." value={novaRetirada.quantidade} onChange={handleInputChange} required />
                            </Form.Group>
                        </Row>
                        <Row className="mb-3">
                            <Form.Group as={Col} md="8" controlId="formFarmaceutico">
                                <Form.Label>Farmacêutico Responsável</Form.Label>
                                <Form.Select name="farmaceutico_id" value={novaRetirada.farmaceutico_id} onChange={handleInputChange} required>
                                    <option value="">Selecione um farmacêutico</option>
                                    {farmaceuticos.map((farmaceutico) => (
                                        <option key={farmaceutico.id} value={farmaceutico.id}>{farmaceutico.id_func} - {farmaceutico.CRF}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                            <Form.Group as={Col} md="4" controlId="formData">
                                <Form.Label>Data da Retirada</Form.Label>
                                <Form.Control type="date" name="data" value={novaRetirada.data} onChange={handleInputChange} required />
                            </Form.Group>
                        </Row>
                        <Form.Group controlId="formReceita" className="mb-3">
                            <Form.Label>Anexar Receita (Opcional)</Form.Label>
                            <Form.Control type="file" name="receita" onChange={handleInputChange} />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={fecharModal}>Cancelar</Button>
                    <Button variant="primary" onClick={handleFormSubmit}>
                        {modoEdicao ? 'Salvar Alterações' : 'Salvar'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* AQUI ESTÁ A MUDANÇA: de Lista (ul) para Tabela (table) */}
            <table className="retiradas-table">
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Medicamento</th>
                        <th>Qtd.</th>
                        <th>Farmacêutico</th>
                        <th>Receita</th>
                        <th className="text-center">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {retiradas.map((retirada) => (
                        <tr key={retirada.id}>
                            <td>{new Date(retirada.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                            <td>{retirada.medicamento ? retirada.medicamento.nome : 'Desconhecido'}</td>
                            <td>{retirada.quantidade}</td>
                            <td>{retirada.farmaceutico ? retirada.farmaceutico.CRF : 'Desconhecido'}</td>
                            <td>
                                {retirada.receita ? (
                                    <a href={`http://127.0.0.1:8080/storage/${retirada.receita}`} target="_blank" rel="noopener noreferrer">Visualizar</a>
                                ) : 'N/A'}
                            </td>
                            <td className="actions-cell">
                                <Button variant="info" size="sm" onClick={() => handleEditarRetirada(retirada)}>Editar</Button>
                                <Button variant="danger" size="sm" onClick={() => handleExcluirRetirada(retirada.id)} className="ms-2">Excluir</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Retiradas;