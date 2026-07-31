import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Modal, Form, Col, Row } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './AgendamentoVacina.css';

const AgendamentoVacina = () => {
  const [agendamentos, setAgendamentos] = useState([]);
  const [aplicacoes, setAplicacoes] = useState([]);
  const [novoAgendamento, setNovoAgendamento] = useState({
    aplicacao_id: '',
    data_prevista: '',
    status: 'pendente',
    observacoes: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [agendamentoParaEdicao, setAgendamentoParaEdicao] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchAgendamentos();
    fetchAplicacoes();
  }, []);

  const fetchAgendamentos = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get('http://127.0.0.1:8080/api/agendamentos-vacinas', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAgendamentos(response.data);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
    }
  };

  const fetchAplicacoes = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get('http://127.0.0.1:8080/api/aplicacoes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAplicacoes(response.data);
    } catch (error) {
      console.error('Erro ao buscar aplicações:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNovoAgendamento({ ...novoAgendamento, [name]: value });
    if (!!errors[name]) {
      setErrors(prevErrors => ({ ...prevErrors, [name]: null }));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('auth_token');
      const headers = { Authorization: `Bearer ${token}` };
      if (modoEdicao && agendamentoParaEdicao) {
        await axios.put(`http://127.0.0.1:8080/api/agendamentos-vacinas/${agendamentoParaEdicao.id}`, novoAgendamento, { headers });
      } else {
        await axios.post('http://127.0.0.1:8080/api/agendamentos-vacinas', novoAgendamento, { headers });
      }
      fetchAgendamentos();
      fecharModal();
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
    }
  };

  const abrirModal = () => {
    setShowModal(true);
    setModoEdicao(false);
    setAgendamentoParaEdicao(null);
  };

  const fecharModal = () => {
    setShowModal(false);
    setModoEdicao(false);
    setAgendamentoParaEdicao(null);
    setNovoAgendamento({
      aplicacao_id: '',
      data_prevista: '',
      status: 'pendente',
      observacoes: ''
    });
    setErrors({});
  };

  const handleEditarAgendamento = (item) => {
    const dataFormatada = item.data_prevista ? new Date(item.data_prevista).toISOString().split('T')[0] : '';
    setNovoAgendamento({ ...item, data_prevista: dataFormatada });
    setAgendamentoParaEdicao(item);
    setModoEdicao(true);
    setShowModal(true);
  };

  const handleExcluirAgendamento = async (item) => {
    try {
      const token = localStorage.getItem('auth_token');
      await axios.delete(`http://127.0.0.1:8080/api/agendamentos-vacinas/${item.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAgendamentos();
    } catch (error) {
      console.error('Erro ao excluir agendamento:', error);
    }
  };

  return (
    <div className="agendamento-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Agendamentos de Vacinas</h2>
        <Button variant="primary" onClick={abrirModal}>Novo Agendamento</Button>
      </div>

      <Modal show={showModal} onHide={fecharModal} centered dialogClassName="custom-modal-width" className="agendamento-modal-theme">
        <Modal.Header closeButton>
          <Modal.Title>{modoEdicao ? 'Editar Agendamento' : 'Novo Agendamento'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleFormSubmit}>
            <Form.Group className="mb-3" controlId="formAplicacaoId">
              <Form.Label>Aplicação</Form.Label>
              <Form.Select name="aplicacao_id" value={novoAgendamento.aplicacao_id} onChange={handleInputChange} required>
                <option value="">Selecione uma aplicação</option>
                {aplicacoes.map((aplicacao) => (
                  <option key={aplicacao.id} value={aplicacao.id}>{aplicacao.nome || `Aplicação #${aplicacao.id}`}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Row className="mb-3">
              <Form.Group as={Col} md="6" controlId="formDataPrevista">
                <Form.Label>Data Prevista</Form.Label>
                <Form.Control type="date" name="data_prevista" value={novoAgendamento.data_prevista} onChange={handleInputChange} required />
              </Form.Group>
              <Form.Group as={Col} md="6" controlId="formStatus">
                <Form.Label>Status</Form.Label>
                <Form.Select name="status" value={novoAgendamento.status} onChange={handleInputChange} required>
                  <option value="pendente">Pendente</option>
                  <option value="aplicada">Aplicada</option>
                  <option value="atrasada">Atrasada</option>
                </Form.Select>
              </Form.Group>
            </Row>
            <Form.Group className="mb-3" controlId="formObservacoes">
              <Form.Label>Observações</Form.Label>
              <Form.Control as="textarea" rows={3} name="observacoes" value={novoAgendamento.observacoes} onChange={handleInputChange} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={handleFormSubmit}>
            {modoEdicao ? 'Salvar Alterações' : 'Salvar'}
          </Button>
        </Modal.Footer>
      </Modal>

      <table className="agendamento-table">
        <thead>
          <tr>
            <th>Aplicação</th>
            <th>Data Prevista</th>
            <th>Status</th>
            <th>Observações</th>
            <th className="text-center">Ações</th>
          </tr>
        </thead>
        <tbody>
          {agendamentos.map((item) => (
            <tr key={item.id} className="agendamento-row">
              <td>{item.aplicacao?.nome || `Aplicação #${item.aplicacao_id}`}</td>
              <td>{new Date(item.data_prevista).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
              <td>{item.status}</td>
              <td>{item.observacoes || '-'}</td>
              <td className="actions-cell">
                <Button variant="info" size="sm" onClick={() => handleEditarAgendamento(item)}>Editar</Button>
                <Button variant="danger" size="sm" onClick={() => handleExcluirAgendamento(item)} className="ms-2">Excluir</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AgendamentoVacina;
