import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Modal, Form, Row, Col, Table } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './EsquemaVacinal.css';

const EsquemaVacinal = () => {
    const [esquemas, setEsquemas] = useState([]);
    const [vacinas, setVacinas] = useState([]);
    const [novoEsquema, setNovoEsquema] = useState({
        vacina_id: '',
        numero_dose: '',
        idade_recomendada_meses: '',
        intervalo_minimo: ''
    });
    const [showModal, setShowModal] = useState(false);
    const [modoEdicao, setModoEdicao] = useState(false);
    const [esquemaParaEdicao, setEsquemaParaEdicao] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    // ===== NOTIFICACOES =====
    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ show: false, message: '', type: '' });
        }, 5000);
    };

    useEffect(() => {
        fetchEsquemas();
        fetchVacinas();
    }, []);

    // ===== BUSCAR ESQUEMAS =====
    const fetchEsquemas = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get('http://127.0.0.1:8080/api/esquemas-vacinais', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEsquemas(response.data);
        } catch (error) {
            console.error('Erro ao buscar esquemas:', error);
            showNotification('Erro ao carregar esquemas vacinais', 'error');
        } finally {
            setLoading(false);
        }
    };

    // ===== BUSCAR VACINAS =====
    const fetchVacinas = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get('http://127.0.0.1:8080/api/vacinas', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVacinas(response.data);
        } catch (error) {
            console.error('Erro ao buscar vacinas:', error);
            showNotification('Erro ao carregar vacinas', 'error');
        }
    };

    // ===== HANDLE INPUT CHANGE =====
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNovoEsquema(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    // ===== VALIDAR FORMULARIO =====
    const validateForm = () => {
        const { vacina_id, numero_dose, idade_recomendada_meses } = novoEsquema;
        const newErrors = {};

        if (!vacina_id) newErrors.vacina_id = 'Selecione uma vacina.';
        if (!numero_dose || parseInt(numero_dose) < 1) {
            newErrors.numero_dose = 'O número da dose deve ser maior que zero.';
        }
        if (!idade_recomendada_meses || parseInt(idade_recomendada_meses) < 0) {
            newErrors.idade_recomendada_meses = 'A idade recomendada deve ser maior ou igual a zero.';
        }
        if (novoEsquema.intervalo_minimo && parseInt(novoEsquema.intervalo_minimo) < 0) {
            newErrors.intervalo_minimo = 'O intervalo mínimo não pode ser negativo.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ===== SALVAR ESQUEMA =====
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const headers = { Authorization: `Bearer ${token}` };

            const dadosParaEnviar = {
                ...novoEsquema,
                numero_dose: parseInt(novoEsquema.numero_dose),
                idade_recomendada_meses: parseInt(novoEsquema.idade_recomendada_meses),
                intervalo_minimo: novoEsquema.intervalo_minimo ? parseInt(novoEsquema.intervalo_minimo) : null
            };

            if (modoEdicao && esquemaParaEdicao) {
                await axios.put(
                    `http://127.0.0.1:8080/api/esquemas-vacinais/${esquemaParaEdicao.id}`,
                    dadosParaEnviar,
                    { headers }
                );
                showNotification('Esquema vacinal atualizado com sucesso!', 'success');
            } else {
                await axios.post(
                    'http://127.0.0.1:8080/api/esquemas-vacinais',
                    dadosParaEnviar,
                    { headers }
                );
                showNotification('Esquema vacinal cadastrado com sucesso!', 'success');
            }

            fetchEsquemas();
            fecharModal();
        } catch (error) {
            console.error('Erro ao salvar esquema:', error);
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data);
                showNotification('Erro de validação. Verifique os campos.', 'error');
            } else {
                showNotification('Erro ao salvar esquema vacinal.', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    // ===== ABRIR MODAL =====
    const abrirModal = () => {
        setShowModal(true);
        setModoEdicao(false);
        setEsquemaParaEdicao(null);
        setNovoEsquema({
            vacina_id: '',
            numero_dose: '',
            idade_recomendada_meses: '',
            intervalo_minimo: ''
        });
        setErrors({});
    };

    // ===== FECHAR MODAL =====
    const fecharModal = () => {
        setShowModal(false);
        setModoEdicao(false);
        setEsquemaParaEdicao(null);
        setNovoEsquema({
            vacina_id: '',
            numero_dose: '',
            idade_recomendada_meses: '',
            intervalo_minimo: ''
        });
        setErrors({});
    };

    // ===== EDITAR ESQUEMA =====
    const handleEditarEsquema = (esquema) => {
        setNovoEsquema({
            vacina_id: esquema.vacina_id,
            numero_dose: esquema.numero_dose,
            idade_recomendada_meses: esquema.idade_recomendada_meses,
            intervalo_minimo: esquema.intervalo_minimo || ''
        });
        setEsquemaParaEdicao(esquema);
        setModoEdicao(true);
        setShowModal(true);
    };

    // ===== EXCLUIR ESQUEMA =====
    const handleExcluirEsquema = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir este esquema vacinal?')) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            await axios.delete(`http://127.0.0.1:8080/api/esquemas-vacinais/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchEsquemas();
            showNotification('Esquema vacinal excluído com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao excluir esquema:', error);
            showNotification('Erro ao excluir esquema vacinal.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // ===== FORMATAR IDADE =====
    const formatarIdade = (meses) => {
        if (meses === 0) return 'Ao nascer';
        if (meses < 12) return `${meses} meses`;
        const anos = Math.floor(meses / 12);
        const resto = meses % 12;
        if (resto === 0) return `${anos} anos`;
        return `${anos} anos e ${resto} meses`;
    };

    // ===== RENDER =====
    return (
        <div className="esquemas-container">
            {/* ===== NOTIFICACAO ===== */}
            {notification.show && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}

            <div className="header">
                <h2>Esquemas Vacinais</h2>
                <Button variant="primary" onClick={abrirModal} disabled={loading}>
                    Adicionar Esquema
                </Button>
            </div>

            {/* ===== MODAL ===== */}
            <Modal
                show={showModal}
                onHide={fecharModal}
                centered
                dialogClassName="custom-modal-widthesquema"
                className="esquemas-modal-theme"
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        {modoEdicao ? 'Editar Esquema Vacinal' : 'Adicionar Esquema Vacinal'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form noValidate onSubmit={handleFormSubmit}>
                        {/* VACINA */}
                        <Form.Group className="mb-3">
                            <Form.Label>Vacina</Form.Label>
                            <Form.Select
                                name="vacina_id"
                                value={novoEsquema.vacina_id}
                                onChange={handleInputChange}
                                isInvalid={!!errors.vacina_id}
                                required
                            >
                                <option value="">Selecione uma vacina...</option>
                                {vacinas.map((vacina) => (
                                    <option key={vacina.id} value={vacina.id}>
                                        {vacina.nome} - {vacina.fabricante || 'N/A'}
                                    </option>
                                ))}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                                {errors.vacina_id}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Row>
                            {/* NUMERO DA DOSE */}
                            <Form.Group as={Col} md="4" className="mb-3">
                                <Form.Label>Número da Dose</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="numero_dose"
                                    placeholder="Ex: 1, 2, 3..."
                                    value={novoEsquema.numero_dose}
                                    onChange={handleInputChange}
                                    isInvalid={!!errors.numero_dose}
                                    min="1"
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.numero_dose}
                                </Form.Control.Feedback>
                            </Form.Group>

                            {/* IDADE RECOMENDADA */}
                            <Form.Group as={Col} md="4" className="mb-3">
                                <Form.Label>Idade Recomendada (meses)</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="idade_recomendada_meses"
                                    placeholder="Ex: 2, 4, 6..."
                                    value={novoEsquema.idade_recomendada_meses}
                                    onChange={handleInputChange}
                                    isInvalid={!!errors.idade_recomendada_meses}
                                    min="0"
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.idade_recomendada_meses}
                                </Form.Control.Feedback>
                                <small className="text-muted">
                                    (0 = ao nascer, 2 = 2 meses, 12 = 1 ano)
                                </small>
                            </Form.Group>

                            {/* INTERVALO MINIMO */}
                            <Form.Group as={Col} md="4" className="mb-3">
                                <Form.Label>Intervalo Mínimo (dias)</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="intervalo_minimo"
                                    placeholder="Ex: 30, 60, 90..."
                                    value={novoEsquema.intervalo_minimo}
                                    onChange={handleInputChange}
                                    isInvalid={!!errors.intervalo_minimo}
                                    min="0"
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.intervalo_minimo}
                                </Form.Control.Feedback>
                                <small className="text-muted">(Opcional)</small>
                            </Form.Group>
                        </Row>

                        <div className="d-flex justify-content-end gap-2 mt-3">
                            <Button variant="secondary" onClick={fecharModal}>
                                Cancelar
                            </Button>
                            <Button variant="primary" type="submit" disabled={loading}>
                                {loading ? 'Salvando...' : (modoEdicao ? 'Atualizar' : 'Salvar')}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* ===== TABELA ===== */}
            <div className="table-responsive">
                <Table striped bordered hover className="esquemas-table">
                    <thead>
                        <tr>
                            <th>Vacina</th>
                            <th>Dose</th>
                            <th>Idade Recomendada</th>
                            <th>Intervalo Mínimo</th>
                            <th className="text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && !esquemas.length ? (
                            <tr>
                                <td colSpan="5" className="text-center py-4">
                                    <span className="spinner-border spinner-border-sm me-2" />
                                    Carregando esquemas...
                                </td>
                            </tr>
                        ) : esquemas.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="text-center py-4 text-muted">
                                    Nenhum esquema vacinal cadastrado.
                                </td>
                            </tr>
                        ) : (
                            esquemas.map((esquema) => (
                                <tr key={esquema.id}>
                                    <td>
                                        <strong>{esquema.vacina?.nome || 'N/A'}</strong>
                                        <br />
                                        <small className="text-muted">
                                            {esquema.vacina?.fabricante || ''}
                                        </small>
                                    </td>
                                    <td className="text-center">
                                        <span className="badge bg-primary">
                                            {esquema.numero_dose}ª Dose
                                        </span>
                                    </td>
                                    <td>{formatarIdade(esquema.idade_recomendada_meses)}</td>
                                    <td className="text-center">
                                        {esquema.intervalo_minimo ? (
                                            <span className="badge bg-info">
                                                {esquema.intervalo_minimo} dias
                                            </span>
                                        ) : (
                                            <span className="text-muted">-</span>
                                        )}
                                    </td>
                                    <td className="actions-cell">
                                        <Button
                                            variant="info"
                                            size="sm"
                                            onClick={() => handleEditarEsquema(esquema)}
                                            disabled={loading}
                                        >
                                            Editar
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            className="ms-2"
                                            onClick={() => handleExcluirEsquema(esquema.id)}
                                            disabled={loading}
                                        >
                                            Excluir
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </div>

            {/* ===== RESUMO ===== */}
            {esquemas.length > 0 && (
                <div className="resumo-esquemas">
                    <h6>Resumo</h6>
                    <div className="resumo-itens">
                        <div className="resumo-item">
                            <span className="resumo-label">Total de Esquemas:</span>
                            <span className="resumo-valor">{esquemas.length}</span>
                        </div>
                        <div className="resumo-item">
                            <span className="resumo-label">Vacinas com Esquema:</span>
                            <span className="resumo-valor">
                                {new Set(esquemas.map(e => e.vacina_id)).size}
                            </span>
                        </div>
                        <div className="resumo-item">
                            <span className="resumo-label">Doses Totais:</span>
                            <span className="resumo-valor">
                                {esquemas.reduce((acc, e) => acc + (e.numero_dose || 0), 0)}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EsquemaVacinal;