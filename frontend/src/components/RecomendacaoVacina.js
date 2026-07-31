import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Modal, Form, Col, Row } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './RecomendacaoVacina.css';

const RecomendacaoVacina = () => {
  const [recomendacoes, setRecomendacoes] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [vacinas, setVacinas] = useState([]);
  const [novaRecomendacao, setNovaRecomendacao] = useState({
    paciente_id: '',
    vacina_id: '',
    data_recomendada: '',
    status: 'pendente'
  });
  const [showModal, setShowModal] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [recomendacaoParaEdicao, setRecomendacaoParaEdicao] = useState(null);
  const [pacienteSelecionadoId, setPacienteSelecionadoId] = useState('');

  useEffect(() => {
    fetchRecomendacoes();
    fetchPacientes();
    fetchVacinas();
  }, []);

  const fetchRecomendacoes = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get('http://127.0.0.1:8080/api/recomendacoes-vacinas', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecomendacoes(response.data);
    } catch (error) {
      console.error('Erro ao buscar recomendações:', error);
    }
  };

  const fetchPacientes = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get('http://127.0.0.1:8080/api/pacientes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPacientes(response.data);
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
    }
  };

  const fetchVacinas = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get('http://127.0.0.1:8080/api/vacinas', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVacinas(response.data);
    } catch (error) {
      console.error('Erro ao buscar vacinas:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNovaRecomendacao({ ...novaRecomendacao, [name]: value });

    if (name === 'paciente_id') {
      setPacienteSelecionadoId(value);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('auth_token');
      const headers = { Authorization: `Bearer ${token}` };
      if (modoEdicao && recomendacaoParaEdicao) {
        await axios.put(`http://127.0.0.1:8080/api/recomendacoes-vacinas/${recomendacaoParaEdicao.id}`, novaRecomendacao, { headers });
      } else {
        await axios.post('http://127.0.0.1:8080/api/recomendacoes-vacinas', novaRecomendacao, { headers });
      }
      fetchRecomendacoes();
      fecharModal();
    } catch (error) {
      console.error('Erro ao salvar recomendação:', error);
    }
  };

  const abrirModal = () => {
    setShowModal(true);
    setModoEdicao(false);
    setRecomendacaoParaEdicao(null);
  };

  const fecharModal = () => {
    setShowModal(false);
    setModoEdicao(false);
    setRecomendacaoParaEdicao(null);
    setNovaRecomendacao({
      paciente_id: '',
      vacina_id: '',
      data_recomendada: '',
      status: 'pendente'
    });
    setPacienteSelecionadoId('');
  };

  const handleEditarRecomendacao = (item) => {
    const dataFormatada = item.data_recomendada ? new Date(item.data_recomendada).toISOString().split('T')[0] : '';
    setNovaRecomendacao({ ...item, data_recomendada: dataFormatada });
    setRecomendacaoParaEdicao(item);
    setModoEdicao(true);
    setShowModal(true);
    setPacienteSelecionadoId(item.paciente_id);
  };

  const handleExcluirRecomendacao = async (item) => {
    try {
      const token = localStorage.getItem('auth_token');
      await axios.delete(`http://127.0.0.1:8080/api/recomendacoes-vacinas/${item.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchRecomendacoes();
    } catch (error) {
      console.error('Erro ao excluir recomendação:', error);
    }
  };

  const gerarAutomaticas = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(
        `http://127.0.0.1:8080/api/recomendacoes-vacinas/gerar-automaticas/${pacienteSelecionadoId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRecomendacoes(response.data);
    } catch (error) {
      console.error('Erro ao gerar recomendações automáticas:', error);
    }
  };

  return (
    <div className="recomendacao-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Recomendações de Vacinas</h2>
        <div>
          <Button variant="primary" onClick={abrirModal}>Nova Recomendação</Button>
          {pacienteSelecionadoId && (
            <Button variant="warning" className="ms-2" onClick={gerarAutomaticas}>
              Gerar Automáticas
            </Button>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal show={showModal} onHide={fecharModal} centered dialogClassName="custom-modal-width" className="recomendacao-modal-theme">
        <Modal.Header closeButton>
          <Modal.Title>{modoEdicao ? 'Editar Recomendação' : 'Nova Recomendação'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleFormSubmit}>
            <Row className="mb-3">
              <Form.Group as={Col} md="6" controlId="formPacienteId">
                <Form.Label>Paciente</Form.Label>
                <Form.Select name="paciente_id" value={novaRecomendacao.paciente_id} onChange={handleInputChange} required>
                  <option value="">Selecione um paciente</option>
                  {pacientes.map((paciente) => (
                    <option key={paciente.id} value={paciente.id}>{paciente.nome}</option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group as={Col} md="6" controlId="formVacinaId">
                <Form.Label>Vacina</Form.Label>
                <Form.Select name="vacina_id" value={novaRecomendacao.vacina_id} onChange={handleInputChange} required>
                  <option value="">Selecione uma vacina</option>
                  {vacinas.map((vacina) => (
                    <option key={vacina.id} value={vacina.id}>{vacina.nome}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Row>
            <Row className="mb-3">
              <Form.Group as={Col} md="6" controlId="formDataRecomendada">
                <Form.Label>Data Recomendada</Form.Label>
                <Form.Control type="date" name="data_recomendada" value={novaRecomendacao.data_recomendada} onChange={handleInputChange} required />
              </Form.Group>
              <Form.Group as={Col} md="6" controlId="formStatus">
                <Form.Label>Status</Form.Label>
                <Form.Select name="status" value={novaRecomendacao.status} onChange={handleInputChange} required>
                  <option value="pendente">Pendente</option>
                  <option value="aplicada">Aplicada</option>
                </Form.Select>
              </Form.Group>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={handleFormSubmit}>
            {modoEdicao ? 'Salvar Alterações' : 'Salvar'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Tabela */}
      <table className="recomendacao-table">
        <thead>
          <tr>
            <th>Paciente</th>
            <th>Vacina</th>
            <th>Data Recomendada</th>
            <th>Status</th>
            <th className="text-center">Ações</th>
          </tr>
        </thead>
        <tbody>
          {recomendacoes.map((item) => (
            <tr key={item.id} className="recomendacao-row">
              <td>{item.paciente?.nome || `Paciente #${item.paciente_id}`}</td>
              <td>{item.vacina?.nome || `Vacina #${item.vacina_id}`}</td>
              <td>{new Date(item.data_recomendada).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
              {/* Status com classe dinâmica */}
              <td className={`status-${item.status}`}>{item.status}</td>
              <td className="actions-cell">
                <Button variant="info" size="sm" onClick={() => handleEditarRecomendacao(item)}>Editar</Button>
                <Button variant="danger" size="sm" onClick={() => handleExcluirRecomendacao(item)} className="ms-2">Excluir</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecomendacaoVacina;
