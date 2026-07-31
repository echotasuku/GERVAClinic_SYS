import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Modal, Form, Row, Col } from 'react-bootstrap';
import Select from 'react-select'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import './Aplicacoes.css';

const Aplicacoes = () => {
    const [aplicacoes, setAplicacoes] = useState([]);
    const [novaAplicacao, setNovaAplicacao] = useState({
        id_profissional: '',
        paciente_id: '',
        estoque_id: '', // ← Estoque de VACINAS
        observacoes: '',
        data_aplicacao: '',
        hora_aplicacao: ''
    });
    const [showModal, setShowModal] = useState(false);
    const [modoEdicao, setModoEdicao] = useState(false);
    const [aplicacaoParaEdicao, setAplicacaoParaEdicao] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    
    // Estados para os relacionamentos (dropdowns)
    const [profissionais, setProfissionais] = useState([]);
    const [pacientes, setPacientes] = useState([]);
    const [estoques, setEstoques] = useState([]); // ← Estoques de VACINAS
    const [errors, setErrors] = useState({});

    // Mapeamento das opções para o react-select
    const profissionaisOptions = profissionais.map(prof => ({
        value: prof.id,
        label: `${prof.id_func || prof.id} - ${prof.nome}`
    }));

    const pacientesOptions = pacientes.map(pac => ({
        value: pac.id,
        label: `${pac.nome} (CNS: ${pac.cns || 'N/A'})`
    }));

    // ===== OPÇÕES DE ESTOQUE DE VACINAS =====
    const estoquesOptions = estoques.map(est => ({
        value: est.id,
        label: `${est.vacina?.nome || est.lote || `Estoque ID: ${est.id}`} - Lote: ${est.lote || 'N/A'}`
    }));

    // ===== NOTIFICAÇÕES =====
    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ show: false, message: '', type: '' });
        }, 5000);
    };

    useEffect(() => {
        fetchAplicacoes();
        fetchProfissionais();
        fetchPacientes();
        fetchEstoques(); // ← Busca estoques de VACINAS
    }, []);

    const fetchAplicacoes = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get('http://127.0.0.1:8080/api/aplicacoes', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAplicacoes(response.data);
        } catch (error) {
            console.error('Erro ao buscar aplicações:', error);
            showNotification('Erro ao carregar aplicações', 'error');
        }
    };

    const fetchProfissionais = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get('http://127.0.0.1:8080/api/profissionais', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfissionais(response.data);
        } catch (error) {
            console.error('Erro ao buscar profissionais:', error);
            showNotification('Erro ao carregar profissionais', 'error');
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
            showNotification('Erro ao carregar pacientes', 'error');
        }
    };

    // ===== BUSCA ESTOQUES DE VACINAS =====
    const fetchEstoques = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get('http://127.0.0.1:8080/api/estoque', { // ← Endpoint de estoque de VACINAS
                headers: { Authorization: `Bearer ${token}` }
            });
            setEstoques(response.data);
        } catch (error) {
            console.error('Erro ao buscar estoques de vacinas:', error);
            showNotification('Erro ao carregar estoques de vacinas', 'error');
        }
    };

    const handleInputChange = (e, fieldName) => {
        if (e && e.value !== undefined && fieldName) {
            setNovaAplicacao({
                ...novaAplicacao,
                [fieldName]: e.value
            });
            if (!!errors[fieldName]) {
                setErrors(prevErrors => ({ ...prevErrors, [fieldName]: null }));
            }
        } else if (e && e.target) { 
            const { name, value } = e.target;
            setNovaAplicacao({
                ...novaAplicacao,
                [name]: value
            });
            if (!!errors[name]) {
                setErrors(prevErrors => ({ ...prevErrors, [name]: null }));
            }
        }
    };

    const validateForm = () => {
        const { id_profissional, paciente_id, estoque_id, data_aplicacao, hora_aplicacao } = novaAplicacao;
        const newErrors = {};

        if (!id_profissional) newErrors.id_profissional = 'Selecione um profissional.';
        if (!paciente_id) newErrors.paciente_id = 'Selecione um paciente.';
        if (!estoque_id) newErrors.estoque_id = 'Selecione uma vacina do estoque.'; // ← Mensagem atualizada
        if (!data_aplicacao) newErrors.data_aplicacao = 'A data da aplicação é obrigatória.';
        if (!hora_aplicacao) newErrors.hora_aplicacao = 'A hora da aplicação é obrigatória.';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const formData = new FormData();
        for (const key in novaAplicacao) {
            if (novaAplicacao[key] !== null && novaAplicacao[key] !== '') {
                formData.append(key, novaAplicacao[key]);
            }
        }

        try {
            const token = localStorage.getItem('auth_token');
            const headers = {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`
            };
            
            if (modoEdicao && aplicacaoParaEdicao) {
                formData.append('_method', 'PUT');
                await axios.post(`http://127.0.0.1:8080/api/aplicacoes/${aplicacaoParaEdicao.id}`, formData, { headers });
                showNotification('Aplicação atualizada com sucesso!', 'success');
            } else {
                await axios.post('http://127.0.0.1:8080/api/aplicacoes', formData, { headers });
                showNotification('Aplicação registrada com sucesso!', 'success');
            }

            fetchAplicacoes();
            fecharModal();
        } catch (error) {
            console.error('Erro ao criar/editar aplicação:', error);
            showNotification('Erro ao salvar aplicação', 'error');
            if (error.response && error.response.data && error.response.data.errors) {
                setErrors(error.response.data.errors);
            }
        }
    };

    const abrirModal = () => {
        setShowModal(true);
        setModoEdicao(false);
        setNovaAplicacao({
            id_profissional: '',
            paciente_id: '',
            estoque_id: '',
            observacoes: '',
            data_aplicacao: '',
            hora_aplicacao: ''
        });
        setErrors({});
    };

    const fecharModal = () => {
        setShowModal(false);
        setModoEdicao(false);
        setAplicacaoParaEdicao(null);
        setNovaAplicacao({
            id_profissional: '',
            paciente_id: '',
            estoque_id: '',
            observacoes: '',
            data_aplicacao: '',
            hora_aplicacao: ''
        });
        setErrors({});
    };

    const handleEditarAplicacao = (aplicacao) => {
        setNovaAplicacao({
            id_profissional: aplicacao.id_profissional || aplicacao.profissional_id,
            paciente_id: aplicacao.paciente_id,
            estoque_id: aplicacao.estoque_id,
            observacoes: aplicacao.observacoes || '',
            data_aplicacao: aplicacao.data_aplicacao ? aplicacao.data_aplicacao.split('T')[0] : '',
            hora_aplicacao: aplicacao.hora_aplicacao || ''
        });
        setAplicacaoParaEdicao(aplicacao);
        setModoEdicao(true);
        setShowModal(true);
    };

    const handleExcluirAplicacao = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir esta aplicação?')) return;
        try {
            const token = localStorage.getItem('auth_token');
            await axios.delete(`http://127.0.0.1:8080/api/aplicacoes/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchAplicacoes();
            showNotification('Aplicação excluída com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao excluir aplicação:', error);
            showNotification('Erro ao excluir aplicação', 'error');
        }
    };

    return (
        <div className="aplicacoes-container">
            {/* ===== NOTIFICAÇÃO ===== */}
            {notification.show && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Aplicações de Vacinas</h2> {/* ← Título atualizado */}
                <Button variant="primary" onClick={abrirModal}>Registrar Aplicação</Button>
            </div>
            
            <Modal show={showModal} onHide={fecharModal} centered dialogClassName="custom-modal-width" className="aplicacoes-modal-theme">
                <Modal.Header closeButton>
                    <Modal.Title>{modoEdicao ? 'Editar Aplicação' : 'Registrar Aplicação de Vacina'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form noValidate onSubmit={handleFormSubmit}>
                        <Row className="mb-3">
                            <Form.Group as={Col} md="6" controlId="formProfissional">
                                <Form.Label>Profissional</Form.Label>
                                <Select
                                    name="id_profissional"
                                    options={profissionaisOptions}
                                    value={profissionaisOptions.find(option => option.value === novaAplicacao.id_profissional)}
                                    onChange={(e) => handleInputChange(e, 'id_profissional')}
                                    isInvalid={!!errors.id_profissional}
                                    placeholder="Selecione o profissional"
                                    required
                                />
                                {!!errors.id_profissional && <div className="text-danger small mt-1">{errors.id_profissional}</div>}
                            </Form.Group>
                            
                            <Form.Group as={Col} md="6" controlId="formPaciente">
                                <Form.Label>Paciente</Form.Label>
                                <Select
                                    name="paciente_id"
                                    options={pacientesOptions}
                                    value={pacientesOptions.find(option => option.value === novaAplicacao.paciente_id)}
                                    onChange={(e) => handleInputChange(e, 'paciente_id')}
                                    isInvalid={!!errors.paciente_id}
                                    placeholder="Selecione o paciente"
                                    required
                                />
                                {!!errors.paciente_id && <div className="text-danger small mt-1">{errors.paciente_id}</div>}
                            </Form.Group>
                        </Row>

                        <Row className="mb-3">
                            <Form.Group as={Col} md="4" controlId="formEstoque">
                                <Form.Label>Vacina (Lote)</Form.Label> {/* ← Label atualizado */}
                                <Select
                                    name="estoque_id"
                                    options={estoquesOptions}
                                    value={estoquesOptions.find(option => option.value === novaAplicacao.estoque_id)}
                                    onChange={(e) => handleInputChange(e, 'estoque_id')}
                                    isInvalid={!!errors.estoque_id}
                                    placeholder="Selecione a vacina do estoque"
                                    required
                                />
                                {!!errors.estoque_id && <div className="text-danger small mt-1">{errors.estoque_id}</div>}
                            </Form.Group>

                            <Form.Group as={Col} md="4" controlId="formDataAplicacao">
                                <Form.Label>Data da Aplicação</Form.Label>
                                <Form.Control 
                                    type="date" 
                                    name="data_aplicacao" 
                                    value={novaAplicacao.data_aplicacao} 
                                    onChange={handleInputChange} 
                                    isInvalid={!!errors.data_aplicacao} 
                                    required 
                                />
                                <Form.Control.Feedback type="invalid">{errors.data_aplicacao}</Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group as={Col} md="4" controlId="formHoraAplicacao">
                                <Form.Label>Hora da Aplicação</Form.Label>
                                <Form.Control 
                                    type="time" 
                                    name="hora_aplicacao" 
                                    value={novaAplicacao.hora_aplicacao} 
                                    onChange={handleInputChange} 
                                    isInvalid={!!errors.hora_aplicacao} 
                                    required
                                />
                                <Form.Control.Feedback type="invalid">{errors.hora_aplicacao}</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        
                        <Row className="mb-3">
                            <Form.Group as={Col} md="12" controlId="formObservacoes">
                                <Form.Label>Observações</Form.Label>
                                <Form.Control 
                                    as="textarea" 
                                    rows={3}
                                    name="observacoes" 
                                    placeholder="Detalhes adicionais sobre a aplicação da vacina..."
                                    value={novaAplicacao.observacoes} 
                                    onChange={handleInputChange} 
                                />
                            </Form.Group>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={fecharModal}>Cancelar</Button>
                    <Button variant="success" onClick={handleFormSubmit}>
                        {modoEdicao ? 'Salvar Alterações' : 'Salvar'}
                    </Button>
                </Modal.Footer>
            </Modal>

            <div className="table-responsive">
                <table className="aplicacoes-table table table-striped table-hover">
                    <thead className="table-dark">
                        <tr>
                            <th>Data</th>
                            <th>Hora</th>
                            <th>Paciente</th>
                            <th>Profissional</th>
                            <th>Vacina</th> {/* ← Coluna atualizada */}
                            <th>Lote</th> {/* ← Nova coluna para o lote */}
                            <th>Observações</th>
                            <th className="text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {aplicacoes.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="text-center py-4">Nenhuma aplicação de vacina registrada.</td>
                            </tr>
                        ) : (
                            aplicacoes.map((aplicacao) => (
                                <tr key={aplicacao.id}>
                                    <td>{aplicacao.data_aplicacao ? new Date(aplicacao.data_aplicacao).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-'}</td>
                                    <td>{aplicacao.hora_aplicacao || '-'}</td>
                                    <td>{aplicacao.paciente?.nome || 'Desconhecido'}</td>
                                    <td>{aplicacao.profissional?.nome || 'Desconhecido'}</td>
                                    <td>{aplicacao.estoque?.vacina?.nome || aplicacao.estoque?.nome || 'Desconhecido'}</td>
                                    <td>{aplicacao.estoque?.lote || '-'}</td> {/* ← Exibindo o lote */}
                                    <td>{aplicacao.observacoes || '-'}</td>
                                    <td className="actions-cell text-center">
                                        <Button variant="info" size="sm" className="me-2" onClick={() => handleEditarAplicacao(aplicacao)}>Editar</Button>
                                        <Button variant="danger" size="sm" onClick={() => handleExcluirAplicacao(aplicacao.id)}>Excluir</Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Aplicacoes;