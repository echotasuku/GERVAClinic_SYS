import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Modal, Form, Row, Col, Table, Card, Badge } from 'react-bootstrap';
import { FaCalendarAlt, FaSyringe, FaClock, FaPlus, FaEdit, FaTrash, FaChild, FaUserMd } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import './CalendarioVacinal.css';

const CalendarioVacinal = () => {
    const [calendarios, setCalendarios] = useState([]);
    const [vacinas, setVacinas] = useState([]);
    const [novoCalendario, setNovoCalendario] = useState({
        faixa_etaria: '',
        vacina_id: '',
        dose: '',
        intervalo_dias: '',
        observacoes: ''
    });
    const [showModal, setShowModal] = useState(false);
    const [modoEdicao, setModoEdicao] = useState(false);
    const [calendarioParaEdicao, setCalendarioParaEdicao] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [filtroFaixaEtaria, setFiltroFaixaEtaria] = useState('');

    
    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ show: false, message: '', type: '' });
        }, 5000);
    };

    useEffect(() => {
        fetchCalendarios();
        fetchVacinas();
    }, []);

    
    const fetchCalendarios = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get('http://127.0.0.1:8080/api/calendarios-vacinais', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCalendarios(response.data);
        } catch (error) {
            console.error('Erro ao buscar calendarios:', error);
            showNotification('Erro ao carregar calendario vacinal', 'error');
        } finally {
            setLoading(false);
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
            showNotification('Erro ao carregar vacinas', 'error');
        }
    };

    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNovoCalendario(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    
    const validateForm = () => {
        const { faixa_etaria, vacina_id, dose } = novoCalendario;
        const newErrors = {};

        if (!faixa_etaria) newErrors.faixa_etaria = 'Informe a faixa etaria.';
        if (!vacina_id) newErrors.vacina_id = 'Selecione uma vacina.';
        if (!dose) newErrors.dose = 'Informe a dose.';
        if (novoCalendario.intervalo_dias && parseInt(novoCalendario.intervalo_dias) < 0) {
            newErrors.intervalo_dias = 'O intervalo nao pode ser negativo.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const headers = { Authorization: `Bearer ${token}` };

            const dadosParaEnviar = {
                ...novoCalendario,
                intervalo_dias: novoCalendario.intervalo_dias ? parseInt(novoCalendario.intervalo_dias) : null
            };

            if (modoEdicao && calendarioParaEdicao) {
                await axios.put(
                    `http://127.0.0.1:8080/api/calendarios-vacinais/${calendarioParaEdicao.id}`,
                    dadosParaEnviar,
                    { headers }
                );
                showNotification('Calendario vacinal atualizado com sucesso!', 'success');
            } else {
                await axios.post(
                    'http://127.0.0.1:8080/api/calendarios-vacinais',
                    dadosParaEnviar,
                    { headers }
                );
                showNotification('Calendario vacinal cadastrado com sucesso!', 'success');
            }

            fetchCalendarios();
            fecharModal();
        } catch (error) {
            console.error('Erro ao salvar calendario:', error);
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data);
                showNotification('Erro de validacao. Verifique os campos.', 'error');
            } else {
                showNotification('Erro ao salvar calendario vacinal.', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    
    const abrirModal = () => {
        setShowModal(true);
        setModoEdicao(false);
        setCalendarioParaEdicao(null);
        setNovoCalendario({
            faixa_etaria: '',
            vacina_id: '',
            dose: '',
            intervalo_dias: '',
            observacoes: ''
        });
        setErrors({});
    };

    
    const fecharModal = () => {
        setShowModal(false);
        setModoEdicao(false);
        setCalendarioParaEdicao(null);
        setNovoCalendario({
            faixa_etaria: '',
            vacina_id: '',
            dose: '',
            intervalo_dias: '',
            observacoes: ''
        });
        setErrors({});
    };

    
    const handleEditarCalendario = (calendario) => {
        setNovoCalendario({
            faixa_etaria: calendario.faixa_etaria,
            vacina_id: calendario.vacina_id,
            dose: calendario.dose,
            intervalo_dias: calendario.intervalo_dias || '',
            observacoes: calendario.observacoes || ''
        });
        setCalendarioParaEdicao(calendario);
        setModoEdicao(true);
        setShowModal(true);
    };

    
    const handleExcluirCalendario = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir este calendario vacinal?')) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            await axios.delete(`http://127.0.0.1:8080/api/calendarios-vacinais/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchCalendarios();
            showNotification('Calendario vacinal excluido com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao excluir calendario:', error);
            showNotification('Erro ao excluir calendario vacinal.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const getCorFaixaEtaria = (faixa) => {
        const cores = {
            'Recem-nascido': '#4CAF50',
            '2 meses': '#2196F3',
            '4 meses': '#FF9800',
            '6 meses': '#9C27B0',
            '12 meses': '#F44336',
            '15 meses': '#00BCD4',
            '18 meses': '#FF5722',
            '2 anos': '#795548',
            '4 anos': '#607D8B',
            '5 anos': '#E91E63',
            '9 anos': '#8BC34A',
            '10 anos': '#3F51B5',
            '11 anos': '#FFC107',
            '12 anos': '#009688',
            '15 anos': '#FF6F00',
            'Adulto': '#37474F',
            'Idoso': '#78909C',
            'Gestante': '#E91E63',
            'Profissional de saude': '#1A237E'
        };
        return cores[faixa] || '#757575';
    };

    
    const getIconeFaixaEtaria = (faixa) => {
        if (faixa.toLowerCase().includes('gestante')) return <FaUserMd />;
        if (faixa.toLowerCase().includes('idoso')) return <FaUserMd />;
        if (faixa.toLowerCase().includes('adulto')) return <FaUserMd />;
        if (faixa.toLowerCase().includes('profissional')) return <FaUserMd />;
        return <FaChild />;
    };

    const calendariosFiltrados = filtroFaixaEtaria
        ? calendarios.filter(c => c.faixa_etaria === filtroFaixaEtaria)
        : calendarios;

    
    const faixasEtarias = [...new Set(calendarios.map(c => c.faixa_etaria))];


    return (
        <div className="calendario-container">
        
            {notification.show && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}

            
            <div className="calendario-header">
                <div className="header-left">
                    <h2>
                        <FaCalendarAlt className="me-2" />
                        Calendario Vacinal
                    </h2>
                    <p className="text-muted">Calendario nacional de vacinacao</p>
                </div>
                <Button className="btn-add" onClick={abrirModal} disabled={loading}>
                    <FaPlus className="me-2" />
                    Adicionar ao Calendario
                </Button>
            </div>

            
            <div className="filtros-container">
                <div className="filtro-item">
                    <label>Filtrar por Faixa Etaria</label>
                    <select
                        className="form-select"
                        value={filtroFaixaEtaria}
                        onChange={(e) => setFiltroFaixaEtaria(e.target.value)}
                    >
                        <option value="">Todas as faixas</option>
                        {faixasEtarias.map((faixa) => (
                            <option key={faixa} value={faixa}>{faixa}</option>
                        ))}
                    </select>
                </div>
                <div className="filtro-item">
                    <label>Total de Registros</label>
                    <Badge bg="primary" className="total-badge">
                        {calendariosFiltrados.length}
                    </Badge>
                </div>
            </div>

            
            {loading && !calendarios.length ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Carregando...</span>
                    </div>
                    <p className="mt-2 text-muted">Carregando calendario vacinal...</p>
                </div>
            ) : calendariosFiltrados.length === 0 ? (
                <Card className="empty-state">
                    <Card.Body className="text-center py-5">
                        <FaCalendarAlt size={50} className="text-muted mb-3" />
                        <h5 className="text-muted">Nenhum registro no calendario</h5>
                        <p className="text-muted">Clique em "Adicionar ao Calendario" para começar.</p>
                    </Card.Body>
                </Card>
            ) : (
                <div className="calendario-grid">
                    {calendariosFiltrados.map((calendario) => (
                        <Card key={calendario.id} className="calendario-card">
                            <Card.Header className="calendario-card-header">
                                <div className="calendario-card-header-left">
                                    <div
                                        className="faixa-etaria-icon"
                                        style={{ backgroundColor: getCorFaixaEtaria(calendario.faixa_etaria) }}
                                    >
                                        {getIconeFaixaEtaria(calendario.faixa_etaria)}
                                    </div>
                                    <div>
                                        <h5 className="mb-0">{calendario.faixa_etaria}</h5>
                                        <small className="text-muted">Faixa etaria</small>
                                    </div>
                                </div>
                                <Badge
                                    bg="info"
                                    className="dose-badge"
                                >
                                    <FaSyringe className="me-1" />
                                    {calendario.dose}
                                </Badge>
                            </Card.Header>
                            <Card.Body>
                                <div className="calendario-info">
                                    <div className="info-item">
                                        <FaSyringe className="info-icon text-primary" />
                                        <div>
                                            <span className="info-label">Vacina</span>
                                            <span className="info-value">{calendario.vacina?.nome || 'N/A'}</span>
                                        </div>
                                    </div>
                                    {calendario.intervalo_dias && (
                                        <div className="info-item">
                                            <FaClock className="info-icon text-warning" />
                                            <div>
                                                <span className="info-label">Intervalo</span>
                                                <span className="info-value">{calendario.intervalo_dias} dias</span>
                                            </div>
                                        </div>
                                    )}
                                    {calendario.observacoes && (
                                        <div className="info-item observacoes">
                                            <div>
                                                <span className="info-label">Observacoes</span>
                                                <span className="info-value">{calendario.observacoes}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Card.Body>
                            <Card.Footer className="calendario-card-footer">
                                <Button
                                    variant="info"
                                    size="sm"
                                    onClick={() => handleEditarCalendario(calendario)}
                                    disabled={loading}
                                >
                                    <FaEdit /> Editar
                                </Button>
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => handleExcluirCalendario(calendario.id)}
                                    disabled={loading}
                                >
                                    <FaTrash /> Excluir
                                </Button>
                            </Card.Footer>
                        </Card>
                    ))}
                </div>
            )}

            {/* ===== MODAL ===== */}
            <Modal
                show={showModal}
                onHide={fecharModal}
                centered
                dialogClassName="custom-modal-widthcal"
                className="calendario-modal-theme"
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        <FaCalendarAlt className="me-2" />
                        {modoEdicao ? 'Editar Calendario Vacinal' : 'Adicionar ao Calendario Vacinal'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form noValidate onSubmit={handleFormSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Faixa Etaria</Form.Label>
                            <Form.Select
                                name="faixa_etaria"
                                value={novoCalendario.faixa_etaria}
                                onChange={handleInputChange}
                                isInvalid={!!errors.faixa_etaria}
                                required
                            >
                                <option value="">Selecione...</option>
                                <option value="Recem-nascido">Recem-nascido</option>
                                <option value="2 meses">2 meses</option>
                                <option value="4 meses">4 meses</option>
                                <option value="6 meses">6 meses</option>
                                <option value="12 meses">12 meses</option>
                                <option value="15 meses">15 meses</option>
                                <option value="18 meses">18 meses</option>
                                <option value="2 anos">2 anos</option>
                                <option value="4 anos">4 anos</option>
                                <option value="5 anos">5 anos</option>
                                <option value="9 anos">9 anos</option>
                                <option value="10 anos">10 anos</option>
                                <option value="11 anos">11 anos</option>
                                <option value="12 anos">12 anos</option>
                                <option value="15 anos">15 anos</option>
                                <option value="Adulto">Adulto</option>
                                <option value="Idoso">Idoso</option>
                                <option value="Gestante">Gestante</option>
                                <option value="Profissional de saude">Profissional de saude</option>
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                                {errors.faixa_etaria}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Vacina</Form.Label>
                            <Form.Select
                                name="vacina_id"
                                value={novoCalendario.vacina_id}
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
                            <Form.Group as={Col} md="6" className="mb-3">
                                <Form.Label>Dose</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="dose"
                                    placeholder="Ex: 1a Dose, 2a Dose, Reforco..."
                                    value={novoCalendario.dose}
                                    onChange={handleInputChange}
                                    isInvalid={!!errors.dose}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.dose}
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="6" className="mb-3">
                                <Form.Label>Intervalo (dias)</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="intervalo_dias"
                                    placeholder="Ex: 30, 60, 90..."
                                    value={novoCalendario.intervalo_dias}
                                    onChange={handleInputChange}
                                    isInvalid={!!errors.intervalo_dias}
                                    min="0"
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.intervalo_dias}
                                </Form.Control.Feedback>
                                <small className="text-muted">(Opcional)</small>
                            </Form.Group>
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Label>Observacoes</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                name="observacoes"
                                placeholder="Observacoes adicionais sobre este calendario..."
                                value={novoCalendario.observacoes}
                                onChange={handleInputChange}
                                isInvalid={!!errors.observacoes}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.observacoes}
                            </Form.Control.Feedback>
                        </Form.Group>

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
        </div>
    );
};

export default CalendarioVacinal;